/**
 * MIGRATION NOTE:
 * Source: src/contexts/AuthContext.tsx
 * Destination: src/contexts/AuthContext.tsx (updated for Next.js)
 * This context needs 'use client' because it uses React hooks and browser-only auth features.
 * The authentication logic is preserved exactly from the original implementation.
 * Any deviation is unintentional and should be flagged.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange } from '../lib/auth';
import { checkSessionValidity, authSecurityManager } from '../lib/authSecurity';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  sessionValid: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    // Get initial user and validate session only for admin access
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          // Only check session validity and admin status if user might access admin
          const isValid = await checkSessionValidity(currentUser);
          setSessionValid(isValid);
          
          if (isValid) {
            // Check admin privileges
            const adminStatus = await authSecurityManager.isAdmin(currentUser);
            setIsAdmin(adminStatus);
            
            if (!adminStatus) {
              // Sign out if not admin (but don't block public access)
              const { signOut } = await import('../lib/auth');
              await signOut();
              setUser(null);
              setSessionValid(false);
            }
          }
        } else {
          setSessionValid(false);
          setIsAdmin(false);
        }
      } catch (error) {
        setUser(null);
        setSessionValid(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const isValid = await checkSessionValidity(currentUser);
        setSessionValid(isValid);
        
        if (isValid) {
          const adminStatus = await authSecurityManager.isAdmin(currentUser);
          setIsAdmin(adminStatus);
          
          if (!adminStatus) {
            const { signOut } = await import('../lib/auth');
            await signOut();
            setUser(null);
            setSessionValid(false);
          }
        } else {
          setIsAdmin(false);
        }
      } else {
        setSessionValid(false);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOutUser = async () => {
    try {
      const { signOut } = await import('../lib/auth');
      await signOut();
      setUser(null);
      setIsAdmin(false);
      setSessionValid(false);
      
      // Log security event
      authSecurityManager.logSecurityEvent({
        type: 'login_success', // Using this as logout event
        details: { action: 'logout' }
      });
    } catch (error) {
    }
  };

  const refreshSession = async () => {
    if (user) {
      const isValid = await checkSessionValidity(user);
      setSessionValid(isValid);
      
      if (!isValid) {
        await signOutUser();
      }
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    sessionValid,
    signOut: signOutUser,
    refreshSession,
  };

  return (
    <ErrorBoundary context="Auth Provider">
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </ErrorBoundary>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
