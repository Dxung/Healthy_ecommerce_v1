'use client';

import Link from 'next/link';
import { Store, Star, Package, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShopInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  averageRating: number;
  totalRatings: number;
  totalProducts: number;
  createdAt: string;
  province?: string | null;
}

interface ShopInfoSectionProps {
  shop: ShopInfo;
}

export function ShopInfoSection({ shop }: ShopInfoSectionProps) {
  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    const diffYears = Math.floor(diffMonths / 12);

    if (diffYears > 0) {
      return `${diffYears} nam truoc`;
    }
    if (diffMonths > 0) {
      return `${diffMonths} thang truoc`;
    }
    return 'Moi tham gia';
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left: Avatar + Name + Button */}
        <div className="flex items-center gap-3 flex-1">
          <Link href={`/shop/${shop.slug}`}>
            {shop.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="w-14 h-14 rounded-full object-cover border"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <Store className="w-7 h-7 text-gray-400" />
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              href={`/shop/${shop.slug}`}
              className="font-semibold text-gray-900 hover:text-primary transition-colors block truncate"
            >
              {shop.name}
            </Link>
            {shop.province && (
              <p className="text-sm text-gray-500 truncate">{shop.province}</p>
            )}
          </div>
          <Link href={`/shop/${shop.slug}`}>
            <Button variant="outline" size="sm">
              Xem Shop
            </Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-12 bg-gray-200" />

        {/* Right: Stats Grid */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-gray-900">
                {shop.averageRating.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {shop.totalRatings} danh gia
            </p>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-1">
              <Package className="w-4 h-4 text-primary" />
              <span className="font-semibold text-gray-900">
                {shop.totalProducts}
              </span>
            </div>
            <p className="text-xs text-gray-500">San pham</p>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-gray-900 text-sm">
                {formatJoinedDate(shop.createdAt)}
              </span>
            </div>
            <p className="text-xs text-gray-500">Tham gia</p>
          </div>
        </div>
      </div>
    </div>
  );
}
