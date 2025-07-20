
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

    const messageText = newMessage.trim();
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
      setNewMessage(messageText);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4 flex items-center">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full mr-3 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{receiverName}</h2>
        </div>
      </div>

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
                <p className="text-sm">{message.message}</p>
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
      <div className="border-t p-4 bg-white">
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
