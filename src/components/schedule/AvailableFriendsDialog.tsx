import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Profile } from '@/types/database';
import { Users, Check } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TimeSlot } from '@/hooks/useAvailableFriends';

interface AvailableFriendsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeSlot: TimeSlot | null;
  courseName?: string;
  availableFriends: Profile[];
  loading?: boolean;
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
];

export default function AvailableFriendsDialog({
  open,
  onOpenChange,
  timeSlot,
  courseName,
  availableFriends,
  loading,
}: AvailableFriendsDialogProps) {
  if (!timeSlot) return null;

  const getDayName = (day: number) => `周${DAYS[day - 1]}`;
  
  const getTimeRange = () => {
    const startTime = PERIODS.find(p => p.period === timeSlot.startPeriod)?.start || '';
    const endTime = PERIODS.find(p => p.period === timeSlot.endPeriod)?.end || '';
    return `${startTime} - ${endTime}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-primary text-xl">空堂好友</DialogTitle>
        </DialogHeader>

        {/* Time Slot Info */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center mb-4">
          {courseName ? (
            <div className="font-semibold text-lg">{courseName}</div>
          ) : (
            <div className="font-semibold text-lg text-muted-foreground">空堂時段</div>
          )}
          <div className="text-muted-foreground text-sm mt-1">
            {getDayName(timeSlot.dayOfWeek)} {getTimeRange()}
          </div>
        </div>

        {/* Friends List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              載入中...
            </div>
          ) : availableFriends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              此時段沒有空堂的好友
            </div>
          ) : (
            availableFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 bg-primary text-primary-foreground">
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                      {friend.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{friend.username || '未命名'}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {friend.friend_code || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-500 font-medium text-sm">
                  空堂
                  <Check className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
