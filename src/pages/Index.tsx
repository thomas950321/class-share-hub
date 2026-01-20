import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ScheduleGrid from '@/components/schedule/ScheduleGrid';
import CourseDialog from '@/components/schedule/CourseDialog';
import { useCourses } from '@/hooks/useCourses';
import { Course } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { courses, loading, addCourse, updateCourse, deleteCourse } = useCourses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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

  const handleCourseEdit = (course: Course) => {
    setSelectedCourse(course);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCourse(null);
    setDialogOpen(true);
  };

  const handleSave = async (data: Omit<Course, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (selectedCourse) {
      await updateCourse(selectedCourse.id, data);
    } else {
      await addCourse(data);
    }
  };

  const handleDelete = async () => {
    if (selectedCourse) {
      await deleteCourse(selectedCourse.id);
      setDialogOpen(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">我的課表</h1>
            <p className="text-muted-foreground">管理你的每週課程安排</p>
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="w-4 h-4" />
            添加課程
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="glass-card rounded-xl p-4">
            <ScheduleGrid courses={courses} onCourseEdit={handleCourseEdit} />
          </div>
        )}

        <CourseDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          course={selectedCourse}
          existingCourses={courses}
          onSave={handleSave}
          onDelete={selectedCourse ? handleDelete : undefined}
        />
      </div>
    </MainLayout>
  );
}
