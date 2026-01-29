'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, BrandResponse } from '@/lib/api';
import { Package, ChevronRight, Search } from 'lucide-react';

function BrandCard({ brand }: { brand: BrandResponse }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
        {brand.logoUrl ? (
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="w-12 h-12 object-contain"
          />
        ) : (
          <span className="text-2xl font-bold text-gray-400">
            {brand.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 text-lg">{brand.name}</h3>
        {brand.description && (
          <p className="text-sm text-gray-500 line-clamp-1 mt-1">
            {brand.description}
          </p>
        )}
        <span className="text-xs text-gray-400 mt-1 inline-block">
          {brand.productCount} sản phẩm
        </span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </Link>
  );
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setFilteredBrands(
        brands.filter((b) =>
          b.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredBrands(brands);
    }
  }, [search, brands]);

  const fetchBrands = async () => {
    try {
      const data = await apiClient.getPublicBrands();
      const activeBrands = data.filter((b) => b.isActive);
      setBrands(activeBrands);
      setFilteredBrands(activeBrands);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Thương hiệu
          </h1>
          <p className="text-gray-500 mt-2">
            Khám phá các thương hiệu thực phẩm lành mạnh uy tín
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm thương hiệu..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Brands Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? 'Không tìm thấy thương hiệu' : 'Chưa có thương hiệu nào'}
            </h3>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-primary hover:underline"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
