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
import { apiClient, type CategoryResponse, type ApiError } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryFormModalProps {
  category: CategoryResponse | null;
  allCategories: CategoryResponse[];
  onClose: () => void;
  onUpdated: () => void;
}

export function CategoryFormModal({
  category,
  allCategories,
  onClose,
  onUpdated,
}: CategoryFormModalProps) {
  const isCreating = category === null;

  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!isCreating);
  const [iconUrl, setIconUrl] = useState(category?.iconUrl || '');
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder || 0));
  const [submitting, setSubmitting] = useState(false);

  // Cascading parent category selection (DB uses levels 1, 2, 3)
  const getInitialParentLevel1 = () => {
    if (!category?.parentId) return '';
    const parent = allCategories.find((c) => c.id === category.parentId);
    if (!parent) return '';
    if (parent.level === 1) return parent.id;
    // Parent is level 2, find its parent (level 1)
    if (parent.level === 2) return parent.parentId || '';
    return '';
  };

  const getInitialParentLevel2 = () => {
    if (!category?.parentId) return '';
    const parent = allCategories.find((c) => c.id === category.parentId);
    if (!parent) return '';
    if (parent.level === 2) return parent.id;
    return '';
  };

  const [parentLevel1, setParentLevel1] = useState(getInitialParentLevel1);
  const [parentLevel2, setParentLevel2] = useState(getInitialParentLevel2);

  // Filter categories by level (DB uses levels 1, 2, 3)
  const categoriesLevel1 = allCategories.filter((c) => c.level === 1 && c.isActive);
  const categoriesLevel2 = allCategories.filter(
    (c) => c.level === 2 && c.parentId === parentLevel1 && c.isActive
  );

  // Get final parent ID (deepest selected)
  const getFinalParentId = () => {
    if (parentLevel2) return parentLevel2;
    if (parentLevel1) return parentLevel1;
    return '';
  };

  // Handlers for cascading selection
  const handleParentLevel1Change = (value: string) => {
    setParentLevel1(value);
    setParentLevel2('');
  };

  const hasChanges = isCreating
    ? name.trim() !== ''
    : name !== category?.name ||
      slug !== category?.slug ||
      iconUrl !== (category?.iconUrl || '') ||
      getFinalParentId() !== (category?.parentId || '') ||
      sortOrder !== String(category?.sortOrder || 0);

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
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    if (!hasChanges) {
      onClose();
      return;
    }

    try {
      setSubmitting(true);

      if (isCreating) {
        await apiClient.createCategory({
          name: name.trim(),
          slug: slug.trim() || undefined,
          iconUrl: iconUrl.trim() || undefined,
          parentId: getFinalParentId() || undefined,
          sortOrder: parseInt(sortOrder) || 0,
        });
        toast.success('Đã tạo danh mục mới');
      } else {
        const updateData: {
          name?: string;
          slug?: string;
          iconUrl?: string | null;
          sortOrder?: number;
        } = {};

        if (name !== category?.name) {
          updateData.name = name.trim();
        }
        if (slug !== category?.slug) {
          updateData.slug = slug.trim();
        }
        if (iconUrl !== (category?.iconUrl || '')) {
          updateData.iconUrl = iconUrl.trim() || null;
        }
        if (sortOrder !== String(category?.sortOrder || 0)) {
          updateData.sortOrder = parseInt(sortOrder) || 0;
        }

        await apiClient.updateCategory(category!.id, updateData);
        toast.success('Đã cập nhật danh mục');
      }

      onUpdated();
      onClose();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Tạo danh mục phân loại sản phẩm mới'
              : 'Cập nhật thông tin danh mục'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên danh mục *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Thực phẩm hữu cơ, Đồ uống..."
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="VD: thuc-pham-huu-co..."
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Tự động tạo từ tên, hoặc nhập thủ công
            </p>
          </div>

          {/* Parent Category - Cascading Dropdowns */}
          <div className="space-y-2">
            <Label>Danh mục cha</Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Level 1 Parent */}
              <select
                value={parentLevel1}
                onChange={(e) => handleParentLevel1Change(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Danh mục gốc (Cấp 1)</option>
                {categoriesLevel1.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Level 2 Parent */}
              <select
                value={parentLevel2}
                onChange={(e) => setParentLevel2(e.target.value)}
                disabled={!parentLevel1 || categoriesLevel2.length === 0}
                className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!parentLevel1
                    ? 'Chọn cấp 1 trước'
                    : categoriesLevel2.length === 0
                    ? 'Không có danh mục cấp 2'
                    : 'Chọn danh mục cấp 2'}
                </option>
                {categoriesLevel2.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500">
              {!parentLevel1
                ? 'Danh mục mới sẽ là Cấp 1 (gốc)'
                : !parentLevel2
                ? 'Danh mục mới sẽ là Cấp 2'
                : 'Danh mục mới sẽ là Cấp 3'}
            </p>
          </div>

          {/* Icon URL */}
          <div className="space-y-2">
            <Label htmlFor="iconUrl">URL icon</Label>
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
                  className="w-10 h-10 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-sm text-gray-500">Xem trước</span>
              </div>
            )}
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
            <Input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
              className="w-24"
            />
            <p className="text-xs text-gray-500">
              Số nhỏ hơn sẽ hiển thị trước
            </p>
          </div>

          {/* Metadata (only for edit mode) */}
          {!isCreating && category && (
            <div className="pt-4 border-t space-y-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Cấp:</span>
                <span>Cấp {category.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Số sản phẩm:</span>
                <span>{category.productCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày tạo:</span>
                <span>{formatDate(category.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày cập nhật:</span>
                <span>{formatDate(category.updatedAt)}</span>
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
