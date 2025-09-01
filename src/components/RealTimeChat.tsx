
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  message: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface RealTimeChatProps {
  receiverId: string;
  receiverName: string;
  postId?: string;
  onBack: () => void;
}

const RealTimeChat = ({ receiverId, receiverName, postId, onBack }: RealTimeChatProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        // Mark messages as read when entering chat
        if (user) {
          try {
            await supabase.rpc('mark_messages_as_read', {
              p_sender_id: receiverId,
              p_receiver_id: user.id
            });
          } catch (error) {
            console.error("Error marking messages as read:", error);
          }
        }
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };
    getCurrentUser();
  }, [receiverId]);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["chat-messages", receiverId],
    queryFn: async (): Promise<Message[]> => {
      if (!currentUser) return [];

      try {
        const { data, error } = await supabase
          .from("chats")
          .select("*")
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUser.id})`)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
    enabled: !!currentUser,
  });

  // Set up realtime subscription for new messages
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel(`chat-${currentUser.id}-${receiverId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUser.id}))`
        },
        (payload) => {
          // Add the new message directly to the cache for instant display
          queryClient.setQueryData(["chat-messages", receiverId], (oldData: Message[] | undefined) => {
            if (!oldData) return [payload.new as Message];
            return [...oldData, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, receiverId, queryClient]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    let messageText = newMessage.trim();
    
    // If there's post info, prepend it to the message
    if (postInfo) {
      const postDetails = `🛍️ Product: ${postInfo.title}\n💰 Price: ${postInfo.price ? `₹${postInfo.price.toLocaleString()}` : 'Not specified'}\n📝 ${postInfo.description ? postInfo.description.substring(0, 100) : 'No description'}${postInfo.description && postInfo.description.length > 100 ? '...' : ''}\n\n`;
      messageText = postDetails + messageText;
    }

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      message: messageText,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      created_at: new Date().toISOString(),
    };

    // Immediately add the message to the UI (optimistic update)
    queryClient.setQueryData(["chat-messages", receiverId], (oldData: Message[] | undefined) => {
      if (!oldData) return [optimisticMessage];
      return [...oldData, optimisticMessage];
    });

    // Immediately update the chat list preview as well (optimistic update)
    queryClient.setQueryData(["user-chats", currentUser.id], (oldChats: any[] | undefined) => {
      if (!oldChats) return oldChats;
      
      // Find existing chat or create new one
      const existingChatIndex = oldChats.findIndex(chat => chat.other_user.id === receiverId);
      
      if (existingChatIndex >= 0) {
        // Update existing chat with new message
        const updatedChats = [...oldChats];
        updatedChats[existingChatIndex] = {
          ...updatedChats[existingChatIndex],
          message: messageText,
          created_at: new Date().toISOString(),
          sender_id: currentUser.id,
          receiver_id: receiverId
        };
        // Move to top
        const updatedChat = updatedChats.splice(existingChatIndex, 1)[0];
        return [updatedChat, ...updatedChats];
      } else {
        // Create new chat entry if it doesn't exist
        const newChatEntry = {
          id: optimisticMessage.id,
          sender_id: currentUser.id,
          receiver_id: receiverId,
          message: messageText,
          created_at: new Date().toISOString(),
          other_user: {
            id: receiverId,
            full_name: receiverName,
            profile_img: null
          }
        };
        return [newChatEntry, ...oldChats];
      }
    });

    // Clear the input immediately
    setNewMessage("");

    try {
      const { data, error } = await supabase.from("chats").insert({
        sender_id: currentUser.id,
        receiver_id: receiverId,
        post_id: postId || null,
        message: messageText,
      }).select().single();

      if (error) throw error;

      // Replace the optimistic message with the real one from the server
      queryClient.setQueryData(["chat-messages", receiverId], (oldData: Message[] | undefined) => {
        if (!oldData) return [data];
        return oldData.map(msg => 
          msg.id === optimisticMessage.id ? data : msg
        );
      });

      // Optimistically update the chat list as well
      queryClient.setQueryData(["user-chats", currentUser.id], (oldChats: any[] | undefined) => {
        if (!oldChats) return oldChats;
        
        // Find existing chat or create new one
        const existingChatIndex = oldChats.findIndex(chat => chat.other_user.id === receiverId);
        
        if (existingChatIndex >= 0) {
          // Update existing chat with new message
          const updatedChats = [...oldChats];
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            message: messageText,
            created_at: new Date().toISOString(),
            sender_id: currentUser.id,
            receiver_id: receiverId
          };
          // Move to top
          const updatedChat = updatedChats.splice(existingChatIndex, 1)[0];
          return [updatedChat, ...updatedChats];
        } else {
          // Create new chat entry if it doesn't exist
          const newChatEntry = {
            id: data.id,
            sender_id: currentUser.id,
            receiver_id: receiverId,
            message: messageText,
            created_at: new Date().toISOString(),
            other_user: {
              id: receiverId,
              full_name: receiverName, // Use the receiver name passed from props
              profile_img: null
            }
          };
          return [newChatEntry, ...oldChats];
        }
      });

      // Clear postInfo after sending message with it
      if (postInfo) {
        setPostInfo(null);
      }

    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Remove the optimistic message on error
      queryClient.setQueryData(["chat-messages", receiverId], (oldData: Message[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(msg => msg.id !== optimisticMessage.id);
      });

      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });

      // Restore the message to the input
      setNewMessage(newMessage.trim());
    }
  };

  const [postInfo, setPostInfo] = useState<any>(null);

  // Fetch post info if postId is provided
  useEffect(() => {
    if (postId) {
      const fetchPostInfo = async () => {
        try {
          const { data, error } = await supabase
            .from("posts")
            .select("id, title, description, price, images, type")
            .eq("id", postId)
            .maybeSingle();
          
          if (error) throw error;
          console.log("Fetched post info:", data);
          setPostInfo(data);
        } catch (error) {
          console.error("Error fetching post info:", error);
        }
      };
      fetchPostInfo();
    } else {
      setPostInfo(null);
    }
  }, [postId]);

  // Send initial message with post info when entering from a post
  useEffect(() => {
    if (postInfo && currentUser && messages?.length === 0) {
      const sendInitialMessage = async () => {
        const initialMessage = `Hi! I'm interested in your post: "${postInfo.title}"${postInfo.price ? ` (₹${postInfo.price.toLocaleString()})` : ''}`;
        
        try {
          await supabase.from("chats").insert({
            sender_id: currentUser.id,
            receiver_id: receiverId,
            post_id: postId,
            message: initialMessage,
          });
        } catch (error) {
          console.error("Error sending initial message:", error);
        }
      };
      
      // Small delay to ensure messages query has completed
      setTimeout(sendInitialMessage, 500);
    }
  }, [postInfo, currentUser, receiverId, postId, messages?.length]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-md border-b border-border/50 p-4 flex items-center sticky top-0 z-10 shadow-sm">
        <button
          onClick={onBack}
          className="p-2 hover:bg-accent/50 rounded-xl mr-4 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex-1 flex items-center space-x-3">
          {/* User Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {receiverName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <button
              onClick={() => window.open(`/user/${receiverId}`, '_blank')}
              className="font-semibold text-foreground hover:text-primary transition-colors duration-200 text-left"
            >
              {receiverName}
            </button>

          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-accent/50 rounded-xl transition-all duration-200">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modern Post Preview */}
      {postInfo && (
        <div className="bg-gradient-to-r from-primary/8 to-transparent border-b border-border/50 p-4" style={{animation: 'slideInLeft 0.5s ease-out'}}>
          <div 
            onClick={() => window.open(`/post/${postInfo.id}`, '_blank')}
            className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 cursor-pointer hover:bg-card/80 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/10 border border-border/30"
          >
            <div className="flex items-center space-x-4">
              {/* Product Image */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted/50 flex-shrink-0 ring-2 ring-primary/10">
                {postInfo.images && postInfo.images.length > 0 ? (
                  <img 
                    src={postInfo.images[0]} 
                    alt={postInfo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate mb-1">
                  {postInfo.title}
                </h3>
                {postInfo.description && (
                  <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
                    {postInfo.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-medium">
                    {postInfo.type}
                  </span>
                  {postInfo.price && (
                    <span className="text-sm font-bold text-primary">
                      ₹{postInfo.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-3 text-center bg-muted/30 py-2 rounded-xl">
              💬 Discussing this product • Tap to view details
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="relative">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-6 w-6 border-2 border-primary/10"></div>
            </div>
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === currentUser?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-200 ${
                  message.sender_id === currentUser?.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-card text-card-foreground border border-border/50 shadow-sm"
                }`}
              >
                {/* Check if message contains product info */}
                {message.message.includes("🛍️ Product:") ? (
                  <div className="space-y-2">
                    {message.message.split('\n\n').map((part, index) => (
                      <div key={index}>
                        {index === 0 ? (
                          // Product details part
                          <div className={`text-xs p-2 rounded-lg border ${
                            message.sender_id === currentUser?.id
                              ? "bg-primary/20 border-primary/30 text-primary-foreground/90"
                              : "bg-muted/50 border-border text-muted-foreground"
                          }`}>
                            {part.split('\n').map((line, lineIndex) => (
                              <div key={lineIndex} className="flex items-start space-x-1">
                                <span>{line}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // User message part
                          <p className="text-sm">{part}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">{message.message}</p>
                )}
                <p
                  className={`text-xs mt-1 ${
                    message.sender_id === currentUser?.id
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">
                  {receiverName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Start your conversation</h3>
            <p className="text-muted-foreground text-sm">
              Send a message to {receiverName} to begin chatting
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border/50 p-4 bg-card/30 backdrop-blur-sm">
        <div className="flex space-x-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-2xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground"
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChat;
