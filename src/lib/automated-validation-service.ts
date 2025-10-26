// =====================================================
// Automated Validation Service
// =====================================================
// This service integrates automated document validation with the database
// and handles the complete validation workflow for KYC verifications.

import { createClient } from '@supabase/supabase-js';
import { validateDocumentsAutomatically as runDocumentValidation } from './client-document-validation';
import type { KYCVerification } from '@/types/database';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =====================================================
// TYPES
// =====================================================

export interface ValidationResult {
  success: boolean;
  autoApproved: boolean;
  riskScore: number;
  scores: {
    selfieQuality: number;
    idFrontQuality: number;
    idBackQuality: number;
    faceMatch: number;
  };
  reasons: string[];
  error?: string;
}

export interface DocumentFiles {
  selfieFile: File;
  idFrontFile: File;
  idBackFile?: File;
}

// =====================================================
// MAIN VALIDATION SERVICE
// =====================================================

/**
 * Validates documents automatically and updates the database
 * @param verificationId - The KYC verification ID
 * @param files - The uploaded document files
 * @returns Validation result with approval status
 */
export async function validateDocumentsAutomatically(
  verificationId: string,
  files: DocumentFiles
): Promise<ValidationResult> {
  try {
    console.log(`Starting automated validation for verification ${verificationId}`);
    
    // Run automated validation checks
    const validationResult = await runDocumentValidation(
      files.selfieFile,
      files.idFrontFile,
      files.idBackFile
    );
    
    const { riskAssessment, scores } = validationResult;
    
    // Update database with validation results
    const { error: updateError } = await supabase
      .from('kyc_verifications')
      .update({
        automated_risk_score: riskAssessment.riskScore,
        selfie_quality_score: scores.selfieQuality,
        id_front_quality_score: scores.idFrontQuality,
        id_back_quality_score: scores.idBackQuality,
        face_match_score: scores.faceMatch,
        auto_approved: riskAssessment.autoApproved,
        updated_at: new Date().toISOString()
      })
      .eq('id', verificationId);
    
    if (updateError) {
      console.error('Error updating validation results:', updateError);
      return {
        success: false,
        autoApproved: false,
        riskScore: 1.0,
        scores: {
          selfieQuality: 0,
          idFrontQuality: 0,
          idBackQuality: 0,
          faceMatch: 0
        },
        reasons: ['Database update failed'],
        error: updateError.message
      };
    }
    
    // If auto-approved, update user verification status
    if (riskAssessment.autoApproved) {
      await updateUserVerificationStatus(verificationId);
    }
    
    console.log('Validation completed:', {
      autoApproved: riskAssessment.autoApproved,
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel
    });
    
    return {
      success: true,
      autoApproved: riskAssessment.autoApproved,
      riskScore: riskAssessment.riskScore,
      scores,
      reasons: riskAssessment.reasons
    };
    
  } catch (error) {
    console.error('Error in automated validation service:', error);
    return {
      success: false,
      autoApproved: false,
      riskScore: 1.0,
      scores: {
        selfieQuality: 0,
        idFrontQuality: 0,
        idBackQuality: 0,
        faceMatch: 0
      },
      reasons: ['Validation system error'],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Updates user verification status when auto-approved
 */
async function updateUserVerificationStatus(verificationId: string): Promise<void> {
  try {
    // Get the user_id from the verification
    const { data: verification, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('user_id')
      .eq('id', verificationId)
      .single();
    
    if (fetchError || !verification) {
      console.error('Error fetching verification:', fetchError);
      return;
    }
    
    // Update user profile verification status
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        is_identity_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', verification.user_id);
    
    if (updateError) {
      console.error('Error updating user verification status:', updateError);
    } else {
      console.log(`User ${verification.user_id} identity verification auto-approved`);
    }
    
  } catch (error) {
    console.error('Error updating user verification status:', error);
  }
}

/**
 * Gets validation results for a verification
 */
export async function getValidationResults(verificationId: string): Promise<{
  verification: KYCVerification | null;
  error?: string;
}> {
  try {
    const { data: verification, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('id', verificationId)
      .single();
    
    if (error) {
      return { verification: null, error: error.message };
    }
    
    return { verification };
  } catch (error) {
    return { 
      verification: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Gets all auto-approved verifications for admin review
 */
export async function getAutoApprovedVerifications(): Promise<{
  verifications: KYCVerification[];
  error?: string;
}> {
  try {
    const { data: verifications, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('auto_approved', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { verifications: [], error: error.message };
    }
    
    return { verifications: verifications || [] };
  } catch (error) {
    return { 
      verifications: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Gets high-risk verifications that need manual review
 */
export async function getHighRiskVerifications(): Promise<{
  verifications: KYCVerification[];
  error?: string;
}> {
  try {
    const { data: verifications, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .or('auto_approved.is.null,auto_approved.eq.false')
      .gte('automated_risk_score', 0.5)
      .order('automated_risk_score', { ascending: false });
    
    if (error) {
      return { verifications: [], error: error.message };
    }
    
    return { verifications: verifications || [] };
  } catch (error) {
    return { 
      verifications: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Override auto-approval decision (admin function)
 */
export async function overrideAutoApproval(
  verificationId: string, 
  approved: boolean, 
  adminId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: updateError } = await supabase
      .from('kyc_verifications')
      .update({
        auto_approved: approved,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        admin_notes: reason || (approved ? 'Admin override - approved' : 'Admin override - rejected'),
        updated_at: new Date().toISOString()
      })
      .eq('id', verificationId);
    
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    // Update user verification status if approved
    if (approved) {
      await updateUserVerificationStatus(verificationId);
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get validation statistics for admin dashboard
 */
export async function getValidationStats(): Promise<{
  stats: {
    totalVerifications: number;
    autoApproved: number;
    pendingReview: number;
    highRisk: number;
    averageRiskScore: number;
  };
  error?: string;
}> {
  try {
    // Get all verifications with validation data
    const { data: verifications, error } = await supabase
      .from('kyc_verifications')
      .select('auto_approved, automated_risk_score')
      .not('automated_risk_score', 'is', null);
    
    if (error) {
      return { 
        stats: {
          totalVerifications: 0,
          autoApproved: 0,
          pendingReview: 0,
          highRisk: 0,
          averageRiskScore: 0
        }, 
        error: error.message 
      };
    }
    
    const totalVerifications = verifications.length;
    const autoApproved = verifications.filter(v => v.auto_approved === true).length;
    const pendingReview = verifications.filter(v => v.auto_approved === false).length;
    const highRisk = verifications.filter(v => (v.automated_risk_score || 0) >= 0.5).length;
    
    const riskScores = verifications
      .map(v => v.automated_risk_score || 0)
      .filter(score => score > 0);
    const averageRiskScore = riskScores.length > 0 
      ? riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length 
      : 0;
    
    return {
      stats: {
        totalVerifications,
        autoApproved,
        pendingReview,
        highRisk,
        averageRiskScore: Math.round(averageRiskScore * 100) / 100
      }
    };
  } catch (error) {
    return { 
      stats: {
        totalVerifications: 0,
        autoApproved: 0,
        pendingReview: 0,
        highRisk: 0,
        averageRiskScore: 0
      }, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
