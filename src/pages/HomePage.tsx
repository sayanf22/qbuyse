import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/PostCard";
import { Filter, Menu, Bell, ChevronDown, Package } from "lucide-react";
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
import { AuthModal } from "@/components/AuthModal";
import { SEOHead } from "@/components/SEOHead";
import { categories, getCategoryById } from "@/utils/categories";
import { useLanguage } from "@/contexts/LanguageContext";

type PostType = "ALL" | "SELL" | "WANT";

interface Post {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  category: string;
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
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Get user's default state
  useEffect(() => {
    const getUserState = async () => {
      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("state")
          .eq("id", currentUser.id)
          .single();
        
        if (profile?.state) {
          const stateObj = indianStates.find(s => s.name === profile.state);
          setCurrentState(stateObj?.code || "ALL");
        } else {
          setCurrentState("ALL");
        }
      } else {
        setCurrentState("ALL");
      }
    };
    getUserState();
  }, [currentUser]);

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["posts", filter, currentState, selectedCategory],
    queryFn: async (): Promise<Post[]> => {
      try {
        const filterValue = filter === "ALL" ? "ALL" : filter;
        const stateValue = currentState === "ALL" ? "ALL" : 
          indianStates.find(s => s.code === currentState)?.name || "ALL";
        
        const { data, error } = await supabase.rpc('get_posts_with_profiles' as any, {
          p_filter: filterValue,
          p_state: stateValue,
          p_category: selectedCategory,
          p_limit: 50
        });

        if (error) {
          console.error("Error fetching posts:", error);
          return [];
        }
        
        const shuffledData = (data || []).sort(() => Math.random() - 0.5);
        return shuffledData;
      } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
      }
    },
    enabled: true,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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
        (payload) => {
          console.log('Notification received:', payload);
          queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
    <div className="min-h-screen bg-background animate-fade-in">
      <SEOHead 
        title="Home - Buy & Sell in Your State"
        description="India's leading local marketplace to buy and sell products in your state. Find amazing deals, connect with buyers and sellers near you. Join millions using Qbuyse!"
        keywords={['buy sell online', 'local marketplace', 'state wise marketplace', 'classified ads india', 'second hand products', 'new products online', 'local trading', 'peer to peer marketplace']}
      />
      
      <div className="bg-card shadow-sm sticky top-0 z-40 border-b border-border">
        <div className="px-4 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <HamburgerMenu />
            
            <Select value={currentState} onValueChange={handleStateChange}>
              <SelectTrigger className="w-auto min-w-[80px] bg-muted border-none hover:bg-accent transition-colors">
                <span className="text-foreground text-sm sm:text-base">{currentState}</span>
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {indianStates.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
                    <span className="text-sm">{state.code === "ALL" ? "ALL – All States" : `${state.code} – ${state.name}`}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors relative"
                >
                  <Bell size={20} className="text-foreground sm:w-6 sm:h-6" />
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
                className="p-2 hover:bg-accent rounded-lg transition-colors text-primary font-medium text-sm"
              >
                Login
              </button>
            )}
          </div>

          <div className="flex space-x-1 sm:space-x-2 bg-muted rounded-full p-1">
            {(["ALL", "SELL", "WANT"] as PostType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={
                  filter === type
                    ? "flex-1 py-2 px-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 bg-primary text-primary-foreground shadow-sm"
                    : "flex-1 py-2 px-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground"
                }
              >
                {type === "ALL" ? t('all') : type === "SELL" ? t('sell') : t('want')}
              </button>
            ))}
          </div>

          <div className="mt-4 mb-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-semibold text-foreground">{t('browse_categories')}</h3>
              <span className="text-xs text-muted-foreground scroll-hint">{t('scroll_hint')}</span>
            </div>
            <div className="relative">
              <div className="flex space-x-3 overflow-x-auto pb-3 category-scroll">
                <button
                  onClick={() => setSelectedCategory("ALL")}
                  className={
                    selectedCategory === "ALL"
                      ? "flex-shrink-0 px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center space-x-2.5 min-w-fit bg-primary text-primary-foreground"
                      : "flex-shrink-0 px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center space-x-2.5 min-w-fit bg-card text-card-foreground hover:bg-accent border border-border"
                  }
                >
                  <Package size={24} />
                  <span>{t('all_categories')}</span>
                </button>
                
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const translationKey = category.id.toLowerCase().replace(/\s+/g, '_');
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={
                        isSelected
                          ? "flex-shrink-0 px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center space-x-2.5 min-w-fit bg-primary text-primary-foreground"
                          : "flex-shrink-0 px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center space-x-2.5 min-w-fit bg-card text-card-foreground hover:bg-accent border border-border"
                      }
                    >
                      <IconComponent size={24} />
                      <span>{t(translationKey) || category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-in w-full max-w-2xl mx-auto"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PostCard post={post} onDelete={refetch} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-muted-foreground text-sm sm:text-base">
              {currentState === "ALL" 
                ? "No posts found" 
                : `No posts found in ${getStateName(currentState)}`
              }
            </p>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default HomePage;