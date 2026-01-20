-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Users can insert friendships" ON public.friendships;

-- Create new policy that allows inserting friendships when accepting a friend request
-- This allows inserting a record where user_id matches auth.uid() OR 
-- when there's a pending friend request from the other user
CREATE POLICY "Users can insert friendships" 
ON public.friendships 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM friend_requests 
    WHERE friend_requests.from_user_id = user_id 
    AND friend_requests.to_user_id = auth.uid() 
    AND friend_requests.status = 'pending'
  )
);