import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '@/integrations/api/client';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  roles: string[];
}
interface Roles {
  role: string[];
}
interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, displayName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        const response = await apiClient.getMe();
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear it
          await apiClient.logout();
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    toast.error('Sign up is disabled. Please use registration form.');
    return { error: { message: 'Sign up disabled' } };
  };

  // const getUsers = async()=>{
  //   try{
  //     const response = await apiClient.getUsers();
  //   }
  // }

  const register = async (email: string, password: string, displayName: string, role: string) => {
    try {
      const response = await apiClient.register({
        email,
        password,
        displayName,
        role,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success('Account created and signed in!');
        navigate('/');
        return;
      }

      throw new Error('Registration failed');
    } catch (error: any) {
      const message = error.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });

      if (response.error) {
        toast.error(response.error.message);
        return { error: response.error };
      }

      if (response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success('Signed in successfully!');
        navigate('/');
        return { error: null };
      }

      return { error: { message: 'Unknown error' } };
    } catch (error: any) {
      const message = error.message || 'Sign in failed';
      toast.error(message);
      return { error: { message } };
    }
  };

  const signOut = async () => {
    await apiClient.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Signed out successfully!');
    navigate('/auth');
  };

  return (
    <AuthContext.Provider
      value={{ user, signUp, signIn, register, signOut, loading, isAuthenticated }}
    >
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
