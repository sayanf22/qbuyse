import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import PostCard from "@/components/PostCard";
import { toast } from "@/hooks/use-toast";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["userProfilePosts", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleStartChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to start a chat.",
          variant: "destructive",
        });
        return;
      }

      if (user.id === userId) {
        toast({
          title: "Error",
          description: "You cannot start a chat with yourself.",
          variant: "destructive",
        });
        return;
      }

      // Navigate to chat page with the user
      navigate(`/chat?user=${userId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">User not found</h2>
          <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => navigate(-1)} 
              variant="ghost" 
              size="sm"
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Profile</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="bg-card">
        <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-8">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg mb-4">
              {profile.profile_img ? (
                <AvatarImage 
                  src={profile.profile_img} 
                  alt="Profile" 
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-600 dark:to-orange-700 text-2xl font-bold text-orange-800 dark:text-orange-100">
                  {getInitials(profile.full_name || 'User')}
                </AvatarFallback>
              )}
            </Avatar>
            
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {profile.full_name || 'User'}
            </h1>
            {profile.username && (
              <p className="text-muted-foreground text-sm mb-1">
                @{profile.username}
              </p>
            )}
            <p className="text-muted-foreground text-sm mb-4">
              {profile.state || 'Location not set'}
            </p>

            {/* Start Chat Button */}
            <Button
              onClick={handleStartChat}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
          </div>

          {/* User's Posts */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Listings ({userPosts?.length || 0})
            </h2>
            
            {postsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
              </div>
            ) : userPosts && userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    // onDelete not passed since users can't delete other's posts
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No listings yet</p>
                <p className="text-muted-foreground/70 text-sm">This user hasn't posted anything yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;