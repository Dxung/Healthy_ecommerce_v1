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
import {
  apiClient,
  type BrandResponse,
  type BrandDocumentRequirementResponse,
  type DocumentTypeResponse,
  type ApiError,
} from '@/lib/api';
import { Loader2, Plus, Trash2, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useBrandDocumentRequirements, useDocumentTypes } from '@/lib/hooks/useAdminData';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface BrandDocumentRequirementsModalProps {
  brand: BrandResponse;
  onClose: () => void;
}

export function BrandDocumentRequirementsModal({
  brand,
  onClose,
}: BrandDocumentRequirementsModalProps) {
  const { requirements, isLoading, refresh } = useBrandDocumentRequirements(brand.id);
  const { documentTypes, isLoading: loadingTypes } = useDocumentTypes();

  const [isAdding, setIsAdding] = useState(false);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingRequirement, setDeletingRequirement] = useState<BrandDocumentRequirementResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get document types that are not yet added to this brand
  const availableDocTypes = documentTypes.filter(
    (dt) => dt.isActive && !requirements.some((r) => r.documentTypeId === dt.id)
  );

  // Get document type name by ID
  const getDocTypeName = (docTypeId: string): string => {
    const docType = documentTypes.find((dt) => dt.id === docTypeId);
    return docType?.name || 'Không xác định';
  };

  const handleAddRequirement = async () => {
    if (!selectedDocTypeId) {
      toast.error('Vui lòng chọn loại giấy tờ');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.addBrandDocumentRequirement(brand.id, {
        documentTypeId: selectedDocTypeId,
      });
      toast.success('Đã thêm yêu cầu giấy tờ');
      refresh();
      setSelectedDocTypeId('');
      setIsAdding(false);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thêm yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequirement = async () => {
    if (!deletingRequirement) return;

    try {
      setIsDeleting(true);
      await apiClient.removeBrandDocumentRequirement(brand.id, deletingRequirement.id);
      toast.success('Đã xóa yêu cầu giấy tờ');
      refresh();
      setDeletingRequirement(null);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa yêu cầu');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Yêu cầu giấy tờ - {brand.name}
            </DialogTitle>
            <DialogDescription>
              Cấu hình các giấy tờ cần thiết để shop đăng ký làm đại lý chính hãng cho thương hiệu này
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Loading State */}
            {(isLoading || loadingTypes) ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Requirements List */}
                {requirements.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      Chưa có yêu cầu giấy tờ nào cho thương hiệu này
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Shop có thể đăng ký Official mà không cần giấy tờ
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {requirements.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {getDocTypeName(req.documentTypeId)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Thêm ngày: {formatDate(req.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingRequirement(req)}
                          title="Xóa yêu cầu"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Requirement */}
                {isAdding ? (
                  <div className="mt-4 p-4 border rounded-lg bg-white space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Chọn loại giấy tờ
                    </label>
                    {availableDocTypes.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        Tất cả loại giấy tờ đã được thêm
                      </p>
                    ) : (
                      <select
                        value={selectedDocTypeId}
                        onChange={(e) => setSelectedDocTypeId(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">-- Chọn loại giấy tờ --</option>
                        {availableDocTypes.map((dt) => (
                          <option key={dt.id} value={dt.id}>
                            {dt.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAdding(false);
                          setSelectedDocTypeId('');
                        }}
                        disabled={submitting}
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddRequirement}
                        disabled={submitting || !selectedDocTypeId}
                      >
                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Thêm
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setIsAdding(true)}
                    disabled={availableDocTypes.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm yêu cầu giấy tờ
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingRequirement}
        onOpenChange={(open) => !open && setDeletingRequirement(null)}
        title={`Xóa yêu cầu "${deletingRequirement ? getDocTypeName(deletingRequirement.documentTypeId) : ''}"?`}
        description="Shop sẽ không cần nộp loại giấy tờ này khi đăng ký làm đại lý chính hãng cho thương hiệu này."
        variant="danger"
        confirmText="Xóa"
        onConfirm={handleDeleteRequirement}
        loading={isDeleting}
      />
    </>
  );
}
