import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BottomNavigationProps {
  onProtectedNavigation: (path: string) => void;
}

const BottomNavigation = ({ onProtectedNavigation }: BottomNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Query to get unread message count for authenticated users
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-messages", user?.id],
    queryFn: async (): Promise<number> => {
      if (!user) return 0;

      try {
        // Count unread messages for current user
        const { data: unreadMessages, error } = await supabase
          .from("chats")
          .select("sender_id")
          .eq("receiver_id", user.id)
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
    enabled: !!user,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      requireAuth: false,
    },
    {
      icon: Search,
      label: "Search",
      path: "/search",
      requireAuth: false,
    },
    {
      icon: Plus,
      label: "Post",
      path: "/post",
      requireAuth: true,
      isSpecial: true,
    },
    {
      icon: MessageCircle,
      label: "Chats",
      path: "/chats",
      requireAuth: true,
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
      requireAuth: true,
    },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.requireAuth && !user) {
      onProtectedNavigation(item.path);
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-[9998] shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isSpecial) {
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className="relative bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
              >
                <Icon size={24} />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item)}
              className={`relative flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "text-teal-600 bg-teal-50 dark:bg-teal-950"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {/* Notification badge for chats when authenticated */}
                {item.label === "Chats" && user && unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] font-medium">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;