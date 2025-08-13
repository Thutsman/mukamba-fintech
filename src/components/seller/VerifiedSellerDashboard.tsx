'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import { uploadFile as uploadFileMockSafe, uploadMultipleImages } from '@/lib/uploads';
import { createListing } from '@/lib/listings';
import { type User } from '@/types/auth';
import { 
  PlusCircle, CheckCircle, XCircle, Clock, FileText, ImageIcon,
  Home, BarChart3, User as UserIcon, Settings, Bell, Eye, MessageCircle, DollarSign, Filter, Plus, X, Upload, Camera, BarChart, MessageSquare, ArrowLeft
} from 'lucide-react';

type ListingStatus = 'pending' | 'approved' | 'rejected';

interface SellerProperty {
  id: string;
  title: string;
  address: string;
  city?: string;
  country?: string;
  propertyType?: string;
  views?: number;
  price: number;
  status: ListingStatus;
  submittedAt: string;
}

interface VerifiedSellerDashboardProps {
  user: User;
}

export const VerifiedSellerDashboard: React.FC<VerifiedSellerDashboardProps> = ({ user }) => {
  const router = useRouter();
  const [listings, setListings] = React.useState<SellerProperty[]>([]);
  const [isNewListingOpen, setIsNewListingOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);
  const deedInputRef = React.useRef<HTMLInputElement>(null);
  const imagesInputRef = React.useRef<HTMLInputElement>(null);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [form, setForm] = React.useState({
    title: '',
    address: '',
    description: '',
    propertyType: '',
    listingType: 'rent-to-buy' as 'rent-to-buy' | 'direct-sale',
    city: '',
    suburb: '',
    bedrooms: '',
    bathrooms: '',
    size: '',
    askingPrice: '',
    monthlyRent: '',
    rentCreditPercentage: '',
    durationMonths: '12',
    titleDeed: null as File | null,
    floorPlans: null as File | null,
    inspectionReport: null as File | null,
    municipalRates: null as File | null,
    images: [] as File[],
  });

  // TODO: Replace with Supabase fetch for properties owned by user.id
  React.useEffect(() => {
    setListings([
      { id: 'p1', title: '3BR House', address: '123 Oak Street', city: 'Harare', country: 'ZW', propertyType: 'Rent-to-Buy', views: 324, price: 8500, status: 'pending', submittedAt: new Date().toISOString() },
    ]);
  }, []);

  const StatusBadge: React.FC<{ status: ListingStatus | 'inactive' }> = ({ status }) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.inactive}`}>
        {label}
      </span>
    );
  };

  const openNewListing = () => {
    setCurrentStep(1);
    setIsNewListingOpen(true);
  };
  const closeNewListing = () => {
    setIsNewListingOpen(false);
    setCurrentStep(1);
  };

  const handleFileSelect = (field: 'titleDeed' | 'images', files: FileList | null) => {
    if (!files) return;
    if (field === 'titleDeed') setForm((f) => ({ ...f, titleDeed: files[0] }));
    if (field === 'images') setForm((f) => ({ ...f, images: Array.from(files) }));
  };

  React.useEffect(() => {
    // Revoke previous
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    const urls = (form.images || []).map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    // Revoke on unmount
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.images]);

  const handleRemoveImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmitNewListing = async () => {
    setIsSubmitting(true);
    try {
      // Upload files (mocked if no supabase creds)
      if (form.titleDeed) {
        await uploadFileMockSafe(form.titleDeed, STORAGE_BUCKETS.PROPERTY_DOCUMENTS, `${user.id}/${Date.now()}-title-deed.pdf`);
      }
      if (form.images.length > 0) {
        await uploadMultipleImages(form.images);
      }
      // Mock create listing
      const listingPayload = {
        ownerId: user.id,
        title: form.title,
        address: form.address,
        city: form.city,
        suburb: form.suburb,
        propertyType: form.propertyType,
        listingType: form.listingType,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        size: form.size,
        askingPrice: form.askingPrice,
        monthlyRent: form.monthlyRent,
        rentCreditPercentage: form.rentCreditPercentage,
        durationMonths: form.durationMonths,
        submittedAt: new Date().toISOString(),
      };

      const created = await createListing(listingPayload);
      setListings((prev) => [
        {
          id: String(created.id),
          title: created.title,
          address: created.address,
          city: created.city,
          country: 'ZW',
          propertyType: created.listingType === 'rent-to-buy' ? 'Rent-to-Buy' : 'Direct Sale',
          views: 0,
          price: Number(created.askingPrice || created.monthlyRent || 0),
          status: 'pending',
          submittedAt: created.submittedAt,
        },
        ...prev,
      ]);

      // Close modal
      closeNewListing();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step components
  const BasicInfoStep: React.FC = () => (
    <div className="space-y-6">
      {/* Property Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
        <input
          type="text"
          placeholder="e.g., Modern 3-Bedroom House in Borrowdale"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      {/* Property Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Property Description *</label>
        <textarea
          rows={4}
          placeholder="Describe your property in detail... amenities, unique features, neighborhood benefits"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 50 characters recommended</p>
      </div>

      {/* Property Type & Listing Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg" value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
            <option value="">Select property type</option>
            <option>House</option>
            <option>Apartment</option>
            <option>Townhouse</option>
            <option>Commercial</option>
            <option>Land</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type *</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input type="radio" name="listingType" value="rent-to-buy" className="mr-2" checked={form.listingType === 'rent-to-buy'} onChange={() => setForm({ ...form, listingType: 'rent-to-buy' })} />
              <span className="text-sm">Rent-to-Buy</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="listingType" value="direct-sale" className="mr-2" checked={form.listingType === 'direct-sale'} onChange={() => setForm({ ...form, listingType: 'direct-sale' })} />
              <span className="text-sm">Direct Sale</span>
            </label>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
          <input
            type="text"
            placeholder="e.g., Harare"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Suburb/Area *</label>
          <input
            type="text"
            placeholder="e.g., Borrowdale"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={form.suburb}
            onChange={(e) => setForm({ ...form, suburb: e.target.value })}
          />
        </div>
      </div>

      {/* Property Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}>
            <option value="">Select</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}>
            <option value="">Select</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size (m²)</label>
          <input
            type="number"
            placeholder="120"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
          />
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">Pricing Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asking Price (R) *</label>
            <input
              type="number"
              placeholder="1200000"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={form.askingPrice}
              onChange={(e) => setForm({ ...form, askingPrice: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (R)</label>
            <input
              type="number"
              placeholder="8500"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={form.monthlyRent}
              onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rent Credit %</label>
            <input
              type="number"
              placeholder="25"
              min="0"
              max="100"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={form.rentCreditPercentage}
              onChange={(e) => setForm({ ...form, rentCreditPercentage: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contract Duration (months)</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="48">48 months</option>
              <option value="60">60 months</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const MediaUploadStep: React.FC = () => (
    <div className="space-y-6">
      {/* Title Deed Upload */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Title Deed Document *
        </h4>
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <p className="text-blue-700 font-medium">Upload your title deed</p>
          <p className="text-blue-600 text-sm">PDF, DOC, or DOCX (max 10MB)</p>
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => deedInputRef.current?.click()}>
            Choose File
          </Button>
          <input ref={deedInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleFileSelect('titleDeed', e.target.files)} />
          {form.titleDeed && <p className="text-xs text-blue-700 mt-2">Selected: {form.titleDeed.name}</p>}
        </div>
      </div>

      {/* Property Images Upload */}
      <div>
        <h4 className="font-medium text-slate-900 mb-4 flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Property Images *
        </h4>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-700 font-medium">Upload property photos</p>
          <p className="text-slate-600 text-sm">JPG, PNG (max 5MB each, up to 20 images)</p>
          <p className="text-slate-500 text-xs mt-2">First image will be used as the main photo</p>
          <Button className="mt-4" variant="outline" onClick={() => imagesInputRef.current?.click()}>
            Select Images
          </Button>
          <input ref={imagesInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileSelect('images', e.target.files)} />
        </div>

        {/* Image Preview Grid */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {imagePreviews.map((url, idx) => (
              <div key={idx} className="relative group border rounded-lg overflow-hidden">
                <img src={url} alt={`preview-${idx}`} className="w-full h-32 object-cover" />
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white text-slate-700 rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Documents */}
      <div>
        <h4 className="font-medium text-slate-900 mb-4">Additional Documents (Optional)</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
            <span className="text-sm text-slate-700">Floor plans</span>
            <div>
              {form.floorPlans && <span className="text-xs text-slate-500 mr-2">{form.floorPlans.name}</span>}
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('floorPlansInput')?.click()}>Upload</Button>
              <input id="floorPlansInput" type="file" className="hidden" onChange={(e) => setForm((f) => ({ ...f, floorPlans: e.target.files?.[0] || null }))} />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
            <span className="text-sm text-slate-700">Property inspection report</span>
            <div>
              {form.inspectionReport && <span className="text-xs text-slate-500 mr-2">{form.inspectionReport.name}</span>}
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('inspectionInput')?.click()}>Upload</Button>
              <input id="inspectionInput" type="file" className="hidden" onChange={(e) => setForm((f) => ({ ...f, inspectionReport: e.target.files?.[0] || null }))} />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
            <span className="text-sm text-slate-700">Municipal rates certificate</span>
            <div>
              {form.municipalRates && <span className="text-xs text-slate-500 mr-2">{form.municipalRates.name}</span>}
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('municipalInput')?.click()}>Upload</Button>
              <input id="municipalInput" type="file" className="hidden" onChange={(e) => setForm((f) => ({ ...f, municipalRates: e.target.files?.[0] || null }))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ReviewStep: React.FC = () => (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-slate-500">Title</div>
          <div className="font-medium text-slate-800">{form.title || '—'}</div>
        </div>
        <div>
          <div className="text-slate-500">Property Type</div>
          <div className="font-medium text-slate-800">{form.propertyType || '—'}</div>
        </div>
        <div>
          <div className="text-slate-500">Listing Type</div>
          <div className="font-medium text-slate-800 capitalize">{form.listingType || '—'}</div>
        </div>
        <div>
          <div className="text-slate-500">Address</div>
          <div className="font-medium text-slate-800">{form.address || '—'}</div>
        </div>
        <div>
          <div className="text-slate-500">City</div>
          <div className="font-medium text-slate-800">{form.city || '—'}</div>
        </div>
        <div>
          <div className="text-slate-500">Suburb</div>
          <div className="font-medium text-slate-800">{form.suburb || '—'}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-slate-500">Description</div>
          <div className="font-medium text-slate-800 whitespace-pre-wrap">{form.description || '—'}</div>
        </div>
        <div>
          <div className="text-slate-500">Asking Price</div>
          <div className="font-medium text-slate-800">{form.askingPrice || '—'}</div>
        </div>
        <div>
          <div className="text-slate-500">Rent Credit %</div>
          <div className="font-medium text-slate-800">{form.rentCreditPercentage || '—'}</div>
        </div>
        <div>
          <div className="text-slate-500">Duration (months)</div>
          <div className="font-medium text-slate-800">{form.durationMonths || '—'}</div>
        </div>
        <div>
          <div className="text-slate-500">Monthly Rent</div>
          <div className="font-medium text-slate-800">{form.monthlyRent || '—'}</div>
        </div>
        <div>
          <div className="text-slate-500">Bedrooms / Bathrooms / Size</div>
          <div className="font-medium text-slate-800">{form.bedrooms || '—'} / {form.bathrooms || '—'} / {form.size || '—'} m²</div>
        </div>
      </div>
      <div className="pt-2">
        <div className="text-slate-500">Files</div>
        <div className="text-slate-800">Title deed: {form.titleDeed ? form.titleDeed.name : '—'}</div>
        <div className="text-slate-800">Images: {form.images.length} selected</div>
      </div>
    </div>
  );

  const navigationItems = [
    { icon: Home, label: 'Overview', active: true, href: '/dashboard/seller' },
    { icon: FileText, label: 'Listings', href: '/dashboard/seller' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/seller' },
    { icon: FileText, label: 'Documents', href: '/dashboard/seller' },
    { icon: UserIcon, label: 'Profile', href: '/dashboard/seller' },
    { icon: Settings, label: 'Settings', href: '/dashboard/seller' },
  ];

  const handleNavigationClick = (href: string) => {
    // Wire to router when distinct routes exist
    console.log('Navigate to:', href);
  };

  const deedVerified = user.isPropertyVerified || user.kycStatus === 'approved';
  const deedProgress = deedVerified ? 100 : 75;

  const sellerMetrics = [
    {
      title: 'Active Listings',
      value: '12',
      subtitle: 'Properties Listed',
      icon: Home,
      color: 'bg-blue-100 text-blue-700',
      trend: '+2 this month',
    },
    {
      title: 'Total Views',
      value: '1,247',
      subtitle: 'This Month',
      icon: Eye,
      color: 'bg-green-100 text-green-700',
      trend: '+15% from last month',
    },
    {
      title: 'Inquiries',
      value: '23',
      subtitle: 'Pending Responses',
      icon: MessageCircle,
      color: 'bg-orange-100 text-orange-700',
      trend: '5 new today',
    },
    {
      title: 'Revenue Generated',
      value: 'R45,600',
      subtitle: 'Total Commissions',
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-700',
      trend: '+12% this quarter',
    },
  ];

  const recentActivities = [
    {
      id: 'a1',
      icon: Home,
      title: 'New listing submitted',
      description: '3BR House • Borrowdale, Harare • Pending review',
      time: '3 hours ago',
      bg: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'a2',
      icon: FileText,
      title: 'Title deed uploaded',
      description: 'Property documents received for verification',
      time: 'Yesterday',
      bg: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'a3',
      icon: CheckCircle,
      title: 'Listing approved',
      description: '3BR House • Now visible to buyers',
      time: '2 days ago',
      bg: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'a4',
      icon: MessageSquare,
      title: 'New inquiries',
      description: '5 new inquiries received for your property',
      time: '2 days ago',
      bg: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'a5',
      icon: DollarSign,
      title: 'Price updated',
      description: 'Asking price adjusted to R1,200,000',
      time: 'Last week',
      bg: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Sidebar */}
      <aside className="hidden md:block fixed left-6 top-8 w-80 bg-white border border-slate-200 rounded-2xl shadow-lg">
        <div className="flex flex-col">
          {/* Profile */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={user.firstName} />
                <AvatarFallback className="bg-red-600 text-white text-xl font-semibold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="mt-2">
                <div className="text-slate-900 font-semibold text-base">{user.firstName} {user.lastName}</div>
                <div className="text-xs text-slate-500 truncate max-w-[14rem]">{user.email || 'seller@mukamba.com'}</div>
                <div className="mt-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified Seller
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Title Deed Progress */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Title Deed Verified</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${deedProgress}%` }} />
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Your property documents are verified.
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-2 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigationClick(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative group ${
                  item.active ? 'bg-red-50 text-red-700 border border-red-200' : 'text-slate-700 hover:bg-slate-50'
                }`}
                aria-current={item.active ? 'page' : undefined}
              >
                <span className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${item.active ? 'bg-red-600' : 'bg-transparent group-hover:bg-slate-200'}`} />
                <item.icon className={item.active ? 'w-4 h-4 text-red-600' : 'w-4 h-4 text-slate-500'} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Quick Settings */}
          <div className="px-4 py-3 border-t border-slate-200 space-y-2">
            <div className="text-xs font-medium text-slate-500">Quick Settings</div>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-2 py-2">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="inline-block w-4 h-4 rounded-full bg-slate-400" />
                <span>Dark Mode</span>
              </div>
              <button
                onClick={() => setDarkModeEnabled((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${darkModeEnabled ? 'bg-red-600' : 'bg-slate-300'}`}
                aria-pressed={darkModeEnabled}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${darkModeEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-2 py-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              <button
                onClick={() => setNotificationsEnabled((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notificationsEnabled ? 'bg-red-600' : 'bg-slate-300'}`}
                aria-pressed={notificationsEnabled}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${notificationsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-[23rem] p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
      {/* Back to Home */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="flex items-center text-slate-600 hover:text-slate-900 px-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
      {/* Top Section */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-xl text-slate-900">Welcome, {user.firstName} {user.lastName}</CardTitle>
            <div className="text-sm text-slate-600 truncate">{user.email}</div>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" /> Verified Seller
              </Badge>
            </div>
          </div>
          <Button onClick={openNewListing} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
            <PlusCircle className="w-4 h-4 mr-2" /> Start New Listing
          </Button>
        </CardHeader>
      </Card>

      {/* Seller Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sellerMetrics.map((m) => (
          <Card key={m.title} className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-4 text-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-600 font-medium">{m.title}</div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">{m.value}</div>
                  <div className="text-xs text-slate-600 mt-1">{m.subtitle}</div>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.color}`}>
                  <m.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600">{m.trend}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6 text-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto" onClick={openNewListing}>
            <Plus className="w-6 h-6 mb-2" />
            <span className="text-sm">New Listing</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto" onClick={() => console.log('View Analytics')}>
            <BarChart className="w-6 h-6 mb-2" />
            <span className="text-sm">View Analytics</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto" onClick={() => console.log('Messages')}>
            <MessageSquare className="w-6 h-6 mb-2" />
            <span className="text-sm">Messages</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto" onClick={() => console.log('Settings')}>
            <Settings className="w-6 h-6 mb-2" />
            <span className="text-sm">Settings</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.bg}`}>
                <a.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-900">{a.title}</div>
                  <div className="text-xs text-slate-500">{a.time}</div>
                </div>
                <div className="text-sm text-slate-600">{a.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Listings - Enhanced */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-slate-900">My Property Listings</h3>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button onClick={openNewListing} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              List New Property
            </Button>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="text-sm text-slate-600">No listings yet.</div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="space-y-4 lg:hidden">
              {listings.map((p) => (
                <div key={p.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{p.title}</div>
                      <div className="text-sm text-slate-600 truncate">{p.address}{p.city ? `, ${p.city}` : ''}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-slate-600">{p.propertyType || '—'}</span>
                        <span className="text-slate-500">•</span>
                        <span className="font-medium">{typeof p.price === 'number' ? `R${p.price.toLocaleString()}` : p.price}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <StatusBadge status={p.status} />
                        <span className="text-xs text-slate-500">{new Date(p.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="overflow-x-auto hidden lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Property</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Listed Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Views</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="py-3 px-4 font-medium text-slate-800">{p.title}</td>
                      <td className="py-3 px-4">{p.address}{p.city ? `, ${p.city}` : ''}</td>
                      <td className="py-3 px-4">{p.propertyType || '—'}</td>
                      <td className="py-3 px-4">{typeof p.price === 'number' ? `R${p.price.toLocaleString()}` : p.price}</td>
                      <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                      <td className="py-3 px-4">{new Date(p.submittedAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{p.views ?? '—'}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Enhanced New Listing Modal */}
      {isNewListingOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">List Your Property</h2>
                    <p className="text-slate-600">Provide detailed information to attract potential buyers</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={closeNewListing}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'} rounded-full flex items-center justify-center text-sm font-medium`}>1</div>
                  <span className={`ml-2 text-sm font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-slate-600'}`}>Basic Info</span>
                </div>
                <div className="flex-1 h-px bg-slate-300 mx-4"></div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'} rounded-full flex items-center justify-center text-sm font-medium`}>2</div>
                  <span className={`ml-2 text-sm ${currentStep === 2 ? 'text-blue-600 font-medium' : 'text-slate-600'}`}>Media & Docs</span>
                </div>
                <div className="flex-1 h-px bg-slate-300 mx-4"></div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'} rounded-full flex items-center justify-center text-sm font-medium`}>3</div>
                  <span className={`ml-2 text-sm ${currentStep === 3 ? 'text-blue-600 font-medium' : 'text-slate-600'}`}>Review</span>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                {currentStep === 1 && <BasicInfoStep />}
                {currentStep === 2 && <MediaUploadStep />}
                {currentStep === 3 && <ReviewStep />}
              </div>

              {/* Footer Actions */}
              <div className="pt-6 flex items-center justify-between">
                <Button variant="outline" onClick={closeNewListing}>Cancel</Button>
                <div className="space-x-2">
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={() => setCurrentStep((s) => (s === 2 ? 1 : 2))}>Back</Button>
                  )}
                  {currentStep < 3 ? (
                    <Button onClick={() => setCurrentStep((s) => (s === 1 ? 2 : 3))}>
                      Next
                    </Button>
                  ) : (
                    <Button onClick={handleSubmitNewListing} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                      {isSubmitting ? 'Submitting...' : 'Submit Listing'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};


