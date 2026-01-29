'use client';

import Link from 'next/link';
import { type PublicProductListItemResponse } from '@/lib/api';
import { Package, Star, Store } from 'lucide-react';

interface ProductCardProps {
  product: PublicProductListItemResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const priceDisplay =
    product.minPrice === product.maxPrice
      ? formatPrice(product.minPrice)
      : `${formatPrice(product.minPrice)} - ${formatPrice(product.maxPrice)}`;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow group">
        {/* Image */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          {/* Shop */}
          <div className="flex items-center gap-1 mb-1">
            {product.shop.logoUrl ? (
              <img
                src={product.shop.logoUrl}
                alt={product.shop.name}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <Store className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-xs text-gray-500 truncate">{product.shop.name}</span>
          </div>

          {/* Name */}
          <h3
            className="font-medium text-gray-900 line-clamp-2 text-sm mb-1 min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price */}
          <p className="text-primary font-semibold text-sm">{priceDisplay}</p>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {/* Rating */}
            {product.averageRating > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {product.averageRating.toFixed(1)}
              </span>
            )}

            {/* Sold */}
            <span>Đã bán {product.soldCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
