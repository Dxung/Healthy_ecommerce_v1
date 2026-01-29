'use client';

import { type ShopProductListItemResponse, type ProductStatus } from '@/lib/api';
import { Package, Star, Eye, EyeOff, Layers } from 'lucide-react';

interface ShopProductCardProps {
  product: ShopProductListItemResponse;
  onClick: () => void;
}

const statusConfig: Record<ProductStatus, { label: string; className: string }> = {
  draft: { label: 'Nháp', className: 'bg-gray-100 text-gray-600' },
  active: { label: 'Đang bán', className: 'bg-green-100 text-green-700' },
  inactive: { label: 'Tạm dừng', className: 'bg-yellow-100 text-yellow-700' },
  suspended: { label: 'Bị khóa', className: 'bg-red-100 text-red-700' },
  deleted: { label: 'Đã xóa', className: 'bg-gray-100 text-gray-400' },
};

export function ShopProductCard({ product, onClick }: ShopProductCardProps) {
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

  const status = statusConfig[product.status];

  return (
    <div
      className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Status Badge */}
        <span
          className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded ${status.className}`}
        >
          {status.label}
        </span>

        {/* Visibility Badge */}
        <span
          className={`absolute top-2 right-2 p-1.5 rounded ${
            product.isVisible ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
          }`}
          title={product.isVisible ? 'Đang hiển thị' : 'Đã ẩn'}
        >
          {product.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-sm font-medium">Xem chi tiết</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate" title={product.name}>
          {product.name}
        </h3>

        <p className="text-primary font-semibold mt-1">{priceDisplay}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {/* Variants */}
          <span className="flex items-center gap-1" title="Số biến thể">
            <Layers className="w-3.5 h-3.5" />
            {product.variantCount}
          </span>

          {/* Stock */}
          <span
            className={`${product.totalStock === 0 ? 'text-red-500' : ''}`}
            title="Tồn kho"
          >
            Kho: {product.totalStock}
          </span>

          {/* Sold */}
          <span title="Đã bán">Bán: {product.soldCount}</span>

          {/* Rating */}
          {product.averageRating > 0 && (
            <span className="flex items-center gap-0.5" title="Đánh giá">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {product.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
