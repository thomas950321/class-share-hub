import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, FriendRequestWithProfile, FriendWithProfile } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('id, friend_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching friendships:', error);
      return;
    }

    if (friendships && friendships.length > 0) {
      const friendIds = friendships.map((f) => f.friend_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);

      if (profileError) {
        console.error('Error fetching friend profiles:', profileError);
        return;
      }

      const friendsWithProfiles = friendships.map((f) => ({
        id: f.id,
        friend_id: f.friend_id,
        profile: profiles?.find((p) => p.id === f.friend_id) as Profile,
      })).filter((f) => f.profile);

      setFriends(friendsWithProfiles);
    } else {
      setFriends([]);
    }
  }, [user]);

  const fetchFriendRequests = useCallback(async () => {
    if (!user) return;

    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('to_user_id', user.id)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching friend requests:', error);
      return;
    }

    if (requests && requests.length > 0) {
      const fromUserIds = requests.map((r) => r.from_user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', fromUserIds);

      if (profileError) {
        console.error('Error fetching request profiles:', profileError);
        return;
      }

      const requestsWithProfiles = requests.map((r) => ({
        ...r,
        from_profile: profiles?.find((p) => p.id === r.from_user_id) as Profile,
      }));

      setFriendRequests(requestsWithProfiles);
    } else {
      setFriendRequests([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchFriends(), fetchFriendRequests()]);
      setLoading(false);
    };

    loadData();
  }, [user, fetchFriends, fetchFriendRequests]);

  const searchByFriendCode = async (code: string): Promise<Profile | null> => {
    // Use profile_search view to avoid exposing sensitive data (email, student_id)
    // Type assertion needed since view is not in generated types
    const { data, error } = await (supabase as any)
      .from('profile_search')
      .select('id, username, friend_code, school')
      .eq('friend_code', code.toUpperCase())
      .maybeSingle();

    if (error) {
      console.error('Error searching profile:', error);
      toast({ title: '搜索失敗', variant: 'destructive' });
      return null;
    }

    if (!data) return null;

    // Map view data to Profile type (email and student_id are protected)
    return {
      id: data.id,
      username: data.username,
      friend_code: data.friend_code,
      school: data.school,
      email: null,
      student_id: null,
      created_at: null,
      updated_at: null,
    } as Profile;
  };

  const sendFriendRequest = async (toUserId: string) => {
    if (!user) return false;

    // Check if already friends
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('id')
      .eq('user_id', user.id)
      .eq('friend_id', toUserId)
      .maybeSingle();

    if (existingFriendship) {
      toast({ title: '你們已經是好友了', variant: 'destructive' });
      return false;
    }

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from('friend_requests')
      .select('id')
      .eq('from_user_id', user.id)
      .eq('to_user_id', toUserId)
      .maybeSingle();

    if (existingRequest) {
      toast({ title: '好友請求已發送過', variant: 'destructive' });
      return false;
    }

    const { error } = await supabase.from('friend_requests').insert({
      from_user_id: user.id,
      to_user_id: toUserId,
    });

    if (error) {
      console.error('Error sending friend request:', error);
      toast({ title: '發送請求失敗', variant: 'destructive' });
      return false;
    }

    toast({ title: '好友請求已發送' });
    return true;
  };

  const acceptRequest = async (requestId: string, fromUserId: string) => {
    if (!user) return;

    // Create mutual friendships
    const { error: friendshipError } = await supabase.from('friendships').insert([
      { user_id: user.id, friend_id: fromUserId },
      { user_id: fromUserId, friend_id: user.id },
    ]);

    if (friendshipError) {
      console.error('Error creating friendship:', friendshipError);
      toast({ title: '接受請求失敗', variant: 'destructive' });
      return;
    }

    // Update request status
    await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    toast({ title: '已接受好友請求' });
    await Promise.all([fetchFriends(), fetchFriendRequests()]);
  };

  const rejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) {
      console.error('Error rejecting request:', error);
      toast({ title: '拒絕請求失敗', variant: 'destructive' });
      return;
    }

    toast({ title: '已拒絕好友請求' });
    await fetchFriendRequests();
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

    if (error) {
      console.error('Error removing friend:', error);
      toast({ title: '刪除好友失敗', variant: 'destructive' });
      return;
    }

    toast({ title: '已刪除好友' });
    await fetchFriends();
  };

  return {
    friends,
    friendRequests,
    loading,
    searchByFriendCode,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    refetch: () => Promise.all([fetchFriends(), fetchFriendRequests()]),
  };
}
