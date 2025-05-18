
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const COOKIE_NAME = 'plagiax_cookie_consent';

export function CookieConsentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated, isLoading: authIsLoading } = useAuth(); // Get auth state

  useEffect(() => {
    // Ensure this only runs on the client and after auth state is determined
    if (typeof window !== 'undefined' && !authIsLoading) {
      if (isAuthenticated) {
        setIsVisible(false);
        // If authenticated, ensure the cookie is set (self-healing)
        const consentCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${COOKIE_NAME}=`));
        if (!consentCookie) {
          const date = new Date();
          date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
          const expires = "expires=" + date.toUTCString();
          document.cookie = `${COOKIE_NAME}=true; ${expires}; path=/; SameSite=Lax`;
        }
      } else {
        // If not authenticated, check if cookie already exists
        const consentCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${COOKIE_NAME}=`));
        
        if (!consentCookie) {
          setIsVisible(true); // Show popup only if cookie is not set
        } else {
          setIsVisible(false);
        }
      }
    }
  }, [isAuthenticated, authIsLoading]); // Depend on isAuthenticated and authIsLoading

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      const date = new Date();
      date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
      const expires = "expires=" + date.toUTCString();
      document.cookie = `${COOKIE_NAME}=true; ${expires}; path=/; SameSite=Lax`;
      setIsVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-card border-t border-border shadow-2xl p-4 z-[9999]">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 text-sm text-card-foreground">
          <Cookie className="h-7 w-7 text-primary flex-shrink-0 mt-1 sm:mt-0" />
          <p>
            We use cookies to enhance your experience and ensure our website functions optimally. By clicking "Accept", you agree to our use of cookies.
          </p>
        </div>
        <Button onClick={handleAccept} size="sm" className="w-full sm:w-auto flex-shrink-0">
          Accept
        </Button>
      </div>
    </div>
  );
}
