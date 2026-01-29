'use client';

import { useState } from 'react';
import { apiClient, type CategoryHierarchyResponse, type CategoryResponse, type ApiError } from '@/lib/api';
import { Loader2, Plus, Pencil, Trash2, FolderTree, ChevronDown, ChevronRight, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CategoryFormModal } from '@/components/admin/CategoryFormModal';
import { useCategoryHierarchy, useCategories } from '@/lib/hooks/useAdminData';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type DialogAction =
  | { type: 'delete'; category: CategoryHierarchyResponse }
  | { type: 'toggle'; category: CategoryHierarchyResponse }
  | null;

interface CategoryTreeItemProps {
  category: CategoryHierarchyResponse;
  level: number;
  onEdit: (category: CategoryHierarchyResponse) => void;
  onToggle: (category: CategoryHierarchyResponse) => void;
  onDelete: (category: CategoryHierarchyResponse) => void;
  allCategories: CategoryResponse[];
  isParentHidden?: boolean;
}

function CategoryTreeItem({ category, level, onEdit, onToggle, onDelete, allCategories, isParentHidden = false }: CategoryTreeItemProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = category.children && category.children.length > 0;

  // Count total descendants
  const countDescendants = (cat: CategoryHierarchyResponse): number => {
    if (!cat.children || cat.children.length === 0) return 0;
    return cat.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
  };
  const descendantCount = countDescendants(category);

  // Check if this category is effectively hidden (parent is hidden)
  const isEffectivelyHidden = isParentHidden;

  return (
    <div>
      <div
        className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg ${
          level > 0 ? 'ml-6' : ''
        } ${isEffectivelyHidden ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}

          {category.iconUrl ? (
            <img
              src={category.iconUrl}
              alt={category.name}
              className="w-8 h-8 rounded object-cover"
            />
          ) : (
            <FolderTree className="w-5 h-5 text-blue-500" />
          )}

          <div>
            <span className="font-medium text-gray-900">{category.name}</span>
            <span className="ml-2 text-xs text-gray-400 font-mono">{category.slug}</span>
          </div>

          <span
            className={`ml-2 inline-flex px-2 py-0.5 text-xs font-medium rounded ${
              isEffectivelyHidden
                ? 'bg-gray-100 text-gray-500'
                : category.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {isEffectivelyHidden
              ? 'Cha đang ẩn'
              : category.isActive
                ? 'Hoạt động'
                : 'Tạm ẩn'}
          </span>

          {category.productCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded">
              <Package className="w-3 h-3" />
              {category.productCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)} title="Chỉnh sửa">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(category)}
            title={category.isActive ? 'Tạm ẩn' : 'Kích hoạt'}
          >
            {category.isActive ? (
              <ToggleRight className="w-4 h-4 text-green-500" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-yellow-500" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            title="Xóa vĩnh viễn"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="border-l border-gray-200 ml-6">
          {category.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onToggle={onToggle}
              onDelete={onDelete}
              allCategories={allCategories}
              isParentHidden={isParentHidden || !category.isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryManagementPage() {
  const { hierarchy, isLoading: loadingHierarchy, refresh: refreshHierarchy } = useCategoryHierarchy();
  const { categories: allCategories, isLoading: loadingCategories, refresh: refreshCategories } = useCategories();
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loading = loadingHierarchy || loadingCategories;

  const refreshAll = () => {
    refreshHierarchy();
    refreshCategories();
  };

  // Count total descendants for a category
  const countDescendants = (cat: CategoryHierarchyResponse): number => {
    if (!cat.children || cat.children.length === 0) return 0;
    return cat.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
  };

  // Count only ACTIVE descendants for a category
  const countActiveDescendants = (cat: CategoryHierarchyResponse): number => {
    if (!cat.children || cat.children.length === 0) return 0;
    return cat.children.reduce((sum, child) => {
      const childCount = child.isActive ? 1 : 0;
      return sum + childCount + countActiveDescendants(child);
    }, 0);
  };

  const handleDelete = async () => {
    if (dialogAction?.type !== 'delete') return;
    const { category } = dialogAction;

    try {
      setIsProcessing(true);
      await apiClient.deleteCategory(category.id);
      const descendantCount = countDescendants(category);
      const totalDeleted = 1 + descendantCount;
      toast.success(`Đã xóa ${totalDeleted} danh mục`);
      refreshAll();
      setDialogAction(null);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa danh mục');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggle = async () => {
    if (dialogAction?.type !== 'toggle') return;
    const { category } = dialogAction;

    try {
      setIsProcessing(true);
      if (category.isActive) {
        await apiClient.deactivateCategory(category.id);
        toast.success(`Đã tạm ẩn danh mục "${category.name}"`);
      } else {
        await apiClient.activateCategory(category.id);
        toast.success(`Đã kích hoạt danh mục "${category.name}"`);
      }
      refreshAll();
      setDialogAction(null);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thay đổi trạng thái danh mục');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (category: CategoryHierarchyResponse) => {
    const flatCategory = allCategories.find((c) => c.id === category.id);
    if (flatCategory) {
      setEditingCategory(flatCategory);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý phân loại sản phẩm theo cây danh mục (tối đa 3 cấp)
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Category Tree */}
      {hierarchy.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có danh mục nào</p>
          <Button onClick={() => setIsCreating(true)} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Thêm danh mục đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Tổng: {allCategories.length} danh mục</span>
            <span>|</span>
            <span>Cấp 1: {hierarchy.length}</span>
          </div>
          {/* Each root category in its own section */}
          {hierarchy.map((category) => (
            <div key={category.id} className="bg-white rounded-lg border p-4">
              <CategoryTreeItem
                category={category}
                level={0}
                onEdit={handleEdit}
                onToggle={(cat) => setDialogAction({ type: 'toggle', category: cat })}
                onDelete={(cat) => setDialogAction({ type: 'delete', category: cat })}
                allCategories={allCategories}
              />
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <CategoryFormModal
          category={editingCategory}
          allCategories={allCategories.filter((c) => c.id !== editingCategory.id)}
          onClose={() => setEditingCategory(null)}
          onUpdated={refreshAll}
        />
      )}

      {/* Create Modal */}
      {isCreating && (
        <CategoryFormModal
          category={null}
          allCategories={allCategories}
          onClose={() => setIsCreating(false)}
          onUpdated={refreshAll}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={dialogAction?.type === 'delete'}
        onOpenChange={(open) => !open && setDialogAction(null)}
        title={`Xóa danh mục "${dialogAction?.type === 'delete' ? dialogAction.category.name : ''}"?`}
        description={
          dialogAction?.type === 'delete' && countDescendants(dialogAction.category) > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>
                Danh mục này có <strong>{countDescendants(dialogAction.category)}</strong> danh mục con
              </li>
              <li>Tất cả danh mục con cũng sẽ bị xóa</li>
              <li>Hành động này <strong>KHÔNG THỂ</strong> hoàn tác</li>
              <li>Sản phẩm hiện có vẫn giữ danh mục nhưng người mua sẽ không thể tìm theo danh mục</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Hành động này <strong>KHÔNG THỂ</strong> hoàn tác</li>
              <li>Sản phẩm hiện có vẫn giữ danh mục nhưng người mua sẽ không thể tìm theo danh mục</li>
            </ul>
          )
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
            ? dialogAction.category.isActive
              ? `Tạm ẩn danh mục "${dialogAction.category.name}"?`
              : `Kích hoạt danh mục "${dialogAction.category.name}"?`
            : ''
        }
        description={
          dialogAction?.type === 'toggle' ? (
            dialogAction.category.isActive ? (
              // Hiding parent - count active children that will be hidden
              countActiveDescendants(dialogAction.category) > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Danh mục sẽ không hiển thị trên trang chính</li>
                  <li>
                    <strong>{countActiveDescendants(dialogAction.category)}</strong> danh mục con đang hoạt động sẽ bị ẩn theo (vì cha ẩn)
                  </li>
                  <li>Danh mục con vẫn giữ trạng thái gốc, bạn có thể chỉnh sửa trước khi kích hoạt lại cha</li>
                  <li>Bạn có thể kích hoạt lại bất cứ lúc nào</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Danh mục sẽ không hiển thị trên trang chính</li>
                  <li>Bạn có thể kích hoạt lại bất cứ lúc nào</li>
                </ul>
              )
            ) : (
              // Activating parent - count active children that will become visible
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Danh mục sẽ được hiển thị lại trên trang chính</li>
                {countActiveDescendants(dialogAction.category) > 0 && (
                  <li>
                    <strong>{countActiveDescendants(dialogAction.category)}</strong> danh mục con đang hoạt động cũng sẽ hiển thị
                  </li>
                )}
              </ul>
            )
          ) : null
        }
        variant="warning"
        confirmText={
          dialogAction?.type === 'toggle' && dialogAction.category.isActive ? 'Tạm ẩn' : 'Kích hoạt'
        }
        onConfirm={handleToggle}
        loading={isProcessing}
      />
    </div>
  );
}
