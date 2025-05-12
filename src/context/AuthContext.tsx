"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Check auth status on mount
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking auth status from localStorage
    const storedAuthStatus = localStorage.getItem('plagiax_isAuthenticated');
    if (storedAuthStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const login = () => {
    localStorage.setItem('plagiax_isAuthenticated', 'true');
    setIsAuthenticated(true);
    router.push('/'); 
  };

  const logout = () => {
    localStorage.removeItem('plagiax_isAuthenticated');
    setIsAuthenticated(false);
    router.push('/login'); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
