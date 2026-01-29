'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  apiClient,
  type ShopProductListItemResponse,
  type ShopProductListParams,
  type ProductStatus,
  type ApiError,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShopProductCard } from '@/components/shop/ProductCard';
import { ProductDetailDialog } from '@/components/shop/ProductDetailDialog';
import { Loader2, Plus, Search, Package } from 'lucide-react';
import { toast } from 'sonner';

const statusOptions: { value: ProductStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'draft', label: 'Nháp' },
  { value: 'active', label: 'Đang bán' },
  { value: 'inactive', label: 'Tạm dừng' },
  { value: 'suspended', label: 'Bị khóa' },
];

const visibilityOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'true', label: 'Hiển thị' },
  { value: 'false', label: 'Ẩn' },
];

export default function ShopProductsPage() {
  const [products, setProducts] = useState<ShopProductListItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [isVisible, setIsVisible] = useState<string>('');

  // Selected product for detail dialog
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [page, status, isVisible]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: ShopProductListParams = {
        page,
        limit: 12,
      };
      if (status) params.status = status;
      if (isVisible) params.isVisible = isVisible === 'true';
      if (search) params.search = search;

      const response = await apiClient.getMyShopProducts(params);
      setProducts(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleProductUpdated = () => {
    fetchProducts();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng cộng {total} sản phẩm
          </p>
        </div>
        <Link href="/shop/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ProductStatus | '');
              setPage(1);
            }}
            className="h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Visibility Filter */}
          <select
            value={isVisible}
            onChange={(e) => {
              setIsVisible(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {visibilityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <Button onClick={handleSearch}>Tìm kiếm</Button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có sản phẩm nào
          </h3>
          <p className="text-gray-500 mb-6">
            Bắt đầu bán hàng bằng cách thêm sản phẩm đầu tiên
          </p>
          <Link href="/shop/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ShopProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProductId(product.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
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

      {/* Product Detail Dialog */}
      {selectedProductId && (
        <ProductDetailDialog
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
          onUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
}
