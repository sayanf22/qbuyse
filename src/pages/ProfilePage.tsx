import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, LogOut, Camera, User, Settings, Bell, Shield, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import PostCard from "@/components/PostCard";
import UsernameSetup from "@/components/UsernameSetup";
import { SEOHead } from "@/components/SEOHead";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<"listings" | "settings">("listings");
  const [activeFilter, setActiveFilter] = useState<"all" | "sell" | "want">("all");
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    full_name: "",
    state: "",
    username: "",
  });

  const { data: profile, refetch, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const { data: userPosts, refetch: refetchPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["userPosts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!profile, // Only fetch posts after profile is loaded
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        state: profile.state || "",
        username: profile.username || "",
      });
    }
  }, [profile]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          state: profileData.state,
          username: profileData.username,
          last_state_change: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
      
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const filteredPosts = userPosts?.filter(post => {
    if (activeFilter === "all") return true;
    return post.type.toLowerCase() === activeFilter;
  }) || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const compressImage = (file: File, maxSizeKB: number = 200): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions to maintain aspect ratio
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx!.drawImage(img, 0, 0, width, height);

        // Start with high quality and reduce until we reach target size
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob && (blob.size <= maxSizeKB * 1024 || quality <= 0.1)) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Compress image to 100-200KB
      const compressedFile = await compressImage(file, 200);
      
      console.log(`Original size: ${(file.size / 1024).toFixed(1)}KB, Compressed size: ${(compressedFile.size / 1024).toFixed(1)}KB`);

      // Delete old image if exists
      if (profile?.profile_img) {
        const oldImagePath = profile.profile_img.split('/').pop();
        if (oldImagePath) {
          await supabase.storage
            .from('profile-images')
            .remove([`${user.id}/${oldImagePath}`]);
        }
      }

      // Upload compressed image
      const fileExt = 'jpg'; // Always use jpg for compressed images
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_img: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success!",
        description: `Profile picture updated successfully. Size: ${(compressedFile.size / 1024).toFixed(1)}KB`,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (profile?.profile_img) {
        const oldImagePath = profile.profile_img.split('/').pop();
        if (oldImagePath) {
          await supabase.storage
            .from('profile-images')
            .remove([`${user.id}/${oldImagePath}`]);
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({ profile_img: null })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Profile picture removed successfully.",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Show loading state while profile is loading
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show username setup if user doesn't have a username
  if (profile && !profile.username) {
    return (
      <UsernameSetup 
        userId={profile.id} 
        onComplete={() => refetch()} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Your Profile & Listings"
        description="Manage your marketplace profile, view your listings, and track your buying and selling activity on Qbuyse"
        keywords={['user profile', 'my listings', 'marketplace account', 'manage posts', 'selling history']}
      />
      <div className="bg-white">
        <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4 group">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                {profile?.profile_img ? (
                  <AvatarImage 
                    src={profile.profile_img} 
                    alt="Profile" 
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-orange-200 to-orange-300 text-2xl font-bold text-gray-700">
                    {getInitials(profile?.full_name || 'User')}
                  </AvatarFallback>
                )}
              </Avatar>
              
              {/* Camera overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-8 h-8 text-white" />
              </div>
              
              {/* Remove image button */}
              {profile?.profile_img && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {uploading && (
              <div className="mb-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {profile?.full_name || 'User'}
            </h1>
            {profile?.username && (
              <p className="text-gray-500 text-sm mb-1">
                @{profile.username}
              </p>
            )}
            <p className="text-gray-500 text-sm">
              {profile?.state || 'Location not set'}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-8">
            <button
              onClick={() => setActiveTab("listings")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === "listings"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Listings
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === "settings"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Settings
            </button>
          </div>

          {/* Content */}
          {activeTab === "listings" ? (
            <div>
              {/* Filter Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setActiveFilter("sell")}
                  className={`flex-1 py-3 px-6 rounded-full font-medium transition-colors ${
                    activeFilter === "sell"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Sell
                </button>
                <button
                  onClick={() => setActiveFilter("want")}
                  className={`flex-1 py-3 px-6 rounded-full font-medium transition-colors ${
                    activeFilter === "want"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Want
                </button>
              </div>

              {/* Listings */}
              {filteredPosts.length > 0 ? (
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onDelete={refetchPosts} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No listings</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {isEditing ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        className="mt-1 rounded-lg border-gray-300 focus:border-gray-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        className="mt-1 rounded-lg border-gray-300 focus:border-gray-500"
                        placeholder="Enter username"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                        State
                      </Label>
                      <select
                        id="state"
                        value={profileData.state}
                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      >
                        {indianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleUpdateProfile}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-3"
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-3"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Settings Options */}
                  <div className="space-y-3">
                    {/* Edit Profile */}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div className="text-left">
                          <span className="font-medium text-gray-900 block">Edit Profile</span>
                          <span className="text-sm text-gray-500">Update your personal information</span>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>


                    {/* Help & Support */}
                    <button 
                      onClick={() => window.location.href = '/help-support'}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <span className="font-medium text-gray-900 block">Help & Support</span>
                          <span className="text-sm text-gray-500">Get help and contact support</span>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>

                    {/* About */}
                    <button 
                      onClick={() => window.location.href = '/about'}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-teal-50 rounded-lg">
                          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <span className="font-medium text-gray-900 block">About</span>
                          <span className="text-sm text-gray-500">Learn more about Qbuyse</span>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </div>

                  {/* Profile Image Actions */}
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Profile Picture</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg py-3"
                        disabled={uploading}
                      >
                        <Camera size={20} className="mr-2" />
                        {uploading ? "Uploading..." : "Upload Photo"}
                      </Button>
                      {profile?.profile_img && (
                        <Button
                          onClick={handleRemoveImage}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-lg py-3"
                        >
                          <Trash2 size={20} className="mr-2" />
                          Remove Photo
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t pt-6">
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg py-3"
                    >
                      <LogOut size={20} className="mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
