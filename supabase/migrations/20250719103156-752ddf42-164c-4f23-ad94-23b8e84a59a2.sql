-- Add read tracking columns to chats table
ALTER TABLE public.chats 
ADD COLUMN is_read BOOLEAN DEFAULT false,
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster unread message queries
CREATE INDEX idx_chats_receiver_unread ON public.chats(receiver_id, is_read, created_at);

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_sender_id UUID, p_receiver_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.chats 
  SET is_read = true, read_at = now()
  WHERE sender_id = p_sender_id 
    AND receiver_id = p_receiver_id 
    AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION mark_messages_as_read(UUID, UUID) TO authenticated;