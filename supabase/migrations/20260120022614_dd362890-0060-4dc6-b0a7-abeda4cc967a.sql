-- Create a restricted view for friend code searches (excludes sensitive columns: email, student_id)
CREATE VIEW public.profile_search
WITH (security_invoker=on) AS
SELECT id, username, friend_code, school
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profile_search TO anon, authenticated;

-- Remove the overly permissive policy that exposes all profile data
DROP POLICY "Users can search profiles by friend_code" ON public.profiles;