'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  apiClient,
  type AdminShopListResponse,
  type AdminShopResponse,
  type ShopStatus,
  type ApiError,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Store,
  Search,
  Eye,
  Ban,
  ShieldOff,
  ShieldCheck,
  Star,
  Package,
  ShoppingCart,
  Clock,
  Award,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const statusOptions: { value: ShopStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Tạm nghỉ' },
  { value: 'suspended', label: 'Đình chỉ' },
  { value: 'banned', label: 'Bị cấm' },
];

const statusColors: Record<ShopStatus, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  suspended: 'bg-orange-100 text-orange-700',
  banned: 'bg-red-100 text-red-700',
};

const statusLabels: Record<ShopStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Tạm nghỉ',
  suspended: 'Đình chỉ',
  banned: 'Bị cấm',
};

export default function AdminShopsPage() {
  const [shops, setShops] = useState<AdminShopListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ShopStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedShop, setSelectedShop] = useState<AdminShopResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [operating, setOperating] = useState(false);

  // Dialog states
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [actionShopId, setActionShopId] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAdminShops({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
        page,
        limit: 15,
      });
      setShops(data);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải danh sách cửa hàng');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, page]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleSearch = () => {
    setPage(1);
    fetchShops();
  };

  const loadShopDetail = async (id: string) => {
    try {
      setLoadingDetail(true);
      const data = await apiClient.getAdminShopById(id);
      setSelectedShop(data);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải thông tin cửa hàng');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSuspendShop = async () => {
    if (!actionShopId || !actionReason.trim()) {
      toast.error('Vui lòng nhập lý do đình chỉ');
      return;
    }
    try {
      setOperating(true);
      await apiClient.suspendShop(actionShopId, actionReason);
      toast.success('Đã đình chỉ cửa hàng');
      setShowSuspendDialog(false);
      setActionShopId(null);
      setActionReason('');
      await fetchShops();
      if (selectedShop?.id === actionShopId) {
        await loadShopDetail(actionShopId);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Đình chỉ cửa hàng thất bại');
    } finally {
      setOperating(false);
    }
  };

  const handleUnsuspendShop = async (id: string) => {
    try {
      setOperating(true);
      await apiClient.unsuspendShop(id);
      toast.success('Đã gỡ đình chỉ cửa hàng');
      await fetchShops();
      if (selectedShop?.id === id) {
        await loadShopDetail(id);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Gỡ đình chỉ thất bại');
    } finally {
      setOperating(false);
    }
  };

  const handleBanShop = async () => {
    if (!actionShopId || !actionReason.trim()) {
      toast.error('Vui lòng nhập lý do cấm');
      return;
    }
    try {
      setOperating(true);
      await apiClient.banShop(actionShopId, actionReason);
      toast.success('Đã cấm vĩnh viễn cửa hàng');
      setShowBanDialog(false);
      setActionShopId(null);
      setActionReason('');
      await fetchShops();
      if (selectedShop?.id === actionShopId) {
        await loadShopDetail(actionShopId);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Cấm cửa hàng thất bại');
    } finally {
      setOperating(false);
    }
  };

  const openSuspendDialog = (id: string) => {
    setActionShopId(id);
    setActionReason('');
    setShowSuspendDialog(true);
  };

  const openBanDialog = (id: string) => {
    setActionShopId(id);
    setActionReason('');
    setShowBanDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý cửa hàng</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setStatusFilter(option.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === option.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <Button onClick={handleSearch} size="sm">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Shops List */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !shops || shops.items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Store className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">Không có cửa hàng</h2>
              <p className="text-gray-500">
                {searchQuery
                  ? 'Không tìm thấy cửa hàng phù hợp'
                  : 'Chưa có cửa hàng nào trong hệ thống'}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                        Cửa hàng
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                        Trạng thái
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                        Đánh giá
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                        Sản phẩm
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                        Đơn hàng
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {shops.items.map((shop) => (
                      <tr
                        key={shop.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedShop?.id === shop.id ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => loadShopDetail(shop.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {shop.logoUrl ? (
                              <img
                                src={shop.logoUrl}
                                alt={shop.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Store className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{shop.name}</p>
                              <p className="text-xs text-gray-500">@{shop.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${statusColors[shop.status]}`}
                            >
                              {statusLabels[shop.status]}
                            </span>
                            {shop.isAdminSuspended && shop.status !== 'banned' && (
                              <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                                Đình chỉ
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{shop.averageRating.toFixed(1)}</span>
                            <span className="text-gray-400 text-xs">({shop.totalRatings})</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{shop.totalProducts}</td>
                        <td className="px-4 py-3 text-center font-medium">{shop.totalOrders}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadShopDetail(shop.id);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {shops.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    Trước
                  </Button>
                  <span className="text-sm text-gray-600">
                    Trang {page} / {shops.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(shops.totalPages, p + 1))}
                    disabled={page === shops.totalPages || loading}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Shop Detail Panel */}
        <div className="w-[380px] flex-shrink-0">
          {loadingDetail ? (
            <div className="bg-white rounded-lg border p-6 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : selectedShop ? (
            <div className="bg-white rounded-lg border overflow-hidden sticky top-6">
              {/* Shop Header */}
              <div className="relative">
                {selectedShop.coverUrl ? (
                  <img
                    src={selectedShop.coverUrl}
                    alt="cover"
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 bg-gradient-to-r from-primary/20 to-primary/10" />
                )}
                <div className="absolute -bottom-10 left-4">
                  {selectedShop.logoUrl ? (
                    <img
                      src={selectedShop.logoUrl}
                      alt={selectedShop.name}
                      className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 border-4 border-white shadow flex items-center justify-center">
                      <Store className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-12 px-4 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedShop.name}</h3>
                    <p className="text-sm text-gray-500">@{selectedShop.slug}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${statusColors[selectedShop.status]}`}
                  >
                    {statusLabels[selectedShop.status]}
                  </span>
                </div>

                {/* Badges */}
                {selectedShop.badges.length > 0 && (
                  <div className="flex gap-1 mb-3">
                    {selectedShop.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded flex items-center gap-1"
                      >
                        <Award className="w-3 h-3" />
                        {badge === 'official'
                          ? 'Chính hãng'
                          : badge === 'approved'
                            ? 'Đã xác minh'
                            : 'Ưu tiên'}
                      </span>
                    ))}
                  </div>
                )}

                {/* Status Warning */}
                {selectedShop.isAdminSuspended && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-700">Đã bị đình chỉ</p>
                        {selectedShop.statusReason && (
                          <p className="text-orange-600 mt-1">{selectedShop.statusReason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Star className="w-4 h-4" />
                      <span className="text-xs">Đánh giá</span>
                    </div>
                    <p className="font-semibold">
                      {selectedShop.averageRating.toFixed(1)}{' '}
                      <span className="text-gray-400 font-normal text-sm">
                        ({selectedShop.totalRatings})
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Package className="w-4 h-4" />
                      <span className="text-xs">Sản phẩm</span>
                    </div>
                    <p className="font-semibold">{selectedShop.totalProducts}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-xs">Đơn hàng</span>
                    </div>
                    <p className="font-semibold">{selectedShop.totalOrders}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Phản hồi</span>
                    </div>
                    <p className="font-semibold">{selectedShop.responseTimeHours}h</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>
                    <span className="text-gray-400">SĐT:</span> {selectedShop.phone}
                  </p>
                  <p>
                    <span className="text-gray-400">Email:</span> {selectedShop.email}
                  </p>
                  <p>
                    <span className="text-gray-400">Địa chỉ:</span> {selectedShop.addressLine}
                  </p>
                  <p className="text-xs text-gray-400">
                    Tham gia: {formatDate(selectedShop.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                {selectedShop.status !== 'banned' && (
                  <div className="space-y-2 pt-3 border-t">
                    {selectedShop.isAdminSuspended ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleUnsuspendShop(selectedShop.id)}
                        disabled={operating}
                      >
                        {operating ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 mr-2" />
                        )}
                        Gỡ đình chỉ
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => openSuspendDialog(selectedShop.id)}
                        disabled={operating}
                      >
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Đình chỉ cửa hàng
                      </Button>
                    )}
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={() => openBanDialog(selectedShop.id)}
                      disabled={operating}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Cấm vĩnh viễn
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Chọn cửa hàng để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Suspend Dialog */}
      {showSuspendDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Đình chỉ cửa hàng</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do đình chỉ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Nhập lý do đình chỉ cửa hàng (tối thiểu 10 ký tự)..."
                  className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuspendDialog(false);
                    setActionShopId(null);
                    setActionReason('');
                  }}
                  disabled={operating}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSuspendShop}
                  disabled={operating || actionReason.length < 10}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {operating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Đình chỉ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Dialog */}
      {showBanDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Cấm vĩnh viễn cửa hàng</h3>
            <p className="text-sm text-gray-500 mb-4">
              Hành động này không thể hoàn tác. Cửa hàng sẽ bị cấm vĩnh viễn khỏi hệ thống.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do cấm <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Nhập lý do cấm cửa hàng (tối thiểu 10 ký tự)..."
                  className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBanDialog(false);
                    setActionShopId(null);
                    setActionReason('');
                  }}
                  disabled={operating}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleBanShop}
                  disabled={operating || actionReason.length < 10}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {operating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Cấm vĩnh viễn
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
