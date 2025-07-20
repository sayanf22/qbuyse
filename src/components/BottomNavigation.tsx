
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  // Query to get unread message count
  const { data: unreadCount = 0, refetch } = useQuery({
    queryKey: ["unread-messages", currentUser?.id],
    queryFn: async (): Promise<number> => {
      if (!currentUser) return 0;

      try {
        // Count unread messages for current user
        const { data: unreadMessages, error } = await supabase
          .from("chats")
          .select("sender_id")
          .eq("receiver_id", currentUser.id)
          .eq("is_read", false);

        if (error) throw error;

        // Group by sender to count unique conversations with unread messages
        const uniqueSenders = new Set(unreadMessages?.map(msg => msg.sender_id) || []);
        return Math.min(uniqueSenders.size, 99); // Cap at 99 for display
      } catch (error) {
        console.error("Error fetching unread count:", error);
        return 0;
      }
    },
    enabled: !!currentUser,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Set up real-time subscription for new messages to update badge
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel(`unread-messages-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `receiver_id=eq.${currentUser.id}`
        },
        () => {
          // Refetch unread count when new message arrives for this user
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats',
          filter: `receiver_id=eq.${currentUser.id}`
        },
        () => {
          // Refetch when messages are marked as read
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, refetch]);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Plus, label: "Post", path: "/post", isSpecial: true },
    { icon: MessageCircle, label: "Chats", path: "/chats" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-[9998] shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          if (item.isSpecial) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
              >
                <Icon size={24} />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "text-teal-600 bg-teal-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {/* Notification badge for chats */}
                {item.label === "Chats" && unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] font-medium">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
