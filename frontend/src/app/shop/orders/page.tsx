'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  apiClient,
  type ShopOrderListResponse,
  type ShopOrderResponse,
  type OrderStatus,
  type ApiError,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ShoppingCart,
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronRight,
  Eye,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

const statusTabs: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang vận chuyển' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang vận chuyển',
  delivered: 'Đã giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  refunding: 'Đang hoàn tiền',
  refunded: 'Đã hoàn tiền',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipping: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
  refunding: 'bg-orange-100 text-orange-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export default function ShopOrdersPage() {
  const [orders, setOrders] = useState<ShopOrderListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<ShopOrderResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [operating, setOperating] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getShopOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        limit: 10,
      });
      setOrders(data);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = (status: OrderStatus | 'all') => {
    setStatusFilter(status);
    setPage(1);
  };

  const loadOrderDetail = async (orderId: string) => {
    try {
      setLoadingDetail(true);
      const data = await apiClient.getShopOrderById(orderId);
      setSelectedOrder(data);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      setOperating(true);
      await apiClient.confirmShopOrder(orderId);
      toast.success('Đã xác nhận đơn hàng');
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        await loadOrderDetail(orderId);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Xác nhận đơn hàng thất bại');
    } finally {
      setOperating(false);
    }
  };

  const handleShipOrder = async (orderId: string) => {
    try {
      setOperating(true);
      await apiClient.shipShopOrder(orderId);
      toast.success('Đã chuyển sang trạng thái giao hàng');
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        await loadOrderDetail(orderId);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setOperating(false);
    }
  };

  const openCancelDialog = (orderId: string) => {
    setCancelOrderId(orderId);
    setCancelReason('');
    setShowCancelDialog(true);
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderId || !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn');
      return;
    }
    try {
      setOperating(true);
      await apiClient.cancelShopOrder(cancelOrderId, cancelReason);
      toast.success('Đã hủy đơn hàng');
      setShowCancelDialog(false);
      setCancelOrderId(null);
      setCancelReason('');
      await fetchOrders();
      if (selectedOrder?.id === cancelOrderId) {
        await loadOrderDetail(cancelOrderId);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Hủy đơn hàng thất bại');
    } finally {
      setOperating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Orders List */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !orders || orders.items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">Chưa có đơn hàng</h2>
              <p className="text-gray-500">
                {statusFilter === 'all'
                  ? 'Chưa có đơn hàng nào'
                  : `Không có đơn hàng "${statusTabs.find((t) => t.value === statusFilter)?.label}"`}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {orders.items.map((order) => (
                  <div
                    key={order.id}
                    className={`bg-white rounded-lg border cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id
                        ? 'border-primary ring-1 ring-primary'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => loadOrderDetail(order.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">#{order.orderCode}</span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${statusColors[order.status]}`}
                          >
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{order.buyer.fullName || 'Khách hàng'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{order.receiverPhone}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{formatDate(order.createdAt)}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">{order.itemCount} sản phẩm</span>
                          <span className="font-semibold text-primary">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {orders.totalPages > 1 && (
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
                    Trang {page} / {orders.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(orders.totalPages, p + 1))}
                    disabled={page === orders.totalPages || loading}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Order Detail Panel */}
        <div className="w-[400px] flex-shrink-0">
          {loadingDetail ? (
            <div className="bg-white rounded-lg border p-6 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : selectedOrder ? (
            <div className="bg-white rounded-lg border overflow-hidden sticky top-6">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Chi tiết đơn hàng</h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${statusColors[selectedOrder.status]}`}
                  >
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">#{selectedOrder.orderCode}</p>
              </div>

              <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {/* Buyer Info */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Thông tin người mua</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.buyer.fullName || 'Khách hàng'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedOrder.receiverName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.receiverPhone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span>{selectedOrder.shippingAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Sản phẩm</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.productImageUrl ? (
                            <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-500">{item.variantName}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">x{item.quantity}</span>
                            <span className="text-sm font-medium">{formatPrice(item.totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.buyerNote && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Ghi chú từ khách</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {selectedOrder.buyerNote}
                    </p>
                  </div>
                )}

                {/* Summary */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tạm tính</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span>{formatPrice(selectedOrder.shippingFee)}</span>
                  </div>
                  {selectedOrder.platformShipDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm phí vận chuyển (nền tảng)</span>
                      <span>-{formatPrice(selectedOrder.platformShipDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Xu sử dụng</span>
                    <span className={selectedOrder.coinUsed > 0 ? 'text-green-600' : ''}>
                      {selectedOrder.coinUsed > 0 ? `-${formatPrice(selectedOrder.coinUsed)}` : '0 xu'}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Tổng đơn hàng</span>
                    <span>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                {/* Shop Revenue */}
                <div className="space-y-2 pt-2 border-t bg-blue-50 -mx-4 px-4 py-3 rounded-b">
                  <h4 className="text-sm font-medium text-blue-800">Doanh thu Shop</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Tạm tính sản phẩm</span>
                    <span className="text-blue-900">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Phí sàn ({selectedOrder.platformFeePercent}%)</span>
                    <span className="text-red-600">-{formatPrice(selectedOrder.platformFee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-blue-200">
                    <span className="text-blue-800">Shop nhận được</span>
                    <span className="text-primary">{formatPrice(selectedOrder.shopReceiveAmount)}</span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Đặt hàng: {formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  {selectedOrder.confirmedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Xác nhận: {formatDate(selectedOrder.confirmedAt)}</span>
                    </div>
                  )}
                  {selectedOrder.shippedAt && (
                    <div className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      <span>Giao hàng: {formatDate(selectedOrder.shippedAt)}</span>
                    </div>
                  )}
                  {selectedOrder.deliveredAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Đã giao: {formatDate(selectedOrder.deliveredAt)}</span>
                    </div>
                  )}
                  {selectedOrder.cancelledAt && (
                    <div className="flex items-center gap-1 text-red-500">
                      <XCircle className="w-3 h-3" />
                      <span>Hủy: {formatDate(selectedOrder.cancelledAt)}</span>
                    </div>
                  )}
                </div>

                {/* Cancel Reason */}
                {selectedOrder.cancelReason && (
                  <div className="bg-red-50 p-3 rounded text-sm">
                    <span className="font-medium text-red-700">Lý do hủy: </span>
                    <span className="text-red-600">{selectedOrder.cancelReason}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t bg-gray-50 space-y-2">
                {selectedOrder.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleConfirmOrder(selectedOrder.id)}
                      disabled={operating}
                    >
                      {operating ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Xác nhận đơn
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => openCancelDialog(selectedOrder.id)}
                      disabled={operating}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleShipOrder(selectedOrder.id)}
                      disabled={operating}
                    >
                      {operating ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Truck className="w-4 h-4 mr-2" />
                      )}
                      Giao hàng
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => openCancelDialog(selectedOrder.id)}
                      disabled={operating}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                )}
                {selectedOrder.status === 'shipping' && (
                  <div className="text-sm text-gray-500 text-center py-2">
                    Đang chờ khách hàng xác nhận nhận hàng
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Chọn đơn hàng để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hủy đơn hàng</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do hủy đơn <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy đơn hàng..."
                  className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelDialog(false);
                    setCancelOrderId(null);
                    setCancelReason('');
                  }}
                  disabled={operating}
                >
                  Đóng
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelOrder}
                  disabled={operating || !cancelReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {operating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Xác nhận hủy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
