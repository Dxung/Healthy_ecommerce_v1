'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  apiClient,
  CategoryHierarchyResponse,
  BrandResponse,
  PublicProductListItemResponse,
} from '@/lib/api';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Leaf,
  Shield,
  Truck,
  Star,
  ShoppingCart,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Format price in VND
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

// Product Card Component
function ProductCard({ product }: { product: PublicProductListItemResponse }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-gray-100">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Leaf className="w-12 h-12" />
          </div>
        )}
        {product.soldCount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
            Đã bán {product.soldCount}
          </div>
        )}
        {product.isOfficialApproved && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <BadgeCheck className="w-3 h-3" />
            Chính hãng
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-primary font-semibold text-lg">
            {formatPrice(product.minPrice)}
          </span>
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {product.averageRating.toFixed(1)}
            </div>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          {product.shop?.logoUrl ? (
            <img
              src={product.shop.logoUrl}
              alt={product.shop.name}
              className="w-4 h-4 rounded-full"
            />
          ) : null}
          <span className="text-xs text-gray-500 truncate">
            {product.shop?.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Category Card Component
function CategoryCard({
  category,
}: {
  category: CategoryHierarchyResponse;
}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all min-w-[120px]"
    >
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
        {category.iconUrl ? (
          <img
            src={category.iconUrl}
            alt={category.name}
            className="w-8 h-8"
          />
        ) : (
          <Leaf className="w-6 h-6 text-primary" />
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 text-center line-clamp-2">
        {category.name}
      </span>
      <span className="text-xs text-gray-400 mt-1">
        {category.productCount} sản phẩm
      </span>
    </Link>
  );
}

// Brand Card Component
function BrandCard({ brand }: { brand: BrandResponse }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
        {brand.logoUrl ? (
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="w-10 h-10 object-contain"
          />
        ) : (
          <span className="text-lg font-bold text-gray-400">
            {brand.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{brand.name}</h3>
        <span className="text-xs text-gray-400">
          {brand.productCount} sản phẩm
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryHierarchyResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<
    PublicProductListItemResponse[]
  >([]);
  const [latestProducts, setLatestProducts] = useState<
    PublicProductListItemResponse[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Category carousel
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkCategoryScroll = () => {
    const container = categoryScrollRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    const container = categoryScrollRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    checkCategoryScroll();
  }, [categories]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesData, brandsData, featuredData, latestData] =
        await Promise.all([
          apiClient.getPublicCategories(),
          apiClient.getPublicBrands(),
          apiClient.getPublicProducts({
            sortBy: 'best_selling',
            limit: 8,
          }),
          apiClient.getPublicProducts({ sortBy: 'newest', limit: 8 }),
        ]);
      setCategories(categoriesData.filter((c) => c.isActive));
      setBrands(brandsData.filter((b) => b.isActive).slice(0, 8));
      setFeaturedProducts(featuredData.items);
      setLatestProducts(latestData.items);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-primary/90 to-primary py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Thực phẩm lành mạnh cho cuộc sống khỏe mạnh
          </h1>
          <p className="text-white/80 mb-8">
            Khám phá hàng nghìn sản phẩm thực phẩm sạch, organic và dinh dưỡng
            từ các thương hiệu uy tín
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
                className="w-full px-6 py-4 pl-14 rounded-full text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sản phẩm sạch</h3>
                <p className="text-sm text-gray-500">100% organic, tự nhiên</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">An toàn</h3>
                <p className="text-sm text-gray-500">Được kiểm định chất lượng</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Giao hàng nhanh</h3>
                <p className="text-sm text-gray-500">Miễn phí đơn từ 300k</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-10 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Danh mục</h2>
              <Link
                href="/categories"
                className="text-primary hover:underline flex items-center gap-1 text-sm"
              >
                Xem tất cả
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              {/* Left scroll button */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollCategories('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}

              {/* Scrollable category container */}
              <div
                ref={categoryScrollRef}
                onScroll={checkCategoryScroll}
                className="flex gap-4 overflow-x-auto scrollbar-hide px-1 py-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((category) => (
                  <div key={category.id} className="flex-shrink-0">
                    <CategoryCard category={category} />
                  </div>
                ))}
              </div>

              {/* Right scroll button */}
              {canScrollRight && (
                <button
                  onClick={() => scrollCategories('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Brands Section */}
      {brands.length > 0 && (
        <section className="py-10 px-4 bg-white">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Thương hiệu nổi bật
              </h2>
              <Link
                href="/brands"
                className="text-primary hover:underline flex items-center gap-1 text-sm"
              >
                Xem tất cả
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-10 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Sản phẩm bán chạy
              </h2>
              <Link
                href="/search?sortBy=best_selling"
                className="text-primary hover:underline flex items-center gap-1 text-sm"
              >
                Xem tất cả
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products Section */}
      {latestProducts.length > 0 && (
        <section className="py-10 px-4 bg-white">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Sản phẩm mới nhất
              </h2>
              <Link
                href="/search?sortBy=newest"
                className="text-primary hover:underline flex items-center gap-1 text-sm"
              >
                Xem tất cả
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
