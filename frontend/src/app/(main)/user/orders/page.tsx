'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  apiClient,
  type OrderListResponse,
  type OrderStatus,
  type ApiError,
} from '@/lib/api';
import { AccountSidebar } from '@/components/user/AccountSidebar';
import { OrderCard } from '@/components/order/OrderCard';
import { OrderDetailDialog } from '@/components/order/OrderDetailDialog';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag, Package } from 'lucide-react';
import { toast } from 'sonner';

const statusTabs: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang vận chuyển' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [operatingOrderId, setOperatingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMyOrders({
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

  const handleViewDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDetailDialog(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setOperatingOrderId(orderId);
      await apiClient.cancelMyOrder(orderId);
      toast.success('Đã hủy đơn hàng');
      await fetchOrders();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Hủy đơn hàng thất bại');
    } finally {
      setOperatingOrderId(null);
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      setOperatingOrderId(orderId);
      const result = await apiClient.confirmDelivery(orderId);
      toast.success(`Xác nhận thành công! Bạn được cộng ${result.coinEarned} xu`);
      await fetchOrders();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Xác nhận thất bại');
    } finally {
      setOperatingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <AccountSidebar />

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold text-gray-900">Đơn hàng của tôi</h1>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="px-6 py-4 border-b border-gray-200">
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
            </div>

            {/* Orders List */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !orders || orders.items.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Chưa có đơn hàng</h2>
                  <p className="text-gray-500">
                    {statusFilter === 'all'
                      ? 'Bạn chưa có đơn hàng nào'
                      : `Không có đơn hàng "${statusTabs.find((t) => t.value === statusFilter)?.label}"`}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {orders.items.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onViewDetail={handleViewDetail}
                        onCancelOrder={handleCancelOrder}
                        onConfirmDelivery={handleConfirmDelivery}
                        operatingOrderId={operatingOrderId}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {orders.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
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
          </div>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        orderId={selectedOrderId}
        onOrderUpdated={fetchOrders}
      />
    </div>
  );
}
