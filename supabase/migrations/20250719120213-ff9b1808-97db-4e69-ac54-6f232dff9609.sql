-- Add function to get random posts with profile data
CREATE OR REPLACE FUNCTION public.get_posts_with_profiles(
  p_filter text DEFAULT 'ALL',
  p_state text DEFAULT 'ALL',
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  price numeric,
  type text,
  state text,
  user_id uuid,
  images text[],
  created_at timestamptz,
  profile_full_name text,
  profile_username text,
  profile_img text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.type,
    p.state,
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
    (p_state = 'ALL' OR p.state = p_state)
  ORDER BY 
    p.created_at DESC,
    random()
  LIMIT p_limit;
END;
$$;

-- Add security policy for the function
REVOKE ALL ON FUNCTION public.get_posts_with_profiles FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_posts_with_profiles TO authenticated, anon;

-- Add function to update profile state change tracking
CREATE OR REPLACE FUNCTION public.update_state_change_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.state IS DISTINCT FROM NEW.state THEN
    NEW.last_state_change = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for state change tracking
DROP TRIGGER IF EXISTS trigger_update_state_change ON public.profiles;
CREATE TRIGGER trigger_update_state_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_state_change_timestamp();

-- Add policy to prevent spam posting (max 10 posts per hour per user)
CREATE OR REPLACE FUNCTION public.check_post_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) 
    FROM public.posts 
    WHERE user_id = NEW.user_id 
    AND created_at > now() - interval '1 hour'
  ) >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 10 posts per hour allowed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_post_rate_limit ON public.posts;
CREATE TRIGGER trigger_post_rate_limit
  BEFORE INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.check_post_rate_limit();