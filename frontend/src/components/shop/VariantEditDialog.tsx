'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  apiClient,
  type ProductVariantResponse,
  type UpdateProductVariantRequest,
  type ApiError,
} from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VariantEditDialogProps {
  productId: string;
  variant: ProductVariantResponse;
  onClose: () => void;
  onUpdated: () => void;
}

export function VariantEditDialog({
  productId,
  variant,
  onClose,
  onUpdated,
}: VariantEditDialogProps) {
  const [name, setName] = useState(variant.name);
  const [sku, setSku] = useState(variant.sku || '');
  const [price, setPrice] = useState(String(variant.price));
  const [compareAtPrice, setCompareAtPrice] = useState(
    variant.compareAtPrice ? String(variant.compareAtPrice) : ''
  );
  const [stockQuantity, setStockQuantity] = useState(String(variant.stockQuantity));
  const [imageUrl, setImageUrl] = useState(variant.imageUrl || '');
  const [isActive, setIsActive] = useState(variant.isActive);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Giá phải là số dương');
      return;
    }

    const stockNum = parseInt(stockQuantity);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Số lượng tồn kho không hợp lệ');
      return;
    }

    try {
      setSubmitting(true);

      const updateData: UpdateProductVariantRequest = {};

      if (name !== variant.name) updateData.name = name.trim();
      if (sku !== (variant.sku || '')) updateData.sku = sku.trim() || null;
      if (priceNum !== variant.price) updateData.price = priceNum;

      const compareNum = compareAtPrice ? parseFloat(compareAtPrice) : null;
      if (compareNum !== variant.compareAtPrice)
        updateData.compareAtPrice = compareNum;

      if (stockNum !== variant.stockQuantity) updateData.stockQuantity = stockNum;

      if (imageUrl !== (variant.imageUrl || ''))
        updateData.imageUrl = imageUrl.trim() || null;

      if (isActive !== variant.isActive) updateData.isActive = isActive;

      // Only call API if there are changes
      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      await apiClient.updateProductVariant(productId, variant.id, updateData);
      toast.success('Đã cập nhật biến thể');
      onUpdated();
      onClose();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể cập nhật biến thể');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa biến thể</DialogTitle>
          <DialogDescription>Cập nhật thông tin biến thể sản phẩm</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên biến thể *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Hộp 500g, Chai 1L..."
            />
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Giá bán (VND) *</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Giá so sánh</Label>
              <Input
                id="compareAtPrice"
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="Giá gốc (tùy chọn)"
              />
            </div>
          </div>

          {/* Stock & SKU Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Tồn kho *</Label>
              <Input
                id="stockQuantity"
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Mã SKU"
                className="font-mono"
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL hình ảnh</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-sm text-gray-500">Xem trước</span>
              </div>
            )}
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="isActive" className="font-normal cursor-pointer">
              Kích hoạt biến thể này (cho phép mua)
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Hủy bỏ
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lưu thay đổi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
