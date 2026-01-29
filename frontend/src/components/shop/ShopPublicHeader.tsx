'use client';

import { type PublicShopResponse } from '@/lib/api';
import { Store, Star, Package, MapPin, Clock, BadgeCheck, Award } from 'lucide-react';

interface ShopPublicHeaderProps {
  shop: PublicShopResponse;
}

export function ShopPublicHeader({ shop }: ShopPublicHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getBadgeLabel = (badge: string) => {
    switch (badge) {
      case 'preferred':
        return 'Ưu tiên';
      case 'approved':
        return 'Xác thực';
      case 'official':
        return 'Chính hãng';
      default:
        return badge;
    }
  };

  return (
    <div className="bg-white border-b">
      {/* Cover Image */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 to-primary/5 relative">
        {shop.coverUrl && (
          <img
            src={shop.coverUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Shop Info */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16 pb-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            {shop.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg bg-white"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <Store className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 md:pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {shop.name}
              </h1>
              {shop.badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded"
                >
                  {badge === 'official' ? (
                    <BadgeCheck className="w-3 h-3" />
                  ) : (
                    <Award className="w-3 h-3" />
                  )}
                  {getBadgeLabel(badge)}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {/* Rating */}
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{shop.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({shop.totalRatings} đánh giá)</span>
              </span>

              {/* Products */}
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4 text-gray-400" />
                {shop.totalProducts} sản phẩm
              </span>

              {/* Location */}
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                {shop.districtName}, {shop.provinceName}
              </span>

              {/* Response Time */}
              {shop.responseTimeHours > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Phản hồi trong {shop.responseTimeHours}h
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-3 pt-3 border-t text-sm">
              <div>
                <span className="text-gray-500">Đơn hàng:</span>{' '}
                <span className="font-medium">{shop.totalOrders}</span>
              </div>
              <div>
                <span className="text-gray-500">Tỷ lệ thành công:</span>{' '}
                <span className="font-medium text-green-600">
                  {(shop.orderSuccessRate * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-gray-500">Tham gia:</span>{' '}
                <span className="font-medium">{formatDate(shop.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
