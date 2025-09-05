'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types
export interface PropertyActionOptions {
  propertyId: string;
  adminId: string;
  details?: Record<string, any>;
}

export interface PropertyActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface UsePropertyActionsReturn {
  deleteProperty: (options: PropertyActionOptions) => Promise<PropertyActionResult>;
  restoreProperty: (options: PropertyActionOptions) => Promise<PropertyActionResult>;
  isDeleting: boolean;
  isRestoring: boolean;
  isLoading: boolean;
}

export const usePropertyActions = (): UsePropertyActionsReturn => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const isLoading = isDeleting || isRestoring;

  // Helper function to get current user ID
  const getCurrentUserId = async (): Promise<string | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error('Error getting current user:', error);
        return null;
      }

      return user.id;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  // Helper function to log activity
  const logActivity = async (
    propertyId: string,
    adminId: string,
    action: 'deleted' | 'restored',
    details?: Record<string, any>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('property_activity_log')
        .insert({
          property_id: propertyId,
          admin_id: adminId,
          action,
          details: details || null,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging activity:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  };

  // Soft delete function
  const deleteProperty = useCallback(async ({
    propertyId,
    adminId,
    details
  }: PropertyActionOptions): Promise<PropertyActionResult> => {
    setIsDeleting(true);

    try {
      // Get current user ID if not provided
      const currentUserId = adminId || await getCurrentUserId();
      
      if (!currentUserId) {
        toast.error('User not authenticated');
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      // Start transaction-like operation
      const now = new Date().toISOString();

      // Update property with soft delete
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          deleted_at: now,
          deleted_by: currentUserId,
          updated_at: now
        })
        .eq('id', propertyId);

      if (updateError) {
        console.error('Error deleting property:', updateError);
        toast.error('Failed to delete property');
        return {
          success: false,
          error: updateError.message
        };
      }

      // Log the activity
      const logSuccess = await logActivity(propertyId, currentUserId, 'deleted', {
        ...details,
        deleted_at: now
      });

      if (!logSuccess) {
        console.warn('Failed to log delete activity, but property was deleted');
      }

      toast.success('Property deleted successfully');
      return {
        success: true,
        data: { deleted_at: now }
      };

    } catch (error) {
      console.error('Error deleting property:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to delete property');
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Restore function
  const restoreProperty = useCallback(async ({
    propertyId,
    adminId,
    details
  }: PropertyActionOptions): Promise<PropertyActionResult> => {
    setIsRestoring(true);

    try {
      // Get current user ID if not provided
      const currentUserId = adminId || await getCurrentUserId();
      
      if (!currentUserId) {
        toast.error('User not authenticated');
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      const now = new Date().toISOString();

      // Update property to restore (remove soft delete)
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          deleted_at: null,
          deleted_by: null,
          updated_at: now
        })
        .eq('id', propertyId);

      if (updateError) {
        console.error('Error restoring property:', updateError);
        toast.error('Failed to restore property');
        return {
          success: false,
          error: updateError.message
        };
      }

      // Log the activity
      const logSuccess = await logActivity(propertyId, currentUserId, 'restored', {
        ...details,
        restored_at: now
      });

      if (!logSuccess) {
        console.warn('Failed to log restore activity, but property was restored');
      }

      toast.success('Property restored successfully');
      return {
        success: true,
        data: { restored_at: now }
      };

    } catch (error) {
      console.error('Error restoring property:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to restore property');
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsRestoring(false);
    }
  }, []);

  return {
    deleteProperty,
    restoreProperty,
    isDeleting,
    isRestoring,
    isLoading
  };
};
