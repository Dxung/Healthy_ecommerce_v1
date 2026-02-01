'use client';

import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  imageUrl: string | null;
  isActive: boolean;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onHover?: (variantId: string | null) => void;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
  quantity,
  onQuantityChange,
  onHover,
}: VariantSelectorProps) {
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const maxQuantity = selectedVariant?.stockQuantity || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Variants */}
      {variants.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Phân loại</label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isAvailable = variant.isActive && variant.stockQuantity > 0;
              const isSelected = variant.id === selectedVariantId;

              return (
                <button
                  key={variant.id}
                  onClick={() => isAvailable && onSelect(variant.id)}
                  onMouseEnter={() => isAvailable && variant.imageUrl && onHover?.(variant.id)}
                  onMouseLeave={() => onHover?.(null)}
                  disabled={!isAvailable}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : isAvailable
                      ? 'border-gray-300 hover:border-primary'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {variant.imageUrl && (
                      <img
                        src={variant.imageUrl}
                        alt=""
                        className="w-6 h-6 rounded object-cover"
                      />
                    )}
                    <span>{variant.name}</span>
                  </div>
                  {!isAvailable && (
                    <span className="text-xs text-red-500 block">Hết hàng</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Single variant info */}
      {variants.length === 1 && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">{variants[0].name}</span>
          {variants[0].stockQuantity === 0 && (
            <span className="ml-2 text-red-500">(Hết hàng)</span>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Số lượng</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={increaseQuantity}
              disabled={quantity >= maxQuantity}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {selectedVariant && (
            <span className="text-sm text-gray-500">
              {selectedVariant.stockQuantity} sản phẩm có sẵn
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
