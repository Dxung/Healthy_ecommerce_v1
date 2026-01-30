'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  apiClient,
  AdminUserDetailResponse,
  UserStatus,
} from '@/lib/api';
import { formatDate } from '@/lib/utils/time';

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
  active: {
    label: 'Hoạt động',
    className: 'bg-green-100 text-green-700',
  },
  suspended: {
    label: 'Đã khóa',
    className: 'bg-red-100 text-red-700',
  },
  deleted: {
    label: 'Đã xóa',
    className: 'bg-gray-100 text-gray-700',
  },
};

const genderLabels: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
  do_not_want_to_say: 'Không muốn tiết lộ',
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<AdminUserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getAdminUserById(userId);
        setUser(data);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleSuspendUser = async () => {
    if (!user || !suspendReason.trim()) return;

    setActionLoading(true);
    try {
      await apiClient.suspendUser(user.id, suspendReason);
      setUser({ ...user, status: 'suspended' });
      setSuspendDialog(false);
      setSuspendReason('');
    } catch (err: any) {
      alert(err.message || 'Không thể khóa tài khoản');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateUser = async () => {
    if (!user) return;
    if (!confirm('Bạn có chắc chắn muốn mở khóa tài khoản này?')) return;

    setActionLoading(true);
    try {
      await apiClient.activateUser(user.id);
      setUser({ ...user, status: 'active' });
    } catch (err: any) {
      alert(err.message || 'Không thể mở khóa tài khoản');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    setActionLoading(true);
    try {
      await apiClient.deleteUser(user.id);
      setUser({ ...user, status: 'deleted' });
      setDeleteDialog(false);
    } catch (err: any) {
      alert(err.message || 'Không thể xóa tài khoản');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Không tìm thấy người dùng'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết người dùng</h1>
            <p className="text-gray-600 mt-1">{user.username}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={user.avatarUrl || '/default-avatar.png'}
                  alt={user.username}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.fullName || user.username}
                </h2>
                <p className="text-gray-500">@{user.username}</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${
                    statusConfig[user.status]?.className || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {statusConfig[user.status]?.label || user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.email || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Số điện thoại</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.phoneNumber || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Ngày sinh</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.dateOfBirth
                      ? formatDate(user.dateOfBirth)
                      : 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Giới tính</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.gender
                      ? genderLabels[user.gender] || user.gender
                      : 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Ngày tham gia</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Cập nhật lần cuối</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động</h3>
          <div className="space-y-3">
            {user.status === 'active' && (
              <button
                onClick={() => setSuspendDialog(true)}
                disabled={actionLoading}
                className="w-full px-4 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserX className="w-4 h-4" />
                Khóa tài khoản
              </button>
            )}

            {user.status === 'suspended' && (
              <button
                onClick={handleActivateUser}
                disabled={actionLoading}
                className="w-full px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
                Mở khóa tài khoản
              </button>
            )}

            {user.status !== 'deleted' && (
              <button
                onClick={() => setDeleteDialog(true)}
                disabled={actionLoading}
                className="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Xóa tài khoản
              </button>
            )}

            {user.status === 'deleted' && (
              <p className="text-sm text-gray-500 text-center">
                Tài khoản đã bị xóa
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Suspend Dialog */}
      {suspendDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSuspendDialog(false)}
            />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Khóa tài khoản
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn đang khóa tài khoản <strong>{user.username}</strong>.
                Vui lòng nhập lý do:
              </p>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Nhập lý do khóa tài khoản..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setSuspendDialog(false);
                    setSuspendReason('');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSuspendUser}
                  disabled={!suspendReason.trim() || actionLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Khóa tài khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setDeleteDialog(false)}
            />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Xác nhận xóa tài khoản
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc chắn muốn xóa tài khoản <strong>{user.username}</strong>?
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteDialog(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xóa tài khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
