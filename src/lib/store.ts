import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
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
  showSuccessPopup: boolean; // Show success popup after signup
  successPopupData: {
    email?: string;
    title?: string;
    message?: string;
  } | null;
  
  // Actions
  basicSignup: (data: BasicSignupData) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  startVerification: (type: 'buyer' | 'seller', step: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markUserAsReturning: () => void; // Mark user as no longer new
  showSuccessMessage: (data: { email?: string; title?: string; message?: string }) => void;
  hideSuccessMessage: () => void;
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
      showSuccessPopup: false,
      successPopupData: null,

      // Basic signup - creates account immediately
      basicSignup: async (data: BasicSignupData) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Starting signup process for:', data.email);
          
          if (!supabase) {
            throw new Error('Supabase client not initialized');
          }

          // Real Supabase auth call with email confirmation disabled
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/confirm`,
              data: {
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone,
                app_type: 'fintech' // Add app metadata to distinguish from early access
              }
            }
          });

          if (authError) {
            console.error('Supabase auth error:', authError);
            
            // Handle specific error cases
            if (authError.message.includes('User already registered') || 
                authError.message.includes('already exists') ||
                authError.message.includes('duplicate')) {
              throw new Error('This email is already registered. Please sign in instead or use a different email.');
            }
            
            throw new Error(authError.message);
          }

          if (!authData.user) {
            throw new Error('No user data returned from signup');
          }

          console.log('Supabase user created:', authData.user);

          // Send custom confirmation email
          if (authData.user) {
            try {
              await fetch('/api/send-confirmation-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: data.email,
                  firstName: data.firstName,
                  userId: authData.user.id,
                }),
              });
              console.log('Custom confirmation email sent successfully');
            } catch (emailError) {
              console.error('Failed to send custom email:', emailError);
              // Don't fail signup if email sending fails
            }
          }

          // Check if email confirmation is required
          if (authData.user && !authData.user.email_confirmed_at) {
            console.log('Email confirmation required - user not fully authenticated');
            
            // Don't set user as authenticated until email is confirmed
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Please check your email and confirm your account before proceeding.',
              isNewUser: false
            });
            
            // Show email confirmation message
            console.log('📧 SETTING showSuccessPopup to TRUE in store for email:', data.email);
            set({
              showSuccessPopup: true,
              successPopupData: {
                email: data.email,
                title: "Account Created Successfully! 🎉",
                message: "Your account has been created! Please check your email and click the confirmation link to activate your account."
              }
            });
            console.log('✅ Store updated - showSuccessPopup should now be TRUE');
            return;
          }

          // Note: Profile creation is now handled by the database trigger
          // The trigger will automatically create a user profile when a user signs up
          console.log('User profile will be created automatically by database trigger');

                     // Create basic user account for frontend
          const newUser: User = {
             id: authData.user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            
            // Default user state
            level: 'basic',
            roles: [],
            
            // Verification status
             is_phone_verified: false,
            isIdentityVerified: false,
            isFinanciallyVerified: false,
            isPropertyVerified: false,
            isAddressVerified: false,
             kyc_level: 'none',
             buyer_type: undefined,
            
            // System fields
            permissions: getUserPermissions({
               is_phone_verified: false,
              isIdentityVerified: false,
              isFinanciallyVerified: false,
              isPropertyVerified: false,
              kycStatus: 'none'
            }),
            kycStatus: 'none',
            createdAt: new Date()
          };

          console.log('Created new user:', newUser);

          // Set timestamp for fresh signup to prevent unwanted redirects
          localStorage.setItem('userSignupTime', Date.now().toString());
          
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
            error: error instanceof Error ? error.message : 'Signup failed. Please try again.',
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
          if (!supabase) {
            throw new Error('Supabase client not initialized');
          }

          // Real Supabase login
          const { data, error } = await supabase.auth.signInWithPassword({
              email: credentials.email,
            password: credentials.password
          });

          if (error) {
            throw new Error(error.message);
          }

          if (!data.user) {
            throw new Error('No user data returned from login');
          }

          console.log('User logged in:', data.user);

          // Fetch user profile from database
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            // Continue with basic user data if profile not found
          }

                     // Convert Supabase user to our User type
           const user: User = {
             id: data.user.id,
             firstName: profileData?.first_name || data.user.user_metadata?.first_name || 'User',
             lastName: profileData?.last_name || data.user.user_metadata?.last_name || '',
             email: data.user.email || credentials.email,
             phone: profileData?.phone || data.user.user_metadata?.phone || '',
             
             // Map from database profile
             level: profileData?.user_level === 'verified_buyer' || profileData?.user_level === 'verified_seller' ? 'verified' : 'basic',
             roles: profileData?.user_role === 'admin' ? ['admin'] : 
                    profileData?.user_role === 'seller' ? ['seller'] : 
                    profileData?.user_role === 'buyer' ? ['buyer'] : [],
             
             // Verification status from database
             is_phone_verified: profileData?.is_phone_verified || false,
             isIdentityVerified: profileData?.is_identity_verified || false,
             isFinanciallyVerified: profileData?.is_financially_verified || false,
             isPropertyVerified: profileData?.is_property_verified || false,
             isAddressVerified: profileData?.is_address_verified || false,
             kyc_level: profileData?.kyc_level || 'none',
             buyer_type: profileData?.buyer_type || undefined,
             
             // System fields
              permissions: getUserPermissions({
               is_phone_verified: profileData?.is_phone_verified || false,
               isIdentityVerified: profileData?.is_identity_verified || false,
               isFinanciallyVerified: profileData?.is_financially_verified || false,
               isPropertyVerified: profileData?.is_property_verified || false,
               isAddressVerified: profileData?.is_address_verified || false,
               kycStatus: 'none' // TODO: Map from database
             }),
             kycStatus: 'none', // TODO: Map from database
             createdAt: data.user.created_at ? new Date(data.user.created_at) : new Date()
            };

            set({
            user: user,
              isAuthenticated: true,
              isLoading: false,
              isNewUser: false
          });
        } catch (error) {
          set({
            error: 'Login failed. Please check your credentials.',
            isLoading: false
          });
        }
      },

             logout: async () => {
         try {
           if (supabase) {
             await supabase.auth.signOut();
           }
         } catch (error) {
           console.error('Logout error:', error);
         }
         
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
          isNewUser: false
        });
      },

               checkAuth: async () => {
          try {
            if (!supabase) return;

            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error || !user) {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false
              });
              return;
            }

            // Fetch user profile from database
            const { data: profileData, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (profileError) {
              console.error('Profile fetch error:', profileError);
            }

            // Convert Supabase user to our User type
            const userData: User = {
              id: user.id,
              firstName: profileData?.first_name || user.user_metadata?.first_name || 'User',
              lastName: profileData?.last_name || user.user_metadata?.last_name || '',
              email: user.email || '',
              phone: profileData?.phone || user.user_metadata?.phone || '',
              
              // Map from database profile
              level: profileData?.user_level === 'verified_buyer' || profileData?.user_level === 'verified_seller' ? 'verified' : 'basic',
              roles: profileData?.user_role === 'admin' ? ['admin'] : 
                     profileData?.user_role === 'seller' ? ['seller'] : 
                     profileData?.user_role === 'buyer' ? ['buyer'] : [],
              
              // Verification status from database
              is_phone_verified: profileData?.is_phone_verified || false,
              isIdentityVerified: profileData?.is_identity_verified || false,
              isFinanciallyVerified: profileData?.is_financially_verified || false,
              isPropertyVerified: profileData?.is_property_verified || false,
              isAddressVerified: profileData?.is_address_verified || false,
              kyc_level: profileData?.kyc_level || 'none',
              buyer_type: profileData?.buyer_type || undefined,
              
              // System fields
              permissions: getUserPermissions({
                is_phone_verified: profileData?.is_phone_verified || false,
                isIdentityVerified: profileData?.is_identity_verified || false,
                isFinanciallyVerified: profileData?.is_financially_verified || false,
                isPropertyVerified: profileData?.is_property_verified || false,
                isAddressVerified: profileData?.is_address_verified || false,
                kycStatus: 'none' // TODO: Map from database
              }),
              kycStatus: 'none', // TODO: Map from database
              createdAt: user.created_at ? new Date(user.created_at) : new Date()
            };
          

            // Check if user just confirmed their email and needs to complete KYC
            const needsKYC = !profileData?.is_phone_verified && profileData?.kyc_level === 'none';
            const isNewlyConfirmed = Boolean(user.email_confirmed_at) && !profileData?.is_phone_verified;
            
            // Set timestamp for fresh email confirmation to prevent unwanted redirects
            if (isNewlyConfirmed) {
              localStorage.setItem('userEmailConfirmTime', Date.now().toString());
            }

            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              isNewUser: needsKYC || isNewlyConfirmed
            });
          } catch (error) {
            console.error('Auth check error:', error);
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
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
              updates = { is_phone_verified: true };
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
        // Clear timestamps when user is no longer considered new
        localStorage.removeItem('userSignupTime');
        localStorage.removeItem('userEmailConfirmTime');
        set({ isNewUser: false });
      },

      showSuccessMessage: (data) => {
        set({
          showSuccessPopup: true,
          successPopupData: data
        });
      },

      hideSuccessMessage: () => {
        set({
          showSuccessPopup: false,
          successPopupData: null
        });
      }
    }),
    {
      name: 'mukamba-auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isNewUser: state.isNewUser
        // Don't persist success popup state
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