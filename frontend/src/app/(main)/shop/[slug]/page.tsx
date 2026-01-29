'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  apiClient,
  type PublicShopResponse,
  type PublicProductListItemResponse,
  type PublicProductFilters,
  type ApiError,
} from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { ShopPublicHeader } from '@/components/shop/ShopPublicHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Package, Search } from 'lucide-react';
import { toast } from 'sonner';

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'best_selling', label: 'Bán chạy' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
];

export default function ShopPublicPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [shop, setShop] = useState<PublicShopResponse | null>(null);
  const [products, setProducts] = useState<PublicProductListItemResponse[]>([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<PublicProductFilters['sortBy']>('best_selling');

  useEffect(() => {
    if (slug) {
      fetchShop();
    }
  }, [slug]);

  useEffect(() => {
    if (shop) {
      fetchProducts();
    }
  }, [shop, page, sortBy]);

  const fetchShop = async () => {
    try {
      setLoadingShop(true);
      const data = await apiClient.getShopBySlug(slug);
      setShop(data);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải thông tin shop');
    } finally {
      setLoadingShop(false);
    }
  };

  const fetchProducts = async () => {
    if (!shop) return;

    try {
      setLoadingProducts(true);
      const filters: PublicProductFilters = {
        page,
        limit: 20,
        sortBy,
      };
      if (search) filters.search = search;

      const response = await apiClient.getShopProducts(shop.id, filters);
      setProducts(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  if (loadingShop) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy shop</h2>
      </div>
    );
  }

  return (
    <div>
      {/* Shop Header */}
      <ShopPublicHeader shop={shop} />

      {/* Products Section */}
      <div className="container mx-auto px-4 py-6">
        {/* Search & Sort */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm trong shop..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
          </div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as PublicProductFilters['sortBy']);
              setPage(1);
            }}
            className="h-10 px-3 rounded-md border border-gray-300 text-sm"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button onClick={handleSearch}>Tìm</Button>
        </div>

        {/* Products */}
        {loadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-500">Shop chưa có sản phẩm để hiển thị</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{total} sản phẩm</p>
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
  );
}
