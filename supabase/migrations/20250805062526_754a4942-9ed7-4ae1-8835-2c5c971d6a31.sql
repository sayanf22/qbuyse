-- Add category column to posts table
ALTER TABLE public.posts ADD COLUMN category TEXT NOT NULL DEFAULT 'Others';

-- Update get_posts_with_profiles function to include category filtering
CREATE OR REPLACE FUNCTION public.get_posts_with_profiles(
  p_filter text DEFAULT 'ALL'::text, 
  p_state text DEFAULT 'ALL'::text, 
  p_category text DEFAULT 'ALL'::text,
  p_limit integer DEFAULT 50
) 
RETURNS TABLE(
  id uuid, 
  title text, 
  description text, 
  price numeric, 
  type text, 
  state text, 
  category text,
  user_id uuid, 
  images text[], 
  created_at timestamp with time zone, 
  profile_full_name text, 
  profile_username text, 
  profile_img text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.type,
    p.state,
    p.category,
    p.user_id,
    p.images,
    p.created_at,
    pr.full_name as profile_full_name,
    pr.username as profile_username,
    pr.profile_img
  FROM public.posts p
  LEFT JOIN public.profiles pr ON p.user_id = pr.id
  WHERE 
    (p_filter = 'ALL' OR p.type = p_filter) AND
    (p_state = 'ALL' OR p.state = p_state) AND
    (p_category = 'ALL' OR p.category = p_category)
  ORDER BY 
    p.created_at DESC,
    random()
  LIMIT p_limit;
END;
$function$