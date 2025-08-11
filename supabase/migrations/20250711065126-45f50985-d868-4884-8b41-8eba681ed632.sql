-- Update discussions table to support nested replies and mentions
ALTER TABLE public.discussions 
ADD COLUMN parent_comment_id uuid REFERENCES public.discussions(id) ON DELETE CASCADE,
ADD COLUMN mentions uuid[] DEFAULT '{}';

-- Create index for better performance on nested queries
CREATE INDEX idx_discussions_parent_comment_id ON public.discussions(parent_comment_id);
CREATE INDEX idx_discussions_mentions ON public.discussions USING GIN(mentions);

-- Update the notification creation function to handle mentions
CREATE OR REPLACE FUNCTION public.create_discussion_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  post_owner_id UUID;
  post_title TEXT;
  commenter_name TEXT;
  mentioned_user_id UUID;
BEGIN
  -- Get the post owner and title
  SELECT user_id, title INTO post_owner_id, post_title
  FROM public.posts 
  WHERE id = NEW.post_id;
  
  -- Get the commenter's name
  SELECT full_name INTO commenter_name
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- Create notification for post owner (if not the commenter)
  IF post_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, post_id, comment_id, message)
    VALUES (
      post_owner_id,
      NEW.post_id,
      NEW.id,
      COALESCE(commenter_name, 'Someone') || ' commented on your post "' || post_title || '"'
    );
  END IF;
  
  -- Create notifications for mentioned users
  IF NEW.mentions IS NOT NULL AND array_length(NEW.mentions, 1) > 0 THEN
    FOREACH mentioned_user_id IN ARRAY NEW.mentions
    LOOP
      -- Don't notify the commenter themselves
      IF mentioned_user_id != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, post_id, comment_id, message)
        VALUES (
          mentioned_user_id,
          NEW.post_id,
          NEW.id,
          COALESCE(commenter_name, 'Someone') || ' mentioned you in a comment on "' || post_title || '"'
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;