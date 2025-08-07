
import { useState, useEffect } from "react";
import { MessageCircle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import RealTimeChat from "@/components/RealTimeChat";

interface Chat {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  other_user: {
    id: string;
    full_name: string;
    profile_img: string;
  };
}

const ChatPage = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
<<<<<<< HEAD
=======
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
>>>>>>> c919ab7 (updates new)
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };
    getCurrentUser();
  }, []);

  // Handle navigation from post card or URL parameter
  useEffect(() => {
    const handleChatNavigation = async () => {
      if (!currentUser) return;

<<<<<<< HEAD
      // Check for URL parameter first (from UserProfilePage)
      const userIdFromUrl = searchParams.get('user');
=======
      // Check for URL parameters (userId, postId)
      const userIdFromUrl = searchParams.get('userId');
      const postIdFromUrl = searchParams.get('postId');
      
>>>>>>> c919ab7 (updates new)
      if (userIdFromUrl) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userIdFromUrl)
<<<<<<< HEAD
            .single();
          
          setSelectedChat(userIdFromUrl);
          setSelectedUserName(profile?.full_name || "Unknown User");
=======
            .maybeSingle();
          
          setSelectedChat(userIdFromUrl);
          setSelectedUserName(profile?.full_name || "Unknown User");
          if (postIdFromUrl) {
            setSelectedPostId(postIdFromUrl);
          }
>>>>>>> c919ab7 (updates new)
          return;
        } catch (error) {
          console.error("Error fetching user profile from URL:", error);
        }
      }

      // Handle navigation from post card (existing functionality)
      if (location.state?.receiverId) {
        const { receiverId, postId } = location.state;
        
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", receiverId)
<<<<<<< HEAD
            .single();
          
          setSelectedChat(receiverId);
          setSelectedUserName(profile?.full_name || "Unknown User");
=======
            .maybeSingle();
          
          setSelectedChat(receiverId);
          setSelectedUserName(profile?.full_name || "Unknown User");
          if (postId) {
            setSelectedPostId(postId);
          }
>>>>>>> c919ab7 (updates new)
        } catch (error) {
          console.error("Error fetching receiver profile:", error);
        }
      }
    };

    handleChatNavigation();
  }, [location.state, currentUser, searchParams]);

<<<<<<< HEAD
  const { data: chats, isLoading } = useQuery({
=======
  const { data: chats, isLoading, refetch } = useQuery({
>>>>>>> c919ab7 (updates new)
    queryKey: ["user-chats", currentUser?.id],
    queryFn: async (): Promise<Chat[]> => {
      if (!currentUser) return [];

      try {
        const { data, error } = await supabase
          .from("chats")
          .select(`
            id,
            sender_id,
            receiver_id,
            message,
            created_at
          `)
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Group by conversation and get latest message
        const conversations = new Map();
        
        for (const chat of data || []) {
          const otherUserId = chat.sender_id === currentUser.id ? chat.receiver_id : chat.sender_id;
          
          if (!conversations.has(otherUserId)) {
            // Get other user's profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, full_name, profile_img")
              .eq("id", otherUserId)
              .single();

            conversations.set(otherUserId, {
              ...chat,
              other_user: profile || { id: otherUserId, full_name: "Unknown User", profile_img: null }
            });
          }
        }

        return Array.from(conversations.values());
      } catch (error) {
        console.error("Error fetching chats:", error);
        return [];
      }
    },
    enabled: !!currentUser,
  });

<<<<<<< HEAD
=======
  // Set up real-time subscription for new chats
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel(`chats-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `or(sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id})`
        },
        (payload) => {
          console.log('Chat change detected:', payload);
          // Refetch chats when new messages arrive
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, refetch]);

  // Also set up a subscription specifically for when user sends a message
  useEffect(() => {
    if (!currentUser) return;

    const handleRouteChange = () => {
      // If navigating to chat page from sending a message, refetch immediately
      refetch();
    };

    // Listen for focus events to refetch when returning to tab
    window.addEventListener('focus', handleRouteChange);
    
    return () => {
      window.removeEventListener('focus', handleRouteChange);
    };
  }, [currentUser, refetch]);

>>>>>>> c919ab7 (updates new)
  if (selectedChat) {
    return (
      <RealTimeChat
        receiverId={selectedChat}
        receiverName={selectedUserName}
<<<<<<< HEAD
        postId={location.state?.postId}
        onBack={() => {
          setSelectedChat(null);
          setSelectedUserName("");
=======
        postId={selectedPostId || location.state?.postId}
        onBack={() => {
          setSelectedChat(null);
          setSelectedUserName("");
          setSelectedPostId(null);
>>>>>>> c919ab7 (updates new)
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : chats && chats.length > 0 ? (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.other_user.id}
                onClick={async () => {
                  // Mark messages as read when opening chat
                  if (currentUser) {
                    try {
                      await supabase.rpc('mark_messages_as_read', {
                        p_sender_id: chat.other_user.id,
                        p_receiver_id: currentUser.id
                      });
                    } catch (error) {
                      console.error("Error marking messages as read:", error);
                    }
                  }
                  setSelectedChat(chat.other_user.id);
                  setSelectedUserName(chat.other_user.full_name);
                }}
                className="flex items-center p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {chat.other_user.profile_img ? (
                      <img
                        src={chat.other_user.profile_img}
                        alt={chat.other_user.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {chat.other_user.full_name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{chat.other_user.full_name}</h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-600">
              Start chatting with sellers and buyers by visiting their posts
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
