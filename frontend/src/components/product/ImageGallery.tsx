'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Package, ZoomIn } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';

interface ProductImage {
  id: string;
  imageUrl: string;
}

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
  thumbnailUrl?: string | null;
  variantImageUrl?: string | null;
  onMainImageChange?: (imageUrl: string) => void;
}

export function ImageGallery({
  images,
  productName,
  thumbnailUrl,
  variantImageUrl,
  onMainImageChange,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShowingVariantImage, setIsShowingVariantImage] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const maxVisibleThumbnails = 5;
  const [thumbnailOffset, setThumbnailOffset] = useState(0);

  const allImages = images.length > 0 ? images : thumbnailUrl ? [{ id: 'thumbnail', imageUrl: thumbnailUrl }] : [];

  // Add variant image to the list if it exists and is different from gallery images
  const displayImages = variantImageUrl && !images.some((img) => img.imageUrl === variantImageUrl)
    ? [{ id: 'variant', imageUrl: variantImageUrl }, ...allImages]
    : allImages;

  const currentImage = isShowingVariantImage && variantImageUrl
    ? variantImageUrl
    : displayImages[currentIndex]?.imageUrl;

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setIsShowingVariantImage(false);
    onMainImageChange?.(displayImages[index]?.imageUrl);
  };

  const handleThumbnailHover = (index: number) => {
    setCurrentIndex(index);
    setIsShowingVariantImage(false);
    onMainImageChange?.(displayImages[index]?.imageUrl);
  };

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setThumbnailOffset(Math.max(0, thumbnailOffset - 1));
    } else {
      setThumbnailOffset(
        Math.min(displayImages.length - maxVisibleThumbnails, thumbnailOffset + 1),
      );
    }
  };

  const goToPrev = () => {
    const newIndex = currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setIsShowingVariantImage(false);
  };

  const goToNext = () => {
    const newIndex = currentIndex === displayImages.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setIsShowingVariantImage(false);
  };

  const openLightbox = () => {
    if (displayImages.length > 0) {
      setIsLightboxOpen(true);
    }
  };

  const handleLightboxNavigate = (index: number) => {
    setCurrentIndex(index);
    setIsShowingVariantImage(false);
  };

  // Update variant image display when variantImageUrl changes
  const handleVariantImageChange = (url: string | null) => {
    if (url) {
      setIsShowingVariantImage(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden group cursor-pointer"
        onClick={openLightbox}
      >
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt={productName}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {/* Zoom indicator */}
            <div className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-5 h-5" />
            </div>
            {/* Navigation arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-20 h-20 text-gray-300" />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="relative">
          {/* Scroll Left Button */}
          {displayImages.length > maxVisibleThumbnails && thumbnailOffset > 0 && (
            <button
              onClick={() => scrollThumbnails('left')}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full shadow hover:shadow-md transition-shadow"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Thumbnails Container */}
          <div
            ref={thumbnailContainerRef}
            className="flex gap-2 overflow-hidden px-1"
          >
            {displayImages
              .slice(thumbnailOffset, thumbnailOffset + maxVisibleThumbnails)
              .map((img, idx) => {
                const actualIndex = idx + thumbnailOffset;
                const isActive = !isShowingVariantImage && actualIndex === currentIndex;
                return (
                  <button
                    key={img.id}
                    onClick={() => handleThumbnailClick(actualIndex)}
                    onMouseEnter={() => handleThumbnailHover(actualIndex)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden border-2 transition-colors ${
                      isActive ? 'border-primary' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
          </div>

          {/* Scroll Right Button */}
          {displayImages.length > maxVisibleThumbnails &&
            thumbnailOffset < displayImages.length - maxVisibleThumbnails && (
              <button
                onClick={() => scrollThumbnails('right')}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full shadow hover:shadow-md transition-shadow"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && displayImages.length > 0 && (
        <ImageLightbox
          images={displayImages}
          currentIndex={currentIndex}
          productName={productName}
          onClose={() => setIsLightboxOpen(false)}
          onNavigate={handleLightboxNavigate}
        />
      )}
    </div>
  );
}
