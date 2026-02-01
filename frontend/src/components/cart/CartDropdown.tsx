'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Package, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

export function CartDropdown() {
  const { cartPreview, totalQuantity, isLoading } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Giỏ hàng"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalQuantity > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-medium rounded-full flex items-center justify-center">
            {totalQuantity > 99 ? '99+' : totalQuantity}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b">
            <h3 className="font-medium text-gray-900">Sản phẩm mới thêm</h3>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : !cartPreview?.recentItems?.length ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chưa có sản phẩm</p>
              </div>
            ) : (
              <div className="divide-y">
                {cartPreview.recentItems.map((item) => {
                  const isInactive =
                    !item.variant.isActive ||
                    !item.product.isVisible ||
                    item.product.status !== 'active' ||
                    item.variant.stockQuantity === 0;

                  return (
                    <Link
                      key={item.id}
                      href={`/products/${item.productId}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex gap-3 p-3 hover:bg-gray-50 transition-colors ${
                        isInactive ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        {item.variant.imageUrl || item.product.thumbnailUrl ? (
                          <img
                            src={item.variant.imageUrl || item.product.thumbnailUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{item.variant.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-primary font-medium">
                            {formatPrice(item.variant.price)}
                          </span>
                          <span className="text-xs text-gray-400">x{item.quantity}</span>
                        </div>
                        {isInactive && (
                          <span className="text-xs text-red-500">Sản phẩm không khả dụng</span>
                        )}
                        {item.hasPriceChanged && !isInactive && (
                          <span className="text-xs text-orange-500">Giá đã thay đổi</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">
                {cartPreview?.totalItems ?? 0} sản phẩm trong giỏ
              </span>
            </div>
            <Link href="/cart" onClick={() => setIsOpen(false)}>
              <Button className="w-full">Xem giỏ hàng</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
