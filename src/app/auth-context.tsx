import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { authApi, LoginDto, RegisterDto, UpdateProfileDto } from '@/api/auth.api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  cloudStorageConfigured: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileDto) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('lifeshelf_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('lifeshelf_token');
  });
  const [cloudStorageConfigured, setCloudStorageConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await authApi.getMe();
      setUser(data.user);
      setCloudStorageConfigured(data.cloudStorageConfigured);
      localStorage.setItem('lifeshelf_user', JSON.stringify(data.user));
    } catch {
      // If token is invalid or expired
      setUser(null);
      setToken(null);
      localStorage.removeItem('lifeshelf_token');
      localStorage.removeItem('lifeshelf_user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (data: LoginDto) => {
    const res = await authApi.login(data);
    localStorage.setItem('lifeshelf_token', res.token);
    localStorage.setItem('lifeshelf_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: RegisterDto) => {
    const res = await authApi.register(data);
    localStorage.setItem('lifeshelf_token', res.token);
    localStorage.setItem('lifeshelf_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('lifeshelf_token');
      localStorage.removeItem('lifeshelf_user');
    }
  };

  const updateProfile = async (data: UpdateProfileDto) => {
    const updatedUser = await authApi.updateProfile(data);
    setUser(updatedUser);
    localStorage.setItem('lifeshelf_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        cloudStorageConfigured,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
