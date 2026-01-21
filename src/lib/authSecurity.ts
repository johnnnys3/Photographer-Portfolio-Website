/**
 * Authentication security utilities and enhancements
 */

import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
  requireEmailVerification: boolean;
  enableTwoFactorAuth: boolean;
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  sessionTimeout: 1440, // 24 hours instead of 60 minutes
  requireEmailVerification: true,
  enableTwoFactorAuth: false,
};

export class AuthSecurityManager {
  private config: SecurityConfig;
  private loginAttempts: Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }> = new Map();

  constructor(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = config;
    this.cleanupExpiredLockouts();
  }

  /**
   * Check if a user is currently locked out due to too many failed attempts
   */
  public isLockedOut(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    if (!attempts?.lockedUntil) return false;

    const now = new Date();
    if (now > attempts.lockedUntil) {
      this.loginAttempts.delete(email);
      return false;
    }

    return true;
  }

  /**
   * Get remaining lockout time in minutes
   */
  public getLockoutRemainingTime(email: string): number {
    const attempts = this.loginAttempts.get(email);
    if (!attempts?.lockedUntil) return 0;

    const now = new Date();
    const remaining = Math.ceil((attempts.lockedUntil.getTime() - now.getTime()) / (1000 * 60));
    return Math.max(0, remaining);
  }

  /**
   * Record a failed login attempt
   */
  public recordFailedAttempt(email: string): void {
    const existing = this.loginAttempts.get(email) || { count: 0, lastAttempt: new Date() };
    const now = new Date();

    existing.count += 1;
    existing.lastAttempt = now;

    if (existing.count >= this.config.maxLoginAttempts) {
      existing.lockedUntil = new Date(now.getTime() + this.config.lockoutDuration * 60 * 1000);
    }

    this.loginAttempts.set(email, existing);
  }

  /**
   * Reset login attempts on successful login
   */
  public resetAttempts(email: string): void {
    this.loginAttempts.delete(email);
  }

  /**
   * Validate user session and permissions
   */
  public async validateSession(user: User): Promise<{ valid: boolean; requiresReauth: boolean }> {
    if (!user) {
      return { valid: false, requiresReauth: false };
    }

    // Check if email is verified (if required)
    if (this.config.requireEmailVerification && !user.email_confirmed_at) {
      return { valid: false, requiresReauth: true };
    }

    // Check session age
    const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null;
    if (!lastSignIn) {
      return { valid: false, requiresReauth: true };
    }

    const sessionAge = (Date.now() - lastSignIn.getTime()) / (1000 * 60); // in minutes
    if (sessionAge > this.config.sessionTimeout) {
      return { valid: false, requiresReauth: true };
    }

    return { valid: true, requiresReauth: false };
  }

  /**
   * Check if user has admin privileges
   */
  public async isAdmin(user: User): Promise<boolean> {
    if (!user || !user.email) return false;

    try {
      // Check against admin users table or metadata
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('email, role, active')
        .eq('email', user.email)
        .eq('active', true)
        .single();

      return !!adminData;
    } catch (error) {
      const adminDomains = ['photographer.com', 'admin.com'];
      return adminDomains.some(domain => user.email?.endsWith(domain));
    }
  }

  /**
   * Log security events
   */
  public logSecurityEvent(event: {
    type: 'login_success' | 'login_failed' | 'lockout' | 'session_expired' | 'permission_denied';
    email?: string;
    userId?: string;
    details?: any;
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event,
      userAgent: navigator.userAgent,
      ip: 'client-side', // In production, this should come from server
    };

    console.log('Security event:', logEntry);


    // In production, send to security monitoring service
    if (import.meta.env.PROD) {
      // sendToSecurityMonitoring(logEntry);
    }
  }

  /**
   * Cleanup expired lockouts periodically
   */
  private cleanupExpiredLockouts(): void {
    setInterval(() => {
      const now = new Date();
      for (const [email, attempts] of this.loginAttempts.entries()) {
        if (attempts.lockedUntil && now > attempts.lockedUntil) {
          this.loginAttempts.delete(email);
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Get password strength requirements
   */
  public getPasswordRequirements(): {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    description: string;
  } {
    return {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      description: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters',
    };
  }

  /**
   * Validate password strength
   */
  public validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const requirements = this.getPasswordRequirements();
    const errors: string[] = [];

    if (password.length < requirements.minLength) {
      errors.push(`Password must be at least ${requirements.minLength} characters long`);
    }

    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (requirements.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Global security manager instance
export const authSecurityManager = new AuthSecurityManager();

/**
 * Enhanced authentication functions with security checks
 */
export async function secureSignIn(email: string, password: string) {
  // Check if user is locked out
  if (authSecurityManager.isLockedOut(email)) {
    const remainingTime = authSecurityManager.getLockoutRemainingTime(email);
    throw new Error(`Account temporarily locked. Try again in ${remainingTime} minutes.`);
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      authSecurityManager.recordFailedAttempt(email);
      authSecurityManager.logSecurityEvent({
        type: 'login_failed',
        email,
        details: { error: error.message },
      });
      throw error;
    }

    if (data.user) {
      // Check if user has admin privileges
      const isAdminUser = await authSecurityManager.isAdmin(data.user);
      if (!isAdminUser) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      authSecurityManager.resetAttempts(email);
      authSecurityManager.logSecurityEvent({
        type: 'login_success',
        email,
        userId: data.user.id,
      });
    }

    return data;
  } catch (error) {
    authSecurityManager.recordFailedAttempt(email);
    throw error;
  }
}

/**
 * Check session validity and refresh if needed
 */
export async function checkSessionValidity(user: User): Promise<boolean> {
  const validation = await authSecurityManager.validateSession(user);
  
  if (!validation.valid) {
    if (validation.requiresReauth) {
      authSecurityManager.logSecurityEvent({
        type: 'session_expired',
        userId: user.id,
      });
      // Only sign out if this is an admin user or if explicitly accessing admin
      // For public users, just return false without signing out
      try {
        const isAdminUser = await authSecurityManager.isAdmin(user);
        if (isAdminUser) {
          await supabase.auth.signOut();
        }
      } catch (error) {
        // If admin check fails, don't sign out public users
      }
    }
    return false;
  }

  return true;
}
