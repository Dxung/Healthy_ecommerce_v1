'use client';

import { useState } from 'react';
import { apiClient, type DietTagResponse, type ApiError } from '@/lib/api';
import { Loader2, Plus, Pencil, Trash2, Leaf, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DietTagFormModal } from '@/components/admin/DietTagFormModal';
import { useDietTags } from '@/lib/hooks/useAdminData';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type DialogAction =
  | { type: 'delete'; dietTag: DietTagResponse }
  | { type: 'toggle'; dietTag: DietTagResponse }
  | null;

export default function DietTagManagementPage() {
  const { dietTags, isLoading: loading, refresh: refreshDietTags } = useDietTags();
  const [editingDietTag, setEditingDietTag] = useState<DietTagResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async () => {
    if (dialogAction?.type !== 'delete') return;
    const { dietTag } = dialogAction;

    try {
      setIsProcessing(true);
      await apiClient.deleteDietTag(dietTag.id);
      toast.success('Đã xóa nhãn chế độ ăn vĩnh viễn');
      refreshDietTags();
      setDialogAction(null);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa nhãn chế độ ăn');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async () => {
    if (dialogAction?.type !== 'toggle') return;
    const { dietTag } = dialogAction;
    const action = dietTag.isActive ? 'tạm ẩn' : 'kích hoạt lại';

    try {
      setIsProcessing(true);
      await apiClient.updateDietTag(dietTag.id, { isActive: !dietTag.isActive });
      toast.success(`Đã ${action} nhãn chế độ ăn`);
      refreshDietTags();
      setDialogAction(null);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || `Không thể ${action} nhãn chế độ ăn`);
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhãn chế độ ăn</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các nhãn chế độ ăn uống cho sản phẩm (Chay, Thuần chay, Keto, Low-carb...)
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm nhãn
        </Button>
      </div>

      {/* Diet Tags List */}
      {dietTags.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có nhãn chế độ ăn nào</p>
          <Button onClick={() => setIsCreating(true)} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhãn đầu tiên
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Tên nhãn
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Mô tả
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
              {dietTags.map((dietTag) => (
                <tr key={dietTag.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {dietTag.iconUrl ? (
                        <img
                          src={dietTag.iconUrl}
                          alt={dietTag.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <Leaf className="w-5 h-5 text-green-500" />
                      )}
                      <span className="font-medium text-gray-900">{dietTag.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-gray-500">{dietTag.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600 truncate max-w-xs">
                      {dietTag.description || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        dietTag.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {dietTag.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(dietTag.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDietTag(dietTag)}
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDialogAction({ type: 'toggle', dietTag })}
                        title={dietTag.isActive ? 'Tạm ẩn nhãn' : 'Kích hoạt lại'}
                      >
                        {dietTag.isActive ? (
                          <ToggleRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-yellow-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDialogAction({ type: 'delete', dietTag })}
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
      {editingDietTag && (
        <DietTagFormModal
          dietTag={editingDietTag}
          onClose={() => setEditingDietTag(null)}
          onUpdated={refreshDietTags}
        />
      )}

      {/* Create Modal */}
      {isCreating && (
        <DietTagFormModal
          dietTag={null}
          onClose={() => setIsCreating(false)}
          onUpdated={refreshDietTags}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={dialogAction?.type === 'delete'}
        onOpenChange={(open) => !open && setDialogAction(null)}
        title={`Xóa vĩnh viễn nhãn "${dialogAction?.type === 'delete' ? dialogAction.dietTag.name : ''}"?`}
        description={
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Hành động này <strong>KHÔNG THỂ</strong> hoàn tác</li>
            <li>Sản phẩm hiện có vẫn giữ nhãn này nhưng người mua sẽ không thể tìm theo nhãn</li>
            <li>Bạn có thể tạo nhãn mới với cùng tên/slug sau khi xóa</li>
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
            ? dialogAction.dietTag.isActive
              ? `Tạm ẩn nhãn "${dialogAction.dietTag.name}"?`
              : `Kích hoạt lại nhãn "${dialogAction.dietTag.name}"?`
            : ''
        }
        description={
          dialogAction?.type === 'toggle' && dialogAction.dietTag.isActive ? (
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Nhãn sẽ không hiển thị trên trang chính</li>
              <li>Bạn có thể kích hoạt lại bất cứ lúc nào</li>
              <li>Không thể tạo nhãn mới với cùng tên/slug</li>
            </ul>
          ) : (
            <p className="text-gray-600">Nhãn sẽ được hiển thị lại trên trang chính.</p>
          )
        }
        variant="warning"
        confirmText={dialogAction?.type === 'toggle' && dialogAction.dietTag.isActive ? 'Tạm ẩn' : 'Kích hoạt lại'}
        onConfirm={handleToggleActive}
        loading={isProcessing}
      />
    </div>
  );
}
