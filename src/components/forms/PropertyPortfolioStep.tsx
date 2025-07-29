'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Plus, Home, DollarSign, MapPin, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SellerVerificationData, PropertyInfo } from '@/types/auth';
import { useAuthStore } from '@/lib/store';

interface PropertyPortfolioStepProps {
  form: UseFormReturn<any>;
}

export const PropertyPortfolioStep: React.FC<PropertyPortfolioStepProps> = ({ form }) => {
  const { user, updateUser } = useAuthStore();
  const [properties, setProperties] = React.useState<PropertyInfo[]>(user?.properties || []);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingProperty, setEditingProperty] = React.useState<PropertyInfo | null>(null);

  const [newProperty, setNewProperty] = React.useState<Partial<PropertyInfo>>({
    address: '',
    propertyType: 'residential',
    bedrooms: 0,
    bathrooms: 0,
    size: 0,
    estimatedValue: 0,
    currentStatus: 'vacant',
    monthlyRental: 0,
    description: ''
  });

  const handleAddProperty = () => {
    if (newProperty.address && newProperty.size && newProperty.estimatedValue) {
      const property: PropertyInfo = {
        id: `prop_${Date.now()}`,
        address: newProperty.address || '',
        propertyType: newProperty.propertyType as 'residential' | 'commercial' | 'mixed',
        bedrooms: newProperty.bedrooms || 0,
        bathrooms: newProperty.bathrooms || 0,
        size: newProperty.size || 0,
        estimatedValue: newProperty.estimatedValue || 0,
        currentStatus: newProperty.currentStatus as 'vacant' | 'rented' | 'owner-occupied',
        monthlyRental: newProperty.monthlyRental || 0,
        description: newProperty.description || ''
      };

      const updatedProperties = [...properties, property];
      setProperties(updatedProperties);
      
      // Update user with new properties
      if (user) {
        updateUser({ properties: updatedProperties });
      }

      // Reset form
      setNewProperty({
        address: '',
        propertyType: 'residential',
        bedrooms: 0,
        bathrooms: 0,
        size: 0,
        estimatedValue: 0,
        currentStatus: 'vacant',
        monthlyRental: 0,
        description: ''
      });
      setShowAddForm(false);
    }
  };

  const handleRemoveProperty = (id: string) => {
    const updatedProperties = properties.filter(p => p.id !== id);
    setProperties(updatedProperties);
    
    if (user) {
      updateUser({ properties: updatedProperties });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Property Portfolio</h2>
        <p className="text-slate-600 mt-2">Add information about the properties you want to list</p>
      </div>

      {/* Existing Properties */}
      {properties.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Your Properties</h3>
          {properties.map((property) => (
            <Card key={property.id} className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Home className="w-5 h-5 mr-2 text-blue-600" />
                    {property.address}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveProperty(property.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {property.propertyType}
                  </div>
                  <div>
                    <span className="font-medium">Size:</span> {property.size}m²
                  </div>
                  <div>
                    <span className="font-medium">Bedrooms:</span> {property.bedrooms}
                  </div>
                  <div>
                    <span className="font-medium">Bathrooms:</span> {property.bathrooms}
                  </div>
                  <div>
                    <span className="font-medium">Value:</span> ${property.estimatedValue.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {property.currentStatus}
                  </div>
                  {property.monthlyRental && (
                    <div>
                      <span className="font-medium">Rental:</span> ${property.monthlyRental.toLocaleString()}/month
                    </div>
                  )}
                </div>
                {property.description && (
                  <div className="mt-3">
                    <span className="font-medium">Description:</span>
                    <p className="text-slate-600 mt-1">{property.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Property Button */}
      {!showAddForm && (
        <div className="text-center">
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      )}

      {/* Add Property Form */}
      {showAddForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2 text-blue-600" />
              Add New Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Property Address *</Label>
                <Input
                  id="address"
                  value={newProperty.address}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street, City"
                />
              </div>

              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  value={newProperty.propertyType}
                  onValueChange={(value) => setNewProperty(prev => ({ ...prev, propertyType: value as 'residential' | 'commercial' | 'mixed' }))}
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
                <Label htmlFor="size">Size (m²) *</Label>
                <Input
                  id="size"
                  type="number"
                  value={newProperty.size}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, size: parseInt(e.target.value) || 0 }))}
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="estimatedValue">Estimated Value ($) *</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  value={newProperty.estimatedValue}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, estimatedValue: parseInt(e.target.value) || 0 }))}
                  placeholder="250000"
                />
              </div>

              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={newProperty.bedrooms}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))}
                  placeholder="3"
                />
              </div>

              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={newProperty.bathrooms}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 0 }))}
                  placeholder="2"
                />
              </div>

              <div>
                <Label htmlFor="currentStatus">Current Status</Label>
                <Select
                  value={newProperty.currentStatus}
                  onValueChange={(value) => setNewProperty(prev => ({ ...prev, currentStatus: value as 'vacant' | 'rented' | 'owner-occupied' }))}
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

              <div>
                <Label htmlFor="monthlyRental">Monthly Rental ($)</Label>
                <Input
                  id="monthlyRental"
                  type="number"
                  value={newProperty.monthlyRental}
                  onChange={(e) => setNewProperty(prev => ({ ...prev, monthlyRental: parseInt(e.target.value) || 0 }))}
                  placeholder="1500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Property Description</Label>
              <Textarea
                id="description"
                value={newProperty.description}
                onChange={(e) => setNewProperty(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the property features, location benefits, etc."
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleAddProperty}
                className="bg-green-600 hover:bg-green-700"
              >
                Add Property
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {properties.length === 0 && !showAddForm && (
        <div className="text-center py-8">
          <Home className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Properties Added</h3>
          <p className="text-slate-600 mb-4">Add your first property to get started with your portfolio</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Property
          </Button>
        </div>
      )}
    </motion.div>
  );
}; 