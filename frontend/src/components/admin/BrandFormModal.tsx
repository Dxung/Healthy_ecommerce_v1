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
import { apiClient, type BrandResponse, type ApiError } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BrandFormModalProps {
  brand: BrandResponse | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function BrandFormModal({ brand, onClose, onUpdated }: BrandFormModalProps) {
  const isCreating = brand === null;

  const [name, setName] = useState(brand?.name || '');
  const [slug, setSlug] = useState(brand?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!isCreating);
  const [description, setDescription] = useState(brand?.description || '');
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl || '');
  const [submitting, setSubmitting] = useState(false);

  const hasChanges = isCreating
    ? name.trim() !== ''
    : name !== brand?.name ||
      slug !== brand?.slug ||
      description !== (brand?.description || '') ||
      logoUrl !== (brand?.logoUrl || '');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (isCreating && !slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugManuallyEdited(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên thương hiệu');
      return;
    }

    if (!hasChanges) {
      onClose();
      return;
    }

    try {
      setSubmitting(true);

      if (isCreating) {
        await apiClient.createBrand({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          logoUrl: logoUrl.trim() || undefined,
        });
        toast.success('Đã tạo thương hiệu mới');
      } else {
        const updateData: {
          name?: string;
          slug?: string;
          description?: string | null;
          logoUrl?: string | null;
        } = {};

        if (name !== brand?.name) {
          updateData.name = name.trim();
        }
        if (slug !== brand?.slug) {
          updateData.slug = slug.trim();
        }
        if (description !== (brand?.description || '')) {
          updateData.description = description.trim() || null;
        }
        if (logoUrl !== (brand?.logoUrl || '')) {
          updateData.logoUrl = logoUrl.trim() || null;
        }

        await apiClient.updateBrand(brand!.id, updateData);
        toast.success('Đã cập nhật thương hiệu');
      }

      onUpdated();
      onClose();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể lưu thương hiệu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Thêm thương hiệu mới' : 'Chỉnh sửa thương hiệu'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Tạo thương hiệu sản phẩm mới trên hệ thống'
              : 'Cập nhật thông tin thương hiệu'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên thương hiệu *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Vinamilk, Nutifood, TH True Milk..."
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="VD: vinamilk, nutifood..."
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Tự động tạo từ tên, hoặc nhập thủ công
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả về thương hiệu..."
              className="w-full min-h-[80px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL logo</Label>
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            {logoUrl && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <img
                  src={logoUrl}
                  alt="Preview"
                  className="w-12 h-12 object-contain rounded border bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-sm text-gray-500">Xem trước</span>
              </div>
            )}
          </div>

          {/* Metadata (only for edit mode) */}
          {!isCreating && brand && (
            <div className="pt-4 border-t space-y-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Số sản phẩm:</span>
                <span>{brand.productCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày tạo:</span>
                <span>{formatDate(brand.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày cập nhật:</span>
                <span>{formatDate(brand.updatedAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Hủy bỏ
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
