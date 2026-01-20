import { useState, useRef, useCallback, useEffect } from 'react';
import { Course, CourseColor } from '@/types/database';
import { cn } from '@/lib/utils';
import { MapPin, Clock, Settings } from 'lucide-react';
import AvailableFriendsDialog from './AvailableFriendsDialog';
import { useAvailableFriends, TimeSlot } from '@/hooks/useAvailableFriends';

interface ScheduleGridProps {
  courses: Course[];
  onCourseEdit?: (course: Course) => void;
  readonly?: boolean;
}

const DAYS = ['一', '二', '三', '四', '五', '六', '日'];
const PERIODS = [
  { period: 1, start: '08:00', end: '09:00' },
  { period: 2, start: '09:00', end: '10:00' },
  { period: 3, start: '10:00', end: '11:00' },
  { period: 4, start: '11:00', end: '12:00' },
  { period: 5, start: '12:00', end: '13:00' },
  { period: 6, start: '13:00', end: '14:00' },
  { period: 7, start: '14:00', end: '15:00' },
  { period: 8, start: '15:00', end: '16:00' },
  { period: 9, start: '16:00', end: '17:00' },
  { period: 10, start: '17:00', end: '18:00' },
  { period: 11, start: '18:00', end: '19:00' },
  { period: 12, start: '19:00', end: '20:00' },
];

const colorClasses: Record<CourseColor, string> = {
  blue: 'bg-course-blue',
  purple: 'bg-course-purple',
  green: 'bg-course-green',
  orange: 'bg-course-orange',
  pink: 'bg-course-pink',
  cyan: 'bg-course-cyan',
};

