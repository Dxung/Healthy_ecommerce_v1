'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  apiClient,
  CategoryHierarchyResponse,
  CategoryResponse,
  BrandResponse,
  PublicProductListItemResponse,
  PublicProductFilters,
} from '@/lib/api';
import {
  Leaf,
  Star,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  X,
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

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'best_selling', label: 'Bán chạy' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao' },
];

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();

  const [category, setCategory] = useState<CategoryResponse | null>(null);
  const [subCategories, setSubCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [products, setProducts] = useState<PublicProductListItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    fetchCategoryData();
  }, [slug]);

  useEffect(() => {
    if (category) {
      fetchProducts();
    }
  }, [category, selectedBrand, minPrice, maxPrice, sortBy, page]);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      // Get all categories to find the current one
      const [categoriesData, brandsData] = await Promise.all([
        apiClient.getPublicCategoriesFlat(),
        apiClient.getPublicBrands(),
      ]);

      const currentCategory = categoriesData.find((c) => c.slug === slug);
      if (currentCategory) {
        setCategory(currentCategory);
        // Find subcategories
        const subs = categoriesData.filter(
          (c) => c.parentId === currentCategory.id && c.isActive
        );
        setSubCategories(subs);
      }

      setBrands(brandsData.filter((b) => b.isActive));
    } catch (error) {
      console.error('Failed to fetch category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!category) return;

    setLoadingProducts(true);
    try {
      const filters: PublicProductFilters = {
        categoryId: category.id,
        page,
        limit,
        sortBy: sortBy as PublicProductFilters['sortBy'],
      };

      if (selectedBrand) filters.brandId = selectedBrand;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

      const response = await apiClient.getPublicProducts(filters);
      setProducts(response.items);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy danh mục
          </h1>
          <Link href="/categories" className="text-primary hover:underline">
            Quay lại danh mục
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/categories" className="hover:text-primary">
            Danh mục
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {category.iconUrl ? (
                <img
                  src={category.iconUrl}
                  alt={category.name}
                  className="w-8 h-8"
                />
              ) : (
                <Leaf className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {category.name}
              </h1>
              <p className="text-gray-500">{total} sản phẩm</p>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 space-y-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Bộ lọc
              </h3>

              {/* Subcategories */}
              {subCategories.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Danh mục con
                  </h4>
                  <div className="space-y-2">
                    {subCategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/categories/${sub.slug}`}
                        className="block text-sm text-gray-600 hover:text-primary py-1"
                      >
                        {sub.name} ({sub.productCount})
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Thương hiệu
                </h4>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Khoảng giá
                </h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={handleResetFilters}
                className="w-full text-sm text-gray-500 hover:text-primary"
              >
                Xóa bộ lọc
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Bộ lọc
              </button>
            </div>

            {/* Sort Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Hiển thị {products.length} / {total} sản phẩm
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-500 mb-4">
                  Thử thay đổi bộ lọc hoặc xem danh mục khác
                </p>
                <button
                  onClick={handleResetFilters}
                  className="text-primary hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Trang {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Bộ lọc</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-6">
              {/* Subcategories */}
              {subCategories.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Danh mục con
                  </h4>
                  <div className="space-y-2">
                    {subCategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/categories/${sub.slug}`}
                        className="block text-sm text-gray-600 hover:text-primary py-1"
                        onClick={() => setShowFilters(false)}
                      >
                        {sub.name} ({sub.productCount})
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Thương hiệu
                </h4>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Khoảng giá
                </h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  Xóa bộ lọc
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-2 bg-primary text-white rounded-lg text-sm"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
