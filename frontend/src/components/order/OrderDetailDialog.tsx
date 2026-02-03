'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiClient, type OrderResponse, type OrderStatus, type ApiError } from '@/lib/api';
import {
  Loader2,
  Store,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  onOrderUpdated?: () => void;
}

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

export function OrderDetailDialog({
  open,
  onOpenChange,
  orderId,
  onOrderUpdated,
}: OrderDetailDialogProps) {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [operating, setOperating] = useState(false);

  useEffect(() => {
    if (open && orderId) {
      fetchOrder();
    }
  }, [open, orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const data = await apiClient.getMyOrderById(orderId);
      setOrder(data);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setOperating(true);
      await apiClient.cancelMyOrder(order.id);
      toast.success('Đã hủy đơn hàng');
      await fetchOrder();
      onOrderUpdated?.();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Hủy đơn hàng thất bại');
    } finally {
      setOperating(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order) return;
    try {
      setOperating(true);
      const result = await apiClient.confirmDelivery(order.id);
      toast.success(`Xác nhận thành công! Bạn được cộng ${result.coinEarned} xu`);
      await fetchOrder();
      onOrderUpdated?.();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Xác nhận thất bại');
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancel = order?.status === 'pending';
  const canConfirmDelivery = order?.status === 'shipping';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : !order ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không tìm thấy đơn hàng</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Mã đơn:</span>
                  <span className="font-medium">#{order.orderCode}</span>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>

              {/* Shop Info */}
              <Link
                href={`/shop/${order.shop.slug}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {order.shop.logoUrl ? (
                  <img
                    src={order.shop.logoUrl}
                    alt={order.shop.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Store className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <span className="font-medium">{order.shop.name}</span>
              </Link>

              {/* Items */}
              <div className="border rounded-lg divide-y">
                {order.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.productId}`}
                    className="flex gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.productImageUrl ? (
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 hover:text-primary">{item.productName}</p>
                      <p className="text-sm text-gray-500">{item.variantName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm">
                          {formatPrice(item.unitPrice)} x {item.quantity}
                        </span>
                        <span className="font-medium text-primary">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Delivery Info */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Địa chỉ nhận hàng</span>
                </div>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.receiverName}</p>
                  <p className="text-gray-600">{order.receiverPhone}</p>
                  <p className="text-gray-600">{order.shippingAddress}</p>
                </div>
              </div>

              {/* Notes */}
              {(order.buyerNote || order.shopNote) && (
                <div className="border rounded-lg p-4 space-y-3">
                  {order.buyerNote && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ghi chú của bạn:</p>
                      <p className="text-sm">{order.buyerNote}</p>
                    </div>
                  )}
                  {order.shopNote && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ghi chú của shop:</p>
                      <p className="text-sm">{order.shopNote}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Summary */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Thanh toán</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tạm tính</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span>{order.shippingFee > 0 ? formatPrice(order.shippingFee) : 'Miễn phí'}</span>
                  </div>
                  {order.platformShipDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Hỗ trợ vận chuyển</span>
                      <span>-{formatPrice(order.platformShipDiscount)}</span>
                    </div>
                  )}
                  {order.voucherDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá voucher</span>
                      <span>-{formatPrice(order.voucherDiscountAmount)}</span>
                    </div>
                  )}
                  <div className={`flex justify-between ${order.coinUsed > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>Xu đã dùng</span>
                    <span>{order.coinUsed > 0 ? `-${formatPrice(order.coinUsed)}` : '0 xu'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span>Tổng thanh toán</span>
                    <span className="text-primary text-lg">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3 text-gray-700">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Lịch sử đơn hàng</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-500">Đặt hàng:</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  {order.confirmedAt && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-500">Xác nhận:</span>
                      <span>{formatDate(order.confirmedAt)}</span>
                    </div>
                  )}
                  {order.shippedAt && (
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-500">Giao hàng:</span>
                      <span>{formatDate(order.shippedAt)}</span>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-500">Đã giao:</span>
                      <span>{formatDate(order.deliveredAt)}</span>
                    </div>
                  )}
                  {order.completedAt && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-500">Hoàn thành:</span>
                      <span>{formatDate(order.completedAt)}</span>
                    </div>
                  )}
                  {order.cancelledAt && (
                    <div className="flex items-center gap-3">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-gray-500">Đã hủy:</span>
                      <span>{formatDate(order.cancelledAt)}</span>
                    </div>
                  )}
                </div>
                {order.cancelReason && (
                  <p className="mt-3 text-sm text-red-600">
                    Lý do hủy: {order.cancelReason}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {order && (canCancel || canConfirmDelivery) && (
          <div className="pt-4 border-t flex justify-end gap-3">
            {canCancel && (
              <Button
                variant="outline"
                onClick={handleCancelOrder}
                disabled={operating}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {operating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Hủy đơn hàng
              </Button>
            )}
            {canConfirmDelivery && (
              <Button onClick={handleConfirmDelivery} disabled={operating}>
                {operating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Xác nhận đã nhận hàng
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
