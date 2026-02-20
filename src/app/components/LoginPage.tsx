import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: (id: string, password: string) => Promise<boolean>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !password) {
      toast.error('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onLogin(id, password);
      if (!success) {
        toast.error('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">MY SNS</CardTitle>
          <CardDescription className="text-base">
            카드뉴스 제작 시스템
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">아이디</Label>
              <Input
                id="id"
                type="text"
                placeholder="아이디 (예: 21t)"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 gap-2"
              disabled={isLoading}
            >
              <Lock className="w-4 h-4" />
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 gap-2 mt-2"
              disabled={isLoading}
              onClick={async () => {
                setId('21t');
                setPassword('21t');
                setIsLoading(true);
                try {
                  const success = await onLogin('21t', '21t');
                  if (!success) {
                    toast.error('로그인 실패. Supabase에서 사용자(21t@local / 21t)를 생성했는지 확인하세요.');
                  }
                } catch (error) {
                  console.error('Login error:', error);
                  toast.error('로그인 중 오류가 발생했습니다.');
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              빠른 로그인 (21t)
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-gray-600">
            <p>권한이 있는 사용자만 접속 가능합니다.</p>
            <p className="mt-1 text-xs">문의: 관리자에게 연락하세요</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}