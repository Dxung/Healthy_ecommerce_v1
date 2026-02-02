'use client';

import Link from 'next/link';
import { Store, Package } from 'lucide-react';
import { type CartShopGroupResponse } from '@/lib/api';
import { Input } from '@/components/ui/input';

interface ProductsSectionProps {
  shops: CartShopGroupResponse[];
  shopNotes: Record<string, string>;
  onShopNoteChange: (shopId: string, note: string) => void;
}

export function ProductsSection({
  shops,
  shopNotes,
  onShopNoteChange,
}: ProductsSectionProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {shops.map((shopGroup) => (
        <div key={shopGroup.shop.id} className="bg-white rounded-lg border">
          {/* Shop Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50">
            <Link
              href={`/shop/${shopGroup.shop.slug}`}
              className="flex items-center gap-2 hover:text-primary"
            >
              {shopGroup.shop.logoUrl ? (
                <img
                  src={shopGroup.shop.logoUrl}
                  alt={shopGroup.shop.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <Store className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <span className="font-medium">{shopGroup.shop.name}</span>
            </Link>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b bg-gray-50 text-sm font-medium text-gray-600">
            <div className="col-span-5">Sản phẩm</div>
            <div className="col-span-2 text-center">Đơn giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-3 text-right">Thành tiền</div>
          </div>

          {/* Items */}
          <div className="divide-y">
            {shopGroup.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 p-4 items-center">
                {/* Product Name & Variant */}
                <div className="col-span-5 flex gap-3 items-center min-w-0">
                  <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-lg overflow-hidden">
                    {item.variant.imageUrl || item.product.thumbnailUrl ? (
                      <img
                        src={item.variant.imageUrl || item.product.thumbnailUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 line-clamp-2 text-sm">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Phân loại: {item.variant.name}
                    </p>
                  </div>
                </div>

                {/* Unit Price */}
                <div className="col-span-2 text-center">
                  <span className="text-sm text-gray-700">
                    {formatPrice(item.variant.price)}
                  </span>
                </div>

                {/* Quantity */}
                <div className="col-span-2 text-center">
                  <span className="text-sm text-gray-700">{item.quantity}</span>
                </div>

                {/* Subtotal */}
                <div className="col-span-3 text-right">
                  <span className="font-semibold text-primary">
                    {formatPrice(item.variant.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Shop Note */}
          <div className="px-4 py-3 border-t bg-gray-50">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 whitespace-nowrap">
                Lời nhắn:
              </label>
              <Input
                placeholder="Ghi chú cho người bán..."
                value={shopNotes[shopGroup.shop.id] || ''}
                onChange={(e) => onShopNoteChange(shopGroup.shop.id, e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Shop Subtotal */}
          <div className="flex items-center justify-end gap-4 px-4 py-3 border-t">
            <span className="text-sm text-gray-500">
              Tạm tính ({shopGroup.selectedCount} sản phẩm):
            </span>
            <span className="font-semibold text-lg text-primary">
              {formatPrice(shopGroup.shopSubtotal)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
