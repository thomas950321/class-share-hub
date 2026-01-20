import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { useFriends } from '@/hooks/useFriends';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Check, X, UserPlus } from 'lucide-react';

export default function FriendRequests() {
  const { user, loading: authLoading } = useAuth();
  const { friendRequests, loading, acceptRequest, rejectRequest } = useFriends();

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">好友請求</h1>
          <p className="text-muted-foreground">管理收到的好友請求</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : friendRequests.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserPlus className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">沒有待處理的好友請求</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {friendRequests.map((request) => (
              <Card key={request.id} className="glass-card">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {request.from_profile?.username?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {request.from_profile?.username || '未知用戶'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {request.from_profile?.friend_code || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => acceptRequest(request.id, request.from_user_id)}
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" />
                      接受
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectRequest(request.id)}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      拒絕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
