'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      {/* Success Message */}
      <div className="text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-14 h-14 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý và sẽ sớm
          được giao đến bạn.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link href="/user/orders">
            <Button className="w-full" size="lg">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Xem đơn hàng của tôi
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="w-full" size="lg">
              Tiếp tục mua sắm
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
