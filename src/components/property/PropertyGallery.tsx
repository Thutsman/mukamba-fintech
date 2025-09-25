'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn,
  Download,
  Share2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PropertyListing } from '@/types/property';

interface PropertyGalleryProps {
  property: PropertyListing;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ property }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  
  // Touch/swipe state
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Get all images for carousel
  const images = React.useMemo(() => {
    const allImages = [property.media.mainImage, ...(property.media.images || [])];
    return allImages.filter((img, index, arr) => arr.indexOf(img) === index); // Remove duplicates
  }, [property.media]);

  // Navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
    
    setIsDragging(false);
  };

  // Mouse drag handlers for desktop
  const [mouseStart, setMouseStart] = React.useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = React.useState<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseEnd(null);
    setMouseStart(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!mouseStart || !mouseEnd) {
      setIsDragging(false);
      return;
    }
    
    const distance = mouseStart - mouseEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
    
    setIsDragging(false);
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          setIsLightboxOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  // Handle image load
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="relative group">
        {/* Main Image */}
        <div 
          className="relative h-96 md:h-[500px] overflow-hidden rounded-lg cursor-grab active:cursor-grabbing select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ touchAction: 'pan-y pinch-zoom' }}
        >
          {isImageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
          
          <Image
            src={images[currentImageIndex]}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onLoad={handleImageLoad}
            priority
          />

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
                onClick={() => setIsLightboxOpen(true)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = images[currentImageIndex];
                  link.download = `property-${property.id}-${currentImageIndex + 1}.jpg`;
                  link.click();
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 touch-manipulation"
                style={{ 
                  minHeight: '44px', 
                  minWidth: '44px',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 touch-manipulation"
                style={{ 
                  minHeight: '44px', 
                  minWidth: '44px',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Swipe indicator for mobile */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs md:hidden">
              <span className="flex items-center">
                <ChevronLeft className="w-3 h-3 mr-1" />
                Swipe
                <ChevronRight className="w-3 h-3 ml-1" />
              </span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === currentImageIndex 
                    ? 'border-blue-500' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <div 
              className="relative max-w-7xl max-h-full p-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ touchAction: 'pan-y pinch-zoom' }}
            >
              {/* Close button */}
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main image */}
              <div className="relative">
                <Image
                  src={images[currentImageIndex]}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[80vh] object-contain"
                />

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails in lightbox */}
              {images.length > 1 && (
                <div className="mt-4 flex justify-center space-x-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToImage(index);
                      }}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex 
                          ? 'border-white' 
                          : 'border-transparent hover:border-white/50'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Image info */}
              <div className="mt-4 text-center text-white">
                <p className="text-lg font-semibold">{property.title}</p>
                <p className="text-sm text-gray-300">
                  Image {currentImageIndex + 1} of {images.length}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
