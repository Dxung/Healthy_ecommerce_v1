'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { isValidPhone, formatPhoneForDisplay, normalizePhone, getPhoneErrorMessage } from '@/lib/phoneUtils';
import { PasswordResetOtpVerifyStep } from '@/components/auth/PasswordResetOtpVerifyStep';
import { NewPasswordStep } from '@/components/auth/NewPasswordStep';

type Step = 'phone' | 'otp' | 'newPassword';

function ForgotPasswordLoading() {
  return (
    <div className="flex items-center justify-center px-4 py-8 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isValid = isValidPhone(phone);
  const displayPhone = isValid ? formatPhoneForDisplay(phone) : phone;

  // Initialize with phone from URL params (from PhoneExistsStep redirect)
  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    if (phoneParam) {
      setPhone(phoneParam);
    }
  }, [searchParams]);

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

  const handlePhoneSubmit = async (e: React.FormEvent) => {
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
      const result = await signInWithPhoneNumber(auth, normalizedPhone, appVerifier);

      // Success - move to OTP step
      setConfirmationResult(result);
      setPhoneNumber(normalizedPhone);
      setCurrentStep('otp');
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

  const handleOtpSuccess = (token: string) => {
    setResetToken(token);
    setCurrentStep('newPassword');
  };

  const handleBackToPhone = () => {
    setCurrentStep('phone');
    setConfirmationResult(null);
    setPhoneNumber('');
    setResetToken('');
    setError(null);
  };

  return (
    <div className="flex items-center justify-center px-4 py-8 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {/* Phone Input Step */}
          {currentStep === 'phone' && (
            <div className="w-full max-w-md mx-auto">
              {/* Back to Login */}
              <Link
                href="/login"
                className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Quay lại đăng nhập
              </Link>

              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Quên mật khẩu</h1>
                <p className="text-sm text-gray-500 mt-2">
                  Nhập số điện thoại đã đăng ký để lấy lại mật khẩu
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-6">
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

                {/* Login Link */}
                <p className="text-sm text-center">
                  Bạn đã nhớ mật khẩu?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Đăng nhập
                  </Link>
                </p>
              </form>

              {/* Recaptcha Container (Invisible) */}
              <div id="recaptcha-container"></div>
            </div>
          )}

          {/* OTP Verification Step */}
          {currentStep === 'otp' && confirmationResult && (
            <PasswordResetOtpVerifyStep
              confirmationResult={confirmationResult}
              phoneNumber={phoneNumber}
              onBack={handleBackToPhone}
              onSuccess={handleOtpSuccess}
            />
          )}

          {/* New Password Step */}
          {currentStep === 'newPassword' && resetToken && (
            <NewPasswordStep
              token={resetToken}
              onBack={handleBackToPhone}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
