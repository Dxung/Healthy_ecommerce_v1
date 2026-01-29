'use client';

import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag } from 'lucide-react';

interface OrderSummaryProps {
  totalItems: number;
  subtotal: number;
  shippingFee?: number;
  discount?: number;
  total: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  canSubmit: boolean;
}

export function OrderSummary({
  totalItems,
  subtotal,
  shippingFee = 0,
  discount = 0,
  total,
  onSubmit,
  isSubmitting,
  canSubmit,
}: OrderSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg border p-4 sticky top-4">
      <h2 className="font-medium mb-4">Tổng đơn hàng</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Tạm tính ({totalItems} sản phẩm)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Phí vận chuyển</span>
          <span>{shippingFee > 0 ? formatPrice(shippingFee) : 'Miễn phí'}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Tổng thanh toán</span>
            <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full mt-4"
        onClick={onSubmit}
        disabled={isSubmitting || !canSubmit}
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <ShoppingBag className="w-5 h-5 mr-2" />
        )}
        Đặt hàng
      </Button>

      {!canSubmit && (
        <p className="text-sm text-red-500 mt-2 text-center">
          Vui lòng chọn địa chỉ giao hàng
        </p>
      )}
    </div>
  );
}
