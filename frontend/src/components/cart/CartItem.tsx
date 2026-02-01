'use client';

import Link from 'next/link';
import { Package, Minus, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { type CartItemResponse } from '@/lib/api';

interface CartItemProps {
  item: CartItemResponse;
  onToggleSelect: (cartItemId: string) => void;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
  disabled?: boolean;
}

export function CartItem({
  item,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}: CartItemProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const isInactive =
    !item.variant.isActive ||
    !item.product.isVisible ||
    item.product.status !== 'active';
  const isOutOfStock = item.variant.stockQuantity === 0;
  const isOverStock = item.quantity > item.variant.stockQuantity;
  const hasIssue = isInactive || isOutOfStock || isOverStock;

  const maxQuantity = item.variant.stockQuantity;

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < maxQuantity) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };

  return (
    <div
      className={`p-4 ${hasIssue ? 'bg-red-50/50' : 'hover:bg-gray-50'} transition-colors`}
    >
      {/* Desktop Layout */}
      <div className="hidden md:flex gap-4">
        {/* Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={item.isSelected}
            onChange={() => onToggleSelect(item.id)}
            disabled={disabled || hasIssue}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
          />
        </div>

        {/* Product Image */}
        <Link
          href={`/products/${item.product.slug}`}
          className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden"
        >
          {item.variant.imageUrl || item.product.thumbnailUrl ? (
            <img
              src={item.variant.imageUrl || item.product.thumbnailUrl}
              alt={item.product.name}
              className={`w-full h-full object-cover ${hasIssue ? 'opacity-50' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
          )}
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${item.product.slug}`}
            className={`font-medium text-gray-900 hover:text-primary line-clamp-2 ${
              hasIssue ? 'opacity-60' : ''
            }`}
          >
            {item.product.name}
          </Link>
          <p className="text-sm text-gray-500 mt-0.5">{item.variant.name}</p>

          {/* Warning Messages */}
          {hasIssue && (
            <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4" />
              {isInactive ? (
                <span>Sản phẩm không còn khả dụng</span>
              ) : isOutOfStock ? (
                <span>Hết hàng</span>
              ) : isOverStock ? (
                <span>Chỉ còn {maxQuantity} sản phẩm</span>
              ) : null}
            </div>
          )}

          {/* Price Changed Warning */}
          {item.hasPriceChanged && !hasIssue && (
            <div className="flex items-center gap-1 mt-2 text-sm text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Giá đã thay đổi từ {formatPrice(item.priceAtAdded)}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="text-right w-24">
          <div className="text-primary font-medium">{formatPrice(item.variant.price)}</div>
          {item.variant.compareAtPrice && (
            <div className="text-sm text-gray-400 line-through">
              {formatPrice(item.variant.compareAtPrice)}
            </div>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center w-28 justify-center">
          {!hasIssue ? (
            <div className="flex items-center border rounded-lg">
              <button
                onClick={handleDecrease}
                disabled={disabled || item.quantity <= 1}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
              <button
                onClick={handleIncrease}
                disabled={disabled || item.quantity >= maxQuantity}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-sm text-gray-400">x{item.quantity}</span>
          )}
        </div>

        {/* Subtotal */}
        <div className="w-28 text-right flex items-center justify-end">
          <div className="font-semibold text-primary">
            {formatPrice(item.variant.price * item.quantity)}
          </div>
        </div>

        {/* Remove Button */}
        <div className="flex items-center w-10">
          <button
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Xóa"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex gap-3">
          {/* Checkbox */}
          <div className="flex items-start pt-1">
            <input
              type="checkbox"
              checked={item.isSelected}
              onChange={() => onToggleSelect(item.id)}
              disabled={disabled || hasIssue}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
            />
          </div>

          {/* Product Image */}
          <Link
            href={`/products/${item.product.slug}`}
            className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden"
          >
            {item.variant.imageUrl || item.product.thumbnailUrl ? (
              <img
                src={item.variant.imageUrl || item.product.thumbnailUrl}
                alt={item.product.name}
                className={`w-full h-full object-cover ${hasIssue ? 'opacity-50' : ''}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
            )}
          </Link>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${item.product.slug}`}
              className={`font-medium text-gray-900 hover:text-primary line-clamp-2 text-sm ${
                hasIssue ? 'opacity-60' : ''
              }`}
            >
              {item.product.name}
            </Link>
            <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}</p>

            {/* Warning Messages */}
            {hasIssue && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertTriangle className="w-3 h-3" />
                {isInactive ? (
                  <span>Không khả dụng</span>
                ) : isOutOfStock ? (
                  <span>Hết hàng</span>
                ) : isOverStock ? (
                  <span>Còn {maxQuantity}</span>
                ) : null}
              </div>
            )}

            {/* Price Changed Warning */}
            {item.hasPriceChanged && !hasIssue && (
              <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                <AlertTriangle className="w-3 h-3" />
                <span>Giá thay đổi</span>
              </div>
            )}

            {/* Price on mobile */}
            <div className="mt-2">
              <span className="text-primary font-medium text-sm">{formatPrice(item.variant.price)}</span>
              {item.variant.compareAtPrice && (
                <span className="text-xs text-gray-400 line-through ml-2">
                  {formatPrice(item.variant.compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Remove Button - positioned top right */}
          <button
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors disabled:opacity-50 -mt-1 -mr-1"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quantity and Subtotal row */}
        <div className="flex items-center justify-between mt-3 ml-7">
          {/* Quantity Controls */}
          {!hasIssue ? (
            <div className="flex items-center border rounded-lg">
              <button
                onClick={handleDecrease}
                disabled={disabled || item.quantity <= 1}
                className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
              <button
                onClick={handleIncrease}
                disabled={disabled || item.quantity >= maxQuantity}
                className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-sm text-gray-400">x{item.quantity}</span>
          )}

          {/* Subtotal */}
          <div className="text-right">
            <span className="font-semibold text-primary">
              {formatPrice(item.variant.price * item.quantity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
