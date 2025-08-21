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
  User
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PropertyType, ListingType, PropertyCountry, PropertyListing } from '@/types/property';
import { AdminListing } from '@/types/admin';

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
  listingType: z.enum(['rent-to-buy', 'sale']),
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
  monthlyRental: z.string().optional(),
  rentCreditPercentage: z.string().optional(),
  sellerName: z.string().min(2, "Seller name is required"),
  sellerEmail: z.string().email("Valid email is required"),
  sellerPhone: z.string().optional(),
  sellerIsVerified: z.boolean(),
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
  const [images, setImages] = React.useState<File[]>([]);
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<AdminListingFormData>({
    resolver: zodResolver(adminListingSchema),
    defaultValues: {
      country,
      listingType: 'rent-to-buy',
      propertyType: adminListing?.type === 'residential' ? 'house' : (adminListing?.type === 'commercial' ? 'commercial' : 'house'),
      currency: country === 'ZW' ? 'USD' : 'ZAR',
      features: [],
      amenities: [],
      sellerIsVerified: true,
      title: adminListing?.propertyTitle || '',
      description: adminListing?.description || '',
      price: adminListing?.price.toString() || '',
      monthlyRental: adminListing?.monthlyRental?.toString() || '',
      sellerName: adminListing?.sellerName || '',
      city: adminListing?.location.split(',')[0]?.trim() || '',
      suburb: adminListing?.location.split(',')[1]?.trim() || '',
      streetAddress: adminListing?.location.split(',')[2]?.trim() || '',
      size: adminListing?.size?.toString() || '',
      bedrooms: adminListing?.bedrooms?.toString() || '',
      bathrooms: adminListing?.bathrooms?.toString() || '',
      sellerEmail: '',
      sellerPhone: '',
      rentToBuyDeposit: '',
      rentCreditPercentage: '',
    }
  });

  const watchListingType = form.watch('listingType');
  const watchPropertyType = form.watch('propertyType');
  const watchCountry = form.watch('country');

  // Debug logging
  React.useEffect(() => {
    console.log('Current property type:', watchPropertyType);
    console.log('Form values:', form.getValues());
  }, [watchPropertyType, form]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setImages(prev => [...prev, ...newImages]);
      newImages.forEach(file => {
        const url = URL.createObjectURL(file);
        setImageUrls(prev => [...prev, url]);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleDetailsSubmit = async (data: AdminListingFormData) => {
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
      
      const propertyListing: PropertyListing = {
        id: adminListing?.id || `prop_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        location: {
          country: formData.country,
          city: formData.city,
          suburb: formData.suburb,
          streetAddress: formData.streetAddress,
        },
        details: {
          size: parseInt(formData.size),
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
          monthlyRental: formData.monthlyRental ? parseInt(formData.monthlyRental) : undefined,
          rentCreditPercentage: formData.rentCreditPercentage ? parseInt(formData.rentCreditPercentage) : undefined,
        },
        media: {
          mainImage: imageUrls[0] || '/placeholder-property.jpg',
          images: imageUrls,
        },
        seller: {
          id: adminListing?.sellerId || `seller_${Date.now()}`,
          name: formData.sellerName,
          isVerified: formData.sellerIsVerified,
          contactInfo: {
            phone: formData.sellerPhone,
            email: formData.sellerEmail,
          },
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        savedBy: 0,
        inquiries: 0,
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      onComplete(propertyListing);
      setStep('success');
      setTimeout(() => handleClose(), 2000);
    } catch (error) {
      console.error('Failed to add property listing:', error);
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
        onClick={handleClose}
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
                                 <RadioGroupItem value="rent-to-buy" id="rent-to-buy" />
                                 <Label htmlFor="rent-to-buy" className="text-sm">Installments</Label>
                               </div>
                               <div className="flex items-center space-x-2">
                                 <RadioGroupItem value="sale" id="sale" />
                                 <Label htmlFor="sale" className="text-sm">Direct Sale</Label>
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
                          {form.formState.errors.streetAddress && (
                            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              {form.formState.errors.streetAddress.message}
                            </p>
                          )}
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

                        {watchListingType === 'rent-to-buy' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                              <Label htmlFor="monthlyRental" className="text-base font-medium text-slate-700 mb-2 block">
                                Monthly Rental
                              </Label>
                              <Input
                                id="monthlyRental"
                                placeholder={`e.g., ${watchCountry === 'ZW' ? 'USD' : 'R'} 1,000`}
                                className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                {...form.register('monthlyRental')}
                              />
                            </div>

                            <div>
                              <Label htmlFor="rentCreditPercentage" className="text-base font-medium text-slate-700 mb-2 block">
                                Rent Credit Percentage
                              </Label>
                              <select
                                id="rentCreditPercentage"
                                {...form.register('rentCreditPercentage')}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              >
                                <option value="">Select percentage</option>
                                <option value="20">20% of monthly rental</option>
                                <option value="25">25% of monthly rental</option>
                                <option value="30">30% of monthly rental</option>
                                <option value="35">35% of monthly rental</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seller Information */}
                  <div className="space-y-6">
                    <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3 mb-4">
                        <User className="w-5 h-5 text-blue-600" />
                        Seller Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="sellerName" className="text-base font-medium text-slate-700 mb-2 block">
                              Seller Name
                            </Label>
                            <Input
                              id="sellerName"
                              placeholder="e.g., John Smith"
                              className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              {...form.register('sellerName')}
                            />
                            {form.formState.errors.sellerName && (
                              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {form.formState.errors.sellerName.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="sellerEmail" className="text-base font-medium text-slate-700 mb-2 block">
                              Seller Email
                            </Label>
                            <Input
                              id="sellerEmail"
                              type="email"
                              placeholder="e.g., john@example.com"
                              className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              {...form.register('sellerEmail')}
                            />
                            {form.formState.errors.sellerEmail && (
                              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {form.formState.errors.sellerEmail.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="sellerPhone" className="text-base font-medium text-slate-700 mb-2 block">
                              Seller Phone (Optional)
                            </Label>
                            <Input
                              id="sellerPhone"
                              placeholder="e.g., +263 77 123 4567"
                              className="px-4 py-3 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              {...form.register('sellerPhone')}
                            />
                          </div>

                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="sellerIsVerified"
                              {...form.register('sellerIsVerified')}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="sellerIsVerified" className="text-base font-medium text-slate-700">
                              Seller is verified
                            </Label>
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
                      <h4 className="font-medium text-slate-800">Seller Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {form.getValues('sellerName')}</div>
                        <div><span className="font-medium">Email:</span> {form.getValues('sellerEmail')}</div>
                        <div><span className="font-medium">Verified:</span> {form.getValues('sellerIsVerified') ? 'Yes' : 'No'}</div>
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
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Check className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Property Added Successfully!</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      The property has been added to the public listings and is now visible to potential buyers
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
