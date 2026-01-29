'use client';

import { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isValidPhone, formatPhoneForDisplay, normalizePhone, getPhoneErrorMessage } from '@/lib/phoneUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface PhoneInputStepProps {
  onSuccess: (confirmationResult: ConfirmationResult, phoneNumber: string) => void;
}

export function PhoneInputStep({ onSuccess }: PhoneInputStepProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isValid = isValidPhone(phone);
  const displayPhone = isValid ? formatPhoneForDisplay(phone) : phone;

  // Cleanup reCAPTCHA on component unmount
  useEffect(() => {
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (error) {
          console.log('Error clearing recaptcha:', error);
        }
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    setError(getPhoneErrorMessage(value));
  };

  const setupRecaptcha = () => {
    // Clear existing verifier if it exists
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (error) {
        console.log('Error clearing existing recaptcha:', error);
      }
      (window as any).recaptchaVerifier = null;
    }

    // Check if container element exists
    const container = document.getElementById('recaptcha-container');
    if (!container) {
      console.error('reCAPTCHA container not found');
      return;
    }

    // Create new verifier
    (window as any).recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError('Số điện thoại không hợp lệ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Setup reCAPTCHA
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;

      // Normalize phone to +84 format
      const normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) {
        throw new Error('Invalid phone number format');
      }

      // Send OTP via Firebase
      const confirmationResult = await signInWithPhoneNumber(auth, normalizedPhone, appVerifier);

      // Success - move to OTP step
      onSuccess(confirmationResult, normalizedPhone);
    } catch (err: any) {
      console.error('Error sending OTP:', err);

      // Reset recaptcha on error
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }

      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Đăng ký</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Phone Input */}
        <div className="relative">
          <Input
            type="tel"
            placeholder="Số điện thoại"
            value={displayPhone}
            onChange={handlePhoneChange}
            className={`pr-10 ${error && phone ? 'border-red-500' : ''}`}
          />
          {isValid && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
              <Check className="w-5 h-5" />
            </div>
          )}
          {error && phone && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isValid || loading}
          className="w-full"
        >
          {loading ? 'Đang xử lý...' : 'TIẾP THEO'}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-gray-500 text-sm">HOẶC</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            // Placeholder - no action yet
          }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          Bằng việc đăng ký, bạn đã đồng ý với Shopee về{' '}
          <a href="#" className="text-primary hover:underline">
            Điều khoản dịch vụ
          </a>{' '}
          &{' '}
          <a href="#" className="text-primary hover:underline">
            Chính sách bảo mật
          </a>
        </p>

        {/* Login Link */}
        <p className="text-sm text-center">
          Bạn đã có tài khoản?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Đăng nhập
          </Link>
        </p>
      </form>

      {/* Recaptcha Container (Invisible) */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
