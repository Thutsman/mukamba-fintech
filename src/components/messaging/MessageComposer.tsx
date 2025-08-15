'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Search,
  Building,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Bed,
  Bath,
  Car,
  Send,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MessageComposerProps {
  userId: string;
  onBack: () => void;
  onMessageSent: (threadId: string) => void;
}

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number;
  imageUrl?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  listedDate: Date;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  userId,
  onBack,
  onMessageSent
}) => {
  const [step, setStep] = React.useState<'select-property' | 'compose-message'>('select-property');
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [messageType, setMessageType] = React.useState<'inquiry' | 'application_related' | 'negotiation'>('inquiry');
  const [messageContent, setMessageContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Mock properties data
  const mockProperties: Property[] = [
    {
      id: 'prop-1',
      title: 'Modern 3BR House in Sandton',
      address: '123 Oak Street, Sandton',
      city: 'Sandton',
      price: 2500000,
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      area: 180,
      imageUrl: '/api/placeholder/400/300',
      sellerId: 'seller-1',
      sellerName: 'John Smith',
      sellerAvatar: '/api/placeholder/100/100',
      listedDate: new Date('2024-01-01')
    },
    {
      id: 'prop-2',
      title: 'Luxury Apartment in Rosebank',
      address: '456 Pine Avenue, Rosebank',
      city: 'Rosebank',
      price: 1800000,
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      area: 120,
      imageUrl: '/api/placeholder/400/300',
      sellerId: 'seller-2',
      sellerName: 'Sarah Johnson',
      sellerAvatar: '/api/placeholder/100/100',
      listedDate: new Date('2024-01-05')
    },
    {
      id: 'prop-3',
      title: 'Family Home in Pretoria',
      address: '789 Maple Drive, Pretoria',
      city: 'Pretoria',
      price: 3200000,
      bedrooms: 4,
      bathrooms: 3,
      parking: 3,
      area: 250,
      imageUrl: '/api/placeholder/400/300',
      sellerId: 'seller-3',
      sellerName: 'Mike Wilson',
      sellerAvatar: '/api/placeholder/100/100',
      listedDate: new Date('2024-01-10')
    }
  ];

  const filteredProperties = React.useMemo(() => {
    if (!searchQuery) return mockProperties;
    
    return mockProperties.filter(property =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mockProperties, searchQuery]);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setStep('compose-message');
  };

  const handleBackToProperties = () => {
    setSelectedProperty(null);
    setStep('select-property');
  };

  const handleSendMessage = async () => {
    if (!selectedProperty || !messageContent.trim()) return;

    setIsSubmitting(true);

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Sending message:', {
      propertyId: selectedProperty.id,
      sellerId: selectedProperty.sellerId,
      messageType,
      content: messageContent
    });

    setIsSubmitting(false);
    onMessageSent(`thread-${Date.now()}`);
  };

  const getMessageTypeDescription = (type: string) => {
    switch (type) {
      case 'inquiry':
        return 'Ask questions about the property, schedule viewings, or request more information';
      case 'application_related':
        return 'Discuss application status, provide additional documents, or ask about the process';
      case 'negotiation':
        return 'Discuss pricing, terms, or make offers on the property';
      default:
        return '';
    }
  };

  if (step === 'compose-message' && selectedProperty) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToProperties}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">New Message</h1>
              <p className="text-sm text-slate-500">Compose your message to {selectedProperty.sellerName}</p>
            </div>
          </div>
        </div>

        {/* Property Info */}
        <Card className="m-4 bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building className="w-8 h-8 text-slate-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">{selectedProperty.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedProperty.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    R{selectedProperty.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Bed className="w-3 h-3" />
                    {selectedProperty.bedrooms} beds
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-3 h-3" />
                    {selectedProperty.bathrooms} baths
                  </span>
                  <span className="flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    {selectedProperty.parking} parking
                  </span>
                  <span>{selectedProperty.area} m²</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Form */}
        <div className="flex-1 px-4 pb-4 space-y-4">
          {/* Message Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message Type
            </label>
            <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inquiry">Property Inquiry</SelectItem>
                <SelectItem value="application_related">Application Related</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              {getMessageTypeDescription(messageType)}
            </p>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Message
            </label>
            <Textarea
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>{messageContent.length} characters</span>
              <span>Max 1000 characters</span>
            </div>
          </div>

          {/* Admin Review Notice */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Admin Review Process</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Your message will be reviewed by our admin team within 2-4 hours before being sent to {selectedProperty.sellerName}. This ensures quality communication and protects all parties.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-blue-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Review time: 2-4 hours
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Quality assured
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleBackToProperties}>
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">New Message</h1>
            <p className="text-sm text-slate-500">Select a property to start a conversation</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search properties, sellers, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Property List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Building className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Properties Found</h3>
            <p className="text-slate-500 mb-4">
              Try adjusting your search terms or browse all available properties.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProperties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handlePropertySelect(property)}
              >
                <div className="flex items-start gap-4">
                  {/* Property Image */}
                  <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-8 h-8 text-slate-400" />
                  </div>

                  {/* Property Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1 truncate">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {property.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        R{property.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3 h-3" />
                        {property.bedrooms} beds
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3 h-3" />
                        {property.bathrooms} baths
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        {property.parking} parking
                      </span>
                      <span>{property.area} m²</span>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={property.sellerAvatar} alt={property.sellerName} />
                        <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                          {property.sellerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-600">{property.sellerName}</span>
                      <Badge variant="secondary" className="text-xs">
                        Verified Seller
                      </Badge>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Available
                    </Badge>
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3" />
            <span>All messages are reviewed by our admin team for quality and safety</span>
          </div>
          <span>{filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}</span>
        </div>
      </div>
    </div>
  );
};
