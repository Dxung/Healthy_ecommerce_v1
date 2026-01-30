'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  apiClient,
  AdminOrderResponse,
  AdminOrderListParams,
  OrderStatus,
} from '@/lib/api';
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Store,
  User,
  Package,
  Phone,
  MapPin,
  X,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';

const ORDER_STATUSES: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'refunding', label: 'Đang hoàn tiền' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

// Valid status transitions for admin
const getValidNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipping', 'cancelled'],
    shipping: ['delivered', 'cancelled'],
    delivered: ['completed', 'cancelled', 'refunding'],
    completed: ['refunding'],
    refunding: ['refunded', 'completed'],
    cancelled: [],
    refunded: [],
  };
  return transitions[currentStatus] || [];
};

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'shipping':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-indigo-100 text-indigo-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'refunding':
      return 'bg-orange-100 text-orange-800';
    case 'refunded':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'shipping':
      return 'Đang giao';
    case 'delivered':
      return 'Đã giao';
    case 'completed':
      return 'Hoàn thành';
    case 'cancelled':
      return 'Đã hủy';
    case 'refunding':
      return 'Đang hoàn tiền';
    case 'refunded':
      return 'Đã hoàn tiền';
    default:
      return status;
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'confirmed':
      return <CheckCircle className="w-4 h-4" />;
    case 'shipping':
      return <Truck className="w-4 h-4" />;
    case 'delivered':
      return <Package className="w-4 h-4" />;
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'cancelled':
      return <XCircle className="w-4 h-4" />;
    case 'refunding':
      return <RefreshCw className="w-4 h-4" />;
    case 'refunded':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function AdminOrdersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const buyerIdParam = searchParams.get('buyerId');

  const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderResponse | null>(
    null
  );
  const [buyerName, setBuyerName] = useState<string | null>(null);

  // Status change
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [statusChanging, setStatusChanging] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: AdminOrderListParams = {
        page,
        limit,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (buyerIdParam) params.buyerId = buyerIdParam;

      const response = await apiClient.getAdminOrders(params);
      setOrders(response.items);
      setTotalPages(response.totalPages);
      setTotal(response.total);

      // Set buyer name from first order if filtering by buyer
      if (buyerIdParam && response.items.length > 0) {
        setBuyerName(response.items[0].buyer.fullName || response.items[0].buyer.phone || 'Khách hàng');
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, fromDate, toDate, buyerIdParam]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleViewOrder = (order: AdminOrderResponse) => {
    setSelectedOrder(order);
  };

  const closeDetailPanel = () => {
    setSelectedOrder(null);
    setShowStatusDialog(false);
    setNewStatus('');
    setStatusNote('');
  };

  const handleOpenStatusDialog = () => {
    setShowStatusDialog(true);
    setNewStatus('');
    setStatusNote('');
  };

  const handleStatusChange = async () => {
    if (!selectedOrder || !newStatus) return;

    setStatusChanging(true);
    try {
      const updated = await apiClient.updateAdminOrderStatus(
        selectedOrder.id,
        newStatus,
        statusNote || undefined
      );
      // Update the selected order
      setSelectedOrder(updated);
      // Update the order in the list
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
      setShowStatusDialog(false);
      setNewStatus('');
      setStatusNote('');
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setStatusChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Xem tất cả đơn hàng trên hệ thống
          </p>
        </div>
      </div>

      {/* Buyer Filter Banner */}
      {buyerIdParam && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Đang lọc đơn hàng của: <strong>{buyerName || 'Đang tải...'}</strong>
            </span>
          </div>
          <button
            onClick={() => router.push('/admin/orders')}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Mã đơn, shop, khách hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | '');
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* From Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                placeholder="Từ ngày"
              />
            </div>

            {/* To Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                placeholder="Đến ngày"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-500">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Package className="w-12 h-12 mb-2" />
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shop
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-primary">
                          {order.orderCode}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {order.shop.logoUrl ? (
                            <img
                              src={order.shop.logoUrl}
                              alt={order.shop.name}
                              className="w-8 h-8 rounded-full object-cover mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              <Store className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <span className="text-sm text-gray-900">
                            {order.shop.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.buyer.fullName || 'Chưa cập nhật'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.buyer.phone || ''}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Hiển thị {(page - 1) * limit + 1} -{' '}
                {Math.min(page * limit, total)} trong {total} đơn hàng
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm">
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Chi tiết đơn hàng
                </h2>
                <p className="text-sm text-primary font-medium">
                  {selectedOrder.orderCode}
                </p>
              </div>
              <button
                onClick={closeDetailPanel}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                  {getValidNextStatuses(selectedOrder.status).length > 0 && (
                    <button
                      onClick={handleOpenStatusDialog}
                      className="px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      Đổi trạng thái
                    </button>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(selectedOrder.createdAt)}
                </span>
              </div>

              {/* Status Change Dialog */}
              {showStatusDialog && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Thay đổi trạng thái đơn hàng
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Trạng thái mới
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      >
                        <option value="">Chọn trạng thái</option>
                        {getValidNextStatuses(selectedOrder.status).map((status) => (
                          <option key={status} value={status}>
                            {getStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Ghi chú (tùy chọn)
                      </label>
                      <textarea
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="Nhập lý do thay đổi trạng thái..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowStatusDialog(false)}
                        disabled={statusChanging}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleStatusChange}
                        disabled={!newStatus || statusChanging}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                      >
                        {statusChanging && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Xác nhận
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Shop Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {selectedOrder.shop.logoUrl ? (
                    <img
                      src={selectedOrder.shop.logoUrl}
                      alt={selectedOrder.shop.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <Store className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedOrder.shop.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID: {selectedOrder.shop.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>

              {/* Buyer Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Thông tin khách hàng
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Tên:</span>{' '}
                    {selectedOrder.buyer.fullName || 'Chưa cập nhật'}
                  </p>
                  <p>
                    <span className="text-gray-500">SĐT:</span>{' '}
                    {selectedOrder.buyer.phone || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Thông tin giao hàng
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Người nhận:</span>{' '}
                    {selectedOrder.receiverName}
                  </p>
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {selectedOrder.receiverPhone}
                  </p>
                  <p>
                    <span className="text-gray-500">Địa chỉ:</span>{' '}
                    {selectedOrder.shippingAddress}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Sản phẩm ({selectedOrder.items.length})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                    >
                      <img
                        src={item.productImageUrl || '/placeholder.png'}
                        alt={item.productName}
                        className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.variantName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(item.unitPrice)} x {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Thông tin thanh toán
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tạm tính</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                  </div>
                  {selectedOrder.tierDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá hạng thành viên</span>
                      <span>
                        -{formatCurrency(selectedOrder.tierDiscountAmount)}
                      </span>
                    </div>
                  )}
                  {selectedOrder.voucherDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Voucher</span>
                      <span>
                        -{formatCurrency(selectedOrder.voucherDiscountAmount)}
                      </span>
                    </div>
                  )}
                  {selectedOrder.coinUsed > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Xu đã dùng</span>
                      <span>-{formatCurrency(selectedOrder.coinUsed)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                    <span>Tổng cộng</span>
                    <span className="text-primary">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Phí nền tảng ({selectedOrder.platformFeePercent}%)</span>
                    <span>{formatCurrency(selectedOrder.platformFee)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {(selectedOrder.buyerNote || selectedOrder.shopNote) && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Ghi chú</h3>
                  {selectedOrder.buyerNote && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 block">
                        Khách hàng:
                      </span>
                      <p className="text-sm">{selectedOrder.buyerNote}</p>
                    </div>
                  )}
                  {selectedOrder.shopNote && (
                    <div>
                      <span className="text-xs text-gray-500 block">Shop:</span>
                      <p className="text-sm">{selectedOrder.shopNote}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Lịch sử đơn hàng
                </h3>
                <div className="space-y-3">
                  {selectedOrder.createdAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">Đơn hàng đã tạo</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedOrder.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedOrder.confirmedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">Shop xác nhận</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedOrder.confirmedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedOrder.shippedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">Đang giao hàng</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedOrder.shippedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedOrder.deliveredAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">Đã giao hàng</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedOrder.deliveredAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedOrder.completedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">Hoàn thành</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedOrder.completedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedOrder.cancelledAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">
                          Đã hủy bởi{' '}
                          {selectedOrder.cancelledBy === 'buyer'
                            ? 'khách hàng'
                            : selectedOrder.cancelledBy === 'shop'
                              ? 'shop'
                              : 'hệ thống'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedOrder.cancelledAt)}
                        </p>
                        {selectedOrder.cancelReason && (
                          <p className="text-xs text-red-500 mt-1">
                            Lý do: {selectedOrder.cancelReason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <AdminOrdersPageContent />
    </Suspense>
  );
}
