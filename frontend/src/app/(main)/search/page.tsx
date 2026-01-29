'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  apiClient,
  type PublicProductListItemResponse,
  type PublicProductFilters,
  type CategoryHierarchyResponse,
  type DietTagResponse,
  type AllergenTagResponse,
  type ApiError,
} from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { Button } from '@/components/ui/button';
import { Loader2, Package, SlidersHorizontal, X } from 'lucide-react';
import { toast } from 'sonner';

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'best_selling', label: 'Bán chạy' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
];

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Products state
  const [products, setProducts] = useState<PublicProductListItemResponse[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter options
  const [categories, setCategories] = useState<CategoryHierarchyResponse[]>([]);
  const [dietTags, setDietTags] = useState<DietTagResponse[]>([]);
  const [allergenTags, setAllergenTags] = useState<AllergenTagResponse[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Filter values from URL
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [sortBy, setSortBy] = useState<PublicProductFilters['sortBy']>(
    (searchParams.get('sortBy') as PublicProductFilters['sortBy']) || 'newest'
  );
  const [selectedDietTags, setSelectedDietTags] = useState<string[]>(
    searchParams.get('dietTagIds')?.split(',').filter(Boolean) || []
  );
  const [allergenFreeIds, setAllergenFreeIds] = useState<string[]>(
    searchParams.get('allergenFreeIds')?.split(',').filter(Boolean) || []
  );
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Mobile filter toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [page, sortBy]);

  const fetchFilterOptions = async () => {
    try {
      setLoadingFilters(true);
      const [categoriesData, dietTagsData, allergenTagsData] = await Promise.all([
        apiClient.getPublicCategories(),
        apiClient.getPublicDietTags(),
        apiClient.getPublicAllergenTags(),
      ]);
      setCategories(categoriesData);
      setDietTags(dietTagsData);
      setAllergenTags(allergenTagsData);
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    } finally {
      setLoadingFilters(false);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const filters: PublicProductFilters = {
        page,
        limit: 20,
        sortBy,
      };
      if (search) filters.search = search;
      if (categoryId) filters.categoryId = categoryId;
      if (selectedDietTags.length > 0) filters.dietTagIds = selectedDietTags;
      if (allergenFreeIds.length > 0) filters.allergenFreeIds = allergenFreeIds;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

      const response = await apiClient.getPublicProducts(filters);
      setProducts(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoadingProducts(false);
    }
  }, [page, sortBy, search, categoryId, selectedDietTags, allergenFreeIds, minPrice, maxPrice]);

  const handleApplyFilters = () => {
    // Update URL with filters
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (categoryId) params.set('categoryId', categoryId);
    if (sortBy && sortBy !== 'newest') params.set('sortBy', sortBy);
    if (selectedDietTags.length > 0) params.set('dietTagIds', selectedDietTags.join(','));
    if (allergenFreeIds.length > 0) params.set('allergenFreeIds', allergenFreeIds.join(','));
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : '/search');

    setPage(1);
    setShowMobileFilters(false);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryId('');
    setSelectedDietTags([]);
    setAllergenFreeIds([]);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
    router.push('/search');
    // Fetch with cleared filters
    setTimeout(() => fetchProducts(), 0);
  };

  const handleSortChange = (newSortBy: PublicProductFilters['sortBy']) => {
    setSortBy(newSortBy);
    setPage(1);
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (newSortBy && newSortBy !== 'newest') {
      params.set('sortBy', newSortBy);
    } else {
      params.delete('sortBy');
    }
    router.push(`/search?${params.toString()}`);
  };

  // Get title based on filters
  const getTitle = () => {
    if (search) return `Kết quả tìm kiếm: "${search}"`;
    if (sortBy === 'best_selling') return 'Sản phẩm bán chạy';
    if (sortBy === 'rating') return 'Sản phẩm đánh giá cao';
    return 'Tìm kiếm sản phẩm';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
          {total > 0 && (
            <p className="text-gray-500 mt-1">{total} sản phẩm được tìm thấy</p>
          )}
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-lg border p-4 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Bộ lọc</h2>
              <ProductFilters
                categories={categories}
                dietTags={dietTags}
                allergenTags={allergenTags}
                search={search}
                onSearchChange={setSearch}
                categoryId={categoryId}
                onCategoryChange={setCategoryId}
                selectedDietTags={selectedDietTags}
                onDietTagsChange={setSelectedDietTags}
                allergenFreeIds={allergenFreeIds}
                onAllergenFreeChange={setAllergenFreeIds}
                minPrice={minPrice}
                onMinPriceChange={setMinPrice}
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                loading={loadingFilters}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button & Sort */}
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Bộ lọc
              </Button>
              <div className="flex-1" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as PublicProductFilters['sortBy'])}
                className="h-10 px-3 rounded-md border border-gray-300 text-sm"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-500">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <span className="text-sm text-gray-600">
                      Trang {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Bộ lọc</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <ProductFilters
                  categories={categories}
                  dietTags={dietTags}
                  allergenTags={allergenTags}
                  search={search}
                  onSearchChange={setSearch}
                  categoryId={categoryId}
                  onCategoryChange={setCategoryId}
                  selectedDietTags={selectedDietTags}
                  onDietTagsChange={setSelectedDietTags}
                  allergenFreeIds={allergenFreeIds}
                  onAllergenFreeChange={setAllergenFreeIds}
                  minPrice={minPrice}
                  onMinPriceChange={setMinPrice}
                  maxPrice={maxPrice}
                  onMaxPriceChange={setMaxPrice}
                  onApply={handleApplyFilters}
                  onClear={handleClearFilters}
                  loading={loadingFilters}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
