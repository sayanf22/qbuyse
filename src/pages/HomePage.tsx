
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
<<<<<<< HEAD
=======
import { useAuth } from "@/hooks/useAuth";
>>>>>>> c919ab7 (updates new)
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
<<<<<<< HEAD
=======
import { AuthModal } from "@/components/AuthModal";
import { SEOHead } from "@/components/SEOHead";
import { categories, getCategoryById } from "@/utils/categories";
>>>>>>> c919ab7 (updates new)

type PostType = "ALL" | "SELL" | "WANT";

interface Post {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
<<<<<<< HEAD
=======
  category: string;
>>>>>>> c919ab7 (updates new)
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
<<<<<<< HEAD
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();

  // Get current user and their state
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        
=======
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Get user's default state
  useEffect(() => {
    const getUserState = async () => {
      if (currentUser) {
>>>>>>> c919ab7 (updates new)
        // Get user's profile to set default state
        const { data: profile } = await supabase
          .from("profiles")
          .select("state")
<<<<<<< HEAD
          .eq("id", user.id)
=======
          .eq("id", currentUser.id)
>>>>>>> c919ab7 (updates new)
          .single();
        
        if (profile?.state) {
          const stateObj = indianStates.find(s => s.name === profile.state);
          setCurrentState(stateObj?.code || "ALL");
        } else {
          setCurrentState("ALL"); // Default to All States
        }
<<<<<<< HEAD
      }
    };
    getCurrentUser();
  }, []);

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["posts", filter, currentState],
=======
      } else {
        setCurrentState("ALL"); // Default for non-authenticated users
      }
    };
    getUserState();
  }, [currentUser]);

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["posts", filter, currentState, selectedCategory],
>>>>>>> c919ab7 (updates new)
    queryFn: async (): Promise<Post[]> => {
      try {
        const filterValue = filter === "ALL" ? "ALL" : filter;
        const stateValue = currentState === "ALL" ? "ALL" : 
          indianStates.find(s => s.code === currentState)?.name || "ALL";
        
        const { data, error } = await supabase.rpc('get_posts_with_profiles' as any, {
          p_filter: filterValue,
          p_state: stateValue,
<<<<<<< HEAD
=======
          p_category: selectedCategory,
>>>>>>> c919ab7 (updates new)
          p_limit: 50
        });

        if (error) {
          console.error("Error fetching posts:", error);
          return [];
        }
        
<<<<<<< HEAD
        return data || [];
=======
        // Randomize the posts order
        const shuffledData = (data || []).sort(() => Math.random() - 0.5);
        return shuffledData;
>>>>>>> c919ab7 (updates new)
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

<<<<<<< HEAD
  // Set up realtime subscription for notifications
=======
  // Set up realtime subscription for notifications with optimized performance
>>>>>>> c919ab7 (updates new)
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
<<<<<<< HEAD
        () => {
          // Refetch unread count when notifications change
          queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
=======
        (payload) => {
          console.log('Notification received:', payload);
          // Optimized real-time updates
          queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
>>>>>>> c919ab7 (updates new)
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
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4">
=======
    <div className="min-h-screen bg-background animate-fade-in">
      <SEOHead 
        title="Home - Buy & Sell in Your State"
        description="India's leading local marketplace to buy and sell products in your state. Find amazing deals, connect with buyers and sellers near you. Join millions using Qbuyse!"
        keywords={['buy sell online', 'local marketplace', 'state wise marketplace', 'classified ads india', 'second hand products', 'new products online', 'local trading', 'peer to peer marketplace']}
      />
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4 max-w-7xl mx-auto">
>>>>>>> c919ab7 (updates new)
          <div className="flex items-center justify-between mb-4">
            <HamburgerMenu />
            
            <Select value={currentState} onValueChange={handleStateChange}>
<<<<<<< HEAD
              <SelectTrigger className="w-auto bg-gray-100 border-none hover:bg-gray-200 transition-colors">
                <span className="text-gray-700">{currentState}</span>
=======
              <SelectTrigger className="w-auto min-w-[80px] bg-gray-100 border-none hover:bg-gray-200 transition-colors">
                <span className="text-gray-700 text-sm sm:text-base">{currentState}</span>
>>>>>>> c919ab7 (updates new)
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {indianStates.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
<<<<<<< HEAD
                    {state.code === "ALL" ? "ALL – All States" : `${state.code} – ${state.name}`}
=======
                    <span className="text-sm">{state.code === "ALL" ? "ALL – All States" : `${state.code} – ${state.name}`}</span>
>>>>>>> c919ab7 (updates new)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
<<<<<<< HEAD
            
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
=======
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <Bell size={20} className="text-gray-700 sm:w-6 sm:h-6" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </button>
                {showNotifications && (
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-teal-600 font-medium text-sm"
              >
                Login
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 sm:space-x-2 bg-gray-100 rounded-full p-1">
>>>>>>> c919ab7 (updates new)
            {(["ALL", "SELL", "WANT"] as PostType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
<<<<<<< HEAD
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
=======
                className={`flex-1 py-2 px-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
>>>>>>> c919ab7 (updates new)
                  filter === type
                    ? "bg-teal-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {type === "ALL" ? "All" : type === "SELL" ? "Sell" : "Want"}
              </button>
            ))}
          </div>
<<<<<<< HEAD
=======

          {/* Category Filter */}
          <div className="mt-3 mb-2">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === "ALL"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1 ${
                      selectedCategory === category.id
                        ? "bg-teal-500 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    <IconComponent size={12} />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
>>>>>>> c919ab7 (updates new)
        </div>
      </div>

      {/* Posts */}
<<<<<<< HEAD
      <div className="px-4 py-4">
=======
      <div className="px-4 py-4 max-w-7xl mx-auto">
>>>>>>> c919ab7 (updates new)
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div
                key={post.id}
<<<<<<< HEAD
                className="animate-fade-in"
=======
                className="animate-fade-in w-full max-w-2xl mx-auto"
>>>>>>> c919ab7 (updates new)
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PostCard post={post} onDelete={refetch} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
<<<<<<< HEAD
            <p className="text-gray-500">
=======
            <p className="text-gray-500 text-sm sm:text-base">
>>>>>>> c919ab7 (updates new)
              {currentState === "ALL" 
                ? "No posts found" 
                : `No posts found in ${getStateName(currentState)}`
              }
            </p>
          </div>
        )}
      </div>
<<<<<<< HEAD
=======

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
>>>>>>> c919ab7 (updates new)
    </div>
  );
};

export default HomePage;
