'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Home, Building, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LandlordRegistrationData, PropertyInfo } from '@/types/auth';
import { useAuthStore } from '@/lib/store';

interface PropertyPortfolioStepProps {
  form: UseFormReturn<any>;
}

export const PropertyPortfolioStep: React.FC<PropertyPortfolioStepProps> = ({ form }) => {
  const { registrationData, setRegistrationData } = useAuthStore();
  const [properties, setProperties] = React.useState<PropertyInfo[]>(
    (registrationData as LandlordRegistrationData).properties || []
  );

  const addProperty = () => {
    const newProperty: PropertyInfo = {
      id: Date.now().toString(),
      address: '',
      propertyType: 'residential',
      size: 0,
      estimatedValue: 0,
      currentStatus: 'vacant',
      description: ''
    };
    
    const updatedProperties = [...properties, newProperty];
    setProperties(updatedProperties);
    setRegistrationData({ properties: updatedProperties });
  };

  const removeProperty = (id: string) => {
    const updatedProperties = properties.filter(p => p.id !== id);
    setProperties(updatedProperties);
    setRegistrationData({ properties: updatedProperties });
  };

  const updateProperty = (id: string, updates: Partial<PropertyInfo>) => {
    const updatedProperties = properties.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    setProperties(updatedProperties);
    setRegistrationData({ properties: updatedProperties });
  };

  const handleBusinessRegistrationChange = (checked: boolean) => {
    setRegistrationData({ businessRegistered: checked });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Property Portfolio
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Add details about your properties to verify ownership and rental potential.
        </p>
      </div>

      {/* Business Registration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="businessRegistered"
              checked={(registrationData as LandlordRegistrationData).businessRegistered || false}
              onCheckedChange={handleBusinessRegistrationChange}
            />
            <Label htmlFor="businessRegistered" className="text-sm font-medium">
              I operate as a registered business entity
            </Label>
          </div>

          {(registrationData as LandlordRegistrationData).businessRegistered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Enter business name"
                  value={(registrationData as LandlordRegistrationData).businessName || ''}
                  onChange={(e) => setRegistrationData({ businessName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="businessRegistrationNumber">Registration Number</Label>
                <Input
                  id="businessRegistrationNumber"
                  placeholder="Enter registration number"
                  value={(registrationData as LandlordRegistrationData).businessRegistrationNumber || ''}
                  onChange={(e) => setRegistrationData({ businessRegistrationNumber: e.target.value })}
                />
              </div>
            </motion.div>
          )}

          <div>
            <Label htmlFor="taxNumber">Tax Number *</Label>
            <Input
              id="taxNumber"
              placeholder="Enter tax number"
              value={(registrationData as LandlordRegistrationData).taxNumber || ''}
              onChange={(e) => setRegistrationData({ taxNumber: e.target.value })}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Properties Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Your Properties
          </h4>
          <Button
            type="button"
            onClick={addProperty}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>

        <AnimatePresence>
          {properties.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600"
            >
              <Home className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No properties added yet
              </p>
              <Button
                type="button"
                onClick={addProperty}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          <MapPin className="w-5 h-5 mr-2 text-red-600" />
                          Property {index + 1}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProperty(property.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor={`address-${property.id}`}>Property Address *</Label>
                        <Input
                          id={`address-${property.id}`}
                          placeholder="Enter full property address"
                          value={property.address}
                          onChange={(e) => updateProperty(property.id, { address: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`propertyType-${property.id}`}>Property Type</Label>
                          <Select
                            value={property.propertyType}
                            onValueChange={(value: 'residential' | 'commercial' | 'mixed') => 
                              updateProperty(property.id, { propertyType: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="residential">Residential</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="mixed">Mixed Use</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`size-${property.id}`}>Size (m²)</Label>
                          <Input
                            id={`size-${property.id}`}
                            type="number"
                            placeholder="Property size"
                            value={property.size || ''}
                            onChange={(e) => updateProperty(property.id, { size: parseInt(e.target.value) || 0 })}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`estimatedValue-${property.id}`}>Estimated Value</Label>
                          <Input
                            id={`estimatedValue-${property.id}`}
                            type="number"
                            placeholder="Property value"
                            value={property.estimatedValue || ''}
                            onChange={(e) => updateProperty(property.id, { estimatedValue: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      {property.propertyType === 'residential' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`bedrooms-${property.id}`}>Bedrooms</Label>
                            <Input
                              id={`bedrooms-${property.id}`}
                              type="number"
                              placeholder="Number of bedrooms"
                              value={property.bedrooms || ''}
                              onChange={(e) => updateProperty(property.id, { bedrooms: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`bathrooms-${property.id}`}>Bathrooms</Label>
                            <Input
                              id={`bathrooms-${property.id}`}
                              type="number"
                              placeholder="Number of bathrooms"
                              value={property.bathrooms || ''}
                              onChange={(e) => updateProperty(property.id, { bathrooms: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`currentStatus-${property.id}`}>Current Status</Label>
                          <Select
                            value={property.currentStatus}
                            onValueChange={(value: 'vacant' | 'rented' | 'owner-occupied') => 
                              updateProperty(property.id, { currentStatus: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vacant">Vacant</SelectItem>
                              <SelectItem value="rented">Currently Rented</SelectItem>
                              <SelectItem value="owner-occupied">Owner Occupied</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {property.currentStatus === 'rented' && (
                          <div>
                            <Label htmlFor={`monthlyRental-${property.id}`}>Monthly Rental</Label>
                            <Input
                              id={`monthlyRental-${property.id}`}
                              type="number"
                              placeholder="Current rental amount"
                              value={property.monthlyRental || ''}
                              onChange={(e) => updateProperty(property.id, { monthlyRental: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`description-${property.id}`}>Property Description</Label>
                        <Textarea
                          id={`description-${property.id}`}
                          placeholder="Brief description of the property, amenities, and unique features"
                          value={property.description}
                          onChange={(e) => updateProperty(property.id, { description: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {properties.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              <strong>Total Properties:</strong> {properties.length} | 
              <strong> Estimated Portfolio Value:</strong> R{properties.reduce((sum, p) => sum + p.estimatedValue, 0).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 