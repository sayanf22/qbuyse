
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PostCard from "@/components/PostCard";
import { Filter, Menu, Bell, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import HamburgerMenu from "@/components/HamburgerMenu";
import NotificationPanel from "@/components/NotificationPanel";

type PostType = "ALL" | "SELL" | "WANT";

interface Post {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  images: string[];
  created_at: string;
  user_id: string;
  state: string;
  profile_full_name?: string;
  profile_username?: string;
  profile_img?: string;
}

const indianStates = [
  { name: "All States", code: "ALL" },
  { name: "Andhra Pradesh", code: "AP" },
  { name: "Arunachal Pradesh", code: "AR" },
  { name: "Assam", code: "AS" },
  { name: "Bihar", code: "BR" },
  { name: "Chhattisgarh", code: "CG" },
  { name: "Goa", code: "GA" },
  { name: "Gujarat", code: "GJ" },
  { name: "Haryana", code: "HR" },
  { name: "Himachal Pradesh", code: "HP" },
  { name: "Jharkhand", code: "JH" },
  { name: "Karnataka", code: "KA" },
  { name: "Kerala", code: "KL" },
  { name: "Madhya Pradesh", code: "MP" },
  { name: "Maharashtra", code: "MH" },
  { name: "Manipur", code: "MN" },
  { name: "Meghalaya", code: "ML" },
  { name: "Mizoram", code: "MZ" },
  { name: "Nagaland", code: "NL" },
  { name: "Odisha", code: "OD" },
  { name: "Punjab", code: "PB" },
  { name: "Rajasthan", code: "RJ" },
  { name: "Sikkim", code: "SK" },
  { name: "Tamil Nadu", code: "TN" },
  { name: "Telangana", code: "TG" },
  { name: "Tripura", code: "TR" },
  { name: "Uttar Pradesh", code: "UP" },
  { name: "Uttarakhand", code: "UK" },
  { name: "West Bengal", code: "WB" },
];

const HomePage = () => {
  const [filter, setFilter] = useState<PostType>("ALL");
  const [currentState, setCurrentState] = useState("ALL");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();

  // Get current user and their state
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        
        // Get user's profile to set default state
        const { data: profile } = await supabase
          .from("profiles")
          .select("state")
          .eq("id", user.id)
          .single();
        
        if (profile?.state) {
          const stateObj = indianStates.find(s => s.name === profile.state);
          setCurrentState(stateObj?.code || "ALL");
        } else {
          setCurrentState("ALL"); // Default to All States
        }
      }
    };
    getCurrentUser();
  }, []);

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["posts", filter, currentState],
    queryFn: async (): Promise<Post[]> => {
      try {
        const filterValue = filter === "ALL" ? "ALL" : filter;
        const stateValue = currentState === "ALL" ? "ALL" : 
          indianStates.find(s => s.code === currentState)?.name || "ALL";
        
        const { data, error } = await supabase.rpc('get_posts_with_profiles' as any, {
          p_filter: filterValue,
          p_state: stateValue,
          p_limit: 50
        });

        if (error) {
          console.error("Error fetching posts:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
      }
    },
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Get unread notifications count
  const { data: unreadCount } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      if (!currentUser) return 0;
      
      const { data, error } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("is_read", false);
      
      if (error) return 0;
      return data?.length || 0;
    },
    enabled: !!currentUser,
  });

  // Set up realtime subscription for posts
  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Set up realtime subscription for notifications
  useEffect(() => {
    if (!currentUser) return;

    const notificationChannel = supabase
      .channel(`notifications-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`
        },
        () => {
          // Refetch unread count when notifications change
          queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [currentUser, queryClient]);

  const handleStateChange = (stateCode: string) => {
    setCurrentState(stateCode);
  };

  const getStateName = (code: string) => {
    return indianStates.find(s => s.code === code)?.name || code;
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <HamburgerMenu />
            
            <Select value={currentState} onValueChange={handleStateChange}>
              <SelectTrigger className="w-auto bg-gray-100 border-none hover:bg-gray-200 transition-colors">
                <span className="text-gray-700">{currentState}</span>
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {indianStates.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.code === "ALL" ? "ALL – All States" : `${state.code} – ${state.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell size={24} className="text-gray-700" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </button>
              {showNotifications && (
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 bg-gray-100 rounded-full p-1">
            {(["ALL", "SELL", "WANT"] as PostType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === type
                    ? "bg-teal-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {type === "ALL" ? "All" : type === "SELL" ? "Sell" : "Want"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PostCard post={post} onDelete={refetch} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-gray-500">
              {currentState === "ALL" 
                ? "No posts found" 
                : `No posts found in ${getStateName(currentState)}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
