'use client';

import React, { useState, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Heart, X, Star, Phone, MessageCircle, Share2, MapPin, Bed, Bath, Square } from 'lucide-react';
import Image from 'next/image';
import { PropertyListing } from '@/types/property';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SwipeablePropertyCardProps {
  property: PropertyListing;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  user?: User;
  onContactSeller?: () => void;
  onPropertySelect?: () => void;
}

export const SwipeablePropertyCard: React.FC<SwipeablePropertyCardProps> = ({
  property,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  onDoubleTap,
  user,
  onContactSeller,
  onPropertySelect
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const controls = useAnimation();
  const constraintsRef = useRef(null);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      controls.start({ x: 500, opacity: 0 });
      onSwipeRight();
    } else if (info.offset.x < -swipeThreshold) {
      controls.start({ x: -500, opacity: 0 });
      onSwipeLeft();
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const handleTouchStart = () => {
    setStartTime(Date.now());
  };

  const handleTouchEnd = () => {
    const endTime = Date.now();
    const pressDuration = endTime - startTime;
    
    // Handle long press (500ms threshold)
    if (pressDuration > 500) {
      onLongPress?.();
      return;
    }
    
    // Handle double tap (300ms threshold)
    if (endTime - lastTapTime < 300) {
      onDoubleTap?.();
      setLastTapTime(0);
    } else {
      setLastTapTime(endTime);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      ref={constraintsRef}
      className="relative w-full h-[calc(100vh-200px)] bg-white rounded-xl shadow-xl overflow-hidden cursor-pointer"
      drag="x"
      dragConstraints={constraintsRef}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.98 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onPropertySelect}
    >
      {/* Image Gallery */}
      <div className="relative w-full h-2/3">
        <Image
          src={property.media.images[currentImageIndex] || property.media.mainImage}
          alt={property.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
        
        {/* Image Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
          {property.media.images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(index);
              }}
            />
          ))}
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-green-500 text-white">
            {property.status}
          </Badge>
          {property.listingType === 'installment' && (
            <Badge className="bg-blue-500 text-white">
              Installments
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="bg-white/90 hover:bg-white w-10 h-10"
            onClick={(e) => {
              e.stopPropagation();
              onDoubleTap?.();
            }}
          >
            <Heart className="w-5 h-5 text-red-500" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-white/90 hover:bg-white w-10 h-10"
            onClick={(e) => {
              e.stopPropagation();
              // Handle share
            }}
          >
            <Share2 className="w-5 h-5 text-slate-700" />
          </Button>
        </div>
      </div>

      {/* Property Details */}
      <div className="absolute bottom-0 left-0 right-0 bg-white p-6 rounded-t-xl shadow-lg">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-1">
              {property.title}
            </h3>
            <div className="flex items-center text-slate-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.location.streetAddress}, {property.location.city}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-700">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              {property.details.bedrooms} beds
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              {property.details.bathrooms} baths
            </div>
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              {property.details.size} m²
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(property.financials.price)}
              </div>
              {property.financials.monthlyInstallment && (
                <div className="text-sm text-slate-600">
                  {formatCurrency(property.financials.monthlyInstallment)}/month
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onContactSeller?.();
                }}
              >
                <Phone className="w-5 h-5 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Indicators */}
      <motion.div
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-500/90 rounded-full p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
      >
        <X className="w-8 h-8 text-white" />
      </motion.div>
      <motion.div
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-500/90 rounded-full p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
      >
        <Heart className="w-8 h-8 text-white" />
      </motion.div>
    </motion.div>
  );
};
