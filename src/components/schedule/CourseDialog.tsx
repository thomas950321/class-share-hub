import { useState, useEffect, useMemo } from 'react';
import { Course, CourseColor } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  existingCourses?: Course[];
  onSave: (data: Omit<Course, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onDelete?: () => void;
}

const DAYS = [
  { value: '1', label: '週一' },
  { value: '2', label: '週二' },
  { value: '3', label: '週三' },
  { value: '4', label: '週四' },
  { value: '5', label: '週五' },
  { value: '6', label: '週六' },
  { value: '7', label: '週日' },
];

const PERIODS = Array.from({ length: 11 }, (_, i) => ({
  value: String(i + 1),
  label: `第${i + 1}節`,
}));

const COLORS: { value: CourseColor; label: string; className: string }[] = [
  { value: 'blue', label: '藍色', className: 'bg-course-blue' },
  { value: 'purple', label: '紫色', className: 'bg-course-purple' },
  { value: 'green', label: '綠色', className: 'bg-course-green' },
  { value: 'orange', label: '橙色', className: 'bg-course-orange' },
  { value: 'pink', label: '粉色', className: 'bg-course-pink' },
  { value: 'cyan', label: '青色', className: 'bg-course-cyan' },
];

export default function CourseDialog({
  open,
  onOpenChange,
  course,
  existingCourses = [],
  onSave,
  onDelete,
}: CourseDialogProps) {
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [classroom, setClassroom] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startPeriod, setStartPeriod] = useState('1');
  const [endPeriod, setEndPeriod] = useState('1');
  const [color, setColor] = useState<CourseColor>('blue');

  useEffect(() => {
    if (course) {
      setName(course.name);
      setTeacher(course.teacher || '');
      setClassroom(course.classroom || '');
      setDayOfWeek(String(course.day_of_week));
      setStartPeriod(String(course.start_period));
      setEndPeriod(String(course.end_period));
      setColor(course.color);
    } else {
      setName('');
      setTeacher('');
      setClassroom('');
      setDayOfWeek('1');
      setStartPeriod('1');
      setEndPeriod('1');
      setColor('blue');
    }
  }, [course, open]);

  // Check for time conflicts with existing courses
  const conflictingCourses = useMemo(() => {
    const day = parseInt(dayOfWeek);
    const start = parseInt(startPeriod);
    const end = parseInt(endPeriod);

    return existingCourses.filter((c) => {
      // Skip the current course being edited
      if (course && c.id === course.id) return false;

      // Check if same day and periods overlap
      if (c.day_of_week !== day) return false;

      // Periods overlap if: start1 <= end2 AND end1 >= start2
      return start <= c.end_period && end >= c.start_period;
    });
  }, [dayOfWeek, startPeriod, endPeriod, existingCourses, course]);

  const hasConflict = conflictingCourses.length > 0;

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      teacher: teacher.trim() || null,
      classroom: classroom.trim() || null,
      day_of_week: parseInt(dayOfWeek),
      start_period: parseInt(startPeriod),
      end_period: parseInt(endPeriod),
      color,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[325px] rounded-lg">
        <DialogHeader>
          <DialogTitle>{course ? '編輯課程' : '添加課程'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">課程名稱 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：微積分"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">授課教師</Label>
            <Input
              id="teacher"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="例如：王教授"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classroom">教室</Label>
            <Input
              id="classroom"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              placeholder="例如：理學院 101"
            />
          </div>

          <div className="space-y-2">
            <Label>星期 *</Label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>開始時間 *</Label>
              <Select value={startPeriod} onValueChange={setStartPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>結束時間 *</Label>
              <Select value={endPeriod} onValueChange={setEndPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.filter((p) => parseInt(p.value) >= parseInt(startPeriod)).map(
                    (period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>顏色</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    c.className,
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-foreground"
                      : "opacity-60 hover:opacity-100"
                  )}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {hasConflict && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                時間與以下課程衝突：{conflictingCourses.map((c) => c.name).join('、')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {course && onDelete && (
            <Button variant="destructive" onClick={onDelete} className="mr-auto">
              刪除
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
