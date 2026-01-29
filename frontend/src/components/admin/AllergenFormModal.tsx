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
import { apiClient, type AllergenTagResponse, type ApiError } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AllergenFormModalProps {
  allergen: AllergenTagResponse | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function AllergenFormModal({ allergen, onClose, onUpdated }: AllergenFormModalProps) {
  const isCreating = allergen === null;

  const [name, setName] = useState(allergen?.name || '');
  const [slug, setSlug] = useState(allergen?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!isCreating);
  const [description, setDescription] = useState(allergen?.description || '');
  const [iconUrl, setIconUrl] = useState(allergen?.iconUrl || '');
  const [submitting, setSubmitting] = useState(false);

  const hasChanges = isCreating
    ? name.trim() !== ''
    : name !== allergen?.name ||
      slug !== allergen?.slug ||
      description !== (allergen?.description || '') ||
      iconUrl !== (allergen?.iconUrl || '');

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
      toast.error('Vui lòng nhập tên nhãn');
      return;
    }

    if (!hasChanges) {
      onClose();
      return;
    }

    try {
      setSubmitting(true);

      if (isCreating) {
        await apiClient.createAllergenTag({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          iconUrl: iconUrl.trim() || undefined,
        });
        toast.success('Đã tạo nhãn dị ứng mới');
      } else {
        const updateData: {
          name?: string;
          slug?: string;
          description?: string | null;
          iconUrl?: string | null;
        } = {};

        if (name !== allergen?.name) {
          updateData.name = name.trim();
        }
        if (slug !== allergen?.slug) {
          updateData.slug = slug.trim();
        }
        if (description !== (allergen?.description || '')) {
          updateData.description = description.trim() || null;
        }
        if (iconUrl !== (allergen?.iconUrl || '')) {
          updateData.iconUrl = iconUrl.trim() || null;
        }

        await apiClient.updateAllergenTag(allergen!.id, updateData);
        toast.success('Đã cập nhật nhãn dị ứng');
      }

      onUpdated();
      onClose();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể lưu nhãn dị ứng');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Thêm nhãn dị ứng mới' : 'Chỉnh sửa nhãn dị ứng'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Tạo nhãn cảnh báo dị ứng mới cho sản phẩm'
              : 'Cập nhật thông tin nhãn dị ứng'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên nhãn *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Đậu phộng, Gluten, Sữa..."
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="VD: dau-phong, gluten, sua..."
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
              placeholder="Mô tả chi tiết về chất gây dị ứng..."
              className="w-full min-h-[80px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Icon URL */}
          <div className="space-y-2">
            <Label htmlFor="iconUrl">URL biểu tượng</Label>
            <Input
              id="iconUrl"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://example.com/icon.png"
            />
            {iconUrl && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <img
                  src={iconUrl}
                  alt="Preview"
                  className="w-8 h-8 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-sm text-gray-500">Xem trước</span>
              </div>
            )}
          </div>

          {/* Metadata (only for edit mode) */}
          {!isCreating && allergen && (
            <div className="pt-4 border-t space-y-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Ngày tạo:</span>
                <span>{formatDate(allergen.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày cập nhật:</span>
                <span>{formatDate(allergen.updatedAt)}</span>
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
