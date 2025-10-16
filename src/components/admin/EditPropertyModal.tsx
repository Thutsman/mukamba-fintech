'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, 
  Home, 
  Upload, 
  Check, 
  MapPin, 
  Building, 
  Loader2, 
  Camera,
  DollarSign,
  Plus,
  Trash2,
  User,
  Zap,
  Save
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { PropertyType, ListingType, PropertyCountry } from '@/types/property';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { updatePropertyStatus, logPropertyActivity } from '@/lib/property-management-services';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PropertyData {
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
  property_images?: Array<{
    id: string;
    image_url: string;
    is_main_image: boolean;
  }>;
}

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string | null;
  onSuccess?: () => void;
}

const editPropertySchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  propertyType: z.enum(['house', 'apartment', 'townhouse', 'land', 'commercial']),
  listingType: z.enum(['rent-to-buy', 'sale', 'installment']),
  country: z.enum(['ZW', 'SA']),
  city: z.string().min(2, "City is required"),
  suburb: z.string().min(2, "Suburb/Area is required"),
  streetAddress: z.string().min(5, "Street address is required"),
  size: z.string().min(1, "Property size is required"),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  parking: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  currency: z.enum(['USD', 'ZAR', 'GBP']),
  rentToBuyDeposit: z.string().optional(),
  monthlyInstallment: z.string().optional(),
  paymentDuration: z.string().optional(),
  status: z.enum(['available', 'sold', 'rented', 'pending', 'draft']),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
});

type EditPropertyFormData = z.infer<typeof editPropertySchema>;

