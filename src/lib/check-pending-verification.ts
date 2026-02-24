import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type IdentityVerificationStatus = 'pending' | 'rejected' | 'approved' | null;

/**
 * Get the latest identity verification status for a user (pending, rejected, or approved).
 * Used to show rejection reason and resubmit option on ProfileDashboard.
 */
export const getLatestIdentityVerificationStatus = async (
  userId: string
): Promise<{
  status: IdentityVerificationStatus;
  rejection_reason?: string | null;
  verificationId?: string;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('id, status, rejection_reason')
      .eq('user_id', userId)
      .eq('verification_type', 'identity')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest identity verification:', error);
      return { status: null, error: error.message };
    }

    const row = data && data.length > 0 ? data[0] : null;
    const status = row?.status as IdentityVerificationStatus ?? null;
    const rejection_reason = (row as { rejection_reason?: string } | null)?.rejection_reason ?? null;
    return {
      status: status === 'pending' || status === 'rejected' || status === 'approved' ? status : null,
      rejection_reason: status === 'rejected' ? rejection_reason : null,
      verificationId: row?.id,
    };
  } catch (error) {
    console.error('Error in getLatestIdentityVerificationStatus:', error);
    return { status: null, error: 'Failed to fetch verification status' };
  }
};

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
