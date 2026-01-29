'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ShopRegistrationStatusResponse } from '@/lib/api';

interface ShopRegistrationSuccessStepProps {
  registration: ShopRegistrationStatusResponse;
}

export function ShopRegistrationSuccessStep({ registration }: ShopRegistrationSuccessStepProps) {
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
      <div className="flex items-center justify-center gap-2 text-yellow-600 mb-6">
        <Clock className="w-5 h-5" />
        <span>Đang chờ duyệt</span>
      </div>

      {/* Registration Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Tên cửa hàng</span>
            <span className="font-medium">{registration.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">URL cửa hàng</span>
            <span className="font-medium text-primary">/{registration.slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Trạng thái</span>
            <span className="font-medium text-yellow-600">Chờ duyệt</span>
          </div>
        </div>
      </div>

      {/* Info Text */}
      <p className="text-sm text-gray-500 mb-6">
        Yêu cầu đăng ký cửa hàng của bạn đã được gửi thành công.
        Chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất.
      </p>

      {/* Action Button */}
      <Button onClick={handleGoToShop} className="w-full gap-2">
        Xem trạng thái đăng ký
        <ArrowRight className="w-4 h-4" />
      </Button>

      {/* Auto redirect notice */}
      <p className="text-xs text-gray-400 mt-4">
        Tự động chuyển hướng sau {countdown} giây...
      </p>
    </div>
  );
}
