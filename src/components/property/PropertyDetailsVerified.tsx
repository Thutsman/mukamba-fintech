'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Star,
  Phone,
  Mail,
  MessageSquare,
  Download,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Users,
  ArrowRight,
  Heart,
  Share2,
  Eye,
  Zap,
  Shield,
  Award,
  Target,
  Calculator,
  FileCheck,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { GlassCard } from '@/components/ui/GlassCard';

import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

interface PropertyDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size: string;
}

interface PropertyAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  responseTime: string;
  rating: number;
  totalSales: number;
}

interface SimilarProperty {
  id: string;
  title: string;
  price: number;
  monthlyRental: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  image: string;
}

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  monthlyRental: number;
  rentToBuyDeposit: number;
  rentCreditPercentage: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  location: {
    city: string;
    suburb: string;
    streetAddress: string;
    coordinates: { latitude: number; longitude: number };
  };
  features: string[];
  amenities: string[];
  images: string[];
  agent: PropertyAgent;
  documents: PropertyDocument[];
  similarProperties: SimilarProperty[];
  status: string;
  views: number;
  savedBy: number;
  createdAt: Date;
}

interface PropertyDetailsVerifiedProps {
  property: Property;
  user: any;
}

export const PropertyDetailsVerified: React.FC<PropertyDetailsVerifiedProps> = ({
  property,
  user
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [showInquiryForm, setShowInquiryForm] = React.useState(false);
  const [inquiryData, setInquiryData] = React.useState({
    name: user?.firstName || '',
    message: ''
  });

  // Auto-play gallery
  React.useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === property.images.length - 1 ? 0 : prev + 1
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, property.images.length]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSaveProperty = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved properties' : 'Added to saved properties');
  };

  const handleShareProperty = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Property link copied to clipboard');
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock inquiry submission
    toast.success('Inquiry sent successfully! Agent will respond within 2 hours.');
    setShowInquiryForm(false);
    setInquiryData({ name: '', message: '' });
  };

  const handleDocumentDownload = (document: PropertyDocument) => {
    // Mock document download
    toast.success(`Downloading ${document.name}...`);
  };

  const handlePrequalify = () => {
    // Navigate to prequalification
    window.location.href = '/prequalification';
  };

  // Image Gallery Component
  const ImageGallery: React.FC = () => (
    <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentImageIndex}
          src={property.images[currentImageIndex]}
          alt={`${property.title} ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>

      {/* Verified Property Badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-emerald-500 text-white">
          <Shield className="w-3 h-3 mr-1" />
          Verified Property
        </Badge>
      </div>

      {/* Gallery Controls */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-white/90"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <div className="flex gap-1">
          {property.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Action Buttons */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveProperty}
          className={`bg-white/90 ${isSaved ? 'text-red-600 border-red-200' : ''}`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareProperty}
          className="bg-white/90"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Property Overview Component
  const PropertyOverview: React.FC = () => (
    <GlassCard className="p-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{property.title}</h1>
          <p className="text-slate-600">{property.description}</p>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <MapPin className="w-4 h-4" />
          <span>{property.location.streetAddress}, {property.location.suburb}, {property.location.city}</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">{property.bedrooms}</div>
            <div className="text-sm text-slate-600 flex items-center justify-center gap-1">
              <Bed className="w-4 h-4" />
              Bedrooms
            </div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">{property.bathrooms}</div>
            <div className="text-sm text-slate-600 flex items-center justify-center gap-1">
              <Bath className="w-4 h-4" />
              Bathrooms
            </div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">{property.size}m²</div>
            <div className="text-sm text-slate-600 flex items-center justify-center gap-1">
              <Square className="w-4 h-4" />
              Size
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          <MapPin className="w-4 h-4 mr-2" />
          View on Map
        </Button>
      </div>
    </GlassCard>
  );

  // Installment Offer Panel Component
  const InstallmentOfferPanel: React.FC = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Installment Offer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Monthly Rental</Label>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(property.monthlyRental)}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Property Price</Label>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(property.price)}
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">Rent Credit</span>
          </div>
          <p className="text-sm text-green-700">
            {property.rentCreditPercentage}% of your monthly rent goes toward the purchase price
          </p>
        </div>

        {/* Installment Calculator Placeholder */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h4 className="font-semibold text-slate-800 mb-4">Installment Calculator</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Property Price:</span>
              <span className="font-semibold">{formatCurrency(property.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Down Payment (20%):</span>
              <span className="font-semibold">{formatCurrency(property.price * 0.2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Loan Amount:</span>
              <span className="font-semibold">{formatCurrency(property.price * 0.8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Monthly Payment (5 years):</span>
              <span className="font-semibold text-green-600">{formatCurrency((property.price * 0.8) / 60)}</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handlePrequalify}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          Prequalify Instantly
        </Button>
      </CardContent>
    </Card>
  );

  // Next Steps Tracker Component
  const NextStepsTracker: React.FC = () => {
    const steps = [
      { id: 1, title: 'Make Formal Offer', status: 'pending', description: 'Submit your official offer' },
      { id: 2, title: 'Confirm Escrow Setup', status: 'locked', description: 'Set up secure payment escrow' },
      { id: 3, title: 'Sign Rent-to-Buy Agreement', status: 'locked', description: 'Complete legal documentation' },
      { id: 4, title: 'Move-In Tracker', status: 'locked', description: 'Schedule your move-in date' }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : step.status === 'pending'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-sm text-slate-600">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-px h-8 bg-slate-200 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Document Center Component
  const DocumentCenter: React.FC = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-purple-600" />
          Document Center
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {property.documents.map((document) => (
            <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="font-medium">{document.name}</div>
                  <div className="text-sm text-slate-500">{document.size}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDocumentDownload(document)}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Contact Agent Component
  const ContactAgent: React.FC = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Contact Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <Avatar>
            <AvatarImage src={property.agent.avatar} />
            <AvatarFallback>{property.agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{property.agent.name}</div>
            <div className="text-sm text-slate-600">Response time: {property.agent.responseTime}</div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span>{property.agent.rating}</span>
              <span className="text-slate-500">({property.agent.totalSales} sales)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-1" />
            Call
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-1" />
            Email
          </Button>
        </div>

        {!showInquiryForm ? (
          <Button 
            onClick={() => setShowInquiryForm(true)}
            className="w-full"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Inquiry
          </Button>
        ) : (
          <form onSubmit={handleInquirySubmit} className="space-y-3">
            <div>
              <Label htmlFor="inquiry-name">Name</Label>
              <Input
                id="inquiry-name"
                value={inquiryData.name}
                onChange={(e) => setInquiryData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="inquiry-message">Message</Label>
              <Textarea
                id="inquiry-message"
                value={inquiryData.message}
                onChange={(e) => setInquiryData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell us more about your interest in this property..."
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Send Inquiry
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowInquiryForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );

  // Recommended Properties Component
  const RecommendedProperties: React.FC = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Similar Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {property.similarProperties.map((prop) => (
            <div key={prop.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={prop.image} 
                alt={prop.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <h4 className="font-medium text-sm">{prop.title}</h4>
                <div className="text-lg font-bold text-green-600 mt-1">
                  {formatCurrency(prop.monthlyRental)}/month
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                  <span>{prop.bedrooms} bed</span>
                  <span>{prop.bathrooms} bath</span>
                  <span>{prop.size}m²</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery />

            {/* Property Overview */}
            <PropertyOverview />

            {/* Features & Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Features</h4>
                    <div className="space-y-2">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Amenities</h4>
                    <div className="space-y-2">
                      {property.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Properties */}
            <RecommendedProperties />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Installment Offer Panel */}
            <InstallmentOfferPanel />

            {/* Next Steps Tracker */}
            <NextStepsTracker />

            {/* Document Center */}
            <DocumentCenter />

            {/* Contact Agent */}
            <ContactAgent />
          </div>
        </div>
      </div>
    </div>
  );
}; 