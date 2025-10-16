'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  X, 
  MapPin, 
  Calendar, 
  Eye, 
  MessageSquare, 
  Heart, 
  Bed, 
  Bath, 
  Car, 
  Ruler, 
  DollarSign,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getPropertyActivityLog } from '@/lib/property-management-services';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PropertyDetails {
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
  rent_to_buy_deposit?: number;
  monthly_installment?: number;
  payment_duration?: number;
  features: string[];
  amenities: string[];
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
    image_order: number;
  }>;
  seller_info?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    is_phone_verified: boolean;
    is_identity_verified: boolean;
  };
}

interface ActivityLogEntry {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user_profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string | null;
  onEdit?: (propertyId: string) => void;
  onDelete?: (propertyId: string) => void;
  onRestore?: (propertyId: string) => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  onEdit,
  onDelete,
  onRestore
}) => {
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'images' | 'activity'>('details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && propertyId) {
      loadPropertyDetails();
      loadActivityLog();
    }
  }, [isOpen, propertyId]);

  const loadPropertyDetails = async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (
            id,
            image_url,
            is_main_image,
            image_order
          )
        `)
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Error loading property details:', error);
        toast.error('Failed to load property details');
        return;
      }

      // Get seller information if seller_id exists
      if (data.seller_id) {
        const { data: sellerData } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email, phone, is_phone_verified, is_identity_verified')
          .eq('id', data.seller_id)
          .single();

        data.seller_info = sellerData;
      }

      setProperty(data);
    } catch (error) {
      console.error('Error loading property details:', error);
      toast.error('Failed to load property details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivityLog = async () => {
    if (!propertyId) return;
    
    try {
      const log = await getPropertyActivityLog(propertyId);
      setActivityLog(log);
    } catch (error) {
      console.error('Error loading activity log:', error);
    }
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'restored':
        return <RotateCcw className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : currency === 'ZAR' ? 'ZAR' : 'GBP',
    }).format(amount);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {property?.title || 'Property Details'}
            </h2>
            <p className="text-slate-600">
              {property && `${property.suburb}, ${property.city}, ${property.country}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {property && (
              <>
                {property.deleted_at ? (
                  <Button
                    variant="outline"
                    onClick={() => onRestore?.(property.id)}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => onEdit?.(property.id)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onDelete?.(property.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </>
            )}
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : property ? (
              <div className="p-6">
                {/* Tabs */}
                <div className="flex border-b mb-6">
                  {[
                    { id: 'details', label: 'Details' },
                    { id: 'images', label: 'Images' },
                    { id: 'activity', label: 'Activity Log' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Status and Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <span className="font-medium">Price</span>
                          </div>
                          <p className="text-2xl font-bold text-slate-900">
                            {formatCurrency(property.price, property.currency)}
                          </p>
                          {property.listing_type === 'rent-to-buy' && property.rent_to_buy_deposit && (
                            <p className="text-sm text-slate-600 mt-1">
                              Deposit: {formatCurrency(property.rent_to_buy_deposit, property.currency)}
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Ruler className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">Size</span>
                          </div>
                          <p className="text-2xl font-bold text-slate-900">
                            {property.size_sqm} m²
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">Status</span>
                          </div>
                          <div className="mt-2">
                            {getStatusBadge(property.status)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Property Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Property Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {property.bedrooms && (
                            <div className="flex items-center gap-2">
                              <Bed className="w-5 h-5 text-slate-600" />
                              <span className="text-sm">{property.bedrooms} Bedrooms</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center gap-2">
                              <Bath className="w-5 h-5 text-slate-600" />
                              <span className="text-sm">{property.bathrooms} Bathrooms</span>
                            </div>
                          )}
                          {property.parking_spaces && (
                            <div className="flex items-center gap-2">
                              <Car className="w-5 h-5 text-slate-600" />
                              <span className="text-sm">{property.parking_spaces} Parking</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Ruler className="w-5 h-5 text-slate-600" />
                            <span className="text-sm">{property.size_sqm} m²</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 whitespace-pre-wrap">{property.description}</p>
                      </CardContent>
                    </Card>

                    {/* Features and Amenities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {property.features && property.features.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Features</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {property.features.map((feature, index) => (
                                <Badge key={index} variant="secondary">{feature}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {property.amenities && property.amenities.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Amenities</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {property.amenities.map((amenity, index) => (
                                <Badge key={index} variant="outline">{amenity}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Seller Information */}
                    {property.seller_info && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Seller Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-slate-600" />
                                <span className="font-medium">Name</span>
                              </div>
                              <p className="text-slate-700">
                                {property.seller_info.first_name} {property.seller_info.last_name}
                              </p>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Mail className="w-4 h-4 text-slate-600" />
                                <span className="font-medium">Email</span>
                              </div>
                              <p className="text-slate-700">{property.seller_info.email}</p>
                            </div>
                            {property.seller_info.phone && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Phone className="w-4 h-4 text-slate-600" />
                                  <span className="font-medium">Phone</span>
                                </div>
                                <p className="text-slate-700">{property.seller_info.phone}</p>
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">Verification</span>
                              </div>
                              <div className="flex gap-2">
                                {property.seller_info.is_phone_verified ? (
                                  <Badge className="bg-green-100 text-green-800">Phone Verified</Badge>
                                ) : (
                                  <Badge variant="secondary">Phone Not Verified</Badge>
                                )}
                                {property.seller_info.is_identity_verified ? (
                                  <Badge className="bg-green-100 text-green-800">Identity Verified</Badge>
                                ) : (
                                  <Badge variant="secondary">Identity Not Verified</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Statistics */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Eye className="w-4 h-4 text-slate-600" />
                              <span className="text-sm font-medium">Views</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{property.views}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Heart className="w-4 h-4 text-slate-600" />
                              <span className="text-sm font-medium">Saved</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{property.saved_by}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <MessageSquare className="w-4 h-4 text-slate-600" />
                              <span className="text-sm font-medium">Inquiries</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{property.inquiries}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === 'images' && (
                  <div className="space-y-6">
                    {property.property_images && property.property_images.length > 0 ? (
                      <>
                        {/* Main Image */}
                        <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                          <img
                            src={property.property_images[selectedImageIndex]?.image_url}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Thumbnail Grid */}
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                          {property.property_images.map((image, index) => (
                            <button
                              key={image.id}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`aspect-square bg-slate-100 rounded-lg overflow-hidden border-2 transition-colors ${
                                selectedImageIndex === index
                                  ? 'border-blue-500'
                                  : 'border-transparent hover:border-slate-300'
                              }`}
                            >
                              <img
                                src={image.image_url}
                                alt={`${property.title} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">📷</span>
                        </div>
                        <p className="text-slate-600">No images available</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {activityLog.length > 0 ? (
                      activityLog.map((entry) => (
                        <Card key={entry.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getActionIcon(entry.action)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium capitalize">{entry.action}</span>
                                  <span className="text-sm text-slate-500">
                                    by {entry.user_profiles.first_name} {entry.user_profiles.last_name}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">
                                  {new Date(entry.created_at).toLocaleString()}
                                </p>
                                {entry.details && (
                                  <div className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                                    <pre className="whitespace-pre-wrap">
                                      {JSON.stringify(entry.details, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">No activity recorded</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-600">Property not found</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Use portal to render modal at root level
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};