export const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  onSuccess
}) => {
  const [step, setStep] = React.useState<'details' | 'media' | 'preview' | 'submitting' | 'success'>('details');
  const [property, setProperty] = React.useState<PropertyData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [newFeature, setNewFeature] = React.useState('');
  const [newAmenity, setNewAmenity] = React.useState('');
  const [newImages, setNewImages] = React.useState<File[]>([]);
  const [newImageUrls, setNewImageUrls] = React.useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = React.useState<Set<string>>(new Set());
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<EditPropertyFormData>({
    resolver: zodResolver(editPropertySchema),
    defaultValues: {
      features: [],
      amenities: [],
    }
  });

  const watchListingType = form.watch('listingType');
  const watchPropertyType = form.watch('propertyType');
  const watchCountry = form.watch('country');

  // Load property data when modal opens
  React.useEffect(() => {
    if (isOpen && propertyId) {
      loadPropertyData();
    }
  }, [isOpen, propertyId]);

  const loadPropertyData = async () => {
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
            is_main_image
          )
        `)
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Error loading property:', error);
        toast.error('Failed to load property data');
        return;
      }

      setProperty(data);
      
      // Populate form with existing data
      form.reset({
        title: data.title,
        description: data.description,
        propertyType: data.property_type as PropertyType,
        listingType: data.listing_type as ListingType,
        country: data.country as PropertyCountry,
        city: data.city,
        suburb: data.suburb,
        streetAddress: data.street_address,
        size: data.size_sqm.toString(),
        bedrooms: data.bedrooms?.toString() || '',
        bathrooms: data.bathrooms?.toString() || '',
        parking: data.parking_spaces?.toString() || '',
        price: data.price.toString(),
        currency: data.currency as 'USD' | 'ZAR' | 'GBP',
        rentToBuyDeposit: data.rent_to_buy_deposit?.toString() || '',
        monthlyInstallment: data.monthly_installment?.toString() || '',
        paymentDuration: data.payment_duration?.toString() || '',
        status: data.status as 'available' | 'sold' | 'rented' | 'pending' | 'draft',
        features: data.features || [],
        amenities: data.amenities || [],
      });
    } catch (error) {
      console.error('Error loading property:', error);
      toast.error('Failed to load property data');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for features and amenities
  const addFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = form.watch('features') || [];
      const updatedFeatures = [...currentFeatures, newFeature.trim()];
      form.setValue('features', updatedFeatures, { shouldValidate: true });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = form.watch('features') || [];
    const updatedFeatures = currentFeatures.filter((_, i) => i !== index);
    form.setValue('features', updatedFeatures, { shouldValidate: true });
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      const currentAmenities = form.watch('amenities') || [];
      const updatedAmenities = [...currentAmenities, newAmenity.trim()];
      form.setValue('amenities', updatedAmenities, { shouldValidate: true });
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    const currentAmenities = form.watch('amenities') || [];
    const updatedAmenities = currentAmenities.filter((_, i) => i !== index);
    form.setValue('amenities', updatedAmenities, { shouldValidate: true });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setNewImages(prev => [...prev, ...newFiles]);
      
      // Create preview URLs
      const urls = newFiles.map(file => URL.createObjectURL(file));
      setNewImageUrls(prev => [...prev, ...urls]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const toggleImageDeletion = (imageId: string) => {
    setImagesToDelete(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleDetailsSubmit = async (data: EditPropertyFormData) => {
    const isValid = await form.trigger();
    if (!isValid) return;
    setStep('media');
  };

  const handleMediaSubmit = async () => {
    setStep('preview');
  };

  const handleFinalSubmit = async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    setStep('submitting');
    
    try {
      const formData = form.getValues();
      
      // Prepare update data
      const updateData = {
        title: formData.title,
        description: formData.description,
        property_type: formData.propertyType,
        listing_type: formData.listingType,
        country: formData.country,
        city: formData.city,
        suburb: formData.suburb,
        street_address: formData.streetAddress,
        size_sqm: parseInt(formData.size),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        parking_spaces: formData.parking ? parseInt(formData.parking) : null,
        price: parseInt(formData.price),
        currency: formData.currency,
        rent_to_buy_deposit: formData.rentToBuyDeposit ? parseInt(formData.rentToBuyDeposit) : null,
        monthly_installment: formData.monthlyInstallment ? parseInt(formData.monthlyInstallment) : null,
        payment_duration: formData.paymentDuration ? parseInt(formData.paymentDuration) : null,
        status: formData.status,
        features: formData.features || [],
        amenities: formData.amenities || [],
        updated_at: new Date().toISOString(),
      };

      // Update property in database
      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId);

      if (error) {
        console.error('Error updating property:', error);
        toast.error('Failed to update property');
        return;
      }

      // Delete marked images
      if (imagesToDelete.size > 0) {
        const { error: deleteError } = await supabase
          .from('property_images')
          .delete()
          .in('id', Array.from(imagesToDelete));

        if (deleteError) {
          console.error('Error deleting images:', deleteError);
          toast.error('Failed to delete some images');
        } else {
          toast.success(`${imagesToDelete.size} image(s) deleted successfully`);
        }
      }

      // Log the activity
      await logPropertyActivity(propertyId, 'admin-user-id', 'updated', {
        updated_fields: Object.keys(updateData),
        deleted_images: imagesToDelete.size > 0 ? Array.from(imagesToDelete) : undefined,
        updated_at: new Date().toISOString()
      });

      toast.success('Property updated successfully');
      setStep('success');
      onSuccess?.();
      
      setTimeout(() => handleClose(), 2000);
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Failed to update property');
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStep('details');
      form.reset();
      setNewImages([]);
      setNewImageUrls([]);
      setImagesToDelete(new Set());
      setProperty(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm" 
        onClick={step === 'success' ? undefined : handleClose}
      >
        <motion.div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden bg-white rounded-lg relative"
        >
          <Card className="shadow-2xl border-0 isolate">
            <CardHeader className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="w-6 h-6" />
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <CardTitle className="text-xl">
                {step === 'details' && 'Edit Property Details'}
                {step === 'media' && 'Update Property Photos'}
                {step === 'preview' && 'Review Changes'}
                {step === 'submitting' && 'Updating Property'}
                {step === 'success' && 'Property Updated!'}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                {step === 'details' && 'Update property information'}
                {step === 'media' && 'Add or update property photos'}
                {step === 'preview' && 'Review changes before saving'}
                {step === 'submitting' && 'Please wait while we update the property'}
                {step === 'success' && 'Property has been successfully updated'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 sm:space-y-8 max-h-[calc(95vh-12rem)] sm:max-h-[calc(90vh-16rem)] overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6">
              {isLoading && step === 'details' ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : step === 'details' && property ? (
                <form onSubmit={form.handleSubmit(handleDetailsSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3 mb-4">
                        <Home className="w-5 h-5 text-blue-600" />
                        Basic Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title" className="text-base font-medium text-slate-700 mb-2 block">
                            Property Title
                          </Label>
                          <Input
                            id="title"
                            placeholder="e.g., Modern 3-Bedroom House in Borrowdale"
                            className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            {...form.register('title')}
                          />
                          {form.formState.errors.title && (
                            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              {form.formState.errors.title.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="description" className="text-base font-medium text-slate-700 mb-2 block">
                            Property Description
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Describe the property in detail..."
                            className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            {...form.register('description')}
                            rows={4}
                          />
                          {form.formState.errors.description && (
                            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              {form.formState.errors.description.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <Label htmlFor="propertyType" className="text-base font-medium text-slate-700 mb-2 block">
                              Property Type
                            </Label>
                            <select
                              id="propertyType"
                              {...form.register('propertyType')}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                              <option value="house">House</option>
                              <option value="apartment">Apartment</option>
                              <option value="townhouse">Townhouse</option>
                              <option value="land">Land</option>
                              <option value="commercial">Commercial Property</option>
                            </select>
                          </div>

                          <div>
                            <Label className="text-base font-medium text-slate-700 mb-2 block">
                              Listing Type
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                              <div 
                                className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                  form.watch('listingType') === 'rent-to-buy' 
                                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                                    : 'border-slate-300 bg-white hover:border-slate-400'
                                }`}
                                onClick={() => form.setValue('listingType', 'rent-to-buy')}
                              >
                                <div className="flex items-center space-x-3 w-full">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    form.watch('listingType') === 'rent-to-buy'
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-slate-400'
                                  }`}>
                                    {form.watch('listingType') === 'rent-to-buy' && (
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                  </div>
                                  <Label htmlFor="rent-to-buy" className="text-sm font-medium text-slate-700 cursor-pointer flex-1">
                                    Installments
                                  </Label>
                                </div>
                              </div>
                              <div 
                                className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                  form.watch('listingType') === 'sale' 
                                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                                    : 'border-slate-300 bg-white hover:border-slate-400'
                                }`}
                                onClick={() => form.setValue('listingType', 'sale')}
                              >
                                <div className="flex items-center space-x-3 w-full">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    form.watch('listingType') === 'sale'
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-slate-400'
                                  }`}>
                                    {form.watch('listingType') === 'sale' && (
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                  </div>
                                  <Label htmlFor="sale" className="text-sm font-medium text-slate-700 cursor-pointer flex-1">
                                    Cash
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="status" className="text-base font-medium text-slate-700 mb-2 block">
                              Status
                            </Label>
                            <select
                              id="status"
                              {...form.register('status')}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                              <option value="available">Available</option>
                              <option value="sold">Sold</option>
                              <option value="rented">Rented</option>
                              <option value="pending">Pending</option>
                              <option value="draft">Draft</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-6">
                    <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3 mb-4">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Location
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="city" className="text-base font-medium text-slate-700 mb-2 block">
                              City
                            </Label>
                            <Input
                              id="city"
                              placeholder="e.g., Harare"
                              className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              {...form.register('city')}
                            />
                          </div>

                          <div>
                            <Label htmlFor="suburb" className="text-base font-medium text-slate-700 mb-2 block">
                              Suburb/Area
                            </Label>
                            <Input
                              id="suburb"
                              placeholder="e.g., Borrowdale"
                              className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              {...form.register('suburb')}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="streetAddress" className="text-base font-medium text-slate-700 mb-2 block">
                            Street Address
                          </Label>
                          <Input
                            id="streetAddress"
                            placeholder="e.g., 123 Example Street"
                            className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            {...form.register('streetAddress')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="space-y-6">
                    <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3 mb-4">
                        <Building className="w-5 h-5 text-blue-600" />
                        Property Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <Label htmlFor="size" className="text-base font-medium text-slate-700 mb-2 block">
                              Size (m²)
                            </Label>
                            <Input
                              id="size"
                              type="number"
                              placeholder="e.g., 200"
                              className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              {...form.register('size')}
                            />
                          </div>

                          {watchPropertyType !== 'land' && (
                            <>
                              <div>
                                <Label htmlFor="bedrooms" className="text-base font-medium text-slate-700 mb-2 block">
                                  Bedrooms
                                </Label>
                                <Input
                                  id="bedrooms"
                                  type="number"
                                  placeholder="e.g., 3"
                                  className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  {...form.register('bedrooms')}
                                />
                              </div>

                              <div>
                                <Label htmlFor="bathrooms" className="text-base font-medium text-slate-700 mb-2 block">
                                  Bathrooms
                                </Label>
                                <Input
                                  id="bathrooms"
                                  type="number"
                                  placeholder="e.g., 2"
                                  className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  {...form.register('bathrooms')}
                                />
                              </div>

                              <div>
                                <Label htmlFor="parking" className="text-base font-medium text-slate-700 mb-2 block">
                                  Parking Spaces
                                </Label>
                                <Input
                                  id="parking"
                                  type="number"
                                  placeholder="e.g., 2"
                                  className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  {...form.register('parking')}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="space-y-6">
                    <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3 mb-4">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        Financial Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="price" className="text-base font-medium text-slate-700 mb-2 block">
                              {watchListingType === 'sale' ? 'Selling Price' : 'Property Value'}
                            </Label>
                            <Input
                              id="price"
                              placeholder={`e.g., ${watchCountry === 'ZW' ? 'USD' : 'R'} 150,000`}
                              className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              {...form.register('price')}
                            />
                          </div>

                          <div>
                            <Label htmlFor="currency" className="text-base font-medium text-slate-700 mb-2 block">
                              Currency
                            </Label>
                            <select
                              id="currency"
                              {...form.register('currency')}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                              <option value="USD">USD</option>
                              <option value="ZAR">ZAR</option>
                              <option value="GBP">GBP</option>
                            </select>
                          </div>
                        </div>

                        {watchListingType === 'rent-to-buy' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor="rentToBuyDeposit" className="text-base font-medium text-slate-700 mb-2 block">
                                Required Deposit
                              </Label>
                              <Input
                                id="rentToBuyDeposit"
                                placeholder={`e.g., ${watchCountry === 'ZW' ? 'USD' : 'R'} 15,000`}
                                className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                {...form.register('rentToBuyDeposit')}
                              />
                            </div>

                            <div>
                              <Label htmlFor="monthlyInstallment" className="text-base font-medium text-slate-700 mb-2 block">
                                Monthly Installment
                              </Label>
                              <Input
                                id="monthlyInstallment"
                                placeholder={`e.g., ${watchCountry === 'ZW' ? 'USD' : 'R'} 1,000`}
                                className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                {...form.register('monthlyInstallment')}
                              />
                            </div>

                            <div>
                              <Label htmlFor="paymentDuration" className="text-base font-medium text-slate-700 mb-2 block">
                                Payment Duration (months)
                              </Label>
                              <Input
                                id="paymentDuration"
                                type="number"
                                placeholder="e.g., 120"
                                className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                {...form.register('paymentDuration')}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Features & Amenities */}
                  <div className="space-y-6">
                    <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3 mb-4">
                        <Zap className="w-5 h-5 text-blue-600" />
                        Features & Amenities
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Property Features */}
                        <div>
                          <Label className="text-base font-medium text-slate-700 mb-2 block">
                            Property Features
                          </Label>
                          <div className="flex gap-2 mb-3">
                            <Input
                              value={newFeature}
                              onChange={(e) => setNewFeature(e.target.value)}
                              placeholder="e.g., Hardwood floors, Built-in wardrobes"
                              className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addFeature();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={addFeature}
                              disabled={!newFeature.trim()}
                              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(form.watch('features') || []).map((feature, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1"
                              >
                                {feature}
                                <button
                                  type="button"
                                  onClick={() => removeFeature(index)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Property Amenities */}
                        <div>
                          <Label className="text-base font-medium text-slate-700 mb-2 block">
                            Amenities
                          </Label>
                          <div className="flex gap-2 mb-3">
                            <Input
                              value={newAmenity}
                              onChange={(e) => setNewAmenity(e.target.value)}
                              placeholder="e.g., Swimming pool, Gym, 24/7 Security"
                              className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addAmenity();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={addAmenity}
                              disabled={!newAmenity.trim()}
                              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(form.watch('amenities') || []).map((amenity, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1"
                              >
                                {amenity}
                                <button
                                  type="button"
                                  onClick={() => removeAmenity(index)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Continue to Photos
                    </Button>
                  </div>
                </form>
              ) : null}

              {step === 'media' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-medium text-slate-800 mb-2">
                      Property Photos
                    </h3>
                    <p className="text-sm text-slate-600">
                      Add new photos or keep existing ones
                    </p>
                  </div>

                  {/* Existing Images */}
                  {property?.property_images && property.property_images.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-3">Current Images</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {property.property_images.map((image, index) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.image_url}
                              alt={`Property photo ${index + 1}`}
                              className={`w-full h-40 object-cover rounded-lg transition-opacity ${
                                imagesToDelete.has(image.id) ? 'opacity-50' : ''
                              }`}
                            />
                            {image.is_main_image && (
                              <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                                Main
                              </Badge>
                            )}
                            <button
                              onClick={() => toggleImageDeletion(image.id)}
                              className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${
                                imagesToDelete.has(image.id)
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white/80 text-red-600 hover:bg-red-500 hover:text-white'
                              }`}
                              title={imagesToDelete.has(image.id) ? 'Undo delete' : 'Delete image'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {imagesToDelete.has(image.id) && (
                              <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                                  Will be deleted
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {imagesToDelete.size > 0 && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">
                            {imagesToDelete.size} image(s) will be deleted when you save changes.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add New Images */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50"
                  >
                    <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      Click to add new photos
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      JPG, PNG up to 10MB each
                    </p>
                  </div>

                  {newImageUrls.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-3">New Images</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {newImageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`New property photo ${index + 1}`}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeNewImage(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep('details')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleMediaSubmit}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Continue to Preview
                    </Button>
                  </div>
                </div>
              )}

              {step === 'preview' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Review Changes</h3>
                    <p className="text-sm text-blue-700">
                      Review the property information before saving changes
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-800">Property Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Title:</span> {form.getValues('title')}</div>
                        <div><span className="font-medium">Type:</span> {form.getValues('propertyType')}</div>
                        <div><span className="font-medium">Listing:</span> {form.getValues('listingType')}</div>
                        <div><span className="font-medium">Status:</span> {form.getValues('status')}</div>
                        <div><span className="font-medium">Price:</span> {form.getValues('currency')} {form.getValues('price')}</div>
                        <div><span className="font-medium">Location:</span> {form.getValues('city')}, {form.getValues('suburb')}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-800">Features & Amenities</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Features:</span> {(form.watch('features') || []).length > 0 ? (form.watch('features') || []).join(', ') : 'None added'}</div>
                        <div><span className="font-medium">Amenities:</span> {(form.watch('amenities') || []).length > 0 ? (form.watch('amenities') || []).join(', ') : 'None added'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep('media')}
                      className="flex-1"
                    >
                      Back to Photos
                    </Button>
                    <Button
                      onClick={handleFinalSubmit}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {step === 'submitting' && (
                <div className="text-center space-y-4 py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Building className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Updating Property</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Please wait while we update the property information...
                    </p>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Check className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Property Updated Successfully!</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      The property information has been updated and is now live
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  // Use portal to render modal at root level
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};