export default function ScheduleGrid({ courses, onCourseEdit, readonly }: ScheduleGridProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedCourseName, setSelectedCourseName] = useState<string | undefined>();
  const [showAvailableFriends, setShowAvailableFriends] = useState(false);
  const [showSettingsForCourse, setShowSettingsForCourse] = useState<string | null>(null);
  const { availableFriends, loading: loadingFriends, findAvailableFriends } = useAvailableFriends();
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const settingsTimeout = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const pointerStartPos = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);
  
  const MOVE_THRESHOLD = 10;

  // Auto-hide settings icon after 3 seconds
  useEffect(() => {
    if (showSettingsForCourse) {
      settingsTimeout.current = setTimeout(() => {
        setShowSettingsForCourse(null);
      }, 3000);
      return () => {
        if (settingsTimeout.current) {
          clearTimeout(settingsTimeout.current);
        }
      };
    }
  }, [showSettingsForCourse]);

  const handleCoursePointerDown = useCallback((e: React.PointerEvent, course: Course) => {
    if (readonly) return;
    isLongPress.current = false;
    hasMoved.current = false;
    pointerStartPos.current = { x: e.clientX, y: e.clientY };
    
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowSettingsForCourse(course.id);
    }, 500);
  }, [readonly]);

  const handleSettingsClick = useCallback((e: React.PointerEvent, course: Course) => {
    e.stopPropagation();
    e.preventDefault();
    // Clear any pending timers
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setShowSettingsForCourse(null);
    onCourseEdit?.(course);
  }, [onCourseEdit]);

  const handleCoursePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerStartPos.current) return;
    
    const dx = Math.abs(e.clientX - pointerStartPos.current.x);
    const dy = Math.abs(e.clientY - pointerStartPos.current.y);
    
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      hasMoved.current = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, []);

  const handleCoursePointerUp = useCallback((course: Course, clickedPeriod: number) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Only trigger tap if not a long press AND finger didn't move (not swiping)
    if (!isLongPress.current && !hasMoved.current) {
      const timeSlot: TimeSlot = {
        dayOfWeek: course.day_of_week,
        startPeriod: clickedPeriod,
        endPeriod: clickedPeriod,
      };
      setSelectedTimeSlot(timeSlot);
      setSelectedCourseName(course.name);
      setShowAvailableFriends(true);
      findAvailableFriends(timeSlot);
    }
    
    pointerStartPos.current = null;
  }, [findAvailableFriends]);

  const handleEmptyCellClick = useCallback((day: number, period: number) => {
    const timeSlot: TimeSlot = {
      dayOfWeek: day,
      startPeriod: period,
      endPeriod: period,
    };
    setSelectedTimeSlot(timeSlot);
    setSelectedCourseName(undefined);
    setShowAvailableFriends(true);
    findAvailableFriends(timeSlot);
  }, [findAvailableFriends]);

  const handlePointerLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pointerStartPos.current = null;
  }, []);

  const getCourseForCell = (day: number, period: number) => {
    return courses.find(
      (c) => c.day_of_week === day && period >= c.start_period && period <= c.end_period
    );
  };

  const getCourseTimeRange = (course: Course) => {
    const startTime = PERIODS.find(p => p.period === course.start_period)?.start || '';
    const endTime = PERIODS.find(p => p.period === course.end_period)?.end || '';
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px] p-3">
        {/* Header */}
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="bg-primary/10 rounded-full py-1.5 px-3 text-center text-xs font-medium text-primary">
            節次
          </div>
          {DAYS.map((day) => (
            <div
              key={day}
              className="bg-primary/10 rounded-full py-1.5 px-3 text-center text-xs font-medium text-primary"
            >
              周{day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-8 gap-2">
          {PERIODS.map(({ period, start, end }) => (
            <>
              {/* Period label */}
              <div
                key={`period-${period}`}
                className="bg-card rounded-lg p-2 min-h-[70px] flex flex-col items-center justify-center text-center border border-border/50"
              >
                <div className="text-xs font-medium text-primary">第{period}節</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{start}</div>
                <div className="text-[10px] text-muted-foreground">{end}</div>
              </div>

              {/* Day cells */}
              {DAYS.map((_, dayIndex) => {
                const day = dayIndex + 1;
                const course = getCourseForCell(day, period);

                return (
                  <div
                    key={`${day}-${period}`}
                    className={cn(
                      "bg-card rounded-lg min-h-[70px] border border-border/50 relative",
                      !course && "hover:bg-primary/5 transition-colors cursor-pointer"
                    )}
                    onClick={() => !course && handleEmptyCellClick(day, period)}
                  >
                    {course ? (
                      <button
                        onPointerDown={(e) => handleCoursePointerDown(e, course)}
                        onPointerMove={handleCoursePointerMove}
                        onPointerUp={() => handleCoursePointerUp(course, period)}
                        onPointerLeave={handlePointerLeave}
                        onContextMenu={(e) => e.preventDefault()}
                        className={cn(
                          "absolute inset-0 rounded-lg p-1.5 transition-all flex flex-col items-center justify-center select-none touch-auto overflow-hidden",
                          colorClasses[course.color],
                          "text-white shadow-sm",
                          !readonly && "hover:opacity-90 hover:shadow-md cursor-pointer active:scale-[0.98]",
                          readonly && "cursor-default"
                        )}
                      >
                        {/* Settings icon - appears on long press */}
                        {showSettingsForCourse === course.id && !readonly && (
                          <div
                            onPointerDown={(e) => handleSettingsClick(e, course)}
                            className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-md cursor-pointer hover:bg-white transition-colors z-10"
                          >
                            <Settings className="w-3 h-3 text-gray-700" />
                          </div>
                        )}
                        <div className="font-semibold text-xs leading-tight text-center line-clamp-2 w-full px-0.5">
                          {course.name}
                        </div>
                        {course.classroom && (
                          <div className="flex items-center justify-center gap-0.5 text-[10px] opacity-90 mt-1 w-full">
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{course.classroom}</span>
                          </div>
                        )}
                      </button>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-muted-foreground">點擊查詢</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <AvailableFriendsDialog
        open={showAvailableFriends}
        onOpenChange={setShowAvailableFriends}
        timeSlot={selectedTimeSlot}
        courseName={selectedCourseName}
        availableFriends={availableFriends}
        loading={loadingFriends}
      />
    </div>
  );
}
