'use client';

import Link from 'next/link';
import { Store, Package, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type OrderListItemResponse, type OrderStatus } from '@/lib/api';

interface OrderCardProps {
  order: OrderListItemResponse;
  onViewDetail: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  onConfirmDelivery?: (orderId: string) => void;
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
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

export function OrderCard({
  order,
  onViewDetail,
  onCancelOrder,
  onConfirmDelivery,
}: OrderCardProps) {
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

  const canCancel = order.status === 'pending';
  const canConfirmDelivery = order.status === 'delivered';

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <Link
          href={`/shop/${order.shop.slug}`}
          className="flex items-center gap-2 hover:text-primary"
        >
          {order.shop.logoUrl ? (
            <img
              src={order.shop.logoUrl}
              alt={order.shop.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <Store className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <span className="font-medium">{order.shop.name}</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">#{order.orderCode}</span>
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${statusColors[order.status]}`}
          >
            {statusLabels[order.status]}
          </span>
        </div>
      </div>

      {/* Items Preview (show first 2 items) */}
      <div className="divide-y">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.id} className="flex gap-4 p-4">
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
              <p className="font-medium text-gray-900 line-clamp-1">{item.productName}</p>
              <p className="text-sm text-gray-500">{item.variantName}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-500">x{item.quantity}</span>
                <span className="font-medium text-primary">{formatPrice(item.totalPrice)}</span>
              </div>
            </div>
          </div>
        ))}
        {order.itemCount > 2 && (
          <div className="px-4 py-2 text-sm text-gray-500 text-center">
            +{order.itemCount - 2} sản phẩm khác
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
        <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-sm text-gray-500">Tổng tiền: </span>
            <span className="font-semibold text-primary">{formatPrice(order.totalAmount)}</span>
          </div>
          <div className="flex gap-2">
            {canCancel && onCancelOrder && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancelOrder(order.id)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Hủy đơn
              </Button>
            )}
            {canConfirmDelivery && onConfirmDelivery && (
              <Button size="sm" onClick={() => onConfirmDelivery(order.id)}>
                Đã nhận hàng
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onViewDetail(order.id)}>
              Chi tiết
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
