import { useState, useEffect } from 'react';
import { authApi } from '@/utils/api';
import { STORAGE_KEYS } from '@/constants';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const AUTH_CHECK_TIMEOUT_MS = 5000;

    const checkAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (storedToken) {
        try {
          const verify = authApi.verifySession(storedToken);
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), AUTH_CHECK_TIMEOUT_MS)
          );
          await Promise.race([verify, timeout]);
          setAccessToken(storedToken);
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        }
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const login = async (id: string, password: string): Promise<boolean> => {
    try {
      const data = await authApi.login(id, password);
      if (data.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        setAccessToken(data.accessToken);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  return { isAuthenticated, accessToken, isCheckingAuth, login };
}
