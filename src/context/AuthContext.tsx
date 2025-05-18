
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  type User as FirebaseUser 
} from "firebase/auth";
import { auth as firebaseAuth } from '@/lib/firebase'; // Import your Firebase auth instance

interface User {
  uid: string;
  fullName: string | null;
  email: string | null;
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
const COOKIE_CONSENT_NAME = 'plagiax_cookie_consent';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setCurrentUser({ 
          uid: firebaseUser.uid,
          email: firebaseUser.email, 
          fullName: firebaseUser.displayName 
        });
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
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

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
    // onAuthStateChanged will handle setting currentUser and redirecting
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
    router.push('/'); // Explicit redirect after successful login
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await updateProfile(userCredential.user, { displayName: fullName });
    // onAuthStateChanged will handle setting currentUser, but for immediate UI update:
     setCurrentUser({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      fullName: fullName,
    });
    // No automatic login after signup, user should go to login page
    // router.push('/login'); // This was changed based on previous requests
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    // onAuthStateChanged will handle setting currentUser to null
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
