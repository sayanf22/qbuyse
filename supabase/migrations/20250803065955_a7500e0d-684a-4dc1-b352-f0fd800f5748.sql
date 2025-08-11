-- Drop existing triggers and recreate properly
DROP TRIGGER IF EXISTS trigger_create_discussion_notification ON public.discussions;
DROP TRIGGER IF EXISTS on_discussion_created ON public.discussions;

-- Create the trigger on discussions table to create notifications
CREATE TRIGGER trigger_create_discussion_notification
  AFTER INSERT ON public.discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_discussion_notification();

-- Enable realtime for discussions table if not already enabled
DO $$
BEGIN
  BEGIN
    ALTER publication supabase_realtime ADD TABLE public.discussions;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Table already in publication, do nothing
      NULL;
  END;
END
$$;