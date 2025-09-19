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
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { PropertyType, ListingType, PropertyCountry, PropertyListing } from '@/types/property';
import { AdminListing } from '@/types/admin';
import { createPropertyApplicationInSupabase } from '@/lib/property-application-services';
import { uploadMultipleImages } from '@/lib/uploads';

interface AdminListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (propertyListing: PropertyListing) => void;
  adminListing?: AdminListing;
  country?: PropertyCountry;
}

const adminListingSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  propertyType: z.enum(['house', 'apartment', 'townhouse', 'land', 'commercial']),
  listingType: z.enum(['rent-to-buy', 'sale', 'installment']),
  country: z.enum(['ZW', 'SA']),
  city: z.string().min(2, "City is required"),
  suburb: z.string().min(2, "Suburb/Area is required"),
  size: z.string().min(1, "Property size is required"),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  parking: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  currency: z.enum(['USD', 'ZAR', 'GBP']),
  rentToBuyDeposit: z.string().optional(),
  monthlyInstallment: z.string().optional(),
  paymentDuration: z.string().optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
});

type AdminListingFormData = z.infer<typeof adminListingSchema>;

export const AdminListingModal: React.FC<AdminListingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  adminListing,
  country = 'ZW'
}) => {
  const [step, setStep] = React.useState<'details' | 'media' | 'preview' | 'submitting' | 'success'>('details');
  
  // Debug step changes
  React.useEffect(() => {
    console.log('Step changed to:', step);
  }, [step]);
  const [images, setImages] = React.useState<File[]>([]);
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [newFeature, setNewFeature] = React.useState('');
  const [newAmenity, setNewAmenity] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<AdminListingFormData>({
    resolver: zodResolver(adminListingSchema),
    defaultValues: {
      country,
      listingType: 'installment',
      propertyType: adminListing?.type === 'residential' ? 'house' : (adminListing?.type === 'commercial' ? 'commercial' : 'house'),
      currency: country === 'ZW' ? 'USD' : 'ZAR',
      features: [],
      amenities: [],
      title: adminListing?.propertyTitle || '',
      description: adminListing?.description || '',
      price: adminListing?.price.toString() || '',
      monthlyInstallment: adminListing?.monthlyInstallment?.toString() || '',
      city: adminListing?.location.split(',')[0]?.trim() || '',
      suburb: adminListing?.location.split(',')[1]?.trim() || '',
      size: adminListing?.size?.toString() || '',
      bedrooms: adminListing?.bedrooms?.toString() || '',
      bathrooms: adminListing?.bathrooms?.toString() || '',
      rentToBuyDeposit: '',
    }
  });

  const watchListingType = form.watch('listingType');
  const watchPropertyType = form.watch('propertyType');
  const watchCountry = form.watch('country');

  // Debug logging
  React.useEffect(() => {
    console.log('Current property type:', watchPropertyType);
    console.log('Form values:', form.getValues());
    console.log('Form errors:', form.formState.errors);
    console.log('Form valid:', form.formState.isValid);
  }, [watchPropertyType, form, form.formState.errors, form.formState.isValid]);

  // Trigger validation when form values change
  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change') {
        // Trigger validation for the changed field
        form.trigger(name as keyof AdminListingFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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

  // Image compression function
  const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create new file with compressed data
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      
      // Compress images before adding them
      const compressedImages: File[] = [];
      const compressedUrls: string[] = [];
      
      for (const file of newImages) {
        try {
          console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
          
          // Compress image
          const compressedFile = await compressImage(file, 1920, 0.8);
          compressedImages.push(compressedFile);
          
          console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
          
          // Create blob URL for preview
          const url = URL.createObjectURL(compressedFile);
          compressedUrls.push(url);
        } catch (error) {
          console.error('Error compressing image:', error);
          // Fallback to original file
          compressedImages.push(file);
        const url = URL.createObjectURL(file);
          compressedUrls.push(url);
        }
      }
      
      setImages(prev => [...prev, ...compressedImages]);
      setImageUrls(prev => [...prev, ...compressedUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleDetailsSubmit = async (data: AdminListingFormData) => {
    console.log('Form data submitted:', data);
    console.log('Form errors:', form.formState.errors);
    
    // Trigger validation manually to ensure form state is up to date
    const isValid = await form.trigger();
    console.log('Form validation result:', isValid);
    
    // Check if there are any validation errors
    if (!isValid) {
      console.error('Form validation failed:', form.formState.errors);
      // Don't return, let the form show the errors
      return;
    }
    
    console.log('Form is valid, proceeding to media step');
    setStep('media');
  };

  const handleMediaSubmit = async () => {
    if (images.length < 3) {
      alert('Please upload at least 3 images of the property');
      return;
    }
    setStep('preview');
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setStep('submitting');
    
    try {
      const formData = form.getValues();
      
      // Debug logging for features and amenities
      console.log('Final form data:', formData);
      console.log('Features from form:', formData.features);
      console.log('Amenities from form:', formData.amenities);
      console.log('Features type:', typeof formData.features, Array.isArray(formData.features));
      console.log('Amenities type:', typeof formData.amenities, Array.isArray(formData.amenities));
      
      // Convert blob URLs back to files for upload
      const imageFiles = images.map((file, index) => {
        if (file instanceof File) {
          return file;
        }
        return null;
      }).filter(Boolean) as File[];
      
      if (imageFiles.length === 0) {
        throw new Error('No images uploaded');
      }
      
      // Upload images to Supabase storage first
      console.log('Uploading images to Supabase storage...');
      const uploadResults = await uploadMultipleImages(imageFiles);
      
      // Check upload results and handle partial failures
      const successfulUploads = uploadResults.filter(result => result.success);
      const failedUploads = uploadResults.filter(result => !result.success);
      
      if (successfulUploads.length === 0) {
        throw new Error('All image uploads failed');
      }
      
      if (failedUploads.length > 0) {
        console.warn(`${failedUploads.length} images failed to upload, but ${successfulUploads.length} succeeded`);
        console.warn('Failed uploads:', failedUploads);
      }
      
      // Extract successful image URLs
      const imageUrls = successfulUploads.map(result => result.url!);
      console.log(`${imageUrls.length} images uploaded successfully:`, imageUrls);
      
      // Debug the property application data before creation
      console.log('Creating property application with data:');
      console.log('Features for property application:', formData.features);
      console.log('Amenities for property application:', formData.amenities);
      
      // Create property application instead of direct listing
      const propertyApplication = {
        id: `temp_${Date.now()}`, // Temporary ID for the interface
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        location: {
          country: formData.country,
          city: formData.city,
          suburb: formData.suburb,
          streetAddress: '', // No street address for security
        },
        details: {
          size: parseInt(formData.size),
          type: formData.propertyType as any,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
          parking: formData.parking ? parseInt(formData.parking) : undefined,
          features: formData.features || [],
          amenities: formData.amenities || [],
        },
        financials: {
          price: parseInt(formData.price),
          currency: formData.currency,
          rentToBuyDeposit: formData.rentToBuyDeposit ? parseInt(formData.rentToBuyDeposit) : undefined,
          monthlyInstallment: formData.monthlyInstallment ? parseInt(formData.monthlyInstallment) : undefined,
          paymentDuration: formData.paymentDuration ? parseInt(formData.paymentDuration) : undefined,
        },
        media: {
          mainImage: imageUrls[0] || '/placeholder-property.jpg',
          images: imageUrls, // Now using the uploaded image URLs instead of File objects
        },
        seller: {
          id: crypto.randomUUID(),
          name: 'Admin User',
          isVerified: true,
          contactInfo: {
            phone: '',
            email: 'admin@mukamba.com',
          },
        },
        status: 'active' as const, // Admin-created properties are automatically active
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        savedBy: 0,
        inquiries: 0,
      };

      // Save to Supabase as a pending application
      const applicationId = await createPropertyApplicationInSupabase(propertyApplication);
      
      if (applicationId) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        onComplete(propertyApplication);
        setStep('success');
        setTimeout(() => handleClose(), 2000);
      } else {
        throw new Error('Failed to create property application in database');
      }
    } catch (error) {
      console.error('Failed to add property application:', error);
      alert('Failed to create property application. Please try again.');
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStep('details');
      form.reset();
      setImages([]);
      setImageUrls([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" 
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={step === 'success' ? undefined : handleClose}
      >
        <motion.div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-lg relative"
          style={{ maxHeight: '90vh', overflow: 'hidden' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
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
              <CardTitle className="text-xl" id="modal-title">
                {step === 'details' && 'Add Property Listing'}
                {step === 'media' && 'Add Property Photos'}
                {step === 'preview' && 'Review Listing'}
                {step === 'submitting' && 'Adding Listing'}
                {step === 'success' && 'Property Added!'}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                {step === 'details' && 'Complete property information for public listing'}
                {step === 'media' && 'Upload high-quality photos of the property'}
                {step === 'preview' && 'Review the property listing before publishing'}
                {step === 'submitting' && 'Please wait while we add the property to listings'}
                {step === 'success' && 'Property has been successfully added to listings'}
              </p>
            </CardHeader>

            <CardContent className="space-y-8 max-h-[calc(90vh-16rem)] overflow-y-auto px-6 pb-6" style={{ maxHeight: 'calc(90vh - 16rem)' }}>
              {step === 'details' && (
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="propertyType" className="text-base font-medium text-slate-700 mb-2 block">
                              Property Type
                            </Label>
                            <select
                              id="propertyType"
                              {...form.register('propertyType')}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                              <option value="">Select property type</option>
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
                                                         <RadioGroup
                               value={form.watch('listingType')}
                               onValueChange={(value: ListingType) => form.setValue('listingType', value)}
                               className="grid grid-cols-2 gap-4 mt-2"
                             >
                               <div className="flex items-center space-x-2">
                                 <RadioGroupItem value="installment" id="installment" />
                                 <Label htmlFor="installment" className="text-sm">Installments</Label>
                               </div>
                               <div className="flex items-center space-x-2">
                                 <RadioGroupItem value="sale" id="sale" />
                                 <Label htmlFor="sale" className="text-sm">Cash Sale</Label>
                               </div>
                             </RadioGroup>
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
                            {form.formState.errors.city && (
                              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {form.formState.errors.city.message}
                              </p>
                            )}
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
                            {form.formState.errors.suburb && (
                              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {form.formState.errors.suburb.message}
                              </p>
                            )}
                          </div>
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
                            {form.formState.errors.size && (
                              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {form.formState.errors.size.message}
                              </p>
                            )}
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
                            {form.formState.errors.price && (
                              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {form.formState.errors.price.message}
                              </p>
                            )}
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
                              <option value="">Select currency</option>
                              <option value="USD">USD</option>
                              <option value="ZAR">ZAR</option>
                              <option value="GBP">GBP</option>
                            </select>
                            {form.formState.errors.currency && (
                              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {form.formState.errors.currency.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {watchListingType === 'installment' && (
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

                  <div className="pt-6 space-y-3">
                    {/* Debug info */}
                    <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded">
                      <div>Form valid: {form.formState.isValid ? 'Yes' : 'No'}</div>
                      <div>Errors: {Object.keys(form.formState.errors).length}</div>
                      <div>Dirty: {form.formState.isDirty ? 'Yes' : 'No'}</div>
                      <div>Submitted: {form.formState.isSubmitted ? 'Yes' : 'No'}</div>
                      {Object.keys(form.formState.errors).length > 0 && (
                        <div className="text-red-500">
                          {Object.entries(form.formState.errors).map(([key, error]) => (
                            <div key={key}>{key}: {error?.message}</div>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-xs">
                        <div>Required fields status:</div>
                        <div>Title: {form.watch('title') ? '✓' : '✗'} (min 10 chars)</div>
                        <div>Description: {form.watch('description') ? '✓' : '✗'} (min 50 chars)</div>
                        <div>Property Type: {form.watch('propertyType') ? '✓' : '✗'}</div>
                        <div>Listing Type: {form.watch('listingType') ? '✓' : '✗'}</div>
                        <div>City: {form.watch('city') ? '✓' : '✗'} (min 2 chars)</div>
                        <div>Suburb: {form.watch('suburb') ? '✓' : '✗'} (min 2 chars)</div>
                        <div>Size: {form.watch('size') ? '✓' : '✗'}</div>
                        <div>Price: {form.watch('price') ? '✓' : '✗'}</div>
                        <div>Currency: {form.watch('currency') ? '✓' : '✗'}</div>
                        <div>Features: {(form.watch('features') || []).length} items</div>
                        <div>Amenities: {(form.watch('amenities') || []).length} items</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          console.log('Manual validation check');
                          console.log('Form values:', form.getValues());
                          console.log('Form errors:', form.formState.errors);
                          console.log('Form valid:', form.formState.isValid);
                          console.log('Form dirty:', form.formState.isDirty);
                          console.log('Form submitted:', form.formState.isSubmitted);
                          // Trigger validation manually
                          form.trigger();
                        }}
                        className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
                      >
                        Debug Form
                      </button>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={!form.formState.isValid}
                    >
                      Continue to Photos
                    </Button>
                  </div>
                </form>
              )}

              {step === 'media' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-medium text-slate-800 mb-2">
                      Property Photos
                    </h3>
                    <p className="text-sm text-slate-600">
                      Upload clear, high-quality photos of the property (minimum 3)
                    </p>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50"
                  >
                    <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      Click to upload photos
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      JPG, PNG up to 10MB each
                    </p>
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Property photo ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
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
                      disabled={images.length < 3}
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
                    <h3 className="font-semibold text-blue-800 mb-2">Preview</h3>
                    <p className="text-sm text-blue-700">
                      Review the property information before adding it to the listings
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-800">Property Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Title:</span> {form.getValues('title')}</div>
                        <div><span className="font-medium">Type:</span> {form.getValues('propertyType')}</div>
                        <div><span className="font-medium">Listing:</span> {form.getValues('listingType')}</div>
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
                      Add to Listings
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
                    <h3 className="font-semibold text-slate-800">Adding Property to Listings</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Please wait while we add the property to the public listings...
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
                    <h3 className="text-lg font-semibold text-slate-800">Property Added Successfully!</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      The property has been added to the public listings and is now visible to potential buyers
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      onClick={handleClose}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Close
                    </Button>
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
