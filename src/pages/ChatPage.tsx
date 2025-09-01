
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
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
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

      // Check for URL parameters (userId, postId)
      const userIdFromUrl = searchParams.get('userId');
      const postIdFromUrl = searchParams.get('postId');
      
      if (userIdFromUrl) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userIdFromUrl)
            .maybeSingle();
          
          setSelectedChat(userIdFromUrl);
          setSelectedUserName(profile?.full_name || "Unknown User");
          if (postIdFromUrl) {
            setSelectedPostId(postIdFromUrl);
          }
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
            .maybeSingle();
          
          setSelectedChat(receiverId);
          setSelectedUserName(profile?.full_name || "Unknown User");
          if (postId) {
            setSelectedPostId(postId);
          }
        } catch (error) {
          console.error("Error fetching receiver profile:", error);
        }
      }
    };

    handleChatNavigation();
  }, [location.state, currentUser, searchParams]);

  const { data: chats, isLoading, refetch } = useQuery({
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

  if (selectedChat) {
    return (
      <RealTimeChat
        receiverId={selectedChat}
        receiverName={selectedUserName}
        postId={selectedPostId || location.state?.postId}
        onBack={() => {
          setSelectedChat(null);
          setSelectedUserName("");
          setSelectedPostId(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm sticky top-0 z-40 border-b border-border/50">
        <div className="px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Stay connected with your marketplace community</p>
          </div>
          
          {/* Modern Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-12 pr-4 py-3 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 text-foreground placeholder:text-muted-foreground hover:bg-card/70"
            />
          </div>
        </div>
      </div>

      {/* Modern Chat List */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-10 w-10 border-2 border-primary/10"></div>
            </div>
          </div>
        ) : chats && chats.length > 0 ? (
          <div className="space-y-2">
            {chats.map((chat, index) => (
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
                className="group flex items-center p-4 hover:bg-card/60 active:bg-card/80 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:shadow-primary/5 border border-transparent hover:border-border/30 backdrop-blur-sm"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="relative">
                  {/* Modern Avatar with Status Indicator */}
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
                    {chat.other_user.profile_img ? (
                      <img
                        src={chat.other_user.profile_img}
                        alt={chat.other_user.full_name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {chat.other_user.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                </div>
                
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                      {chat.other_user.full_name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        {new Date(chat.created_at).toLocaleDateString()}
                      </span>

                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate group-hover:text-foreground/80 transition-colors duration-200">
                    {chat.message}
                  </p>
                </div>
                
                {/* Hover Arrow */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle size={40} className="text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Start Your First Conversation</h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed mb-8">
              Connect with sellers and buyers by visiting their posts and starting meaningful conversations about products you're interested in.
            </p>
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 text-sm text-primary bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
                <span>💬</span>
                <span>Tap on any post to start chatting</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
