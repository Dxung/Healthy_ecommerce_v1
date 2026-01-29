'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';

interface PhoneExistsStepProps {
  username: string;
  phoneNumber: string;
  avatarUrl?: string;
  onGetBackAccount?: (phone: string) => void;
}

export function PhoneExistsStep({ username, phoneNumber, avatarUrl, onGetBackAccount }: PhoneExistsStepProps) {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleReclaimPhoneClick = () => {
    if (onGetBackAccount) {
      onGetBackAccount(phoneNumber);
    } else {
      // Fallback: redirect to forgot-password with phone number
      router.push(`/forgot-password?phone=${encodeURIComponent(phoneNumber)}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Số điện thoại đã được đăng ký</h1>
      </div>

      <div className="space-y-6">
        {/* Avatar and Username Display */}
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`@${username}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-gray-400" />
            )}
          </div>

          {/* Username and Phone Number */}
          <div className="text-center space-y-1">
            <p className="text-lg font-medium text-gray-900">@{username}</p>
            <p className="text-sm text-blue-600">{phoneNumber}</p>
          </div>
        </div>

        {/* Explanatory Text */}
        <div className="text-center px-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Nếu tài khoản trên là của bạn, nhấn &quot;Đăng nhập&quot;. Nếu bạn quên mật khẩu,
            chọn &quot;Lấy lại tài khoản&quot; để đặt lại mật khẩu.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Login Button - Primary */}
          <Button
            onClick={handleLoginClick}
            className="w-full"
            size="lg"
          >
            Đăng nhập
          </Button>

          {/* Get Back Account Button - Secondary */}
          <Button
            onClick={handleReclaimPhoneClick}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Lấy lại tài khoản
          </Button>
        </div>
      </div>
    </div>
  );
}
