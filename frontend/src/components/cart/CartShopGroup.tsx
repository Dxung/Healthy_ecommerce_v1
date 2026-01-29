'use client';

import Link from 'next/link';
import { Store } from 'lucide-react';
import { type CartShopGroupResponse } from '@/lib/api';
import { CartItem } from './CartItem';

interface CartShopGroupProps {
  shopGroup: CartShopGroupResponse;
  onToggleShopSelect: (shopId: string, isSelected: boolean) => void;
  onToggleItemSelect: (cartItemId: string) => void;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  disabled?: boolean;
}

export function CartShopGroup({
  shopGroup,
  onToggleShopSelect,
  onToggleItemSelect,
  onUpdateQuantity,
  onRemoveItem,
  disabled = false,
}: CartShopGroupProps) {
  const { shop, items, shopSubtotal, selectedCount } = shopGroup;

  // Check if all selectable items are selected
  const selectableItems = items.filter(
    (item) =>
      item.variant.isActive &&
      item.product.isVisible &&
      item.product.status === 'approved' &&
      item.variant.stockQuantity > 0
  );
  const allSelected = selectableItems.length > 0 && selectedCount === selectableItems.length;
  const hasSelectableItems = selectableItems.length > 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg border">
      {/* Shop Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => onToggleShopSelect(shop.id, !allSelected)}
          disabled={disabled || !hasSelectableItems}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
        />
        <Link href={`/shop/${shop.slug}`} className="flex items-center gap-2 hover:text-primary">
          {shop.logoUrl ? (
            <img src={shop.logoUrl} alt={shop.name} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <Store className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <span className="font-medium">{shop.name}</span>
        </Link>
      </div>

      {/* Items */}
      <div className="divide-y">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onToggleSelect={onToggleItemSelect}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Shop Footer */}
      <div className="flex items-center justify-end gap-4 px-4 py-3 border-t bg-gray-50">
        <span className="text-sm text-gray-500">
          {selectedCount} sản phẩm đã chọn
        </span>
        <span className="font-medium">
          Tạm tính: <span className="text-primary">{formatPrice(shopSubtotal)}</span>
        </span>
      </div>
    </div>
  );
}
