
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    full_name: string;
    is_barber: boolean;
    bio?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const currentUser = await apiService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      localStorage.removeItem('access_token');
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const tokens = await apiService.login(email, password);
      localStorage.setItem('access_token', tokens.access_token);
      
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    full_name: string;
    is_barber: boolean;
    bio?: string;
  }) => {
    try {
      await apiService.register(userData);
      
      // Auto-login after registration
      await login(userData.email, userData.password);
      
      toast({
        title: "Account Created!",
        description: "Welcome to BarberEase. Your account has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again with different credentials.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
