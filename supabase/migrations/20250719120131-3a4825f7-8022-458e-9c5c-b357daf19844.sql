-- Fix username constraint by updating existing data first
UPDATE public.profiles 
SET username = NULL 
WHERE username IS NOT NULL 
AND NOT (username ~ '^[a-z0-9_]+$' AND length(username) >= 3 AND length(username) <= 30);

-- Now add the constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_username_format;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_username_format 
CHECK (username IS NULL OR (username ~ '^[a-z0-9_]+$' AND length(username) >= 3 AND length(username) <= 30));

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts (type);
CREATE INDEX IF NOT EXISTS idx_posts_state ON public.posts (state);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts (user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_post_id ON public.discussions (post_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON public.discussions (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read ON public.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_chats_sender_receiver ON public.chats (sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);

-- Add additional security policies for notifications table
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add policies for chats table to allow updates (marking as read)
DROP POLICY IF EXISTS "Users can update chats" ON public.chats;
CREATE POLICY "Users can update chats" 
ON public.chats 
FOR UPDATE 
USING ((auth.uid() = sender_id) OR (auth.uid() = receiver_id));

-- Add policy to allow users to delete their own chats
DROP POLICY IF EXISTS "Users can delete own chats" ON public.chats;
CREATE POLICY "Users can delete own chats" 
ON public.chats 
FOR DELETE 
USING ((auth.uid() = sender_id) OR (auth.uid() = receiver_id));