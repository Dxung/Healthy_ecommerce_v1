'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag } from 'lucide-react';

interface CartStickyBarProps {
  totalItems: number;
  selectedCount: number;
  selectedTotal: number;
  allSelected: boolean;
  hasInactiveItems: boolean;
  onToggleSelectAll: (selected: boolean) => void;
  onRemoveSelected: () => void;
  onRemoveInactive: () => void;
  disabled?: boolean;
}

export function CartStickyBar({
  totalItems,
  selectedCount,
  selectedTotal,
  allSelected,
  hasInactiveItems,
  onToggleSelectAll,
  onRemoveSelected,
  onRemoveInactive,
  disabled = false,
}: CartStickyBarProps) {
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const canCheckout = selectedCount > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
      <div className="container mx-auto px-4 py-3 md:py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Left: Select All and Remove buttons */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onToggleSelectAll(e.target.checked)}
                disabled={disabled || totalItems === 0}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
              />
              <span className="text-sm">Chọn tất cả ({totalItems})</span>
            </label>
            {selectedCount > 0 && (
              <button
                onClick={onRemoveSelected}
                disabled={disabled}
                className="text-sm text-red-500 hover:text-red-600 hover:underline disabled:opacity-50"
              >
                Xóa ({selectedCount})
              </button>
            )}
            <button
              onClick={onRemoveInactive}
              disabled={disabled || !hasInactiveItems}
              className={`text-sm ${
                hasInactiveItems
                  ? 'text-orange-500 hover:text-orange-600 hover:underline'
                  : 'text-gray-400 cursor-not-allowed'
              } disabled:opacity-50`}
            >
              Bỏ sản phẩm không khả dụng
            </button>
          </div>

          {/* Right: Total and Checkout */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Tổng thanh toán ({selectedCount} sản phẩm):
              </div>
              <div className="text-xl font-bold text-primary">{formatPrice(selectedTotal)}</div>
            </div>
            <Button
              size="lg"
              onClick={() => router.push('/checkout')}
              disabled={disabled || !canCheckout}
              className="min-w-[160px]"
            >
              {disabled ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <ShoppingBag className="w-5 h-5 mr-2" />
              )}
              Mua hàng
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-3">
          {/* Row 1: Select All, Delete, Remove Inactive */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onToggleSelectAll(e.target.checked)}
                disabled={disabled || totalItems === 0}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
              />
              <span className="text-sm">Chọn tất cả ({totalItems})</span>
            </label>
            <div className="flex items-center gap-3">
              {selectedCount > 0 && (
                <button
                  onClick={onRemoveSelected}
                  disabled={disabled}
                  className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  Xóa ({selectedCount})
                </button>
              )}
              {hasInactiveItems && (
                <button
                  onClick={onRemoveInactive}
                  disabled={disabled}
                  className="text-sm text-orange-500 hover:text-orange-600 disabled:opacity-50"
                >
                  Bỏ không khả dụng
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Total and Checkout */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-gray-500">
                Tổng ({selectedCount}):
              </div>
              <div className="text-lg font-bold text-primary">{formatPrice(selectedTotal)}</div>
            </div>
            <Button
              onClick={() => router.push('/checkout')}
              disabled={disabled || !canCheckout}
              className="flex-1 max-w-[180px]"
            >
              {disabled ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <ShoppingBag className="w-4 h-4 mr-1.5" />
              )}
              Mua hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
