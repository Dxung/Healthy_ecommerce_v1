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
import { apiClient, type UnitResponse, type ApiError, UnitCategory, UnitType } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UnitFormModalProps {
  unit: UnitResponse | null; // null = creating new
  onClose: () => void;
  onUpdated: () => void;
}

export function UnitFormModal({ unit, onClose, onUpdated }: UnitFormModalProps) {
  const isCreating = unit === null;

  const [name, setName] = useState(unit?.name || '');
  const [symbol, setSymbol] = useState(unit?.symbol || '');
  const [category, setCategory] = useState<UnitCategory>(unit?.category || UnitCategory.SELLING);
  const [type, setType] = useState<UnitType | ''>(unit?.type || '');
  const [isBase, setIsBase] = useState(unit?.isBase || false);
  const [submitting, setSubmitting] = useState(false);

  const hasChanges = isCreating
    ? name.trim() !== '' && symbol.trim() !== ''
    : name !== unit?.name || symbol !== unit?.symbol || category !== unit?.category || type !== (unit?.type || '');

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
      toast.error('Vui lòng nhập tên đơn vị');
      return;
    }
    if (!symbol.trim()) {
      toast.error('Vui lòng nhập ký hiệu');
      return;
    }

    if (!hasChanges && !isCreating) {
      onClose();
      return;
    }

    try {
      setSubmitting(true);

      if (isCreating) {
        await apiClient.createUnit({
          name: name.trim(),
          symbol: symbol.trim(),
          category,
          type: category === UnitCategory.MEASUREMENT && type ? type as UnitType : undefined,
          isBase,
        });
        toast.success('Đã tạo đơn vị mới');
      } else {
        const updateData: { name?: string; symbol?: string; category?: UnitCategory; type?: UnitType } = {};

        if (name !== unit?.name) {
          updateData.name = name.trim();
        }
        if (symbol !== unit?.symbol) {
          updateData.symbol = symbol.trim();
        }
        if (category !== unit?.category) {
          updateData.category = category;
        }
        if (type !== (unit?.type || '')) {
          updateData.type = type as UnitType;
        }

        await apiClient.updateUnit(unit!.id, updateData);
        toast.success('Đã cập nhật đơn vị');
      }

      onUpdated();
      onClose();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể lưu đơn vị');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Thêm đơn vị mới' : 'Chỉnh sửa đơn vị'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Tạo đơn vị đo lường mới cho sản phẩm'
              : 'Cập nhật thông tin đơn vị'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên đơn vị *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Kilogram, Gram, Lít..."
            />
          </div>

          {/* Symbol */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Ký hiệu *</Label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="VD: kg, g, L, ml..."
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Ký hiệu ngắn gọn để hiển thị bên cạnh số lượng
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Loại đơn vị *</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as UnitCategory);
                if (e.target.value === UnitCategory.SELLING) {
                  setType('');
                  setIsBase(false); // Đơn vị bán không thể là đơn vị gốc
                }
              }}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
            >
              <option value={UnitCategory.SELLING}>Đơn vị bán (Hộp, Gói, Chai...)</option>
              <option value={UnitCategory.MEASUREMENT}>Đơn vị đo lường (g, kg, ml, L...)</option>
            </select>
          </div>

          {/* Type (only for measurement) */}
          {category === UnitCategory.MEASUREMENT && (
            <div className="space-y-2">
              <Label htmlFor="type">Loại đo lường</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as UnitType | '')}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
              >
                <option value="">Chọn loại...</option>
                <option value={UnitType.WEIGHT}>Khối lượng (g, kg...)</option>
                <option value={UnitType.VOLUME}>Thể tích (ml, L...)</option>
              </select>
            </div>
          )}

          {/* Is Base (only for creating + measurement category) */}
          {isCreating && category === UnitCategory.MEASUREMENT && (
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isBase"
                checked={isBase}
                onChange={(e) => setIsBase(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isBase" className="font-normal cursor-pointer">
                Đây là đơn vị gốc (base unit)
              </Label>
            </div>
          )}

          {/* Is Base indicator (edit mode) */}
          {!isCreating && unit?.isBase && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                Đây là đơn vị gốc (base unit).
              </p>
            </div>
          )}

          {/* Metadata (only for edit mode) */}
          {!isCreating && unit && (
            <div className="pt-4 border-t space-y-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Ngày tạo:</span>
                <span>{formatDate(unit.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày cập nhật:</span>
                <span>{formatDate(unit.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <span className={unit.isActive ? 'text-green-600' : 'text-gray-500'}>
                  {unit.isActive ? 'Hoạt động' : 'Vô hiệu'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !name.trim() || !symbol.trim()}
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
