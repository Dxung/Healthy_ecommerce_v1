'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient, type OrderResponse, type ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Loader2, ShoppingBag, Store } from 'lucide-react';
import { toast } from 'sonner';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderIds = searchParams.get('orders')?.split(',') ?? [];
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderIds.length > 0) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const orderPromises = orderIds.map((id) => apiClient.getMyOrderById(id));
      const fetchedOrders = await Promise.all(orderPromises);
      setOrders(fetchedOrders);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
        <Link href="/products">
          <Button>Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Success Message */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-600">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="font-semibold mb-4">Thông tin đơn hàng</h2>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              {/* Order Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b">
                <div className="flex items-center gap-2">
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
                </div>
                <span className="text-sm text-gray-500">#{order.orderCode}</span>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
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
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.variantName}</p>
                    </div>
                    <span className="text-sm text-gray-500">x{item.quantity}</span>
                    <span className="text-sm font-medium">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="flex justify-end mt-3 pt-3 border-t">
                <span className="text-sm text-gray-500 mr-2">Tổng tiền:</span>
                <span className="font-semibold text-primary">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className="font-medium">Tổng thanh toán ({orders.length} đơn hàng)</span>
          <span className="text-xl font-bold text-primary">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Delivery Info */}
      {orders[0] && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="font-semibold mb-3">Địa chỉ giao hàng</h2>
          <div>
            <p className="font-medium">{orders[0].receiverName}</p>
            <p className="text-gray-600">{orders[0].receiverPhone}</p>
            <p className="text-gray-600">{orders[0].shippingAddress}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/user/orders" className="flex-1">
          <Button variant="outline" className="w-full">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Xem đơn hàng của tôi
          </Button>
        </Link>
        <Link href="/products" className="flex-1">
          <Button className="w-full">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
