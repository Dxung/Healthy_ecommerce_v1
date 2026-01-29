'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type CartItemResponse } from '@/lib/api';

interface InactiveItemsSectionProps {
  items: CartItemResponse[];
  onRemoveInactive: () => void;
  disabled?: boolean;
}

export function InactiveItemsSection({
  items,
  onRemoveInactive,
  disabled = false,
}: InactiveItemsSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">
            Sản phẩm không khả dụng ({items.length})
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRemoveInactive}
          disabled={disabled}
          className="text-red-600 border-red-300 hover:bg-red-100"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Xóa tất cả
        </Button>
      </div>
      <p className="text-sm text-red-600 mb-3">
        Các sản phẩm dưới đây đã hết hàng, bị ẩn hoặc không còn khả dụng. Vui lòng xóa để tiếp tục thanh toán.
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2 bg-white/50 rounded"
          >
            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden opacity-50">
              {item.variant.imageUrl || item.product.thumbnailUrl ? (
                <img
                  src={item.variant.imageUrl || item.product.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 truncate">{item.product.name}</p>
              <p className="text-xs text-gray-400">{item.variant.name}</p>
            </div>
            <span className="text-xs text-red-500">
              {!item.variant.isActive || !item.product.isVisible
                ? 'Không khả dụng'
                : item.variant.stockQuantity === 0
                ? 'Hết hàng'
                : 'Không hợp lệ'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
