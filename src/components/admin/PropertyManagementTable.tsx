'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Image as ImageIcon,
  Calendar,
  TrendingUp,
  Users,
  MessageSquare,
  CheckSquare,
  Square,
  AlertTriangle,
  X
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { usePropertyActions } from '@/hooks/usePropertyActions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Property {
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

interface PropertyManagementTableProps {
  onEditProperty?: (propertyId: string) => void;
  onViewProperty?: (propertyId: string) => void;
  onDeleteProperty?: (propertyId: string) => void;
}

type SortField = 'title' | 'price' | 'created_at' | 'inquiries';
type SortDirection = 'asc' | 'desc';

export const PropertyManagementTable: React.FC<PropertyManagementTableProps> = ({
  onEditProperty,
  onViewProperty,
  onDeleteProperty
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Use the property actions hook
  const { deleteProperty, restoreProperty, isDeleting, isRestoring } = usePropertyActions();

  const itemsPerPage = 10;

  useEffect(() => {
    loadProperties();
  }, [showDeleted]);

  useEffect(() => {
    filterAndSortProperties();
  }, [properties, searchQuery, statusFilter, sortField, sortDirection]);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images (
            id,
            image_url,
            is_main_image
          )
        `);

      if (!showDeleted) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading properties:', error);
        toast.error('Failed to load properties');
        return;
      }

      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortProperties = () => {
    let filtered = [...properties];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(query) ||
        property.city.toLowerCase().includes(query) ||
        property.suburb.toLowerCase().includes(query) ||
        property.street_address.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProperties(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectProperty = (propertyId: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
    } else {
      newSelected.add(propertyId);
    }
    setSelectedProperties(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProperties.size === currentPageProperties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(currentPageProperties.map(p => p.id)));
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    const result = await deleteProperty({
      propertyId,
      details: {
        property_title: properties.find(p => p.id === propertyId)?.title,
        deleted_from: 'property_management_table'
      }
    });

    if (result.success) {
      // Optimistic update - remove from local state immediately
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      setSelectedProperties(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
      await loadProperties(); // Refresh to get updated data
      setShowDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async () => {
    const propertyIds = Array.from(selectedProperties);
    let successCount = 0;
    let errorCount = 0;

    // Process each property deletion
    for (const propertyId of propertyIds) {
      const result = await deleteProperty({
        propertyId,
        details: {
          property_title: properties.find(p => p.id === propertyId)?.title,
          deleted_from: 'property_management_table',
          bulk_delete: true,
          total_selected: propertyIds.length
        }
      });

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    // Optimistic update - remove successfully deleted properties from local state
    if (successCount > 0) {
      setProperties(prev => prev.filter(p => !propertyIds.includes(p.id)));
    }

    // Show appropriate feedback
    if (successCount > 0 && errorCount === 0) {
      toast.success(`${successCount} properties deleted successfully`);
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`${successCount} properties deleted, ${errorCount} failed`);
    } else {
      toast.error('Failed to delete properties');
    }

    setSelectedProperties(new Set());
    setShowBulkDeleteConfirm(false);
    await loadProperties(); // Refresh to get updated data
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'available': { color: 'bg-green-100 text-green-800', label: 'Available' },
      'sold': { color: 'bg-blue-100 text-blue-800', label: 'Sold' },
      'rented': { color: 'bg-purple-100 text-purple-800', label: 'Rented' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'draft': { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { color: 'bg-gray-100 text-gray-800', label: status };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getMainImage = (property: Property) => {
    const mainImage = property.property_images?.find(img => img.is_main_image);
    return mainImage?.image_url || property.property_images?.[0]?.image_url;
  };

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageProperties = filteredProperties.slice(startIndex, endIndex);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Property Management</h2>
          <p className="text-slate-600">Manage and monitor all properties</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDeleted(!showDeleted)}
            className={showDeleted ? 'bg-red-50 border-red-200 text-red-700' : ''}
          >
            {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search properties by title, city, suburb..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProperties.size > 0 && (
        <Card className="border-red-200 bg-red-50 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
                <span className="text-sm font-semibold text-red-900">
                  {selectedProperties.size} property(ies) selected
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm disabled:opacity-50 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isDeleting ? 'Deleting...' : 'Delete Selected'}
                  </span>
                  <span className="sm:hidden">
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </span>
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProperties(new Set())}
                className="text-slate-700 hover:text-slate-900 border-slate-400 hover:border-slate-500 bg-white hover:bg-slate-50 font-medium shadow-sm text-sm"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Properties Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Loading properties...</p>
            </div>
          ) : currentPageProperties.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No properties found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSelectAll}
                          className="flex items-center justify-center w-4 h-4"
                        >
                          {selectedProperties.size === currentPageProperties.length ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <span className="hidden sm:inline text-xs font-medium text-slate-500 uppercase tracking-wider">Select</span>
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center gap-1 text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700"
                      >
                        Title
                        <SortIcon field="title" />
                      </button>
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('price')}
                        className="flex items-center gap-1 text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700"
                      >
                        Price
                        <SortIcon field="price" />
                      </button>
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort('created_at')}
                        className="flex items-center gap-1 text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700"
                      >
                        Listed Date
                        <SortIcon field="created_at" />
                      </button>
                    </th>
                    <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Inquiries
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {currentPageProperties.map((property) => (
                    <motion.tr
                      key={property.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-3 sm:px-6 py-4">
                        <button
                          onClick={() => handleSelectProperty(property.id)}
                          className="flex items-center justify-center w-4 h-4"
                        >
                          {selectedProperties.has(property.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="w-12 h-10 sm:w-16 sm:h-12 bg-slate-200 rounded-lg overflow-hidden">
                          {getMainImage(property) ? (
                            <img
                              src={getMainImage(property)}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {property.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {property.property_type} • {property.listing_type}
                          </p>
                          {/* Show address on mobile when address column is hidden */}
                          <div className="md:hidden">
                            <p className="text-xs text-slate-500 mt-1">
                              {property.suburb}, {property.city}
                            </p>
                          </div>
                          {/* Show status on mobile when status column is hidden */}
                          <div className="sm:hidden mt-1">
                            {getStatusBadge(property.status)}
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-slate-900">
                            {property.suburb}, {property.city}
                          </p>
                          <p className="text-xs text-slate-500">
                            {property.country}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">
                          {property.currency} {property.price.toLocaleString()}
                        </p>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        {getStatusBadge(property.status)}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(property.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <MessageSquare className="w-4 h-4" />
                          {property.inquiries}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewProperty?.(property.id)}
                            className="text-slate-600 hover:text-slate-900 p-1 sm:p-2"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditProperty?.(property.id)}
                            className="text-blue-600 hover:text-blue-700 p-1 sm:p-2"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(property.id)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50 p-1 sm:p-2"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} properties
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Confirm Delete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Are you sure you want to delete this property? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteProperty(showDeleteConfirm)}
                  disabled={isDeleting}
                  className="disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Confirm Bulk Delete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete {selectedProperties.size} properties? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete All'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
