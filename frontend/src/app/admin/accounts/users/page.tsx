'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import {
  apiClient,
  AdminUserResponse,
  AdminUserListParams,
  UserStatus,
} from '@/lib/api';
import { formatDate } from '@/lib/utils/time';

// Status display config
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

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Dialogs
  const [suspendDialog, setSuspendDialog] = useState<{
    open: boolean;
    user: AdminUserResponse | null;
  }>({ open: false, user: null });
  const [suspendReason, setSuspendReason] = useState('');

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: AdminUserResponse | null;
  }>({ open: false, user: null });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: AdminUserListParams = {
        page,
        limit,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await apiClient.getAdminUsers(params);
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  // Handle suspend user
  const handleSuspendUser = async () => {
    if (!suspendDialog.user || !suspendReason.trim()) return;

    setActionLoading(suspendDialog.user.id);
    try {
      await apiClient.suspendUser(suspendDialog.user.id, suspendReason);
      setSuspendDialog({ open: false, user: null });
      setSuspendReason('');
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Không thể khóa tài khoản');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle activate user
  const handleActivateUser = async (user: AdminUserResponse) => {
    if (!confirm('Bạn có chắc chắn muốn mở khóa tài khoản này?')) return;

    setActionLoading(user.id);
    try {
      await apiClient.activateUser(user.id);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Không thể mở khóa tài khoản');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return;

    setActionLoading(deleteDialog.user.id);
    try {
      await apiClient.deleteUser(deleteDialog.user.id);
      setDeleteDialog({ open: false, user: null });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa tài khoản');
    } finally {
      setActionLoading(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside dropdown or action button
      if (target.closest('[data-dropdown]')) return;
      setActiveDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle row click to view user details
  const handleRowClick = (userId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking on the action button area
    const target = e.target as HTMLElement;
    if (target.closest('[data-dropdown]')) return;
    router.push(`/admin/accounts/users/${userId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Danh sách người dùng</h1>
        <p className="text-gray-600 mt-1">Quản lý tất cả tài khoản người dùng trong hệ thống</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm theo tên người dùng, số điện thoại, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="suspended">Đã khóa</option>
            <option value="deleted">Đã xóa</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-visible">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Không tìm thấy người dùng nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-t-lg overflow-y-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 rounded-t-lg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => handleRowClick(user.id, e)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Image
                              src={user.avatarUrl || '/default-avatar.png'}
                              alt={user.username}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.username}
                            </div>
                            {user.fullName && (
                              <div className="text-sm text-gray-500">
                                {user.fullName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phoneNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            statusConfig[user.status]?.className || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusConfig[user.status]?.label || user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative" data-dropdown>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(
                                activeDropdown === user.id ? null : user.id
                              );
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <MoreVertical className="w-5 h-5 text-gray-500" />
                            )}
                          </button>

                          {activeDropdown === user.id && (
                            <div
                              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                              data-dropdown
                            >
                              <button
                                onClick={() => {
                                  router.push(`/admin/accounts/users/${user.id}`);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Xem chi tiết
                              </button>

                              <button
                                onClick={() => {
                                  router.push(`/admin/orders?buyerId=${user.id}`);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <ShoppingBag className="w-4 h-4" />
                                Xem đơn hàng
                              </button>

                              <hr className="my-1" />

                              {user.status === 'active' ? (
                                <button
                                  onClick={() => {
                                    setSuspendDialog({ open: true, user });
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                                >
                                  <UserX className="w-4 h-4" />
                                  Khóa tài khoản
                                </button>
                              ) : user.status === 'suspended' ? (
                                <button
                                  onClick={() => {
                                    handleActivateUser(user);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Mở khóa tài khoản
                                </button>
                              ) : null}

                              {user.status !== 'deleted' && (
                                <button
                                  onClick={() => {
                                    setDeleteDialog({ open: true, user });
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Xóa tài khoản
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị{' '}
                    <span className="font-medium">{(page - 1) * limit + 1}</span> đến{' '}
                    <span className="font-medium">
                      {Math.min(page * limit, total)}
                    </span>{' '}
                    trong tổng số <span className="font-medium">{total}</span> người dùng
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Suspend Dialog */}
      {suspendDialog.open && suspendDialog.user && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSuspendDialog({ open: false, user: null })}
            />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Khóa tài khoản
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn đang khóa tài khoản <strong>{suspendDialog.user.username}</strong>.
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
                    setSuspendDialog({ open: false, user: null });
                    setSuspendReason('');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSuspendUser}
                  disabled={!suspendReason.trim() || actionLoading === suspendDialog.user.id}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === suspendDialog.user.id && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Khóa tài khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialog.open && deleteDialog.user && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setDeleteDialog({ open: false, user: null })}
            />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Xác nhận xóa tài khoản
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc chắn muốn xóa tài khoản{' '}
                <strong>{deleteDialog.user.username}</strong>? Hành động này không
                thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteDialog({ open: false, user: null })}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading === deleteDialog.user.id}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === deleteDialog.user.id && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
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
