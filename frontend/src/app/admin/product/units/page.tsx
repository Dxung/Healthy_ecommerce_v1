'use client';

import { useState } from 'react';
import { apiClient, type UnitResponse, type ApiError, UnitCategory } from '@/lib/api';
import { Loader2, Plus, Pencil, Scale, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UnitFormModal } from '@/components/admin/UnitFormModal';
import { UnitConversionSection } from '@/components/admin/UnitConversionSection';
import { useUnits } from '@/lib/hooks/useAdminData';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function UnitManagementPage() {
  const { units, isLoading: loading, refresh: refreshUnits } = useUnits();
  const [editingUnit, setEditingUnit] = useState<UnitResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [togglingUnit, setTogglingUnit] = useState<UnitResponse | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<UnitResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleActive = async () => {
    if (!togglingUnit) return;

    try {
      setIsProcessing(true);
      if (togglingUnit.isActive) {
        await apiClient.deactivateUnit(togglingUnit.id);
        toast.success(`Đã vô hiệu hóa đơn vị "${togglingUnit.name}"`);
      } else {
        await apiClient.activateUnit(togglingUnit.id);
        toast.success(`Đã kích hoạt đơn vị "${togglingUnit.name}"`);
      }
      refreshUnits();
      setTogglingUnit(null);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thay đổi trạng thái đơn vị');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUnit = async () => {
    if (!deletingUnit) return;

    try {
      setIsProcessing(true);
      await apiClient.deleteUnit(deletingUnit.id);
      toast.success(`Đã xóa đơn vị "${deletingUnit.name}"`);
      refreshUnits();
      setDeletingUnit(null);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa đơn vị');
    } finally {
      setIsProcessing(false);
    }
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn vị đo lường</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý đơn vị đo lường cho sản phẩm (gram, kg, lít, ml...)
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm đơn vị
        </Button>
      </div>

      {/* Units List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Danh sách đơn vị</h2>
        </div>
        {units.length === 0 ? (
          <div className="p-8 text-center">
            <Scale className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có đơn vị nào</p>
            <Button onClick={() => setIsCreating(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Thêm đơn vị đầu tiên
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Tên đơn vị
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Ký hiệu
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">
                  Loại
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">
                  Đơn vị gốc
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">
                  Trạng thái
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Ngày cập nhật
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {units.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Scale className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{unit.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 text-sm font-mono bg-gray-100 text-gray-700 rounded">
                      {unit.symbol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        unit.category === UnitCategory.SELLING
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-cyan-100 text-cyan-700'
                      }`}
                    >
                      {unit.category === UnitCategory.SELLING ? 'Đơn vị bán' : 'Đo lường'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {unit.isBase ? (
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        Đơn vị gốc
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        unit.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {unit.isActive ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(unit.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUnit(unit)}
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTogglingUnit(unit)}
                        title={unit.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        {unit.isActive ? (
                          <ToggleRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-yellow-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingUnit(unit)}
                        title="Xóa đơn vị"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Unit Conversions Section */}
      <UnitConversionSection units={units} />

      {/* Edit Modal */}
      {editingUnit && (
        <UnitFormModal
          unit={editingUnit}
          onClose={() => setEditingUnit(null)}
          onUpdated={refreshUnits}
        />
      )}

      {/* Create Modal */}
      {isCreating && (
        <UnitFormModal
          unit={null}
          onClose={() => setIsCreating(false)}
          onUpdated={refreshUnits}
        />
      )}

      {/* Toggle Confirmation Dialog */}
      <ConfirmDialog
        open={togglingUnit !== null}
        onOpenChange={(open) => !open && setTogglingUnit(null)}
        title={
          togglingUnit
            ? togglingUnit.isActive
              ? `Vô hiệu hóa đơn vị "${togglingUnit.name}"?`
              : `Kích hoạt đơn vị "${togglingUnit.name}"?`
            : ''
        }
        description={
          togglingUnit?.isActive ? (
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Đơn vị sẽ không thể sử dụng khi tạo sản phẩm mới</li>
              <li>Sản phẩm hiện có vẫn giữ đơn vị này</li>
              <li>Bạn có thể kích hoạt lại bất cứ lúc nào</li>
            </ul>
          ) : (
            <p className="text-gray-600">Đơn vị sẽ được sử dụng khi tạo sản phẩm mới.</p>
          )
        }
        variant="warning"
        confirmText={togglingUnit?.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
        onConfirm={handleToggleActive}
        loading={isProcessing}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deletingUnit !== null}
        onOpenChange={(open) => !open && setDeletingUnit(null)}
        title={deletingUnit ? `Xóa đơn vị "${deletingUnit.name}"?` : ''}
        description={
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Đơn vị sẽ bị xóa khỏi hệ thống</li>
            <li>Sản phẩm đang sử dụng đơn vị này có thể bị ảnh hưởng</li>
            <li>Bạn có thể tạo lại đơn vị với ký hiệu tương tự sau này</li>
          </ul>
        }
        variant="danger"
        confirmText="Xóa đơn vị"
        onConfirm={handleDeleteUnit}
        loading={isProcessing}
      />
    </div>
  );
}
