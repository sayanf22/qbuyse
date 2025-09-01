import { MessageCircle, Share2, Trash2, MoreVertical, Send, Copy, Facebook, Twitter, Reply, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { getCategoryById } from "@/utils/categories";
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
  DialogDescription,
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
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import { useAuthModal } from "@/hooks/useAuthModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    profile_img?: string;
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
    category?: string;
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
  const { user: currentUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editDescription, setEditDescription] = useState(post.description);
  const [editPrice, setEditPrice] = useState(post.price);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isOpen, defaultTab, openModal, closeModal } = useAuthModal();


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
                .select("full_name, username, profile_img")
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
    return type === 'SELL' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white';
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
      openModal("login");
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

    navigate(`/chat?userId=${post.user_id}&userName=${post.profile_full_name || post.profile_username || 'User'}&postId=${post.id}`);
  };

  const handleDiscussion = () => {
    if (!currentUser) {
      openModal("login");
      return;
    }
    setShowDiscussion(!showDiscussion);
  };

  const updatePost = async () => {
    if (!currentUser || currentUser.id !== post.user_id) return;

    try {
      const { error } = await supabase
        .from("posts")
        .update({
          title: editTitle,
          description: editDescription,
          price: editPrice,
        })
        .eq("id", post.id);

      if (error) throw error;

      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });

      setIsEditing(false);
      if (onDelete) onDelete(); // Trigger refresh
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    }
  };

  const renderComment = (discussion: Discussion, isReply = false) => {
    // Process comment to highlight mentions
    const processedComment = discussion.comment.replace(
      /@(\w+)/g,
      '<span class="text-primary font-medium">@$1</span>'
    );

    const isCommentOwner = currentUser && currentUser.id === discussion.user_id;

    return (
      <div key={discussion.id} className={`flex gap-3 ${isReply ? 'ml-8 mt-2' : ''}`}>
        <div
          className="w-8 h-8 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-800 dark:to-teal-700 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 transition-all duration-200 ring-2 ring-transparent hover:ring-teal-200 dark:hover:ring-teal-600"
          onClick={() => navigate(`/user/${discussion.user_id}`)}
        >
          {discussion.profiles?.profile_img ? (
            <img
              src={discussion.profiles.profile_img}
              alt={discussion.profiles.full_name || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-teal-700 dark:text-teal-200">
              {discussion.profiles?.full_name?.[0] || 'U'}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="bg-muted rounded-lg p-3 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p
                  className="text-sm font-semibold text-foreground mb-1 cursor-pointer hover:text-primary transition-colors hover:underline"
                  onClick={() => navigate(`/user/${discussion.user_id}`)}
                >
                  {discussion.profiles?.full_name || 'Anonymous'}
                </p>
                {discussion.profiles?.username && (
                  <p
                    className="text-xs text-muted-foreground mb-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/user/${discussion.user_id}`)}
                  >
                    @{discussion.profiles.username}
                  </p>
                )}
                <p
                  className="text-sm text-foreground"
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
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
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
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
            </p>
            {currentUser && !isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
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
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden transition-all duration-300 hover:shadow-md w-full flex flex-col">
      {/* Images Carousel */}
      {post.images && post.images.length > 0 && (
        <div className="relative">
          {post.images.length === 1 ? (
            // Single image - no carousel needed
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer aspect-video overflow-hidden">
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="p-4">
                  <DialogTitle className="text-lg font-semibold">{post.title}</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center items-center max-h-[80vh] overflow-hidden">
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            // Multiple images - use carousel
            <Carousel className="w-full">
              <CarouselContent>
                {post.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative cursor-pointer aspect-video overflow-hidden">
                          <img
                            src={image}
                            alt={`${post.title} - Image ${index + 1}`}
                            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                        <DialogHeader className="p-4">
                          <DialogTitle className="text-lg font-semibold">{post.title} - Image {index + 1}</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center items-center max-h-[80vh] overflow-hidden">
                          <img
                            src={image}
                            alt={`${post.title} - Image ${index + 1}`}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/90 hover:bg-background border-0 shadow-lg" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/90 hover:bg-background border-0 shadow-lg" />

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
          {(isOwner || currentUser?.id === post.user_id) && (
            <div className="absolute top-3 left-3 z-[20]">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-background/95 hover:bg-background border-border shadow-lg backdrop-blur-sm"
                    disabled={isDeleting}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical size={18} className="text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-36 z-[50] bg-popover border shadow-lg"
                  side="bottom"
                  sideOffset={5}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditing(true);
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
                    className="text-red-500 hover:text-red-400 hover:bg-red-950/20 cursor-pointer"
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
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="font-bold text-lg"
                  placeholder="Post title"
                />
                <Input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="text-lg font-bold"
                  placeholder="Price"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={updatePost} className="bg-green-600 hover:bg-green-700">
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(post.title);
                      setEditDescription(post.description);
                      setEditPrice(post.price);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-lg text-foreground mb-1">
                  {post.title}
                </h3>
                {post.price && (
                  <p className="text-lg font-bold text-foreground">
                    {formatPrice(post.price)}
                  </p>
                )}
              </>
            )}
          </div>
          {/* 3-dot menu for post owner (when no image) - Always show for debugging */}
          {(isOwner || currentUser?.id === post.user_id) && (!post.images || post.images.length === 0) && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent z-[20] flex-shrink-0"
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 z-[50] bg-popover border shadow-lg"
                side="bottom"
                sideOffset={5}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditing(true);
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
            className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-accent/50 rounded-lg p-3 -mx-1 transition-all duration-200 group border border-transparent hover:border-border/50"
            onClick={() => navigate(`/user/${post.user_id}`)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-800 dark:to-teal-700 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all duration-200 ring-2 ring-transparent group-hover:ring-teal-200 dark:group-hover:ring-teal-600">
              {post.profile_img ? (
                <img
                  src={post.profile_img}
                  alt={post.profile_full_name || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-teal-700 dark:text-teal-200">
                  {post.profile_full_name?.[0] || post.profile_username?.[0] || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {post.profile_full_name || 'Anonymous'}
              </p>
              {post.profile_username && (
                <p className="text-xs text-muted-foreground truncate group-hover:text-primary/80 transition-colors">
                  @{post.profile_username}
                </p>
              )}
            </div>
            <div className="text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
              <span className="text-xs font-medium">View Profile</span>
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Post Date */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>

        {/* Description */}
        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full p-2 border border-border rounded-lg text-sm resize-none bg-input text-foreground"
              rows={3}
              placeholder="Post description"
            />
          </div>
        ) : (
          <div className="mb-4">
            <p className={`text-foreground text-sm ${showFullDescription ? '' : 'line-clamp-2'}`}>
              {post.description}
            </p>
            {post.description && post.description.length > 100 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-primary hover:text-primary/80 text-sm font-medium mt-1 transition-colors"
              >
                {showFullDescription ? 'See less' : 'See more'}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDiscussion}
                    className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs hover:bg-accent transition-colors border-border"
                  >

                    <MessageCircle size={14} />
                    <span>Discussion</span>
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleChat}
                    className="flex items-center gap-1 bg-primary hover:bg-primary/90 rounded-full px-3 py-1.5 text-xs transition-colors text-primary-foreground"
                  >
                    <MessageCircle size={14} />
                    <span>Chat</span>
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs hover:bg-accent transition-colors border-border"
              >
                <Share2 size={14} />
                <span>Share</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="text-center pb-4">
                <DialogTitle className="text-xl font-semibold">Share this post</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Choose how you'd like to share this post
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Native Share (if supported) */}
                {navigator.share && (
                  <Button
                    onClick={handleNativeShare}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-muted hover:bg-accent text-foreground font-medium transition-all"
                    variant="outline"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Share2 size={18} className="text-white" />
                    </div>
                    <span>Share via device</span>
                  </Button>
                )}

                {/* Social Media Options */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleSocialShare('whatsapp')}
                    className="flex items-center justify-center gap-3 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-all transform hover:scale-105"
                  >
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <MessageCircle size={16} className="text-green-500" />
                    </div>
                    <span>WhatsApp</span>
                  </Button>

                  <Button
                    onClick={() => handleSocialShare('facebook')}
                    className="flex items-center justify-center gap-3 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all transform hover:scale-105"
                  >
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <Facebook size={16} className="text-blue-600" />
                    </div>
                    <span>Facebook</span>
                  </Button>

                  <Button
                    onClick={() => handleSocialShare('twitter')}
                    className="flex items-center justify-center gap-3 py-4 rounded-xl bg-black hover:bg-gray-900 text-white font-medium transition-all transform hover:scale-105"
                  >
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <span>X (Twitter)</span>
                  </Button>

                  <Button
                    onClick={() => handleSocialShare('instagram')}
                    className="flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-medium transition-all transform hover:scale-105"
                  >
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-pink-500">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                    <span>Instagram</span>
                  </Button>
                </div>

                {/* Copy Link */}
                <Button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-muted hover:bg-accent text-foreground font-medium transition-all"
                  variant="outline"
                >
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Copy size={18} className="text-white" />
                  </div>
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
                <p className="text-muted-foreground text-sm text-center py-4">No comments yet. Be the first to comment!</p>
              )}

              {/* Add Comment */}
              {currentUser && (
                <div className="space-y-2">
                  {replyingTo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

      {/* Auth Modal */}
      <AuthModal isOpen={isOpen} onClose={closeModal} defaultTab={defaultTab} />

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