import { supabase } from './supabase';
import { 
  BuyerType, 
  SignupSource, 
  BuyerOnboardingProgress, 
  BuyerPhoneVerification, 
  BuyerContactRequest,
  BuyerAnalytics 
} from '@/types/auth';

// Buyer signup service
export const buyerServices = {
  // Handle buyer signup completion
  async handleBuyerSignup(
    userId: string,
    buyerType: BuyerType,
    signupSource: SignupSource,
    propertyId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    try {
      const { error } = await supabase.rpc('handle_buyer_signup', {
        p_user_id: userId,
        p_buyer_type: buyerType,
        p_signup_source: signupSource,
        p_property_id: propertyId
      });

      if (error) {
        console.error('Error handling buyer signup:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in handleBuyerSignup:', error);
      return { success: false, error: error.message };
    }
  },

  // Send OTP for phone verification
  async sendPhoneOTP(
    userId: string,
    phoneNumber: string,
    verificationSource: string,
    propertyId?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    try {
      // Generate a 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Insert OTP record
      const { error } = await supabase
        .from('buyer_phone_verifications')
        .upsert({
          user_id: userId,
          phone_number: phoneNumber,
          otp_code: otpCode,
          otp_expires_at: expiresAt.toISOString(),
          verification_source: verificationSource,
          property_id: propertyId
        }, {
          onConflict: 'user_id,phone_number'
        });

      if (error) {
        console.error('Error sending OTP:', error);
        return { success: false, error: error.message };
      }

      // Send SMS via Supabase Edge Function
      const { data: smsResult, error: smsError } = await supabase.functions.invoke('send-sms', {
        body: {
          phoneNumber,
          otpCode,
          userId,
          verificationSource
        }
      });

      if (smsError) {
        console.error('Error calling SMS function:', smsError);
        const errorMessage = (smsError as any)?.message || JSON.stringify(smsError) || 'Unknown error during SMS function call';
        return { success: false, error: `Failed to send SMS: ${errorMessage}` };
      }

      if (!smsResult?.success) {
        console.error('SMS function returned error:', smsResult?.error);
        return { success: false, error: smsResult?.error || 'Failed to send SMS' };
      }

      console.log(`SMS sent successfully to ${phoneNumber}. Message ID: ${smsResult.messageId}`);
      return { success: true };
    } catch (error: any) {
      console.error('Error in sendPhoneOTP:', error);
      return { success: false, error: error.message };
    }
  },

  // Verify OTP
  async verifyPhoneOTP(
    userId: string,
    phoneNumber: string,
    otpCode: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    try {
      // Get the OTP record
      const { data: otpRecord, error: fetchError } = await supabase
        .from('buyer_phone_verifications')
        .select('*')
        .eq('user_id', userId)
        .eq('phone_number', phoneNumber)
        .single();

      if (fetchError || !otpRecord) {
        return { success: false, error: 'Invalid verification attempt' };
      }

      // Check if OTP is expired
      if (new Date(otpRecord.otp_expires_at) < new Date()) {
        return { success: false, error: 'Verification code has expired' };
      }

      // Check if OTP matches
      if (otpRecord.otp_code !== otpCode) {
        return { success: false, error: 'Invalid verification code' };
      }

      // Handle phone verification
      const { error } = await supabase.rpc('handle_phone_verification', {
        p_user_id: userId,
        p_phone_number: phoneNumber,
        p_verification_source: otpRecord.verification_source || 'manual',
        p_property_id: otpRecord.property_id
      });

      if (error) {
        console.error('Error handling phone verification:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in verifyPhoneOTP:', error);
      return { success: false, error: error.message };
    }
  },

  // Get buyer onboarding progress
  async getBuyerOnboardingProgress(userId: string): Promise<BuyerOnboardingProgress | null> {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('buyer_onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching buyer onboarding progress:', error);
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Error in getBuyerOnboardingProgress:', error);
      return null;
    }
  },

  // Update buyer onboarding progress
  async updateBuyerOnboardingProgress(
    userId: string,
    updates: Partial<BuyerOnboardingProgress>
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    try {
      const { error } = await supabase
        .from('buyer_onboarding_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating buyer onboarding progress:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in updateBuyerOnboardingProgress:', error);
      return { success: false, error: error.message };
    }
  },

  // Create contact request
  async createContactRequest(
    buyerId: string,
    propertyId: string,
    sellerId: string,
    buyerType: BuyerType,
    contactMethod: 'phone' | 'email' | 'both',
    message?: string
  ): Promise<{ success: boolean; error?: string; requestId?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    try {
      const { data, error } = await supabase
        .from('buyer_contact_requests')
        .insert({
          buyer_id: buyerId,
          property_id: propertyId,
          seller_id: sellerId,
          buyer_type: buyerType,
          contact_method: contactMethod,
          message: message,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating contact request:', error);
        return { success: false, error: error.message };
      }

      return { success: true, requestId: data.id };
    } catch (error: any) {
      console.error('Error in createContactRequest:', error);
      return { success: false, error: error.message };
    }
  },

  // Get buyer analytics
  async getBuyerAnalytics(userId: string): Promise<BuyerAnalytics | null> {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('buyer_analytics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching buyer analytics:', error);
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Error in getBuyerAnalytics:', error);
      return null;
    }
  },

  // Get user's contact requests
  async getUserContactRequests(userId: string): Promise<BuyerContactRequest[]> {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('buyer_contact_requests')
        .select('*')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contact requests:', error);
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getUserContactRequests:', error);
      return [];
    }
  }
};

