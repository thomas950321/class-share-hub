import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Course, CourseColor } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function useCourses(userId?: string) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', targetUserId)
        .order('day_of_week')
        .order('start_period');

      if (error) {
        console.error('Error fetching courses:', error);
        toast({ title: '載入課程失敗', variant: 'destructive' });
      } else {
        setCourses((data || []) as Course[]);
      }
      setLoading(false);
    };

    fetchCourses();
  }, [targetUserId]);

  const addCourse = async (courseData: Omit<Course, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('courses')
      .insert({
        ...courseData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding course:', error);
      toast({ title: '添加課程失敗', variant: 'destructive' });
    } else {
      setCourses([...courses, data as Course]);
      toast({ title: '課程已添加' });
    }
  };

  const updateCourse = async (id: string, courseData: Partial<Course>) => {
    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating course:', error);
      toast({ title: '更新課程失敗', variant: 'destructive' });
    } else {
      setCourses(courses.map((c) => (c.id === id ? (data as Course) : c)));
      toast({ title: '課程已更新' });
    }
  };

  const deleteCourse = async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);

    if (error) {
      console.error('Error deleting course:', error);
      toast({ title: '刪除課程失敗', variant: 'destructive' });
    } else {
      setCourses(courses.filter((c) => c.id !== id));
      toast({ title: '課程已刪除' });
    }
  };

  return { courses, loading, addCourse, updateCourse, deleteCourse };
}
