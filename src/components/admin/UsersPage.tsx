'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Ban, 
  UserCheck, 
  Mail, 
  Phone, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAllUsers, updateUserStatus, deleteUser, type AdminUser } from '@/lib/user-services';
import { toast } from 'sonner';

interface UsersPageProps {
  onViewUser?: (userId: string) => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ onViewUser }) => {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [verificationFilter, setVerificationFilter] = React.useState<string>('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);

  const limit = 20;

  // Load users
  const loadUsers = React.useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getAllUsers(page, limit);
      setUsers(result.users);
      setTotalPages(result.totalPages);
      setTotalUsers(result.total);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Load users on mount
  React.useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  // Filter users based on search and filters
  const filteredUsers = React.useMemo(() => {
    let filtered = users;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(query) ||
        (user.first_name && user.first_name.toLowerCase().includes(query)) ||
        (user.last_name && user.last_name.toLowerCase().includes(query)) ||
        (user.phone && user.phone.includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(user => 
        verificationFilter === 'verified' ? user.is_verified : !user.is_verified
      );
    }

    return filtered;
  }, [users, searchQuery, statusFilter, verificationFilter]);

  const handleStatusUpdate = async (userId: string, newStatus: 'active' | 'banned') => {
    try {
      setIsUpdating(userId);
      await updateUserStatus(userId, newStatus);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus }
          : user
      ));
      
      toast.success(`User ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRefresh = () => {
    loadUsers(currentPage);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info('Export functionality coming soon');
  };

  const getStatusColor = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-700';
      case 'banned':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getVerificationStatus = (user: AdminUser) => {
    if (user.is_verified) {
      return { icon: CheckCircle, color: 'text-green-600', text: 'Verified' };
    }
    return { icon: Clock, color: 'text-yellow-600', text: 'Pending' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserDisplayName = (user: AdminUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.email.split('@')[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-600">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Verified Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.is_verified).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Banned Users</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.status === 'banned').length}
                </p>
              </div>
              <Ban className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search users by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Loading users...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertCircle className="w-6 h-6 mr-2" />
              <span>{error}</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <Users className="w-12 h-12 mr-4 opacity-50" />
              <div>
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Signup Date</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const verificationStatus = getVerificationStatus(user);
                    const VerificationIcon = verificationStatus.icon;
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {getUserDisplayName(user)}
                              </p>
                              <p className="text-sm text-slate-500">
                                {user.role || 'user'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-1 text-slate-400" />
                              <span className="truncate max-w-48">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center text-sm text-slate-500">
                                <Phone className="w-3 h-3 mr-1" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <VerificationIcon className={`w-4 h-4 ${verificationStatus.color}`} />
                            <span className={`text-sm ${verificationStatus.color}`}>
                              {verificationStatus.text}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-slate-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(user.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.last_sign_in_at ? (
                            <span className="text-sm text-slate-500">
                              {formatDate(user.last_sign_in_at)}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onViewUser?.(user.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={async () => {
                                  const confirmed = confirm('Are you sure you want to delete this user? This action cannot be undone.');
                                  if (!confirmed) return;
                                  try {
                                    await deleteUser(user.id);
                                    toast.success('User deleted successfully');
                                    setUsers((prev) => prev.filter((u) => u.id !== user.id));
                                  } catch (err) {
                                    console.error('Delete user failed', err);
                                    toast.error('Failed to delete user');
                                  }
                                }}
                                className="text-red-600"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalUsers)} of {totalUsers} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadUsers(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadUsers(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
