"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/utils/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user từ localStorage khi app khởi động
  useEffect(() => {
    const loadUser = async () => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');
        
        if (storedUser && accessToken) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error('Invalid user data in localStorage');
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/login', { email, password });
      
      // Kiểm tra response structure
      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid response from server');
      }
      
      const { user, access_token, refresh_token } = response.data;
      
      // Lưu tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
    } catch (error: any) {
      // Xóa old tokens nếu có
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Re-throw để Login component có thể catch và hiển thị error
      throw error;
    }
  };

  const logout = () => {
    api.post('/logout').catch(() => {});
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    setUser(null);
    window.location.href = '/home/login';
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/me');
      const updatedUser = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
