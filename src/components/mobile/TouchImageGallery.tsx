'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TouchImageGalleryProps {
  images: string[];
  onClose: () => void;
}

export const TouchImageGallery: React.FC<TouchImageGalleryProps> = ({
  images,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchTimeRef = useRef(0);
  const lastTapRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Handle pinch start
      const distance = getDistance(e.touches[0], e.touches[1]);
      touchStartRef.current = { x: distance, y: 0 };
      touchTimeRef.current = Date.now();
    } else if (e.touches.length === 1) {
      // Handle single touch start
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchTimeRef.current = Date.now();
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      // Handle pinch zoom
      const distance = getDistance(e.touches[0], e.touches[1]);
      const initialDistance = touchStartRef.current.x;
      const newScale = Math.min(Math.max(scale * (distance / initialDistance), 1), 3);
      setScale(newScale);
    } else if (e.touches.length === 1 && isDragging) {
      // Handle pan
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;
      setPosition({ x: position.x + deltaX, y: position.y + deltaY });
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchTimeRef.current;

    if (touchDuration < 300) {
      // Handle double tap
      if (touchEndTime - lastTapRef.current < 300) {
        setScale(scale === 1 ? 2 : 1);
        setPosition({ x: 0, y: 0 });
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = touchEndTime;
      }
    }

    setIsDragging(false);
  };

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    if (direction === 'prev') {
      setCurrentIndex(current => (current > 0 ? current - 1 : images.length - 1));
    } else {
      setCurrentIndex(current => (current < images.length - 1 ? current + 1 : 0));
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white z-10"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 text-white z-10"
        onClick={() => navigateImage('prev')}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 text-white z-10"
        onClick={() => navigateImage('next')}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Image Container */}
      <div
        className="w-full h-full overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              x: position.x,
              y: position.y,
              scale: scale
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full relative"
          >
            <Image
              src={images[currentIndex]}
              alt={`Gallery image ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Image Counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Image Dots */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-1">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => {
              setCurrentIndex(index);
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
          />
        ))}
      </div>
    </div>
  );
};
