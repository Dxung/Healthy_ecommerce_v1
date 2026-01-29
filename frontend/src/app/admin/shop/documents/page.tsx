'use client';

import { useState } from 'react';
import { apiClient, type DocumentTypeResponse, type ApiError } from '@/lib/api';
import { Loader2, Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DocumentEditModal } from '@/components/admin/DocumentEditModal';
import { useDocumentTypes } from '@/lib/hooks/useAdminData';

export default function DocumentManagementPage() {
  const { documentTypes: documents, isLoading: loading, refresh: refreshDocuments } = useDocumentTypes();
  const [editingDocument, setEditingDocument] = useState<DocumentTypeResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${name}"?`)) return;

    try {
      await apiClient.deleteDocumentType(id);
      toast.success('Đã xóa giấy tờ');
      refreshDocuments();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa giấy tờ');
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý giấy tờ</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các loại giấy tờ yêu cầu cho huy hiệu shop
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm giấy tờ
        </Button>
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có loại giấy tờ nào</p>
          <Button onClick={() => setIsCreating(true)} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Thêm giấy tờ đầu tiên
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Tên giấy tờ
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Huy hiệu áp dụng
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Trạng thái
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Ngày tạo
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        {doc.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {doc.appliedBadges && doc.appliedBadges.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {doc.appliedBadges.map((badge) => (
                          <span
                            key={badge}
                            className="inline-flex px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Chưa áp dụng</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        doc.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {doc.isActive ? 'Hoạt động' : 'Đã xóa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDocument(doc)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {doc.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id, doc.name)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingDocument && (
        <DocumentEditModal
          document={editingDocument}
          onClose={() => setEditingDocument(null)}
          onUpdated={refreshDocuments}
        />
      )}

      {/* Create Modal */}
      {isCreating && (
        <DocumentEditModal
          document={null}
          onClose={() => setIsCreating(false)}
          onUpdated={refreshDocuments}
        />
      )}
    </div>
  );
}
