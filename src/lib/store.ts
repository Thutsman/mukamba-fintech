import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, RegistrationData, LoginCredentials, BasicSignupData, UserLevel } from '@/types/auth';
import { getUserPermissions, getUserLevel } from '@/types/auth';

// Simple ID generator that's more predictable
let userIdCounter = 1;

interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isNewUser: boolean; // Track if user just signed up
  hasHydrated: boolean; // Persist hydration completed
  
  // Actions
  basicSignup: (data: BasicSignupData) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  startVerification: (type: 'buyer' | 'seller', step: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markUserAsReturning: () => void; // Mark user as no longer new
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isNewUser: false,
      hasHydrated: false,

      // Basic signup - creates account immediately
      basicSignup: async (data: BasicSignupData) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Starting signup process for:', data.email);
          
          // Mock API call - replace with actual API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Create basic user account
          const newUser: User = {
            id: `user_${userIdCounter++}`,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            
            // Default user state
            level: 'basic',
            roles: [],
            
            // Verification status
            isPhoneVerified: false,
            isIdentityVerified: false,
            isFinanciallyVerified: false,
            isPropertyVerified: false,
            isAddressVerified: false,
            
            // System fields
            permissions: getUserPermissions({
              isPhoneVerified: false,
              isIdentityVerified: false,
              isFinanciallyVerified: false,
              isPropertyVerified: false,
              kycStatus: 'none'
            }),
            kycStatus: 'none',
            createdAt: new Date()
          };

          console.log('Created new user:', newUser);

          set({
            user: newUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isNewUser: true // Mark as new user
          });

          console.log('User authenticated successfully');
        } catch (error) {
          console.error('Signup failed:', error);
          set({
            error: 'Signup failed. Please try again.',
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          throw error; // Re-throw so the modal can handle it
        }
      },

            login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call - replace with actual API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check for admin credentials
          if (credentials.email === 'admin@mukamba.com' && credentials.password === 'admin123') {
            const adminUser: User = {
              id: 'admin_1',
              firstName: 'Admin',
              lastName: 'User',
              email: credentials.email,
              phone: '+27123456789',
              level: 'premium',
              roles: ['admin'],
              isPhoneVerified: true,
              isIdentityVerified: true,
              isFinanciallyVerified: true,
              isPropertyVerified: true,
              isAddressVerified: true,
              nationality: 'SA',
              creditScore: 850,
              permissions: getUserPermissions({
                roles: ['admin'],
                isPhoneVerified: true,
                isIdentityVerified: true,
                isFinanciallyVerified: true,
                isPropertyVerified: true,
                kycStatus: 'approved'
              }),
              kycStatus: 'approved',
              createdAt: new Date()
            };

            set({
              user: adminUser,
              isAuthenticated: true,
              isLoading: false,
              isNewUser: false
            });
            return;
          }

          // Check for agent credentials
          if (credentials.email === 'agent@mukamba.com' && credentials.password === 'agent123') {
            const agentUser: User = {
              id: 'agent_1',
              firstName: 'Sarah',
              lastName: 'Johnson',
              email: credentials.email,
              phone: '+27123456789',
              level: 'premium',
              roles: ['agent'],
              isPhoneVerified: true,
              isIdentityVerified: true,
              isFinanciallyVerified: true,
              isPropertyVerified: true,
              isAddressVerified: true,
              nationality: 'SA',
              creditScore: 800,
              permissions: getUserPermissions({
                roles: ['agent'],
                isPhoneVerified: true,
                isIdentityVerified: true,
                isFinanciallyVerified: true,
                isPropertyVerified: true,
                kycStatus: 'approved'
              }),
              kycStatus: 'approved',
              createdAt: new Date()
            };

            set({
              user: agentUser,
              isAuthenticated: true,
              isLoading: false,
              isNewUser: false
            });
            return;
          }

          // Check for verified seller credentials (test account)
          if (credentials.email === 'seller@mukamba.com' && credentials.password === 'seller123') {
            const sellerUser: User = {
              id: 'seller_1',
              firstName: 'Verified',
              lastName: 'Seller',
              email: credentials.email,
              phone: '+27123456789',
              level: 'premium',
              roles: ['seller'],
              isPhoneVerified: true,
              isIdentityVerified: true,
              isFinanciallyVerified: true,
              isPropertyVerified: true,
              isAddressVerified: true,
              nationality: 'SA',
              permissions: getUserPermissions({
                roles: ['seller'],
                isPhoneVerified: true,
                isIdentityVerified: true,
                isFinanciallyVerified: true,
                isPropertyVerified: true,
                isAddressVerified: true,
                kycStatus: 'approved'
              }),
              kycStatus: 'approved',
              createdAt: new Date()
            };

            set({
              user: sellerUser,
              isAuthenticated: true,
              isLoading: false,
              isNewUser: false
            });
            return;
          }
          
          // Mock user data - replace with actual API response
          const mockUser: User = {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: credentials.email,
            phone: '+27123456789',
            level: 'verified',
            roles: ['buyer'],
            isPhoneVerified: true,
            isIdentityVerified: true,
            isFinanciallyVerified: true,
            isPropertyVerified: false,
            isAddressVerified: true,
            nationality: 'SA',
            creditScore: 750,
            permissions: getUserPermissions({
              isPhoneVerified: true,
              isIdentityVerified: true,
              isFinanciallyVerified: true,
              isPropertyVerified: false,
              isAddressVerified: true,
              kycStatus: 'approved'
            }),
            kycStatus: 'approved',
            createdAt: new Date()
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            isNewUser: false // Returning user
          });
        } catch (error) {
          set({
            error: 'Login failed. Please check your credentials.',
            isLoading: false
          });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
          isNewUser: false
        });
      },

      startVerification: async (type: 'buyer' | 'seller', step: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock verification process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const { user } = get();
          if (!user) return;

          // Update user based on verification step
          let updates: Partial<User> = {};
          
          switch (step) {
            case 'phone-verification':
              updates = { isPhoneVerified: true };
              break;
            case 'identity-verification':
              updates = { isIdentityVerified: true, nationality: 'SA' };
              break;
            case 'financial-verification':
              updates = { isFinanciallyVerified: true, creditScore: Math.floor(Math.random() * 200) + 650 };
              break;
            case 'property-verification':
              updates = { isPropertyVerified: true };
              break;
          }

          // Add role if not already present
          const newRoles = user.roles.includes(type) ? user.roles : [...user.roles, type];
          updates.roles = newRoles;

          // Update permissions
          const updatedUser = { ...user, ...updates };
          updates.permissions = getUserPermissions(updatedUser);
          updates.level = getUserLevel(updatedUser);

          set({
            user: { ...user, ...updates },
            isLoading: false
          });
        } catch (error) {
          set({
            error: 'Verification failed. Please try again.',
            isLoading: false
          });
        }
      },

      updateUser: (updates: Partial<User>) => {
        console.log('Store updateUser called with:', updates);
        set((state) => {
          const newUser = state.user ? { ...state.user, ...updates } : null;
          console.log('Store user updated to:', newUser);
          return {
            user: newUser
          };
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      markUserAsReturning: () => {
        set({ isNewUser: false });
      }
    }),
    {
      name: 'mukamba-auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isNewUser: state.isNewUser
      }),
      onRehydrateStorage: () => (_state, _error) => {
        // Mark store as hydrated after persistence restores state
        // This avoids redirects based on pre-hydration defaults, especially on mobile
        // We cannot call set from here, so use a microtask to update after rehydrate
        queueMicrotask(() => {
          try {
            // Access the store and set the flag
            useAuthStore.setState({ hasHydrated: true });
          } catch (_) {
            // no-op
          }
        });
      }
    }
  )
); 