'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  apiClient,
  type ShopProductResponse,
  type ProductStatus,
  type ApiError,
} from '@/lib/api';
import {
  Loader2,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Package,
  Star,
  AlertTriangle,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { VariantEditDialog } from './VariantEditDialog';
import { Tooltip } from '@/components/ui/tooltip';

interface ProductDetailDialogProps {
  productId: string;
  onClose: () => void;
  onUpdated: () => void;
}

const statusConfig: Record<ProductStatus, { label: string; className: string }> = {
  draft: { label: 'Nháp', className: 'bg-gray-100 text-gray-600' },
  active: { label: 'Đang bán', className: 'bg-green-100 text-green-700' },
  inactive: { label: 'Tạm dừng', className: 'bg-yellow-100 text-yellow-700' },
  suspended: { label: 'Bị khóa', className: 'bg-red-100 text-red-700' },
  deleted: { label: 'Đã xóa', className: 'bg-gray-100 text-gray-400' },
};

export function ProductDetailDialog({
  productId,
  onClose,
  onUpdated,
}: ProductDetailDialogProps) {
  const [product, setProduct] = useState<ShopProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMyShopProductById(productId);
      setProduct(data);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải thông tin sản phẩm');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!product) return;

    try {
      setToggling(true);
      await apiClient.publishProduct(productId);
      toast.success('Đã xuất bản sản phẩm');
      fetchProduct();
      onUpdated();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xuất bản sản phẩm');
    } finally {
      setToggling(false);
    }
  };

  const handleDeactivate = async () => {
    if (!product) return;

    try {
      setToggling(true);
      await apiClient.deactivateProduct(productId);
      toast.success('Đã tạm dừng sản phẩm');
      fetchProduct();
      onUpdated();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tạm dừng sản phẩm');
    } finally {
      setToggling(false);
    }
  };

  const handleActivate = async () => {
    if (!product) return;

    try {
      setToggling(true);
      await apiClient.activateProduct(productId);
      toast.success('Đã kích hoạt lại sản phẩm');
      fetchProduct();
      onUpdated();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể kích hoạt sản phẩm');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) return;

    try {
      setDeleting(true);
      await apiClient.deleteShopProduct(productId);
      toast.success('Đã xóa sản phẩm');
      onUpdated();
      onClose();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa sản phẩm');
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="sr-only">Đang tải chi tiết sản phẩm</DialogTitle>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!product) return null;

  const status = statusConfig[product.status];
  const images = product.images?.length > 0 ? product.images : null;
  const variants = product.variants ?? [];
  const allergenTags = product.allergenTags ?? [];
  const dietTags = product.dietTags ?? [];

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span>Chi tiết sản phẩm</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${status.className}`}>
                  {status.label}
                </span>
                <span
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                    product.isVisible
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {product.isVisible ? (
                    <>
                      <Eye className="w-3 h-3" /> Hiển thị
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" /> Đã ẩn
                    </>
                  )}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Left: Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden">
                {images ? (
                  <>
                    <img
                      src={images[currentImageIndex].imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((i) =>
                              i === 0 ? images.length - 1 : i - 1
                            )
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full hover:bg-white"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((i) =>
                              i === images.length - 1 ? 0 : i + 1
                            )
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full hover:bg-white"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images && images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                        idx === currentImageIndex
                          ? 'border-primary'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                <p className="text-sm text-gray-500 font-mono">/{product.slug}</p>
              </div>

              {/* Price Range */}
              <div className="text-2xl font-bold text-primary">
                {product.minPrice === product.maxPrice
                  ? formatPrice(product.minPrice)
                  : `${formatPrice(product.minPrice)} - ${formatPrice(product.maxPrice)}`}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-gray-400" />
                  Tồn: {product.totalStock}
                </span>
                <span>Đã bán: {product.soldCount}</span>
                <span>Lượt xem: {product.viewCount}</span>
                {product.averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {product.averageRating.toFixed(1)} ({product.totalRatings})
                  </span>
                )}
              </div>

              {/* Category & Brand */}
              <div className="text-sm space-y-1">
                {product.categoryName && (
                  <p>
                    <span className="text-gray-500">Danh mục:</span>{' '}
                    {product.categoryName}
                  </p>
                )}
                {product.brandName && (
                  <p>
                    <span className="text-gray-500">Thương hiệu:</span>{' '}
                    {product.brandName}
                  </p>
                )}
              </div>

              {/* Tags */}
              {(allergenTags.length > 0 || dietTags.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {allergenTags.map((tag) => (
                    <Tooltip key={tag.id} content={tag.description} position="bottom">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded cursor-help">
                        <AlertTriangle className="w-3 h-3" />
                        {tag.name}
                      </span>
                    </Tooltip>
                  ))}
                  {dietTags.map((tag) => (
                    <Tooltip key={tag.id} content={tag.description} position="bottom">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded cursor-help">
                        <Leaf className="w-3 h-3" />
                        {tag.name}
                      </span>
                    </Tooltip>
                  ))}
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Mô tả</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                <p>Tạo: {formatDate(product.createdAt)}</p>
                <p>Cập nhật: {formatDate(product.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">
              Biến thể ({variants.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Tên biến thể</th>
                    <th className="text-right px-3 py-2">Giá</th>
                    <th className="text-right px-3 py-2">Tồn kho</th>
                    <th className="text-center px-3 py-2">Trạng thái</th>
                    <th className="text-right px-3 py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {variants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {variant.imageUrl && (
                            <img
                              src={variant.imageUrl}
                              alt=""
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{variant.name}</p>
                            {variant.sku && (
                              <p className="text-xs text-gray-400">SKU: {variant.sku}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <p className="font-medium">{formatPrice(variant.price)}</p>
                        {variant.compareAtPrice && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(variant.compareAtPrice)}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span
                          className={
                            variant.stockQuantity <= variant.lowStockThreshold
                              ? 'text-red-500 font-medium'
                              : ''
                          }
                        >
                          {variant.stockQuantity}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded ${
                            variant.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {variant.isActive ? 'Hoạt động' : 'Tắt'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingVariantId(variant.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex gap-2">
              {/* Status action buttons based on current status */}
              {product.status === 'draft' && (
                <Button
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={handlePublish}
                  disabled={toggling}
                >
                  {toggling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Xuất bản
                </Button>
              )}
              {product.status === 'active' && (
                <Button
                  variant="outline"
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                  onClick={handleDeactivate}
                  disabled={toggling}
                >
                  {toggling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Pause className="w-4 h-4 mr-2" />
                  )}
                  Tạm dừng
                </Button>
              )}
              {product.status === 'inactive' && (
                <Button
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={handleActivate}
                  disabled={toggling}
                >
                  {toggling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Kích hoạt lại
                </Button>
              )}
              {/* Delete button - only for draft (hard delete) or non-suspended (soft delete) */}
              {product.status !== 'suspended' && product.status !== 'deleted' && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {product.status === 'draft' ? 'Xóa vĩnh viễn' : 'Xóa'}
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variant Edit Dialog */}
      {editingVariantId && (
        <VariantEditDialog
          productId={productId}
          variant={variants.find((v) => v.id === editingVariantId)!}
          onClose={() => setEditingVariantId(null)}
          onUpdated={() => {
            fetchProduct();
            onUpdated();
          }}
        />
      )}
    </>
  );
}
