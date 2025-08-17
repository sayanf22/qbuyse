
-- Create discussions table for comments on posts
CREATE TABLE public.discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for discussions table
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for discussions
CREATE POLICY "Users can view all discussions" 
  ON public.discussions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create discussions" 
  ON public.discussions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discussions" 
  ON public.discussions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own discussions" 
  ON public.discussions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS for notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to create notification when discussion is added
CREATE OR REPLACE FUNCTION public.create_discussion_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  post_title TEXT;
  commenter_name TEXT;
BEGIN
  -- Get the post owner and title
  SELECT user_id, title INTO post_owner_id, post_title
  FROM public.posts 
  WHERE id = NEW.post_id;
  
  -- Get the commenter's name
  SELECT full_name INTO commenter_name
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- Only create notification if comment is not from post owner
  IF post_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, post_id, comment_id, message)
    VALUES (
      post_owner_id,
      NEW.post_id,
      NEW.id,
      COALESCE(commenter_name, 'Someone') || ' commented on your post "' || post_title || '"'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for discussion notifications
CREATE TRIGGER on_discussion_created
  AFTER INSERT ON public.discussions
  FOR EACH ROW EXECUTE FUNCTION public.create_discussion_notification();

-- Enable realtime for discussions and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
