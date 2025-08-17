-- Ensure discussions table has proper trigger for notifications
DROP TRIGGER IF EXISTS trigger_create_discussion_notification ON public.discussions;
DROP TRIGGER IF EXISTS on_discussion_created ON public.discussions;

-- Create the trigger on discussions table to create notifications
CREATE TRIGGER create_discussion_notification_trigger
  AFTER INSERT ON public.discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_discussion_notification();

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.notifications;

-- Enable realtime for discussions table 
ALTER TABLE public.discussions REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.discussions;