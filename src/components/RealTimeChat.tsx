
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
      {/* Header */}
      <div className="bg-background shadow-sm border-b border-border p-4 flex items-center">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full mr-3 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <button
            onClick={() => window.open(`/user/${receiverId}`, '_blank')}
            className="font-semibold text-foreground hover:text-primary transition-colors"
          >
            {receiverName}
          </button>
        </div>
      </div>

      {/* Post Preview - Only show when coming from a post */}
      {postInfo && (
        <div className="bg-background border-b border-border p-4 animate-fade-in">
          <div 
            onClick={() => window.open(`/post/${postInfo.id}`, '_blank')}
            className="bg-muted/50 rounded-lg p-3 cursor-pointer hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {/* Product Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {postInfo.images && postInfo.images.length > 0 ? (
                  <img 
                    src={postInfo.images[0]} 
                    alt={postInfo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm truncate">
                  {postInfo.title}
                </h3>
                {postInfo.description && (
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                    {postInfo.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {postInfo.type}
                  </span>
                  {postInfo.price && (
                    <span className="text-sm font-semibold text-primary">
                      ₹{postInfo.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Tap to view full product details
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
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
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-all ${
                  message.sender_id === currentUser?.id
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {/* Check if message contains product info */}
                {message.message.includes("🛍️ Product:") ? (
                  <div className="space-y-2">
                    {message.message.split('\n\n').map((part, index) => (
                      <div key={index}>
                        {index === 0 ? (
                          // Product details part
                          <div className={`text-xs p-2 rounded border ${
                            message.sender_id === currentUser?.id
                              ? "bg-teal-400 border-teal-300"
                              : "bg-muted border-border"
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
                      ? "text-teal-100"
                      : "text-gray-500"
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
          <div className="text-center py-8 text-gray-500">
            Start your conversation with {receiverName}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4 bg-background">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-xl"
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-teal-500 hover:bg-teal-600 rounded-xl transition-colors"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChat;
