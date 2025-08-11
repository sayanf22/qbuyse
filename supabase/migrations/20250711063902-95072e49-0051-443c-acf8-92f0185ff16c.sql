-- Add foreign key constraint between discussions and profiles tables
ALTER TABLE public.discussions 
ADD CONSTRAINT discussions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;