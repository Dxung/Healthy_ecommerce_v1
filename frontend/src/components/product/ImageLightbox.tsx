'use client';

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: { id: string; imageUrl: string }[];
  currentIndex: number;
  productName: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  productName,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
      }
    },
    [currentIndex, images.length, onClose, onNavigate],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const goToPrev = () => {
    onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex w-full h-full max-w-7xl mx-auto p-4">
        {/* Left: Main Image */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={images[currentIndex]?.imageUrl}
            alt={productName}
            className="max-h-[80vh] max-w-full object-contain rounded-lg"
          />
        </div>

        {/* Right: Info + Thumbnails */}
        <div className="hidden lg:flex flex-col w-64 ml-4">
          {/* Product Name */}
          <div className="text-white mb-4">
            <h3 className="font-semibold text-lg line-clamp-2">{productName}</h3>
            <p className="text-sm text-gray-400 mt-1">
              {currentIndex + 1} / {images.length}
            </p>
          </div>

          {/* Thumbnails */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => onNavigate(idx)}
                  className={`aspect-square rounded overflow-hidden border-2 transition-colors ${
                    idx === currentIndex
                      ? 'border-white'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Thumbnails */}
      <div className="lg:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(idx)}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentIndex ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
