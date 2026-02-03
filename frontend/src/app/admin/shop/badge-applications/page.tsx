'use client';

import { useState, useEffect } from 'react';
import {
  apiClient,
  type BadgeApplicationResponse,
  type BadgeApplicationStatus,
  type ApiError,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Award,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { BadgeApplicationDetailModal } from '@/components/admin/BadgeApplicationDetailModal';

const statusConfig: Record<
  BadgeApplicationStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Chờ duyệt',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Clock className="w-4 h-4" />,
  },
  approved: {
    label: 'Đã duyệt',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  rejected: {
    label: 'Từ chối',
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-gray-100 text-gray-700',
    icon: <XCircle className="w-4 h-4" />,
  },
};

const typeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  verified: { label: 'Shop Xác thực', icon: <Shield className="w-4 h-4" /> },
  official: { label: 'Shop Chính hãng', icon: <Award className="w-4 h-4" /> },
};

export default function AdminBadgeApplicationsPage() {
  const [applications, setApplications] = useState<BadgeApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<BadgeApplicationStatus | 'all'>('pending');
  const [selectedType, setSelectedType] = useState<'verified' | 'official' | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus, selectedType, page]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getAdminBadgeApplications({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        type: selectedType === 'all' ? undefined : selectedType,
        page,
        limit,
      });
      setApplications(result.items);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải danh sách đơn đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (id: string) => {
    setSelectedApplicationId(id);
  };

  const handleCloseModal = () => {
    setSelectedApplicationId(null);
  };

  const handleActionComplete = () => {
    setSelectedApplicationId(null);
    fetchApplications();
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

  const getApplicationType = (badgeCode: string) => {
    if (badgeCode === 'approved') return 'verified';
    if (badgeCode === 'official') return 'official';
    return 'verified';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Đơn đăng ký Badge</h1>
        <p className="text-sm text-gray-500 mt-1">
          Xem và xử lý đơn đăng ký huy hiệu từ các shop
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Trạng thái:</span>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as BadgeApplicationStatus | 'all');
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Loại:</span>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value as 'verified' | 'official' | 'all');
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Tất cả</option>
            <option value="verified">Shop Xác thực</option>
            <option value="official">Shop Chính hãng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không có đơn đăng ký nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Shop
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Loại badge
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Thương hiệu
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  Ngày nộp
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">
                  Trạng thái
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applications.map((app) => {
                const status = statusConfig[app.status];
                const appType = getApplicationType(app.badgeCode);
                const type = typeConfig[appType];
                return (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {app.shopName || `Shop #${app.shopId.slice(0, 8)}`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {type.icon}
                        {type.label}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {app.brandName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${status.color}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewApplication(app.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedApplicationId && (
        <BadgeApplicationDetailModal
          applicationId={selectedApplicationId}
          onClose={handleCloseModal}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
}
