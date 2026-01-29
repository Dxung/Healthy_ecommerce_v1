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
import { apiClient, type DietTagResponse, type ApiError } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DietTagFormModalProps {
  dietTag: DietTagResponse | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function DietTagFormModal({ dietTag, onClose, onUpdated }: DietTagFormModalProps) {
  const isCreating = dietTag === null;

  const [name, setName] = useState(dietTag?.name || '');
  const [slug, setSlug] = useState(dietTag?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!isCreating);
  const [description, setDescription] = useState(dietTag?.description || '');
  const [iconUrl, setIconUrl] = useState(dietTag?.iconUrl || '');
  const [submitting, setSubmitting] = useState(false);

  const hasChanges = isCreating
    ? name.trim() !== ''
    : name !== dietTag?.name ||
      slug !== dietTag?.slug ||
      description !== (dietTag?.description || '') ||
      iconUrl !== (dietTag?.iconUrl || '');

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
        await apiClient.createDietTag({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          iconUrl: iconUrl.trim() || undefined,
        });
        toast.success('Đã tạo nhãn chế độ ăn mới');
      } else {
        const updateData: {
          name?: string;
          slug?: string;
          description?: string | null;
          iconUrl?: string | null;
        } = {};

        if (name !== dietTag?.name) {
          updateData.name = name.trim();
        }
        if (slug !== dietTag?.slug) {
          updateData.slug = slug.trim();
        }
        if (description !== (dietTag?.description || '')) {
          updateData.description = description.trim() || null;
        }
        if (iconUrl !== (dietTag?.iconUrl || '')) {
          updateData.iconUrl = iconUrl.trim() || null;
        }

        await apiClient.updateDietTag(dietTag!.id, updateData);
        toast.success('Đã cập nhật nhãn chế độ ăn');
      }

      onUpdated();
      onClose();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể lưu nhãn chế độ ăn');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Thêm nhãn chế độ ăn mới' : 'Chỉnh sửa nhãn chế độ ăn'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Tạo nhãn chế độ ăn uống mới cho sản phẩm'
              : 'Cập nhật thông tin nhãn chế độ ăn'}
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
              placeholder="VD: Chay, Thuần chay, Keto, Low-carb..."
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="VD: chay, thuan-chay, keto..."
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
              placeholder="Mô tả chi tiết về chế độ ăn..."
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
          {!isCreating && dietTag && (
            <div className="pt-4 border-t space-y-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Ngày tạo:</span>
                <span>{formatDate(dietTag.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày cập nhật:</span>
                <span>{formatDate(dietTag.updatedAt)}</span>
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
