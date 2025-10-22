import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Check if user has pending identity verification
 */
export const checkPendingIdentityVerification = async (
  userId: string
): Promise<{ hasPending: boolean; verificationId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('id, status, verification_type')
      .eq('user_id', userId)
      .eq('verification_type', 'identity')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking pending identity verification:', error);
      return { hasPending: false, error: error.message };
    }

    const hasPending = data && data.length > 0;
    return { 
      hasPending, 
      verificationId: hasPending ? data[0].id : undefined 
    };
  } catch (error) {
    console.error('Error checking pending identity verification:', error);
    return { hasPending: false, error: 'Failed to check pending verification' };
  }
};
