'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ArrowLeft, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient, type ApiError } from '@/lib/api';

interface NewPasswordStepProps {
  token: string;
  onBack?: () => void;
}

// Password validation regex (must match backend)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Individual password requirements for real-time feedback
const passwordRequirements = [
  { id: 'length', label: 'Ít nhất 8 ký tự', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'Có chữ hoa', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Có chữ thường', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'Có số', test: (p: string) => /\d/.test(p) },
  { id: 'symbol', label: 'Có ký tự đặc biệt (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p) },
];

export function NewPasswordStep({ token, onBack }: NewPasswordStepProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState<number | null>(null);

  const isPasswordValid = PASSWORD_REGEX.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isPasswordValid && passwordsMatch && !loading && successCountdown === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      return;
    }

    setLoading(true);

    try {
      await apiClient.resetPassword(token, password);

      // Success - show notification with countdown
      setLoading(false);
      setSuccessCountdown(3);
      toast.success('Mật khẩu đã được đặt lại thành công!');

      // Start 3-second countdown
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        countdown--;
        setSuccessCountdown(countdown);

        if (countdown === 0) {
          clearInterval(countdownInterval);
          router.push('/login');
        }
      }, 1000);

    } catch (err: any) {
      console.error('Error resetting password:', err);
      const apiError = err as ApiError;

      // Handle 400 Bad Request - validation errors
      if (apiError.statusCode === 400) {
        if (apiError.message?.includes('PHONE_NOT_REGISTERED')) {
          toast.error('Số điện thoại chưa được đăng ký');
          setTimeout(() => router.push('/forgot-password'), 2000);
          return;
        }
        toast.error(apiError.message || 'Mật khẩu không hợp lệ');
        return;
      }

      // Handle 401 Unauthorized - token expired
      if (apiError.statusCode === 401) {
        toast.error('Phiên xác thực đã hết hạn, vui lòng thử lại');
        setTimeout(() => router.push('/forgot-password'), 2000);
        return;
      }

      toast.error(apiError.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Quay lại
        </button>
      )}

      {/* Success Message with Countdown */}
      {successCountdown !== null && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-center">
            <p className="text-green-800 font-medium mb-2">
              ✓ Đặt lại mật khẩu thành công!
            </p>
            <p className="text-green-700 text-sm">
              Đang chuyển hướng đến trang đăng nhập trong {successCountdown} giây...
            </p>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Đặt mật khẩu mới</h1>
        <p className="text-sm text-gray-500 mt-2">
          Tạo mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password Input */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password requirements checklist */}
          {password.length > 0 && (
            <div className="text-xs space-y-1 mt-2">
              {passwordRequirements.map((req) => {
                const passed = req.test(password);
                return (
                  <div
                    key={req.id}
                    className={`flex items-center gap-1 ${passed ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    {passed ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    {req.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1">
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`pr-10 ${
                confirmPassword.length > 0 && !passwordsMatch ? 'border-red-500' : ''
              }`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-sm text-red-500">Mật khẩu không khớp</p>
          )}
          {confirmPassword.length > 0 && passwordsMatch && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Mật khẩu khớp
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full"
        >
          {loading
            ? 'Đang xử lý...'
            : successCountdown !== null
            ? 'Thành công!'
            : 'ĐẶT LẠI MẬT KHẨU'}
        </Button>
      </form>
    </div>
  );
}
