
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Simplified User interface for localStorage
interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string; // Store a "hashed" password (in a real app, never store plain passwords)
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const LOCAL_STORAGE_USERS_KEY = 'plagiax_users';
const LOCAL_STORAGE_CURRENT_USER_KEY = 'plagiax_current_user';
const COOKIE_CONSENT_NAME = 'plagiax_cookie_consent';

// Basic "hashing" for prototype purposes - DO NOT USE IN PRODUCTION
const simpleHash = (password: string): string => {
  // This is NOT a secure hash. For demonstration only.
  // In a real app, use libraries like bcrypt or Argon2 on the server.
  return `hashed_${password}_salted_demo`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Load current user from localStorage on initial mount
    try {
      const storedUserString = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
      if (storedUserString) {
        const storedUser = JSON.parse(storedUserString) as User;
        setCurrentUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse current user from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!currentUser && !isLoading;

  useEffect(() => {
    if (!isLoading && isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
      router.replace('/');
    }
    
    const publicPaths = ['/login', '/signup', '/about', '/terms'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const getUsersFromStorage = (): User[] => {
    try {
      const usersString = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      return usersString ? JSON.parse(usersString) : [];
    } catch (error) {
      console.error("Failed to parse users from localStorage:", error);
      return [];
    }
  };

  const saveUsersToStorage = (users: User[]) => {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string) => {
    const users = getUsersFromStorage();
    const user = users.find(u => u.email === email);
    const passwordHash = simpleHash(password);

    if (user && user.passwordHash === passwordHash) {
      setCurrentUser(user);
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
      // Set cookie consent
      if (typeof window !== 'undefined') {
        const consentCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${COOKIE_CONSENT_NAME}=`));
        if (!consentCookie) {
          const date = new Date();
          date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
          const expires = "expires=" + date.toUTCString();
          document.cookie = `${COOKIE_CONSENT_NAME}=true; ${expires}; path=/; SameSite=Lax`;
        }
      }
      router.push('/');
    } else {
      throw new Error("Invalid email or password."); // More specific error for login form
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const users = getUsersFromStorage();
    if (users.find(u => u.email === email)) {
      throw new Error("Email already in use.");
    }
    const newUser: User = {
      id: Date.now().toString(), // Simple ID generation
      fullName,
      email,
      passwordHash: simpleHash(password),
    };
    saveUsersToStorage([...users, newUser]);
    // Do not automatically log in, redirect to login page
    router.push('/login');
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    router.push('/login'); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, signup, logout, isLoading }}>
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
