'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { STORAGE_BUCKETS, listFiles, deleteFile, getPublicUrl } from '@/lib/supabase';
import { uploadFile as uploadFileMockSafe, uploadMultipleImages } from '@/lib/uploads';
import { createListing } from '@/lib/listings';
import { type User } from '@/types/auth';
import { 
  PlusCircle, CheckCircle, XCircle, Clock, FileText, ImageIcon,
  Home, BarChart3, User as UserIcon, Settings, Bell, Eye, MessageCircle, DollarSign, Filter, Plus, X, Upload, Camera, BarChart, MessageSquare, ArrowLeft
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

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
  const docInputRef = React.useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = React.useState<Array<{ name: string; url: string; size?: number; created_at?: string; path: string }>>([]);
  const [isDocsLoading, setIsDocsLoading] = React.useState(false);
  const [docsError, setDocsError] = React.useState<string | null>(null);
  // Page section state must be declared before any effects that depend on it
  const [activeSection, setActiveSection] = React.useState<'overview' | 'listings' | 'offers' | 'analytics' | 'documents' | 'profile' | 'settings'>('overview');
  // Mobile sidebar drawer
  const [showMobileNav, setShowMobileNav] = React.useState(false);
  
  // Document categories
  type DocCategory = 'title-deeds' | 'municipal-rates' | 'company-documents' | 'identity-documents';
  const DOC_CATEGORIES: Array<{ id: DocCategory; label: string }> = [
    { id: 'title-deeds', label: 'Title Deeds' },
    { id: 'municipal-rates', label: 'Municipal Rates' },
    { id: 'company-documents', label: 'Company Documents' },
    { id: 'identity-documents', label: 'Identity Documents' },
  ];
  const [docCategoryFilter, setDocCategoryFilter] = React.useState<'all' | DocCategory>('all');
  const [docUploadCategory, setDocUploadCategory] = React.useState<DocCategory>('title-deeds');

  // Profile data (MVP)
  const [personalProfile, setPersonalProfile] = React.useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    nationalId: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: 'ZW',
  });
  const [businessProfile, setBusinessProfile] = React.useState({
    companyName: '',
    registrationNumber: '',
    taxNumber: '',
    brandName: '',
    bio: '',
  });
  const [payoutMethod, setPayoutMethod] = React.useState<
    | { type: 'bank'; accountName: string; accountNumber: string; bankName: string; branch?: string }
    | { type: 'mobile'; accountName: string; walletProvider: string; phoneNumber: string }
  >({ type: 'bank', accountName: '', accountNumber: '', bankName: '', branch: '' });
  const [payoutHistory, setPayoutHistory] = React.useState<Array<{ id: string; date: string; amount: number; status: 'processing' | 'paid' }>>([
    { id: 'px1', date: new Date().toISOString(), amount: 26600, status: 'paid' },
  ]);
  const [security, setSecurity] = React.useState({ twoFAEnabled: false });
  const [notificationsPref, setNotificationsPref] = React.useState({
    newInquiry: true,
    listingApproved: true,
    payoutProcessed: true,
    marketing: false,
  });
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = React.useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState<SellerProperty | null>(null);
  const [listFilter, setListFilter] = React.useState<'all' | 'approved' | 'pending' | 'rejected' | 'inactive'>('all');
  const getInitialForm = () => ({
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

  const [form, setForm] = React.useState(getInitialForm());

  // TODO: Replace with Supabase fetch for properties owned by user.id
  React.useEffect(() => {
    const generateMockListings = (): SellerProperty[] => {
      const statuses: ListingStatus[] = ['approved', 'pending', 'approved', 'approved', 'pending'];
      const types = ['Rent-to-Buy', 'Direct Sale'];
      const cities = ['Harare', 'Bulawayo', 'Gweru', 'Mutare', 'Masvingo'];
      const today = new Date();
      return Array.from({ length: 12 }).map((_, i) => {
        const listedDate = new Date(today.getTime() - i * 1000 * 60 * 60 * 24 * 3); // every 3 days
        return {
          id: `p${i + 1}`,
          title: `${(i % 2 === 0) ? '3BR House' : '2BR Apartment'} #${i + 1}`,
          address: `${120 + i} Oak Street`,
          city: cities[i % cities.length],
          country: 'ZW',
          propertyType: types[i % types.length],
          views: 60 + i * 20,
          price: 7500 + i * 500,
          status: statuses[i % statuses.length],
          submittedAt: listedDate.toISOString(),
        } as SellerProperty;
      });
    };
    setListings(generateMockListings());
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
    // Reset form state and UI when modal closes so it opens fresh next time
    setIsNewListingOpen(false);
    setCurrentStep(1);
    setForm(getInitialForm());
    setImagePreviews([]);
    if (deedInputRef.current) deedInputRef.current.value = '';
    if (imagesInputRef.current) imagesInputRef.current.value = '';
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

  const refreshDocuments = React.useCallback(async () => {
    try {
      setIsDocsLoading(true);
      setDocsError(null);
      let aggregated: Array<{ name: string; size?: number; created_at?: string; path: string; url: string; category?: DocCategory }> = [];
      if (docCategoryFilter === 'all') {
        for (const cat of DOC_CATEGORIES) {
          const files = await listFiles(STORAGE_BUCKETS.USER_DOCUMENTS, `${user.id}/${cat.id}`);
          const mapped = files.map((f: any) => ({
            name: f.name,
            size: f.size,
            created_at: f.created_at,
            path: `${user.id}/${cat.id}/${f.name}`,
            url: getPublicUrl(STORAGE_BUCKETS.USER_DOCUMENTS, `${user.id}/${cat.id}/${f.name}`),
            category: cat.id,
          }));
          aggregated = aggregated.concat(mapped);
        }
      } else {
        const files = await listFiles(STORAGE_BUCKETS.USER_DOCUMENTS, `${user.id}/${docCategoryFilter}`);
        aggregated = files.map((f: any) => ({
          name: f.name,
          size: f.size,
          created_at: f.created_at,
          path: `${user.id}/${docCategoryFilter}/${f.name}`,
          url: getPublicUrl(STORAGE_BUCKETS.USER_DOCUMENTS, `${user.id}/${docCategoryFilter}/${f.name}`),
          category: docCategoryFilter,
        }));
      }
      const mapped = aggregated;
      setDocuments(mapped);
    } catch (e: any) {
      setDocsError(e?.message ?? 'Failed to load documents');
    } finally {
      setIsDocsLoading(false);
    }
  }, [user.id, docCategoryFilter]);

  React.useEffect(() => {
    if (activeSection === 'documents') {
      refreshDocuments();
    }
  }, [activeSection, refreshDocuments]);

  const handleUploadDocument = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsDocsLoading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadFileMockSafe(
          file,
          STORAGE_BUCKETS.USER_DOCUMENTS,
          `${user.id}/${docUploadCategory}/${Date.now()}-${file.name}`
        );
      }
      await refreshDocuments();
    } finally {
      setIsDocsLoading(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (path: string) => {
    try {
      setIsDocsLoading(true);
      await deleteFile(STORAGE_BUCKETS.USER_DOCUMENTS, [path]);
      await refreshDocuments();
    } finally {
      setIsDocsLoading(false);
    }
  };

  const openListingDetails = (listing: SellerProperty) => {
    setSelectedListing(listing);
    setIsDetailsOpen(true);
  };

  const openEditListingFromRow = (listing: SellerProperty) => {
    // Pre-fill the form with known values from the listing (best-effort mapping)
    const inferredListingType =
      listing.propertyType?.toLowerCase().includes('rent') ? 'rent-to-buy' : 'direct-sale';

    setForm((prev) => ({
      ...prev,
      title: listing.title || '',
      address: listing.address || '',
      city: listing.city || '',
      suburb: prev.suburb || '',
      propertyType: prev.propertyType || '',
      listingType: inferredListingType as 'rent-to-buy' | 'direct-sale',
      askingPrice: String(listing.price ?? ''),
    }));
    setCurrentStep(1);
    setIsNewListingOpen(true);
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

  // Step sections rendered as functions (not nested components) to preserve input focus during re-renders
  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      {/* Property Title */}
      <div>
        <label htmlFor="listingTitle" className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
        <Input
          id="listingTitle"
          placeholder="e.g., Modern 3-Bedroom House in Borrowdale"
          className="p-3 h-11 bg-white border-gray-300"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoComplete="off"
          inputMode="text"
        />
      </div>

      {/* Property Description */}
      <div>
        <label htmlFor="listingDescription" className="block text-sm font-medium text-gray-700 mb-2">Property Description *</label>
        <Textarea
          id="listingDescription"
          rows={4}
          placeholder="Describe your property in detail... amenities, unique features, neighborhood benefits"
          className="p-3 bg-white border-gray-300"
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

  const renderMediaUploadStep = () => (
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

  const renderReviewStep = () => (
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
    { icon: Home, label: 'Overview', key: 'overview' as const },
    { icon: FileText, label: 'Listings', key: 'listings' as const },
    { icon: MessageSquare, label: 'Offers', key: 'offers' as const },
    { icon: BarChart3, label: 'Analytics', key: 'analytics' as const },
    { icon: FileText, label: 'Documents', key: 'documents' as const },
    { icon: UserIcon, label: 'Profile', key: 'profile' as const },
    { icon: Settings, label: 'Settings', key: 'settings' as const },
  ];

  const handleNavigationClick = (sectionKey: typeof navigationItems[number]['key']) => {
    setActiveSection(sectionKey);
    if (sectionKey === 'analytics') {
      setIsAnalyticsOpen(true);
    }
    if (sectionKey === 'listings') {
      const el = document.getElementById('seller-listings-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const deedVerified = user.isPropertyVerified || user.kycStatus === 'approved';
  const deedProgress = deedVerified ? 100 : 75;

  const sellerMetrics = React.useMemo(() => {
    const approvedCount = listings.filter((l) => l.status === 'approved').length;
    const pendingCount = listings.filter((l) => l.status === 'pending').length;
    const totalViews = listings.reduce((sum, l) => sum + (l.views ?? 0), 0);
    const estRevenue = approvedCount * 3800; // mock commission estimate
    return [
      {
        title: 'Active Listings',
        value: approvedCount.toString(),
        subtitle: 'Approved & Live',
        icon: Home,
        color: 'bg-blue-100 text-blue-700',
        trend: '+2 this month',
      },
      {
        title: 'Pending Review',
        value: pendingCount.toString(),
        subtitle: 'Awaiting Approval',
        icon: Clock,
        color: 'bg-amber-100 text-amber-700',
        trend: '—',
      },
      {
        title: 'Total Views',
        value: totalViews.toLocaleString(),
        subtitle: 'Across Listings',
        icon: Eye,
        color: 'bg-green-100 text-green-700',
        trend: '+15% from last month',
      },
      {
        title: 'Revenue Generated',
        value: `R${estRevenue.toLocaleString()}`,
        subtitle: 'Estimated Commissions',
        icon: DollarSign,
        color: 'bg-emerald-100 text-emerald-700',
        trend: '+12% this quarter',
      },
    ];
  }, [listings]);

  const filteredListings = React.useMemo(() => {
    if (listFilter === 'all') return listings;
    return listings.filter((l) => l.status === listFilter);
  }, [listFilter, listings]);

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

  const mockAnalytics = Array.from({ length: 12 }).map((_, i) => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    views: [90, 110, 95, 130, 150, 170, 160, 190, 210, 230, 220, 260][i],
    inquiries: [8, 12, 10, 15, 18, 17, 16, 20, 22, 25, 24, 28][i],
  }));

  const mockMessages: Array<{ id: string; from: string; preview: string; time: string; unread?: boolean }> = [
    { id: 'm1', from: 'Tariro N.', preview: 'Hi, is the Borrowdale house still available?', time: '2h ago', unread: true },
    { id: 'm2', from: 'Kabelo M.', preview: 'Can we schedule a viewing this weekend?', time: '1d ago' },
    { id: 'm3', from: 'Lerato P.', preview: 'Is rent-to-buy available for the flat?', time: '3d ago' },
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
                onClick={() => handleNavigationClick(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative group ${
                  activeSection === item.key ? 'bg-red-50 text-red-700 border border-red-200' : 'text-slate-700 hover:bg-slate-50'
                }`}
                aria-current={activeSection === item.key ? 'page' : undefined}
              >
                <span className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${activeSection === item.key ? 'bg-red-600' : 'bg-transparent group-hover:bg-slate-200'}`} />
                <item.icon className={activeSection === item.key ? 'w-4 h-4 text-red-600' : 'w-4 h-4 text-slate-500'} />
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

      {/* Mobile Sidebar Drawer */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileNav(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white border-r border-slate-200 shadow-xl p-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-slate-800">Menu</div>
              <Button variant="ghost" size="sm" onClick={() => setShowMobileNav(false)}><X className="w-4 h-4" /></Button>
            </div>
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { handleNavigationClick(item.key); setShowMobileNav(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === item.key ? 'bg-red-50 text-red-700 border border-red-200' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className={activeSection === item.key ? 'w-4 h-4 text-red-600' : 'w-4 h-4 text-slate-500'} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-[23rem] p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
      {/* Mobile nav trigger */}
      <div className="md:hidden">
        <Button variant="outline" size="sm" onClick={() => setShowMobileNav(true)}>Open Menu</Button>
      </div>
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
      {/* Top Section - only when viewing overview */}
      {activeSection === 'overview' && (
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
      )}

      {/* Profile Section (MVP) */}
      {activeSection === 'profile' && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-slate-800">
            <h3 className="text-lg font-semibold mb-4">Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-600">Verification</div>
                <div className="mt-1 font-semibold text-slate-900">{(user.isIdentityVerified && user.isPropertyVerified) || user.kycStatus === 'approved' ? 'Verified' : 'Pending'}</div>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-600">Active Listings</div>
                <div className="mt-1 font-semibold text-slate-900">{listings.filter(l => l.status === 'approved').length}</div>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-600">Pending Review</div>
                <div className="mt-1 font-semibold text-slate-900">{listings.filter(l => l.status === 'pending').length}</div>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-slate-800">
            <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input value={personalProfile.firstName} onChange={(e) => setPersonalProfile(p => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input value={personalProfile.lastName} onChange={(e) => setPersonalProfile(p => ({ ...p, lastName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input type="email" value={personalProfile.email} onChange={(e) => setPersonalProfile(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input value={personalProfile.phone} onChange={(e) => setPersonalProfile(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">National ID / Passport</label>
                <Input value={personalProfile.nationalId} onChange={(e) => setPersonalProfile(p => ({ ...p, nationalId: e.target.value }))} />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 1</label>
                  <Input value={personalProfile.addressLine1} onChange={(e) => setPersonalProfile(p => ({ ...p, addressLine1: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 2</label>
                  <Input value={personalProfile.addressLine2} onChange={(e) => setPersonalProfile(p => ({ ...p, addressLine2: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input value={personalProfile.city} onChange={(e) => setPersonalProfile(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <Input value={personalProfile.country} onChange={(e) => setPersonalProfile(p => ({ ...p, country: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="mt-4"><Button variant="outline">Save Personal Details</Button></div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-slate-800">
            <h3 className="text-lg font-semibold mb-4">Business / Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <Input value={businessProfile.companyName} onChange={(e) => setBusinessProfile(p => ({ ...p, companyName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration Number</label>
                <Input value={businessProfile.registrationNumber} onChange={(e) => setBusinessProfile(p => ({ ...p, registrationNumber: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tax / VAT Number</label>
                <Input value={businessProfile.taxNumber} onChange={(e) => setBusinessProfile(p => ({ ...p, taxNumber: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand Name</label>
                <Input value={businessProfile.brandName} onChange={(e) => setBusinessProfile(p => ({ ...p, brandName: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Short Bio</label>
                <Textarea rows={3} value={businessProfile.bio} onChange={(e) => setBusinessProfile(p => ({ ...p, bio: e.target.value }))} />
              </div>
            </div>
            <div className="mt-4"><Button variant="outline">Save Business Details</Button></div>
          </div>

          {/* Verification & Compliance */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-slate-800">
            <h3 className="text-lg font-semibold mb-4">Verification & Compliance</h3>
            <div className="text-sm text-slate-600 mb-3">Manage your compliance documents by category.</div>
            <div className="flex gap-2 flex-wrap">
              {DOC_CATEGORIES.map(c => (
                <Button key={c.id} size="sm" variant="outline" onClick={() => { setActiveSection('documents'); setDocCategoryFilter(c.id); }}>
                  {c.label}
                </Button>
              ))}
              <Button size="sm" onClick={() => { setActiveSection('documents'); setDocCategoryFilter('all'); }}>Open Documents</Button>
            </div>
          </div>

          {/* Payouts */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-slate-800">
            <h3 className="text-lg font-semibold mb-4">Payouts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button size="sm" variant={payoutMethod.type==='bank'?'default':'outline'} onClick={() => setPayoutMethod({ type: 'bank', accountName: '', accountNumber: '', bankName: '', branch: '' })}>Bank</Button>
                  <Button size="sm" variant={payoutMethod.type==='mobile'?'default':'outline'} onClick={() => setPayoutMethod({ type: 'mobile', accountName: '', walletProvider: '', phoneNumber: '' })}>Mobile Money</Button>
                </div>
                {payoutMethod.type === 'bank' ? (
                  <div className="grid grid-cols-1 gap-2">
                    <Input placeholder="Account Name" value={payoutMethod.accountName} onChange={(e) => setPayoutMethod(p => ({ ...(p as any), accountName: e.target.value, type: 'bank' }))} />
                    <Input placeholder="Account Number" value={(payoutMethod as any).accountNumber || ''} onChange={(e) => setPayoutMethod(p => ({ ...(p as any), accountNumber: e.target.value, type: 'bank' }))} />
                    <Input placeholder="Bank Name" value={(payoutMethod as any).bankName || ''} onChange={(e) => setPayoutMethod(p => ({ ...(p as any), bankName: e.target.value, type: 'bank' }))} />
                    <Input placeholder="Branch (optional)" value={(payoutMethod as any).branch || ''} onChange={(e) => setPayoutMethod(p => ({ ...(p as any), branch: e.target.value, type: 'bank' }))} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <Input placeholder="Account Name" value={payoutMethod.accountName} onChange={(e) => setPayoutMethod(p => ({ ...(p as any), accountName: e.target.value, type: 'mobile' }))} />
                    <Input placeholder="Wallet Provider (e.g., EcoCash)" value={(payoutMethod as any).walletProvider || ''} onChange={(e) => setPayoutMethod(p => ({ ...(p as any), walletProvider: e.target.value, type: 'mobile' }))} />
                    <Input placeholder="Phone Number" value={(payoutMethod as any).phoneNumber || ''} onChange={(e) => setPayoutMethod(p => ({ ...(p as any), phoneNumber: e.target.value, type: 'mobile' }))} />
                  </div>
                )}
                <div className="pt-2"><Button variant="outline">Save Payout Method</Button></div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">Payout History</div>
                <div className="border border-slate-200 rounded-lg divide-y">
                  {payoutHistory.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div>{new Date(p.date).toLocaleDateString()}</div>
                      <div>R{p.amount.toLocaleString()}</div>
                      <div className={p.status==='paid'?'text-emerald-600':'text-amber-600'}>{p.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-slate-800">
            <h3 className="text-lg font-semibold mb-4">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Change Password</label>
                <div className="grid grid-cols-1 gap-2">
                  <Input type="password" placeholder="Current password" />
                  <Input type="password" placeholder="New password" />
                  <Input type="password" placeholder="Confirm new password" />
                </div>
                <div className="pt-2"><Button variant="outline">Update Password</Button></div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">Two-Factor Authentication (2FA)</div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={security.twoFAEnabled} onChange={(e) => setSecurity({ twoFAEnabled: e.target.checked })} />
                  <span className="text-sm">Enable 2FA</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">We’ll send a verification code to your phone each time you sign in.</div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-slate-800">
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={notificationsPref.newInquiry} onChange={(e) => setNotificationsPref(p => ({ ...p, newInquiry: e.target.checked }))} /> New inquiry</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notificationsPref.listingApproved} onChange={(e) => setNotificationsPref(p => ({ ...p, listingApproved: e.target.checked }))} /> Listing approved</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notificationsPref.payoutProcessed} onChange={(e) => setNotificationsPref(p => ({ ...p, payoutProcessed: e.target.checked }))} /> Payout processed</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notificationsPref.marketing} onChange={(e) => setNotificationsPref(p => ({ ...p, marketing: e.target.checked }))} /> Marketing emails</label>
            </div>
            <div className="mt-3"><Button variant="outline">Save Preferences</Button></div>
          </div>
        </div>
      )}

      {/* Documents Section */}
      {activeSection === 'documents' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">Documents</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Category</label>
              <select
                className="border border-slate-300 rounded-md px-2 py-1 text-sm"
                value={docUploadCategory}
                onChange={(e) => setDocUploadCategory(e.target.value as DocCategory)}
              >
                {DOC_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <input
                ref={docInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleUploadDocument(e.target.files)}
              />
              <Button onClick={() => docInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Upload Files
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 text-sm">
            <button onClick={() => setDocCategoryFilter('all')} className={`px-3 py-1.5 rounded border ${docCategoryFilter==='all'?'border-slate-300 bg-slate-50 text-slate-900':'border-transparent text-slate-600 hover:bg-slate-50'}`}>All</button>
            {DOC_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setDocCategoryFilter(c.id)}
                className={`px-3 py-1.5 rounded border ${docCategoryFilter===c.id?'border-blue-300 bg-blue-50 text-blue-700':'border-transparent text-slate-600 hover:bg-slate-50'}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {docsError && <div className="text-sm text-red-600 mb-3">{docsError}</div>}

          {isDocsLoading ? (
            <div className="text-sm text-slate-600">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-sm text-slate-600">No documents uploaded yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((d) => (
                <div key={d.path} className="border border-slate-200 rounded-lg p-4">
                  <div className="font-medium text-slate-900 truncate" title={d.name}>{d.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {d.size ? `${Math.round(d.size / 1024)} KB` : ''} {d.created_at ? `• ${new Date(d.created_at).toLocaleDateString()}` : ''}
                    {('category' in d && (d as any).category) ? ` • ${(DOC_CATEGORIES.find(c => c.id === (d as any).category)?.label)}` : ''}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a href={d.url} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">View</Button>
                    </a>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteDocument(d.path)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Seller Performance Cards */}
      {activeSection === 'overview' && (
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
      )}

      {/* Quick Actions */}
      {activeSection === 'overview' && (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6 text-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto" onClick={openNewListing}>
            <Plus className="w-6 h-6 mb-2" />
            <span className="text-sm">New Listing</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto" onClick={() => setIsAnalyticsOpen(true)}>
            <BarChart className="w-6 h-6 mb-2" />
            <span className="text-sm">View Analytics</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto" onClick={() => setIsMessagesOpen(true)}>
            <MessageSquare className="w-6 h-6 mb-2" />
            <span className="text-sm">Messages</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto" onClick={() => console.log('Settings')}>
            <Settings className="w-6 h-6 mb-2" />
            <span className="text-sm">Settings</span>
          </Button>
        </div>
      </div>
      )}

      {/* Recent Activity */}
      {activeSection === 'overview' && (
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
      )}

      {/* Active Listings - Enhanced */}
      {(activeSection === 'overview' || activeSection === 'listings') && (
      <div id="seller-listings-section" className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-slate-900">My Property Listings</h3>
          <div className="flex gap-3 items-center">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <button className={`px-3 py-1.5 rounded border ${listFilter==='all'?'border-slate-300 bg-slate-50 text-slate-900':'border-transparent text-slate-600 hover:bg-slate-50'}`} onClick={() => setListFilter('all')}>All</button>
              <button className={`px-3 py-1.5 rounded border ${listFilter==='approved'?'border-blue-300 bg-blue-50 text-blue-700':'border-transparent text-slate-600 hover:bg-slate-50'}`} onClick={() => setListFilter('approved')}>Active</button>
              <button className={`px-3 py-1.5 rounded border ${listFilter==='pending'?'border-amber-300 bg-amber-50 text-amber-700':'border-transparent text-slate-600 hover:bg-slate-50'}`} onClick={() => setListFilter('pending')}>Pending</button>
              <button className={`px-3 py-1.5 rounded border ${listFilter==='rejected'?'border-red-300 bg-red-50 text-red-700':'border-transparent text-slate-600 hover:bg-slate-50'}`} onClick={() => setListFilter('rejected')}>Rejected</button>
              <button className={`px-3 py-1.5 rounded border ${listFilter==='inactive'?'border-slate-300 bg-slate-100 text-slate-700':'border-transparent text-slate-600 hover:bg-slate-50'}`} onClick={() => setListFilter('inactive')}>Inactive</button>
            </div>
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

        {filteredListings.length === 0 ? (
          <div className="text-sm text-slate-600">No listings yet.</div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="space-y-4 lg:hidden">
              {filteredListings.map((p) => (
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
                      <Button variant="outline" size="sm" onClick={() => openEditListingFromRow(p)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => openListingDetails(p)}>View</Button>
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
                  {filteredListings.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="py-3 px-4 font-medium text-slate-800">{p.title}</td>
                      <td className="py-3 px-4">{p.address}{p.city ? `, ${p.city}` : ''}</td>
                      <td className="py-3 px-4">{p.propertyType || '—'}</td>
                      <td className="py-3 px-4">{typeof p.price === 'number' ? `R${p.price.toLocaleString()}` : p.price}</td>
                      <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                      <td className="py-3 px-4">{new Date(p.submittedAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{p.views ?? '—'}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditListingFromRow(p)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => openListingDetails(p)}>View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      )}

      {/* Seller Offers Section */}
      {activeSection === 'offers' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Property Offers</h3>
            <div className="text-sm text-slate-600">
              Offers received for your properties
            </div>
          </div>

          {/* Mock offers data - in real app, this would come from API */}
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">3BR House • Borrowdale, Harare</h4>
                    <span className="text-xs font-mono bg-blue-100 px-2 py-1 rounded text-blue-700">
                      OFF-2024-000001
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">From: John Doe • john@example.com</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  Pending
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Offer Price:</span>
                  <div className="font-semibold">R1,200,000</div>
                </div>
                <div>
                  <span className="text-slate-500">Payment Method:</span>
                  <div className="font-semibold capitalize">Cash</div>
                </div>
                <div>
                  <span className="text-slate-500">Submitted:</span>
                  <div className="font-semibold">Sep 18, 2024</div>
                </div>
              </div>
              
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">2BR Apartment • Avondale, Harare</h4>
                    <span className="text-xs font-mono bg-blue-100 px-2 py-1 rounded text-blue-700">
                      OFF-2024-000002
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">From: Jane Smith • jane@example.com</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  Approved
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Offer Price:</span>
                  <div className="font-semibold">R850,000</div>
                </div>
                <div>
                  <span className="text-slate-500">Payment Method:</span>
                  <div className="font-semibold capitalize">Installments</div>
                </div>
                <div>
                  <span className="text-slate-500">Approved:</span>
                  <div className="font-semibold">Sep 15, 2024</div>
                </div>
              </div>
              
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message Buyer
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>

            <div className="text-sm text-slate-500 text-center py-8">
              No more offers to display
            </div>
          </div>
        </div>
      )}

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
                {currentStep === 1 && renderBasicInfoStep()}
                {currentStep === 2 && renderMediaUploadStep()}
                {currentStep === 3 && renderReviewStep()}
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

      {/* Listing Details Modal */}
      {isDetailsOpen && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Listing Details</h3>
              <Button variant="ghost" onClick={() => setIsDetailsOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-3 text-sm text-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-slate-500">Title</div>
                  <div className="font-medium">{selectedListing.title}</div>
                </div>
                <div>
                  <div className="text-slate-500">Type</div>
                  <div className="font-medium">{selectedListing.propertyType || '—'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-500">Location</div>
                  <div className="font-medium">{selectedListing.address}{selectedListing.city ? `, ${selectedListing.city}` : ''}</div>
                </div>
                <div>
                  <div className="text-slate-500">Price</div>
                  <div className="font-medium">{typeof selectedListing.price === 'number' ? `R${selectedListing.price.toLocaleString()}` : selectedListing.price}</div>
                </div>
                <div>
                  <div className="text-slate-500">Status</div>
                  <div className="font-medium"><StatusBadge status={selectedListing.status} /></div>
                </div>
                <div>
                  <div className="text-slate-500">Listed Date</div>
                  <div className="font-medium">{new Date(selectedListing.submittedAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-slate-500">Views</div>
                  <div className="font-medium">{selectedListing.views ?? '—'}</div>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                <Button onClick={() => { setIsDetailsOpen(false); openEditListingFromRow(selectedListing); }}>Edit Listing</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Analytics Modal */}
      {isAnalyticsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Listing Analytics</h3>
                <p className="text-sm text-slate-600">Performance overview for your properties</p>
              </div>
              <Button variant="ghost" onClick={() => { setIsAnalyticsOpen(false); setActiveSection('overview'); }}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sellerMetrics.map((m) => (
                  <div key={m.title} className="border border-slate-200 rounded-lg p-4">
                    <div className="text-xs text-slate-600">{m.title}</div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">{m.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{m.trend}</div>
                  </div>
                ))}
              </div>
              <div className="h-64 w-full border border-slate-200 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockAnalytics} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="inq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Area type="monotone" dataKey="views" stroke="#ef4444" fillOpacity={1} fill="url(#views)" name="Views" />
                    <Area type="monotone" dataKey="inquiries" stroke="#3b82f6" fillOpacity={1} fill="url(#inq)" name="Inquiries" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Messages Modal */}
      {isMessagesOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Messages</h3>
                <p className="text-sm text-slate-600">Recent buyer inquiries</p>
              </div>
              <Button variant="ghost" onClick={() => setIsMessagesOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-3">
              {mockMessages.map((m) => (
                <div key={m.id} className={`flex items-start justify-between border border-slate-200 rounded-lg p-3 ${m.unread ? 'bg-red-50/50' : 'bg-white'}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-900 truncate">{m.from}</div>
                      {m.unread && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">NEW</span>}
                    </div>
                    <div className="text-sm text-slate-600 truncate max-w-[22rem]">{m.preview}</div>
                    <div className="text-xs text-slate-500 mt-1">{m.time}</div>
                  </div>
                  <div className="shrink-0 flex gap-2">
                    <Button size="sm" variant="outline">Reply</Button>
                    <Button size="sm" variant="ghost">Mark read</Button>
                  </div>
                </div>
              ))}
              {mockMessages.length === 0 && (
                <div className="text-sm text-slate-500">No messages yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};


