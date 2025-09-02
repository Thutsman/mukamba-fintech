'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Upload, Check, MapPin, Currency, Building, Loader2, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PropertyType, ListingType, PropertyCountry } from '@/types/property';

interface PropertyListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: PropertyListingData) => void;
  country: PropertyCountry;
}

const propertySchema = z.object({
  // Basic Information
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  propertyType: z.enum(['house', 'apartment', 'townhouse', 'land', 'commercial']),
  listingType: z.enum(['rent-to-buy', 'sale', 'installment']),
  
  // Location
  country: z.enum(['ZW', 'SA']),
  city: z.string().min(2, "City is required"),
  suburb: z.string().min(2, "Suburb/Area is required"),
  streetAddress: z.string().min(5, "Street address is required"),
  
  // Property Details
  size: z.string().min(1, "Property size is required"),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  parking: z.string().optional(),
  
  // Financial Details
  price: z.string().min(1, "Price is required"),
  rentToBuyDeposit: z.string().optional(),
  monthlyRental: z.string().optional(),
  rentCreditPercentage: z.string().optional(),

  // Additional Features
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
});

type PropertyListingData = z.infer<typeof propertySchema>;

export const PropertyListingModal: React.FC<PropertyListingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  country
}) => {
  const [step, setStep] = React.useState<'details' | 'media' | 'preview' | 'submitting' | 'success'>('details');
  const [images, setImages] = React.useState<File[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<PropertyListingData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      country,
      listingType: 'rent-to-buy',
      features: [],
      amenities: []
    }
  });

  const watchListingType = form.watch('listingType');
  const watchPropertyType = form.watch('propertyType');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImages(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDetailsSubmit = async (data: PropertyListingData) => {
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
      // Here you would typically upload images and submit the form data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      onComplete(formData);
      setStep('success');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit property listing:', error);
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
      onClose();
    }
  };

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial Property' }
  ];

  const amenityOptions = [
    'Swimming Pool',
    'Garden',
    'Security System',
    'Garage',
    'Solar Power',
    'Borehole/Well',
    'Electric Fence',
    'Fiber Internet',
    'Generator',
    'Staff Quarters'
  ];

  const featureOptions = [
    'Furnished',
    'Built-in Wardrobes',
    'Air Conditioning',
    'Solar Geyser',
    'Modern Kitchen',
    'Granite Countertops',
    'Walk-in Closet',
    'En-suite Bathroom',
    'Study Room',
    'Entertainment Area'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="w-6 h-6" />
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <Home className="w-6 h-6 text-emerald-600" />
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
                {step === 'details' && 'List Your Property'}
                {step === 'media' && 'Add Property Photos'}
                {step === 'preview' && 'Review Listing'}
                {step === 'submitting' && 'Submitting Listing'}
                {step === 'success' && 'Property Listed!'}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                {step === 'details' && 'Provide detailed information about your property'}
                {step === 'media' && 'Upload high-quality photos of your property'}
                {step === 'preview' && 'Review your property listing before submission'}
                {step === 'submitting' && 'Please wait while we process your listing'}
                {step === 'success' && 'Your property has been successfully listed'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 max-h-[calc(90vh-12rem)] overflow-y-auto">
              {step === 'details' && (
                <form onSubmit={form.handleSubmit(handleDetailsSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Basic Information</h3>
                    
                    <div>
                      <Label htmlFor="title">Property Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Modern 3-Bedroom House in Borrowdale"
                        {...form.register('title')}
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Property Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your property in detail..."
                        {...form.register('description')}
                        rows={4}
                      />
                      {form.formState.errors.description && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Select onValueChange={(value: PropertyType) => form.setValue('propertyType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            {propertyTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Listing Type</Label>
                        <RadioGroup
                          defaultValue="rent-to-buy"
                          onValueChange={(value: ListingType) => form.setValue('listingType', value)}
                          className="grid grid-cols-2 gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rent-to-buy" id="rent-to-buy" />
                            <Label htmlFor="rent-to-buy">Rent-to-Buy</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sale" id="sale" />
                            <Label htmlFor="sale">Direct Sale</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Location</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="e.g., Harare"
                          {...form.register('city')}
                        />
                      </div>

                      <div>
                        <Label htmlFor="suburb">Suburb/Area</Label>
                        <Input
                          id="suburb"
                          placeholder="e.g., Borrowdale"
                          {...form.register('suburb')}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="streetAddress">Street Address</Label>
                      <Input
                        id="streetAddress"
                        placeholder="e.g., 123 Example Street"
                        {...form.register('streetAddress')}
                      />
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Property Details</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="size">Size (m²)</Label>
                        <Input
                          id="size"
                          type="number"
                          placeholder="e.g., 200"
                          {...form.register('size')}
                        />
                      </div>

                      {watchPropertyType !== 'land' && (
                        <>
                          <div>
                            <Label htmlFor="bedrooms">Bedrooms</Label>
                            <Input
                              id="bedrooms"
                              type="number"
                              placeholder="e.g., 3"
                              {...form.register('bedrooms')}
                            />
                          </div>

                          <div>
                            <Label htmlFor="bathrooms">Bathrooms</Label>
                            <Input
                              id="bathrooms"
                              type="number"
                              placeholder="e.g., 2"
                              {...form.register('bathrooms')}
                            />
                          </div>

                          <div>
                            <Label htmlFor="parking">Parking Spaces</Label>
                            <Input
                              id="parking"
                              type="number"
                              placeholder="e.g., 2"
                              {...form.register('parking')}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Financial Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">
                          {watchListingType === 'sale' ? 'Selling Price' : 'Property Value'}
                        </Label>
                        <Input
                          id="price"
                          placeholder={`e.g., ${country === 'ZW' ? 'USD' : 'R'} 150,000`}
                          {...form.register('price')}
                        />
                      </div>

                      {watchListingType === 'rent-to-buy' && (
                        <>
                          <div>
                            <Label htmlFor="rentToBuyDeposit">Required Deposit</Label>
                            <Input
                              id="rentToBuyDeposit"
                              placeholder={`e.g., ${country === 'ZW' ? 'USD' : 'R'} 15,000`}
                              {...form.register('rentToBuyDeposit')}
                            />
                          </div>

                          <div>
                            <Label htmlFor="monthlyRental">Monthly Rental</Label>
                            <Input
                              id="monthlyRental"
                              placeholder={`e.g., ${country === 'ZW' ? 'USD' : 'R'} 1,000`}
                              {...form.register('monthlyRental')}
                            />
                          </div>

                          <div>
                            <Label htmlFor="rentCreditPercentage">Rent Credit Percentage</Label>
                            <Select onValueChange={(value) => form.setValue('rentCreditPercentage', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select percentage" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="20">20% of monthly rental</SelectItem>
                                <SelectItem value="25">25% of monthly rental</SelectItem>
                                <SelectItem value="30">30% of monthly rental</SelectItem>
                                <SelectItem value="35">35% of monthly rental</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Features & Amenities */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Features & Amenities</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-2 block">Property Features</Label>
                        <div className="space-y-2">
                          {featureOptions.map(feature => (
                            <label key={feature} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={feature}
                                onChange={(e) => {
                                  const features = form.getValues('features') || [];
                                  if (e.target.checked) {
                                    form.setValue('features', [...features, feature]);
                                  } else {
                                    form.setValue('features', features.filter(f => f !== feature));
                                  }
                                }}
                                className="rounded border-slate-300"
                              />
                              <span className="text-sm">{feature}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Property Amenities</Label>
                        <div className="space-y-2">
                          {amenityOptions.map(amenity => (
                            <label key={amenity} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={amenity}
                                onChange={(e) => {
                                  const amenities = form.getValues('amenities') || [];
                                  if (e.target.checked) {
                                    form.setValue('amenities', [...amenities, amenity]);
                                  } else {
                                    form.setValue('amenities', amenities.filter(a => a !== amenity));
                                  }
                                }}
                                className="rounded border-slate-300"
                              />
                              <span className="text-sm">{amenity}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Continue to Photos
                  </Button>
                </form>
              )}

              {step === 'media' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-medium text-slate-800 mb-2">
                      Property Photos
                    </h3>
                    <p className="text-sm text-slate-600">
                      Upload clear, high-quality photos of your property (minimum 3)
                    </p>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-emerald-400 hover:bg-emerald-50"
                  >
                    <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      Click to upload photos
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      JPG, PNG up to 10MB each
                    </p>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Property photo ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">
                      Photo Requirements:
                    </h4>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>• Upload at least 3 photos</li>
                      <li>• Include both interior and exterior shots</li>
                      <li>• Ensure photos are well-lit and clear</li>
                      <li>• Show main features of the property</li>
                    </ul>
                  </div>

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
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Continue to Preview
                    </Button>
                  </div>
                </div>
              )}

              {step === 'preview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Preview content here */}
                    <Button
                      variant="outline"
                      onClick={() => setStep('media')}
                      className="flex-1"
                    >
                      Back to Photos
                    </Button>
                    <Button
                      onClick={handleFinalSubmit}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Submit Listing
                    </Button>
                  </div>
                </div>
              )}

              {step === 'submitting' && (
                <div className="text-center space-y-4 py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <Building className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Processing Your Listing</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Please wait while we submit your property listing...
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
                    <h3 className="font-semibold text-slate-800">Property Listed Successfully!</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Your property has been listed and is now visible to potential buyers
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
}; 