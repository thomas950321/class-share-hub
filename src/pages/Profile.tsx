import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, Check, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [username, setUsername] = useState('');
  const [school, setSchool] = useState('');
  const [studentId, setStudentId] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setSchool(profile.school || '');
      setStudentId(profile.student_id || '');
    }
  }, [profile]);

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

  const handleCopyCode = async () => {
    if (profile?.friend_code) {
      await navigator.clipboard.writeText(profile.friend_code);
      setCopied(true);
      toast({ title: '已複製好友ID' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      username: username.trim() || null,
      school: school.trim() || null,
      student_id: studentId.trim() || null,
    });
    setSaving(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">個人資料</h1>
          <p className="text-muted-foreground">管理你的個人資訊</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">好友ID</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted px-4 py-3 rounded-lg font-mono text-lg tracking-wider">
                    {profile?.friend_code || '載入中...'}
                  </div>
                  <Button variant="outline" size="icon" onClick={handleCopyCode}>
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  分享此ID給朋友，讓他們可以找到你
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">基本資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">電子郵件</Label>
                  <Input
                    id="email"
                    value={profile?.email || user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">用戶名稱</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="你的名稱"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">學校</Label>
                  <Input
                    id="school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="例如：國立台灣大學"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">學號</Label>
                  <Input
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="例如：B12345678"
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  儲存變更
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
