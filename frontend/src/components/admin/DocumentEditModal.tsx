'use client';

import { useState, useEffect } from 'react';
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
import { apiClient, type DocumentTypeResponse, type ApiError } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentEditModalProps {
  document: DocumentTypeResponse | null; // null = creating new
  onClose: () => void;
  onUpdated: () => void;
}

export function DocumentEditModal({
  document,
  onClose,
  onUpdated,
}: DocumentEditModalProps) {
  const isCreating = document === null;

  const [name, setName] = useState(document?.name || '');
  const [description, setDescription] = useState(document?.description || '');
  const [sampleImageUrl, setSampleImageUrl] = useState(document?.sampleImageUrl || '');
  const [submitting, setSubmitting] = useState(false);

  // Track if any changes were made (for edit mode)
  const hasChanges = isCreating
    ? name.trim() !== ''
    : name !== document?.name ||
      description !== (document?.description || '') ||
      sampleImageUrl !== (document?.sampleImageUrl || '');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên giấy tờ');
      return;
    }

    if (!hasChanges) {
      onClose();
      return;
    }

    try {
      setSubmitting(true);

      if (isCreating) {
        await apiClient.createDocumentType({
          name: name.trim(),
          description: description.trim() || undefined,
          sampleImageUrl: sampleImageUrl.trim() || undefined,
        });
        toast.success('Đã tạo giấy tờ mới');
      } else {
        // Only send changed fields
        const updateData: {
          name?: string;
          description?: string | null;
          sampleImageUrl?: string | null;
        } = {};

        if (name !== document?.name) {
          updateData.name = name.trim();
        }
        if (description !== (document?.description || '')) {
          updateData.description = description.trim() || null;
        }
        if (sampleImageUrl !== (document?.sampleImageUrl || '')) {
          updateData.sampleImageUrl = sampleImageUrl.trim() || null;
        }

        await apiClient.updateDocumentType(document!.id, updateData);
        toast.success('Đã cập nhật giấy tờ');
      }

      onUpdated();
      onClose();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể lưu giấy tờ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Thêm giấy tờ mới' : 'Chỉnh sửa giấy tờ'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Tạo loại giấy tờ mới cho yêu cầu xác minh shop'
              : 'Cập nhật thông tin giấy tờ'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên giấy tờ *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Giấy phép kinh doanh"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết về giấy tờ này..."
              className="w-full min-h-[80px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Sample Image URL */}
          <div className="space-y-2">
            <Label htmlFor="sampleImageUrl">URL hình ảnh mẫu</Label>
            <Input
              id="sampleImageUrl"
              value={sampleImageUrl}
              onChange={(e) => setSampleImageUrl(e.target.value)}
              placeholder="https://example.com/sample.jpg"
            />
          </div>

          {/* Metadata (only for edit mode) */}
          {!isCreating && document && (
            <div className="pt-4 border-t space-y-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Ngày tạo:</span>
                <span>{formatDate(document.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày cập nhật:</span>
                <span>{formatDate(document.updatedAt)}</span>
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
