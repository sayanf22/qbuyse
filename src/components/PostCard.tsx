import { MessageCircle, Share2, Trash2, MoreVertical, Send, Copy, Facebook, Twitter, Reply, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Discussion {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  post_id: string;
  parent_comment_id?: string;
  mentions: string[];
  profiles?: {
    full_name: string;
    username: string;
  };
  replies?: Discussion[];
}

interface PostCardProps {
  post: {
    id: string;
    title: string;
    description: string;
    price: number;
    type: string;
    images: string[];
    created_at: string;
    user_id: string;
    profile_full_name?: string;
    profile_username?: string;
    profile_img?: string;
  };
  onDelete?: () => void;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        console.log("Current user in PostCard:", user?.id);
        console.log("Post owner:", post.user_id);
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };
    getCurrentUser();
  }, [post.user_id]);

  // Fetch discussions for this post
  const { data: discussions, isLoading: discussionsLoading, refetch: refetchDiscussions } = useQuery({
    queryKey: ["discussions", post.id],
    queryFn: async () => {
      try {
        console.log("Fetching discussions for post:", post.id);
        const { data, error } = await supabase
          .from("discussions")
          .select(`
            id,
            comment,
            created_at,
            user_id,
            post_id,
            parent_comment_id,
            mentions
          `)
          .eq("post_id", post.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching discussions:", error);
          throw error;
        }

        // Fetch profile data separately for each discussion
        if (data && data.length > 0) {
          const discussionsWithProfiles = await Promise.all(
            data.map(async (discussion) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, username")
                .eq("id", discussion.user_id)
                .single();
              
              return {
                ...discussion,
                profiles: profile
              };
            })
          );

          // Organize discussions into threaded structure
          const topLevelComments: Discussion[] = [];
          const repliesMap: { [key: string]: Discussion[] } = {};

          discussionsWithProfiles.forEach((discussion) => {
            if (!discussion.parent_comment_id) {
              topLevelComments.push(discussion);
            } else {
              if (!repliesMap[discussion.parent_comment_id]) {
                repliesMap[discussion.parent_comment_id] = [];
              }
              repliesMap[discussion.parent_comment_id].push(discussion);
            }
          });

          // Add replies to their parent comments
          topLevelComments.forEach((comment) => {
            comment.replies = repliesMap[comment.id] || [];
          });

          console.log("Organized discussions:", topLevelComments);
          return topLevelComments;
        }

        console.log("Fetched discussions:", data);
        return data || [];
      } catch (error) {
        console.error("Error fetching discussions:", error);
        return [];
      }
    },
    enabled: showDiscussion,
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ comment, parentCommentId }: { comment: string; parentCommentId?: string }) => {
      if (!currentUser) throw new Error("Not authenticated");

      // Extract mentions from comment and validate usernames
      const mentionRegex = /@(\w+)/g;
      const mentionUsernames: string[] = [];
      const mentionUserIds: string[] = [];
      let match;
      
      while ((match = mentionRegex.exec(comment)) !== null) {
        mentionUsernames.push(match[1]);
      }
      
      // Validate mentioned usernames exist and get their user IDs
      if (mentionUsernames.length > 0) {
        const { data: mentionedUsers, error: mentionError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("username", mentionUsernames);
        
        if (mentionError) {
          console.error("Error validating mentions:", mentionError);
          throw new Error("Failed to validate mentioned users");
        }
        
        // Check if all mentioned usernames exist
        const validUsernames = mentionedUsers?.map(u => u.username) || [];
        const invalidUsernames = mentionUsernames.filter(username => !validUsernames.includes(username));
        
        if (invalidUsernames.length > 0) {
          throw new Error(`These users don't exist: @${invalidUsernames.join(', @')}`);
        }
        
        // Store user IDs for mentions
        mentionUserIds.push(...(mentionedUsers?.map(u => u.id) || []));
      }

      console.log("Adding comment:", comment, "for post:", post.id, "by user:", currentUser.id);
      
      const { data, error } = await supabase
        .from("discussions")
        .insert({
          post_id: post.id,
          user_id: currentUser.id,
          comment: comment.trim(),
          parent_comment_id: parentCommentId || null,
          mentions: mentionUserIds,
        })
        .select();

      if (error) {
        console.error("Error adding comment:", error);
        throw error;
      }
      
      console.log("Comment added successfully:", data);
      return data;
    },
    onSuccess: () => {
      setNewComment("");
      setReplyingTo(null);
      refetchDiscussions();
      queryClient.invalidateQueries({ queryKey: ["discussions", post.id] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTypeColor = (type: string) => {
    return type === 'SELL' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const deletePost = async () => {
    if (!currentUser || currentUser.id !== post.user_id) {
      console.log("Cannot delete - not owner");
      return;
    }
    
    setIsDeleting(true);
    try {
      console.log("Deleting post and all related data:", post.id);
      
      // Delete all related data in sequence to ensure proper cleanup
      
      // 1. Delete all notifications related to this post
      const { error: notificationsError } = await supabase
        .from("notifications")
        .delete()
        .eq("post_id", post.id);
      
      if (notificationsError) {
        console.error("Error deleting notifications:", notificationsError);
        throw notificationsError;
      }

      // 2. Delete all discussions/comments related to this post
      const { error: discussionsError } = await supabase
        .from("discussions")
        .delete()
        .eq("post_id", post.id);
      
      if (discussionsError) {
        console.error("Error deleting discussions:", discussionsError);
        throw discussionsError;
      }

      // 3. Delete all chats related to this post
      const { error: chatsError } = await supabase
        .from("chats")
        .delete()
        .eq("post_id", post.id);
      
      if (chatsError) {
        console.error("Error deleting chats:", chatsError);
        throw chatsError;
      }

      // 4. Finally, delete the post itself
      const { error: postError } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (postError) {
        console.error("Error deleting post:", postError);
        throw postError;
      }

      toast({
        title: "Post deleted completely",
        description: "Your post and all related data have been permanently removed.",
      });

      setShowDeleteDialog(false);
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      console.error("Error deleting post and related data:", error);
      toast({
        title: "Error",
        description: "Failed to delete post completely. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate({ 
        comment: newComment, 
        parentCommentId: replyingTo || undefined 
      });
    }
  };

  const handleReplyClick = (commentId: string, username: string) => {
    setReplyingTo(commentId);
    setNewComment(`@${username} `);
  };

  const deleteComment = async (commentId: string) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from("discussions")
        .delete()
        .eq("id", commentId)
        .eq("user_id", currentUser.id); // Ensure user can only delete their own comments

      if (error) throw error;

      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });

      refetchDiscussions();
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const getCurrentUrl = () => {
    return `${window.location.origin}/post/${post.id}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentUrl());
      toast({
        title: "Link copied",
        description: "Post link has been copied to clipboard.",
      });
      setShowShareDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    const url = getCurrentUrl();
    const text = `Check out this ${post.type.toLowerCase()} post: ${post.title}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        break;
      case 'instagram':
        handleCopyLink();
        toast({
          title: "Link copied for Instagram",
          description: "Paste this link in your Instagram story or post.",
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareDialog(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: getCurrentUrl(),
        });
        setShowShareDialog(false);
      } catch (error) {
        console.log('Native sharing cancelled or failed');
      }
    }
  };

  const handleChat = () => {
    if (!currentUser) {
      toast({
        title: "Please login",
        description: "You need to be logged in to chat.",
        variant: "destructive",
      });
      return;
    }

    if (currentUser.id === post.user_id) {
      toast({
        title: "Cannot chat",
        description: "You cannot chat with yourself.",
        variant: "destructive",
      });
      return;
    }

    navigate('/chat', { 
      state: { 
        receiverId: post.user_id,
        postId: post.id 
      } 
    });
  };

  const renderComment = (discussion: Discussion, isReply = false) => {
    // Process comment to highlight mentions
    const processedComment = discussion.comment.replace(
      /@(\w+)/g,
      '<span class="text-blue-600 font-medium">@$1</span>'
    );

    const isCommentOwner = currentUser && currentUser.id === discussion.user_id;

    return (
      <div key={discussion.id} className={`flex gap-3 ${isReply ? 'ml-8 mt-2' : ''}`}>
        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-teal-700">
            {discussion.profiles?.full_name?.[0] || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {discussion.profiles?.full_name || 'Anonymous'}
                </p>
                {discussion.profiles?.username && (
                  <p className="text-xs text-gray-500 mb-2">
                    @{discussion.profiles.username}
                  </p>
                )}
                <p 
                  className="text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: processedComment }}
                />
              </div>
              {/* 3-dot menu for comment owner */}
              {isCommentOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical size={12} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      onClick={() => deleteComment(discussion.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 size={12} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
            </p>
            {currentUser && !isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto"
                onClick={() => handleReplyClick(discussion.id, discussion.profiles?.username || discussion.profiles?.full_name || 'User')}
              >
                <Reply size={12} className="mr-1" />
                Reply
              </Button>
            )}
          </div>
          {/* Render replies */}
          {discussion.replies && discussion.replies.length > 0 && (
            <div className="mt-2">
              {discussion.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const isOwner = currentUser && currentUser.id === post.user_id;
  console.log("Is owner check:", isOwner, "Current user:", currentUser?.id, "Post owner:", post.user_id);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Images Carousel */}
      {post.images && post.images.length > 0 && (
        <div className="relative">
          {post.images.length === 1 ? (
            // Single image - no carousel needed
            <div className="relative">
              <img
                src={post.images[0]}
                alt={post.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
          ) : (
            // Multiple images - use carousel
            <Carousel className="w-full">
              <CarouselContent>
                {post.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative">
                      <img
                        src={image}
                        alt={`${post.title} - Image ${index + 1}`}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white/90 hover:bg-white border-0 shadow-lg" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white/90 hover:bg-white border-0 shadow-lg" />
              
              {/* Image indicator dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {post.images.map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full bg-white/60 transition-all"
                  />
                ))}
              </div>
            </Carousel>
          )}
          
          {/* Type badge */}
          <div className="absolute top-3 right-3 z-20">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(post.type)}`}>
              {post.type === 'SELL' ? 'SELL' : 'WANT'}
            </span>
          </div>
          
          {/* Images count badge for multiple images */}
          {post.images.length > 1 && (
            <div className="absolute top-3 right-20 z-20">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white">
                {post.images.length} photos
              </span>
            </div>
          )}
          
          {/* 3-dot menu for post owner */}
          {isOwner && (
            <div className="absolute top-3 left-3 z-[20]">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/95 hover:bg-white border-gray-200 shadow-lg backdrop-blur-sm"
                    disabled={isDeleting}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical size={16} className="text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-36 z-[10] bg-white border shadow-lg"
                  side="bottom"
                  sideOffset={5}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toast({
                        title: "Coming Soon",
                        description: "Post editing will be available soon.",
                      });
                    }}
                    className="cursor-pointer"
                  >
                    <Edit size={14} className="mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    disabled={isDeleting}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Header with title, price, and 3-dot menu for posts without images */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              {post.title}
            </h3>
            {post.price && (
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(post.price)}
              </p>
            )}
          </div>
          {/* 3-dot menu for post owner (when no image) */}
          {isOwner && (!post.images || post.images.length === 0) && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 z-[20]"
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-36 z-[10] bg-white border shadow-lg"
                side="bottom"
                sideOffset={5}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toast({
                      title: "Coming Soon",
                      description: "Post editing will be available soon.",
                    });
                  }}
                  className="cursor-pointer"
                >
                  <Edit size={14} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  disabled={isDeleting}
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Profile Information - Clickable */}
        {(post.profile_full_name || post.profile_username) && (
          <div 
            className="flex items-center gap-2 mb-3 px-1 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors group"
            onClick={() => navigate(`/user/${post.user_id}`)}
          >
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition-colors">
              {post.profile_img ? (
                <img
                  src={post.profile_img}
                  alt={post.profile_full_name || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-teal-700">
                  {post.profile_full_name?.[0] || post.profile_username?.[0] || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-700 transition-colors">
                {post.profile_full_name || 'Anonymous'}
              </p>
              {post.profile_username && (
                <p className="text-xs text-gray-500 truncate group-hover:text-teal-600 transition-colors">
                  @{post.profile_username}
                </p>
              )}
            </div>
            <div className="text-gray-400 group-hover:text-teal-500 transition-colors">
              <span className="text-xs">View Profile</span>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {post.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <Collapsible open={showDiscussion} onOpenChange={setShowDiscussion}>
              <CollapsibleTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors border-gray-200"
                >
                  <MessageCircle size={14} />
                  <span>Discussion</span>
                </Button>
              </CollapsibleTrigger>
            </Collapsible>

            <Button
              size="sm"
              onClick={handleChat}
              className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 rounded-full px-3 py-1.5 text-xs transition-colors text-white"
            >
              <MessageCircle size={14} />
              <span>Chat</span>
            </Button>
          </div>

          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors border-gray-200"
              >
                <Share2 size={14} />
                <span>Share</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share this post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Native Share (if supported) */}
                {navigator.share && (
                  <Button
                    onClick={handleNativeShare}
                    className="w-full flex items-center justify-center gap-2"
                    variant="outline"
                  >
                    <Share2 size={16} />
                    <span>Share via device</span>
                  </Button>
                )}
                
                {/* Social Media Options */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleSocialShare('whatsapp')}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleSocialShare('facebook')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Facebook size={16} />
                    <span>Facebook</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleSocialShare('twitter')}
                    className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white"
                  >
                    <Twitter size={16} />
                    <span>Twitter</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleSocialShare('instagram')}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <span className="text-lg">📷</span>
                    <span>Instagram</span>
                  </Button>
                </div>
                
                {/* Copy Link */}
                <Button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <Copy size={16} />
                  <span>Copy Link</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Discussion Panel */}
        <Collapsible open={showDiscussion} onOpenChange={setShowDiscussion}>
          <CollapsibleContent className="space-y-3">
            <div className="border-t pt-3">
              {/* Comments */}
              {discussionsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                </div>
              ) : discussions && discussions.length > 0 ? (
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {discussions.map((discussion) => renderComment(discussion))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
              )}

              {/* Add Comment */}
              {currentUser && (
                <div className="space-y-2">
                  {replyingTo && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Replying to comment</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto text-xs text-blue-600"
                        onClick={() => {
                          setReplyingTo(null);
                          setNewComment("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder={replyingTo ? "Type your reply..." : "Add a comment..."}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      className="flex-1 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || addCommentMutation.isPending}
                      className="px-3 bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
              All comments and related data will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deletePost}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PostCard;