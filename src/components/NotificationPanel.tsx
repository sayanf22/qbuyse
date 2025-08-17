
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    staleTime: 0, // Always fetch fresh data for notifications
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refresh every 30 seconds as fallback
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    },
  });

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-card rounded-xl shadow-xl border border-border z-50 max-h-96 overflow-hidden animate-fade-in animate-scale-in transform origin-top-right">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
        <h3 className="font-semibold text-foreground text-base">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications?.some(n => !n.is_read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-2 py-1 h-auto transition-colors"
            >
              Mark all read
            </Button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-full transition-colors duration-200"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer animate-fade-in ${
                  !notification.is_read ? "bg-teal-50/50 border-l-2 border-l-teal-500" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsReadMutation.mutate(notification.id);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`p-2 rounded-full ${!notification.is_read ? 'bg-teal-100 dark:bg-teal-950' : 'bg-muted'}`}>
                      <MessageCircle size={14} className={!notification.is_read ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground'} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${!notification.is_read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2 animate-pulse"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={24} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm font-medium mb-1">No notifications yet</p>
            <p className="text-muted-foreground text-xs">You'll see notifications here when someone interacts with your posts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
