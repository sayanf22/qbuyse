-- Create trigger for discussion notifications if it doesn't exist
DROP TRIGGER IF EXISTS trigger_create_discussion_notification ON public.discussions;
CREATE TRIGGER trigger_create_discussion_notification
  AFTER INSERT ON public.discussions
  FOR EACH ROW EXECUTE FUNCTION public.create_discussion_notification();