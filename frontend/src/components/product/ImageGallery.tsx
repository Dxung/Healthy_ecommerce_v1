'use client';

import { useState, useRef, useEffect } from 'react';
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
  hoveredVariantImageUrl?: string | null;
  selectedVariantImageUrl?: string | null;
  selectedVariantId?: string | null;
  onMainImageChange?: (imageUrl: string) => void;
}

export function ImageGallery({
  images,
  productName,
  thumbnailUrl,
  hoveredVariantImageUrl,
  selectedVariantImageUrl,
  selectedVariantId,
  onMainImageChange,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [thumbnailOffset, setThumbnailOffset] = useState(0);
  // Store the previous index before hovering
  const [preHoverIndex, setPreHoverIndex] = useState<number | null>(null);

  const maxVisibleThumbnails = 5;

  // Build base images: start with thumbnailUrl, then gallery images
  const baseImages: ProductImage[] = [];
  if (thumbnailUrl) {
    baseImages.push({ id: 'thumbnail', imageUrl: thumbnailUrl });
  }
  // Add gallery images that are different from thumbnail
  for (const img of images) {
    if (!baseImages.some((b) => b.imageUrl === img.imageUrl)) {
      baseImages.push(img);
    }
  }

  // When variant is selected (clicked), add variant image to END (if different from existing)
  const displayImages: ProductImage[] =
    selectedVariantId && selectedVariantImageUrl && !baseImages.some((img) => img.imageUrl === selectedVariantImageUrl)
      ? [...baseImages, { id: 'variant', imageUrl: selectedVariantImageUrl }]
      : baseImages;

  // When variant is selected, auto-select the variant image (at the end)
  useEffect(() => {
    if (selectedVariantId && selectedVariantImageUrl) {
      const variantIndex = displayImages.findIndex((img) => img.imageUrl === selectedVariantImageUrl);
      if (variantIndex !== -1) {
        setCurrentIndex(variantIndex);
        // Scroll to show the variant image if needed
        if (variantIndex >= thumbnailOffset + maxVisibleThumbnails) {
          setThumbnailOffset(Math.max(0, variantIndex - maxVisibleThumbnails + 1));
        }
      }
    } else {
      // When variant is deselected, return to thumbnail (first image)
      setCurrentIndex(0);
      setThumbnailOffset(0);
    }
  }, [selectedVariantId, selectedVariantImageUrl]);

  // Determine what image to show in main frame
  // Priority: hovered variant > current selected thumbnail
  const mainImageUrl = hoveredVariantImageUrl || displayImages[currentIndex]?.imageUrl;

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setPreHoverIndex(null);
    onMainImageChange?.(displayImages[index]?.imageUrl);
  };

  const handleThumbnailHover = (index: number) => {
    // Save current index before hover
    if (preHoverIndex === null) {
      setPreHoverIndex(currentIndex);
    }
    setCurrentIndex(index);
  };

  const handleThumbnailLeave = () => {
    // Restore to pre-hover index when leaving thumbnails
    if (preHoverIndex !== null) {
      setCurrentIndex(preHoverIndex);
      setPreHoverIndex(null);
    }
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
    setPreHoverIndex(null);
  };

  const goToNext = () => {
    const newIndex = currentIndex === displayImages.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setPreHoverIndex(null);
  };

  const openLightbox = () => {
    if (displayImages.length > 0) {
      setIsLightboxOpen(true);
    }
  };

  const handleLightboxNavigate = (index: number) => {
    setCurrentIndex(index);
    setPreHoverIndex(null);
  };

  // Calculate thumbnail size (each thumbnail ~80px + 8px gap)
  const thumbnailWidth = 80;
  const thumbnailGap = 8;
  const galleryWidth = maxVisibleThumbnails * thumbnailWidth + (maxVisibleThumbnails - 1) * thumbnailGap;

  return (
    <div className="space-y-4" style={{ maxWidth: `${galleryWidth}px` }}>
      {/* Main Image */}
      <div
        className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden group cursor-pointer"
        style={{ width: `${galleryWidth}px`, height: `${galleryWidth}px` }}
        onClick={openLightbox}
      >
        {mainImageUrl ? (
          <>
            <img
              src={mainImageUrl}
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
        <div className="relative" onMouseLeave={handleThumbnailLeave}>
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
            className="flex overflow-hidden px-1"
            style={{ gap: `${thumbnailGap}px` }}
          >
            {displayImages
              .slice(thumbnailOffset, thumbnailOffset + maxVisibleThumbnails)
              .map((img, idx) => {
                const actualIndex = idx + thumbnailOffset;
                const isActive = actualIndex === currentIndex && !hoveredVariantImageUrl;
                return (
                  <button
                    key={img.id}
                    onClick={() => handleThumbnailClick(actualIndex)}
                    onMouseEnter={() => handleThumbnailHover(actualIndex)}
                    className={`flex-shrink-0 rounded overflow-hidden border-2 transition-colors ${
                      isActive ? 'border-primary' : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ width: `${thumbnailWidth}px`, height: `${thumbnailWidth}px` }}
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
