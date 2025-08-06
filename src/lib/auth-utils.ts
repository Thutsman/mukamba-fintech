// =====================================================
// Authentication Utilities for Mukamba FinTech
// Handles Google OAuth, password validation, and auth helpers
// =====================================================

import { supabase } from './supabase';
import type { User } from '@/types/auth';

// =====================================================
// GOOGLE OAUTH INTEGRATION
// =====================================================

/**
 * Initialize Google OAuth signup
 */
export const signUpWithGoogle = async (): Promise<{ user: User | null; error: string | null }> => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (result.error) throw result.error;

    // The user will be redirected to Google OAuth
    // The actual user creation happens in the callback
    return { user: null, error: null };
  } catch (error) {
    console.error('Google OAuth signup error:', error);
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Google signup failed' 
    };
  }
};

/**
 * Initialize Google OAuth signin
 */
export const signInWithGoogle = async (): Promise<{ user: User | null; error: string | null }> => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (result.error) throw result.error;

    return { user: null, error: null };
  } catch (error) {
    console.error('Google OAuth signin error:', error);
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Google signin failed' 
    };
  }
};

// =====================================================
// PASSWORD VALIDATION
// =====================================================

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  isStrong: boolean;
}

/**
 * Calculate password strength
 */
export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { 
    score: 0, 
    label: '', 
    color: 'bg-gray-200',
    isStrong: false
  };
  
  let score = 0;
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ];
  
  score = checks.filter(Boolean).length;
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-emerald-500'];
  
  return {
    score: Math.min(score, 5),
    label: labels[score],
    color: colors[score],
    isStrong: score >= 4
  };
};

/**
 * Validate password requirements
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// =====================================================
// PHONE VALIDATION
// =====================================================

/**
 * Validate phone number format for SA/ZW
 */
export const validatePhoneFormat = (phone: string, country: 'SA' | 'ZW'): boolean => {
  if (!phone) return true;
  
  const saPattern = /^(\+27|0)[6-8][0-9]{8}$/;
  const zwPattern = /^(\+263|0)[7][1-8][0-9]{7}$/;
  
  const pattern = country === 'SA' ? saPattern : zwPattern;
  return pattern.test(phone);
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string, country: 'SA' | 'ZW'): string => {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  if (country === 'SA') {
    if (digits.startsWith('27')) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    } else if (digits.startsWith('0')) {
      return `+27 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
  } else if (country === 'ZW') {
    if (digits.startsWith('263')) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
    } else if (digits.startsWith('0')) {
      return `+263 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
  }
  
  return phone;
};

// =====================================================
// EMAIL VALIDATION
// =====================================================

/**
 * Check email availability (mock implementation)
 */
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  // Mock implementation - replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const takenEmails = ['admin@mukamba.com', 'agent@mukamba.com', 'test@example.com'];
  return !takenEmails.includes(email);
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// =====================================================
// RATE LIMITING
// =====================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if action is rate limited
 */
export const checkRateLimit = (action: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(action);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(action, {
      count: 1,
      resetTime: now + windowMs
    });
    return false;
  }
  
  if (entry.count >= maxAttempts) {
    return true;
  }
  
  entry.count++;
  return false;
};

/**
 * Clear rate limit for an action
 */
export const clearRateLimit = (action: string): void => {
  rateLimitStore.delete(action);
};

// =====================================================
// ANALYTICS EVENTS
// =====================================================

/**
 * Track authentication events
 */
export const trackAuthEvent = (eventName: string, properties: Record<string, any> = {}) => {
  // Mock analytics tracking - replace with actual analytics service
  console.log('Auth Event:', eventName, properties);
  
  // Example: Google Analytics, Mixpanel, etc.
  // gtag('event', eventName, properties);
  // mixpanel.track(eventName, properties);
};

// =====================================================
// SECURITY HELPERS
// =====================================================

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
};

// =====================================================
// USER ROLE HELPERS
// =====================================================

/**
 * Get default role for new users
 */
export const getDefaultUserRole = (): 'buyer' => 'buyer';

/**
 * Check if user can upgrade role
 */
export const canUpgradeRole = (user: User, targetRole: string): boolean => {
  if (user.roles.includes('admin')) return false;
  if (user.roles.includes(targetRole as any)) return false;
  
  // Add role-specific upgrade requirements
  switch (targetRole) {
    case 'seller':
      return user.isPhoneVerified && user.isIdentityVerified;
    case 'agent':
      return user.isPhoneVerified && user.isIdentityVerified && user.isPropertyVerified;
    default:
      return true;
  }
};

// =====================================================
// SESSION MANAGEMENT
// =====================================================

/**
 * Set remember me preference
 */
export const setRememberMe = (remember: boolean): void => {
  if (remember) {
    localStorage.setItem('mukamba-remember-me', 'true');
  } else {
    localStorage.removeItem('mukamba-remember-me');
  }
};

/**
 * Get remember me preference
 */
export const getRememberMe = (): boolean => {
  return localStorage.getItem('mukamba-remember-me') === 'true';
};

/**
 * Clear all auth-related storage
 */
export const clearAuthStorage = (): void => {
  localStorage.removeItem('mukamba-remember-me');
  sessionStorage.clear();
}; 