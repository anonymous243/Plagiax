
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  fullName: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, fullName: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedAuthStatus = localStorage.getItem('plagiax_isAuthenticated');
    if (storedAuthStatus === 'true') {
      const storedUserEmail = localStorage.getItem('plagiax_currentUserEmail');
      if (storedUserEmail) {
        const storedUsersString = localStorage.getItem('plagiax_users');
        const storedUsers = storedUsersString ? JSON.parse(storedUsersString) : [];
        const user = storedUsers.find((u: any) => u.email === storedUserEmail);
        if (user) {
          setCurrentUser({ fullName: user.fullName, email: user.email });
          setIsAuthenticated(true);
        } else {
          // Clear inconsistent state if user email is stored but user not found
          localStorage.removeItem('plagiax_isAuthenticated');
          localStorage.removeItem('plagiax_currentUserEmail');
        }
      } else {
         // Clear inconsistent state if authenticated but no user email
        localStorage.removeItem('plagiax_isAuthenticated');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
      router.replace('/');
    }
     if (!isLoading && !isAuthenticated && pathname !== '/login' && pathname !== '/signup' && pathname !== '/about' && pathname !== '/terms') {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const login = (email: string, fullName: string) => {
    localStorage.setItem('plagiax_isAuthenticated', 'true');
    localStorage.setItem('plagiax_currentUserEmail', email);
    setIsAuthenticated(true);
    setCurrentUser({ fullName, email });
    router.push('/'); 
  };

  const logout = () => {
    localStorage.removeItem('plagiax_isAuthenticated');
    localStorage.removeItem('plagiax_currentUserEmail');
    setIsAuthenticated(false);
    setCurrentUser(null);
    router.push('/login'); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout, isLoading }}>
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

