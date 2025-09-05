import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client only if credentials are available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface PropertyManagementFilters {
  search?: string;
  status?: string;
  propertyType?: string;
  listingType?: string;
  city?: string;
  showDeleted?: boolean;
  sortBy?: 'title' | 'price' | 'created_at' | 'views' | 'inquiries';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PropertyManagementStats {
  total: number;
  available: number;
  sold: number;
  rented: number;
  pending: number;
  draft: number;
  deleted: number;
}

export interface PropertyWithImages {
  id: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  country: string;
  city: string;
  suburb: string;
  street_address: string;
  size_sqm: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  price: number;
  currency: string;
  status: string;
  listing_status: string;
  views: number;
  saved_by: number;
  inquiries: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
  property_images?: Array<{
    id: string;
    image_url: string;
    is_main_image: boolean;
  }>;
}

export async function getProperties(filters: PropertyManagementFilters = {}): Promise<{
  properties: PropertyWithImages[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning empty results');
      return {
        properties: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }

    let query = supabase
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          image_url,
          is_main_image
        )
      `, { count: 'exact' });

    // Apply filters
    if (!filters.showDeleted) {
      query = query.is('deleted_at', null);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType);
    }

    if (filters.listingType) {
      query = query.eq('listing_type', filters.listingType);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    // Apply search
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,city.ilike.%${filters.search}%,suburb.ilike.%${filters.search}%`);
    }

    // Apply sorting
    const sortField = filters.sortBy || 'created_at';
    const sortDirection = filters.sortDirection || 'desc';
    query = query.order(sortField, { ascending: sortDirection === 'asc' });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      throw new Error('Failed to fetch properties');
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      properties: data || [],
      total: count || 0,
      page,
      totalPages
    };
  } catch (error) {
    console.error('Error in getProperties:', error);
    throw error;
  }
}

export async function getPropertyStats(): Promise<PropertyManagementStats> {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning zero stats');
      return {
        total: 0,
        available: 0,
        sold: 0,
        rented: 0,
        pending: 0,
        draft: 0,
        deleted: 0
      };
    }

    // Get counts for different statuses
    const [totalResult, availableResult, soldResult, rentedResult, pendingResult, draftResult, deletedResult] = await Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'available').is('deleted_at', null),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'sold').is('deleted_at', null),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'rented').is('deleted_at', null),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending').is('deleted_at', null),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'draft').is('deleted_at', null),
      supabase.from('properties').select('*', { count: 'exact', head: true }).not('deleted_at', 'is', null)
    ]);

    return {
      total: totalResult.count || 0,
      available: availableResult.count || 0,
      sold: soldResult.count || 0,
      rented: rentedResult.count || 0,
      pending: pendingResult.count || 0,
      draft: draftResult.count || 0,
      deleted: deletedResult.count || 0
    };
  } catch (error) {
    console.error('Error fetching property stats:', error);
    throw error;
  }
}

export async function softDeleteProperty(propertyId: string, adminId: string): Promise<boolean> {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning false');
      return false;
    }

    const { error } = await supabase
      .from('properties')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: adminId
      })
      .eq('id', propertyId);

    if (error) {
      console.error('Error soft deleting property:', error);
      return false;
    }

    // Log the activity
    await logPropertyActivity(propertyId, adminId, 'deleted', {
      deleted_at: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error in softDeleteProperty:', error);
    return false;
  }
}

export async function bulkSoftDeleteProperties(propertyIds: string[], adminId: string): Promise<boolean> {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning false');
      return false;
    }

    const { error } = await supabase
      .from('properties')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: adminId
      })
      .in('id', propertyIds);

    if (error) {
      console.error('Error bulk soft deleting properties:', error);
      return false;
    }

    // Log the activity for each property
    const logPromises = propertyIds.map(propertyId =>
      logPropertyActivity(propertyId, adminId, 'deleted', {
        deleted_at: new Date().toISOString(),
        bulk_action: true
      })
    );

    await Promise.all(logPromises);

    return true;
  } catch (error) {
    console.error('Error in bulkSoftDeleteProperties:', error);
    return false;
  }
}

export async function restoreProperty(propertyId: string, adminId: string): Promise<boolean> {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning false');
      return false;
    }

    const { error } = await supabase
      .from('properties')
      .update({
        deleted_at: null,
        deleted_by: null
      })
      .eq('id', propertyId);

    if (error) {
      console.error('Error restoring property:', error);
      return false;
    }

    // Log the activity
    await logPropertyActivity(propertyId, adminId, 'restored', {
      restored_at: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error in restoreProperty:', error);
    return false;
  }
}

export async function updatePropertyStatus(propertyId: string, status: string, adminId: string): Promise<boolean> {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning false');
      return false;
    }

    const { error } = await supabase
      .from('properties')
      .update({ status })
      .eq('id', propertyId);

    if (error) {
      console.error('Error updating property status:', error);
      return false;
    }

    // Log the activity
    await logPropertyActivity(propertyId, adminId, 'updated', {
      field: 'status',
      old_value: 'unknown', // You might want to fetch the old value first
      new_value: status
    });

    return true;
  } catch (error) {
    console.error('Error in updatePropertyStatus:', error);
    return false;
  }
}

export async function logPropertyActivity(
  propertyId: string,
  adminId: string,
  action: 'created' | 'updated' | 'deleted' | 'restored',
  details?: any
): Promise<boolean> {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning false');
      return false;
    }

    const { error } = await supabase
      .from('property_activity_log')
      .insert({
        property_id: propertyId,
        admin_id: adminId,
        action,
        details
      });

    if (error) {
      console.error('Error logging property activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logPropertyActivity:', error);
    return false;
  }
}

export async function getPropertyActivityLog(propertyId: string): Promise<any[]> {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning empty array');
      return [];
    }

    const { data, error } = await supabase
      .from('property_activity_log')
      .select(`
        *,
        user_profiles!property_activity_log_admin_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching property activity log:', error);
      throw new Error('Failed to fetch activity log');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPropertyActivityLog:', error);
    throw error;
  }
}

export async function getCities(): Promise<string[]> {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning empty array');
      return [];
    }

    const { data, error } = await supabase
      .from('properties')
      .select('city')
      .is('deleted_at', null)
      .not('city', 'is', null);

    if (error) {
      console.error('Error fetching cities:', error);
      throw new Error('Failed to fetch cities');
    }

    // Get unique cities
    const uniqueCities = [...new Set(data?.map(item => item.city) || [])];
    return uniqueCities.sort();
  } catch (error) {
    console.error('Error in getCities:', error);
    throw error;
  }
}
