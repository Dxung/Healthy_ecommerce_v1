'use client';

import { useState, useRef, useEffect } from 'react';
import { ConfirmationResult } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { formatPhoneForDisplay } from '@/lib/phoneUtils';
import { isOtpTokenExpiredError } from '@/lib/errorUtils';
import { toast } from 'sonner';
import { apiClient, type ApiError } from '@/lib/api';

interface PasswordResetOtpVerifyStepProps {
  confirmationResult: ConfirmationResult;
  phoneNumber: string;
  onBack: () => void;
  onSuccess: (token: string) => void;
}

export function PasswordResetOtpVerifyStep({
  confirmationResult,
  phoneNumber,
  onBack,
  onSuccess,
}: PasswordResetOtpVerifyStepProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isComplete = otp.every((digit) => digit !== '');
  const canResend = countdown === 0;

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    // Only accept digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

    if (digits.length > 0) {
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);

      // Focus the last filled input or next empty
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleResend = async () => {
    setCountdown(60);
    // Note: Firebase doesn't provide a direct resend method
    // User would need to go back to Step 1 and request new OTP
    toast.info('Vui lòng quay lại bước trước để gửi lại mã OTP');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isComplete) {
      setError('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const otpCode = otp.join('');

      // Step 1: Verify OTP with Firebase
      const credential = await confirmationResult.confirm(otpCode);

      // Step 2: Get Firebase ID token
      const firebaseToken = await credential.user.getIdToken();

      // Step 3: Send to backend for password reset verification
      const data = await apiClient.verifyPasswordResetOtp(firebaseToken);

      // Success - return internal token to parent
      onSuccess(data.token);
    } catch (err: any) {
      console.error('Error verifying OTP for password reset:', err);

      // Handle Firebase errors
      if (err.code === 'auth/invalid-verification-code') {
        setError('OTP không đúng, vui lòng nhập lại');
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
        return;
      } else if (err.code === 'auth/code-expired') {
        setError('OTP đã hết hạn, vui lòng ấn nút gửi lại');
        return;
      }

      // Handle API errors
      const apiError = err as ApiError;
      if (apiError.statusCode === 400) {
        // Phone not registered
        if (apiError.message?.includes('chưa được đăng ký') || apiError.message?.includes('PHONE_NOT_REGISTERED')) {
          setError('Số điện thoại chưa được đăng ký. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.');
        } else {
          setError(apiError.message || 'Đã có lỗi xảy ra');
        }
      } else if (apiError.statusCode === 401) {
        // Check if it's OTP token expired
        if (isOtpTokenExpiredError(apiError)) {
          setError('OTP đã hết hạn, vui lòng lấy OTP mới thông qua nút "Gửi lại"');
        } else {
          // Other 401 errors (invalid token, etc.)
          setError('OTP không hợp lệ, vui lòng nhập lại');
          setOtp(Array(6).fill(''));
          inputRefs.current[0]?.focus();
        }
      } else if (apiError.statusCode === 503) {
        setError('Dịch vụ xác thực tạm thời không khả dụng');
        setTimeout(() => {
          window.location.href = '/forgot-password';
        }, 2000);
      } else if (apiError.statusCode === 500) {
        setError('Lỗi hệ thống. Vui lòng thử lại sau.');
        setTimeout(() => {
          window.location.href = '/forgot-password';
        }, 2000);
      } else {
        setError(apiError.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Quay lại
      </button>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Nhập mã xác nhận</h1>
        <p className="text-sm text-gray-500">
          Mã OTP sẽ được gửi qua tin nhắn SMS đến số điện thoại
        </p>
        <p className="text-lg font-medium mt-2">{formatPhoneForDisplay(phoneNumber)}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Inputs */}
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-semibold"
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Countdown / Resend */}
        <div className="text-center text-sm">
          {canResend ? (
            <p className="text-gray-600">
              Bạn vẫn chưa nhận được?{' '}
              <button
                type="button"
                onClick={handleResend}
                className="text-primary hover:underline font-medium"
              >
                Gửi lại
              </button>
            </p>
          ) : (
            <p className="text-gray-500">
              Vui lòng chờ {countdown} giây để gửi lại
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isComplete || loading}
          className="w-full"
        >
          {loading ? 'Đang xác thực...' : 'XÁC NHẬN'}
        </Button>
      </form>
    </div>
  );
}
