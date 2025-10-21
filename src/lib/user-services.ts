export interface AdminUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  role?: string;
  status: 'active' | 'inactive' | 'banned';
  is_verified: boolean;
  signup_method: 'email' | 'phone' | 'oauth';
  provider?: string;
}

export interface UserStats {
  total_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
  verified_users: number;
  unverified_users: number;
}

// Get recent users for admin dashboard
export async function getRecentUsers(limit: number = 10): Promise<AdminUser[]> {
  try {
    const response = await fetch(`/api/admin/users?limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recent users');
    }

    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error in getRecentUsers:', error);
    throw error;
  }
}

// Get user statistics
export async function getUserStats(): Promise<UserStats> {
  try {
    const response = await fetch('/api/admin/users/stats', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user statistics');
    }

    const data = await response.json();
    return data.stats || {
      total_users: 0,
      new_users_today: 0,
      new_users_this_week: 0,
      new_users_this_month: 0,
      verified_users: 0,
      unverified_users: 0
    };
  } catch (error) {
    console.error('Error in getUserStats:', error);
    throw error;
  }
}

// Get all users with pagination
export async function getAllUsers(page: number = 1, limit: number = 20): Promise<{
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return {
      users: data.users || [],
      total: data.pagination?.total || 0,
      page: data.pagination?.page || page,
      totalPages: Math.ceil((data.pagination?.total || 0) / limit)
    };
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
}

// Update user status
export async function updateUserStatus(userId: string, status: 'active' | 'banned'): Promise<void> {
  try {
    const response = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update user status');
    }
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

// Delete user
export async function deleteUser(userId: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
