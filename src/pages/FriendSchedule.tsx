import { useEffect, useState } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ScheduleGrid from '@/components/schedule/ScheduleGrid';
import { useCourses } from '@/hooks/useCourses';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function FriendSchedule() {
  const { user, loading: authLoading } = useAuth();
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const { courses, loading: coursesLoading } = useCourses(friendId);
  const [friendProfile, setFriendProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!friendId) return;

    const fetchFriendProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', friendId)
        .single();

      if (error) {
        console.error('Error fetching friend profile:', error);
      } else {
        setFriendProfile(data as Profile);
      }
      setLoading(false);
    };

    fetchFriendProfile();
  }, [friendId]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/friends')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {friendProfile?.username || '好友'}的課表
            </h1>
            <p className="text-muted-foreground">
              ID: {friendProfile?.friend_code || 'N/A'}
            </p>
          </div>
        </div>

        {loading || coursesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="glass-card rounded-xl p-4">
            <ScheduleGrid courses={courses} readonly />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
