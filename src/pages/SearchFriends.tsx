import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { useFriends } from '@/hooks/useFriends';
import { Profile } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function SearchFriends() {
  const { user, loading: authLoading } = useAuth();
  const { searchByFriendCode, sendFriendRequest } = useFriends();
  const [searchCode, setSearchCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Profile | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      toast({ title: '請輸入好友ID', variant: 'destructive' });
      return;
    }

    setSearching(true);
    const result = await searchByFriendCode(searchCode.trim());
    setSearchResult(result);
    setHasSearched(true);
    setSearching(false);

    if (result && result.id === user.id) {
      toast({ title: '這是你自己的ID', variant: 'destructive' });
      setSearchResult(null);
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;

    const success = await sendFriendRequest(searchResult.id);
    if (success) {
      setSearchResult(null);
      setSearchCode('');
      setHasSearched(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">搜索好友</h1>
          <p className="text-muted-foreground">透過好友ID搜索並添加好友</p>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                placeholder="輸入好友ID（例如：A1B2C3D4）"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={searching} className="gap-2">
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                搜索
              </Button>
            </div>
          </CardContent>
        </Card>

        {hasSearched && (
          searchResult ? (
            <Card className="glass-card">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {searchResult.username?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {searchResult.username || '未設置名稱'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ID: {searchResult.friend_code}
                    </p>
                    {searchResult.school && (
                      <p className="text-sm text-muted-foreground">
                        {searchResult.school}
                      </p>
                    )}
                  </div>
                </div>
                <Button onClick={handleSendRequest} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  發送請求
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">找不到此ID的用戶</p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </MainLayout>
  );
}
