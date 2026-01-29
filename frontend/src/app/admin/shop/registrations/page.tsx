'use client';

import { useState } from 'react';
import {
  type ShopRegistrationStatus,
} from '@/lib/api';
import { Loader2, Store, FileCheck, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RegistrationDetailModal } from '@/components/admin/RegistrationDetailModal';
import { useShopRegistrations } from '@/lib/hooks/useAdminData';

const statusLabels: Record<ShopRegistrationStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

const statusColors: Record<ShopRegistrationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function ShopRegistrationsPage() {
  const [statusFilter, setStatusFilter] = useState<ShopRegistrationStatus | 'all'>('all');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const { registrations, isLoading: loading, refresh: refreshRegistrations } = useShopRegistrations(statusFilter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingCount = registrations.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn đăng ký Shop</h1>
          <p className="text-sm text-gray-500 mt-1">
            Xem xét và duyệt đơn đăng ký shop mới
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                {pendingCount} đơn chờ duyệt
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === status
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {status === 'all' ? 'Tất cả' : statusLabels[status]}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {statusFilter === 'all'
              ? 'Chưa có đơn đăng ký nào'
              : `Không có đơn ${statusLabels[statusFilter as ShopRegistrationStatus].toLowerCase()}`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Tên Shop
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Liên hệ
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Giấy tờ
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Trạng thái
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Ngày đăng ký
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{reg.name}</p>
                        <p className="text-sm text-gray-500">{reg.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{reg.email}</p>
                    <p className="text-sm text-gray-500">{reg.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {reg.hasDocuments && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          <FileCheck className="w-3 h-3" />
                          Giấy tờ KD
                        </span>
                      )}
                      {reg.hasBrandDocuments && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                          <FileText className="w-3 h-3" />
                          Giấy ủy quyền
                        </span>
                      )}
                      {!reg.hasDocuments && !reg.hasBrandDocuments && (
                        <span className="text-sm text-gray-400">Không có</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        statusColors[reg.status]
                      }`}
                    >
                      {statusLabels[reg.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(reg.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingId(reg.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Xem
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {viewingId && (
        <RegistrationDetailModal
          registrationId={viewingId}
          onClose={() => setViewingId(null)}
          onUpdated={refreshRegistrations}
        />
      )}
    </div>
  );
}
