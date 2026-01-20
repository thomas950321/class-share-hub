import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/database';

export interface TimeSlot {
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
}

export function useAvailableFriends() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableFriends, setAvailableFriends] = useState<Profile[]>([]);

  const findAvailableFriends = useCallback(async (timeSlot: TimeSlot) => {
    if (!user) return;

    setLoading(true);
    try {
      // Get all friends
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user.id);

      if (friendshipsError) throw friendshipsError;

      if (!friendships || friendships.length === 0) {
        setAvailableFriends([]);
        return;
      }

      const friendIds = friendships.map(f => f.friend_id);

      // Get friends' courses that overlap with the given time slot
      const { data: busyFriendsCourses, error: coursesError } = await supabase
        .from('courses')
        .select('user_id')
        .in('user_id', friendIds)
        .eq('day_of_week', timeSlot.dayOfWeek)
        .or(`and(start_period.lte.${timeSlot.endPeriod},end_period.gte.${timeSlot.startPeriod})`);

      if (coursesError) throw coursesError;

      // Find friends who don't have courses during this time
      const busyFriendIds = new Set(busyFriendsCourses?.map(c => c.user_id) || []);
      const availableFriendIds = friendIds.filter(id => !busyFriendIds.has(id));

      if (availableFriendIds.length === 0) {
        setAvailableFriends([]);
        return;
      }

      // Get profiles of available friends
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', availableFriendIds);

      if (profilesError) throw profilesError;

      setAvailableFriends((profiles || []) as Profile[]);
    } catch (error) {
      console.error('Error finding available friends:', error);
      setAvailableFriends([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { availableFriends, loading, findAvailableFriends };
}
