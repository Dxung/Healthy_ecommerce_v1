'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ShopInfoResponse } from '@/lib/api';

interface ShopRegistrationSuccessStepProps {
  shop: ShopInfoResponse;
}

export function ShopRegistrationSuccessStep({ shop }: ShopRegistrationSuccessStepProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Auto redirect countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/shop');
    }
  }, [countdown, router]);

  const handleGoToShop = () => {
    router.push('/shop');
  };

  return (
    <div className="w-full text-center">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Đăng ký thành công!
      </h1>

      {/* Status Message */}
      <p className="text-green-600 mb-6">
        Cửa hàng của bạn đã được tạo thành công
      </p>

      {/* Shop Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Tên cửa hàng</span>
            <span className="font-medium">{shop.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">URL cửa hàng</span>
            <span className="font-medium text-primary">/{shop.slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Trạng thái</span>
            <span className="font-medium text-green-600">Hoạt động</span>
          </div>
        </div>
      </div>

      {/* Info Text */}
      <p className="text-sm text-gray-500 mb-6">
        Bạn có thể bắt đầu quản lý cửa hàng và đăng sản phẩm ngay bây giờ.
      </p>

      {/* Action Button */}
      <Button onClick={handleGoToShop} className="w-full gap-2">
        Đi đến trang quản lý cửa hàng
        <ArrowRight className="w-4 h-4" />
      </Button>

      {/* Auto redirect notice */}
      <p className="text-xs text-gray-400 mt-4">
        Tự động chuyển hướng sau {countdown} giây...
      </p>
    </div>
  );
}
