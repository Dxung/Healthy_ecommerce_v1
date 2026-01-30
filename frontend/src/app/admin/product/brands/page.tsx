'use client';

import { useState } from 'react';
import { apiClient, type BrandResponse, type ApiError } from '@/lib/api';
import { Loader2, Plus, Pencil, Trash2, Building2, Package, ToggleLeft, ToggleRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BrandFormModal } from '@/components/admin/BrandFormModal';
import { BrandDocumentRequirementsModal } from '@/components/admin/BrandDocumentRequirementsModal';
import { useBrands } from '@/lib/hooks/useAdminData';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type DialogAction =
  | { type: 'delete'; brand: BrandResponse }
  | { type: 'toggle'; brand: BrandResponse }
  | null;

export default function BrandManagementPage() {
  const { brands, isLoading: loading, refresh: refreshBrands } = useBrands();
  const [editingBrand, setEditingBrand] = useState<BrandResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [docRequirementsBrand, setDocRequirementsBrand] = useState<BrandResponse | null>(null);

  const handleDelete = async () => {
    if (dialogAction?.type !== 'delete') return;
    const { brand } = dialogAction;

    try {
      setIsProcessing(true);
      await apiClient.deleteBrand(brand.id);
      toast.success('Đã xóa thương hiệu vĩnh viễn');
      refreshBrands();
      setDialogAction(null);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa thương hiệu');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async () => {
    if (dialogAction?.type !== 'toggle') return;
    const { brand } = dialogAction;
    const action = brand.isActive ? 'tạm ẩn' : 'kích hoạt lại';

    try {
      setIsProcessing(true);
      await apiClient.updateBrand(brand.id, { isActive: !brand.isActive });
      toast.success(`Đã ${action} thương hiệu`);
      refreshBrands();
      setDialogAction(null);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || `Không thể ${action} thương hiệu`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thương hiệu</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các thương hiệu sản phẩm trên hệ thống
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm thương hiệu
        </Button>
      </div>

      {/* Brands List */}
      {brands.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có thương hiệu nào</p>
          <Button onClick={() => setIsCreating(true)} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Thêm thương hiệu đầu tiên
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Thương hiệu
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Mô tả
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">
                  Sản phẩm
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
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="w-10 h-10 rounded object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-gray-500">{brand.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600 truncate max-w-xs">
                      {brand.description || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded">
                      <Package className="w-3 h-3" />
                      {brand.productCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        brand.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {brand.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(brand.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDocRequirementsBrand(brand)}
                        title="Yêu cầu giấy tờ Official"
                      >
                        <FileText className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingBrand(brand)}
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDialogAction({ type: 'toggle', brand })}
                        title={brand.isActive ? 'Tạm ẩn thương hiệu' : 'Kích hoạt lại'}
                      >
                        {brand.isActive ? (
                          <ToggleRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-yellow-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDialogAction({ type: 'delete', brand })}
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingBrand && (
        <BrandFormModal
          brand={editingBrand}
          onClose={() => setEditingBrand(null)}
          onUpdated={refreshBrands}
        />
      )}

      {/* Create Modal */}
      {isCreating && (
        <BrandFormModal
          brand={null}
          onClose={() => setIsCreating(false)}
          onUpdated={refreshBrands}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={dialogAction?.type === 'delete'}
        onOpenChange={(open) => !open && setDialogAction(null)}
        title={`Xóa vĩnh viễn thương hiệu "${dialogAction?.type === 'delete' ? dialogAction.brand.name : ''}"?`}
        description={
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Hành động này <strong>KHÔNG THỂ</strong> hoàn tác</li>
            <li>Sản phẩm hiện có vẫn giữ thương hiệu này nhưng người mua sẽ không thể tìm thấy</li>
            <li>Bạn có thể tạo thương hiệu mới với cùng tên/slug sau khi xóa</li>
          </ul>
        }
        variant="danger"
        confirmText="Xóa vĩnh viễn"
        onConfirm={handleDelete}
        loading={isProcessing}
      />

      {/* Toggle Confirmation Dialog */}
      <ConfirmDialog
        open={dialogAction?.type === 'toggle'}
        onOpenChange={(open) => !open && setDialogAction(null)}
        title={
          dialogAction?.type === 'toggle'
            ? dialogAction.brand.isActive
              ? `Tạm ẩn thương hiệu "${dialogAction.brand.name}"?`
              : `Kích hoạt lại thương hiệu "${dialogAction.brand.name}"?`
            : ''
        }
        description={
          dialogAction?.type === 'toggle' && dialogAction.brand.isActive ? (
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Thương hiệu sẽ không hiển thị trên trang chính</li>
              <li>Bạn có thể kích hoạt lại bất cứ lúc nào</li>
              <li>Không thể tạo thương hiệu mới với cùng tên/slug</li>
            </ul>
          ) : (
            <p className="text-gray-600">Thương hiệu sẽ được hiển thị lại trên trang chính.</p>
          )
        }
        variant="warning"
        confirmText={dialogAction?.type === 'toggle' && dialogAction.brand.isActive ? 'Tạm ẩn' : 'Kích hoạt lại'}
        onConfirm={handleToggleActive}
        loading={isProcessing}
      />

      {/* Document Requirements Modal */}
      {docRequirementsBrand && (
        <BrandDocumentRequirementsModal
          brand={docRequirementsBrand}
          onClose={() => setDocRequirementsBrand(null)}
        />
      )}
    </div>
  );
}
