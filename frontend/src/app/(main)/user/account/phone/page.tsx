'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AccountSidebar } from '@/components/user/AccountSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiClient } from '@/lib/api';
import { isValidPhone, formatPhoneForDisplay, normalizePhone } from '@/lib/phoneUtils';

type Step = 'phone' | 'otp' | 'error';

export default function UpdatePhonePage() {
  const { user, refetch } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSettingUpRecaptcha, setIsSettingUpRecaptcha] = useState(false);
  const isSubmittingRef = useRef(false);
  const [conflictErrorMessage, setConflictErrorMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

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

  if (!user) {
    return null;
  }

  const isValid = isValidPhone(phoneNumber);
  const displayPhone = isValid ? formatPhoneForDisplay(phoneNumber) : phoneNumber;

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip formatting characters (keep only digits and +)
    const value = e.target.value.replace(/[^\d+]/g, '');
    setPhoneNumber(value);
    setPhoneError('');

    if (value && !isValidPhone(value)) {
      setPhoneError('Chỉ hỗ trợ số điện thoại Việt Nam');
    }
  };


  // Start countdown timer
  const startCountdown = () => {
    setCountdown(60);
    setCanResend(false);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Setup reCAPTCHA
  const setupRecaptcha = async () => {
    // Prevent concurrent setup
    if (isSettingUpRecaptcha) {
      console.log('reCAPTCHA setup already in progress');
      return;
    }

    setIsSettingUpRecaptcha(true);

    try {
      // Get container element first
      const container = document.getElementById('recaptcha-container');
      if (!container) {
        console.error('reCAPTCHA container not found');
        return;
      }

      // STEP 1: Completely destroy old verifier if exists
      if ((window as any).recaptchaVerifier) {
        console.log('Destroying existing reCAPTCHA verifier');
        try {
          await (window as any).recaptchaVerifier.clear();
          delete (window as any).recaptchaVerifier;
        } catch (error) {
          console.log('Error clearing recaptcha:', error);
        }
      }

      // STEP 2: Remove and recreate the container element
      const parent = container.parentNode;
      if (parent) {
        parent.removeChild(container);
        const newContainer = document.createElement('div');
        newContainer.id = 'recaptcha-container';
        parent.appendChild(newContainer);
      }

      // STEP 3: Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('Creating new reCAPTCHA verifier');

      // STEP 4: Create fresh verifier
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA solved');
          },
        }
      );
    } finally {
      setIsSettingUpRecaptcha(false);
    }
  };

  // Handle next button click (Step 1)
  const handleNext = async () => {
    if (!isValid) {
      setPhoneError('Chỉ hỗ trợ số điện thoại Việt Nam');
      return;
    }

    // Prevent double-click
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const normalized = normalizePhone(phoneNumber);

      if (!normalized) {
        throw new Error('Invalid phone number format');
      }

      // Setup reCAPTCHA
      await setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;

      if (!appVerifier) {
        throw new Error('reCAPTCHA verifier not initialized');
      }

      // Send OTP via Firebase
      const result = await signInWithPhoneNumber(auth, normalized, appVerifier);
      setConfirmationResult(result);

      // Move to OTP step
      setStep('otp');
      startCountdown();
      toast.success('Mã OTP đã được gửi đến số điện thoại của bạn');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error('Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (value && !/^\d$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    // Get clipboard data
    const pastedData = e.clipboardData.getData('text');

    // Extract only leading digits (stop at first non-digit)
    const match = pastedData.match(/^\d+/);
    const digits = match ? match[0] : '';

    // Take only first 6 digits
    const otpDigits = digits.slice(0, 6);

    if (otpDigits.length === 0) return;

    // Fill OTP array
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = otpDigits[i] || '';
    }
    setOtp(newOtp);
    setOtpError('');

    // Focus last filled input or last input if all filled
    const lastFilledIndex = Math.min(otpDigits.length - 1, 5);
    const targetInput = document.getElementById(`otp-${lastFilledIndex}`);
    targetInput?.focus();
  };

  // Handle OTP input keydown (backspace and Ctrl+A)
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;

    // Ctrl+Backspace or Cmd+Backspace - clear all OTP boxes
    if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
      e.preventDefault();
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
      return;
    }

    // Backspace with selected text - clear all OTP boxes
    if (e.key === 'Backspace' && input.selectionStart === 0 && input.selectionEnd === input.value.length && input.value.length > 0) {
      e.preventDefault();
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      const firstInput = document.getElementById('otp-0');
      firstInput?.focus();
      return;
    }

    // Backspace - clear current or move to previous
    if (e.key === 'Backspace') {
      // If current box is empty, move to previous
      if (!otp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
      // If current box has value, it will be cleared by default behavior
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    // Prevent double-click
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const normalized = normalizePhone(phoneNumber);

      if (!normalized) {
        throw new Error('Invalid phone number format');
      }

      // Setup reCAPTCHA
      await setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;

      if (!appVerifier) {
        throw new Error('reCAPTCHA verifier not initialized');
      }

      // Resend OTP
      const result = await signInWithPhoneNumber(auth, normalized, appVerifier);
      setConfirmationResult(result);

      startCountdown();
      setOtp(['', '', '', '', '', '']);
      toast.success('Mã OTP mới đã được gửi');
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setOtpError('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    if (!confirmationResult) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      return;
    }

    // Prevent double-submission using ref (more robust than state)
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otpCode);

      // Get Firebase token
      const firebaseToken = await result.user.getIdToken();

      // Call backend to update phone number
      await apiClient.updatePhoneNumber(firebaseToken);

      // Refresh user context to get updated phone number
      await refetch();

      toast.success('Cập nhật số điện thoại thành công!');
      router.push('/user/account/profile');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);

      // Check if it's a Firebase auth error (OTP verification failed)
      if (error.code === 'auth/invalid-verification-code') {
        setOtpError('Mã OTP không chính xác');
      }
      // Check if it's a 409 Conflict (phone already in use)
      else if (error.statusCode === 409) {
        // Clear reCAPTCHA
        if ((window as any).recaptchaVerifier) {
          try {
            (window as any).recaptchaVerifier.clear();
          } catch (e) {
            console.log('Error clearing recaptcha:', e);
          }
          (window as any).recaptchaVerifier = null;
        }
        const container = document.getElementById('recaptcha-container');
        if (container) {
          container.innerHTML = '';
        }

        setConflictErrorMessage('Số điện thoại này đã được gắn với tài khoản khác. Bạn có thể tiếp tục sử dụng tài khoản gắn liền hoặc xóa tài khoản trước khi gắn sđt vào tài khoản mới.');
        setStep('error');
      }
      else {
        toast.error('Xác thực thất bại. Vui lòng thử lại.');
      }
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>

      {/* Centered Content Container */}
      <div className="container mx-auto py-6 px-4">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <AccountSidebar />

          {/* Right Content Card */}
          <div className="flex-1 bg-white rounded-lg shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200">
              <h1 className="text-lg font-semibold text-gray-900">Chỉnh sửa số điện thoại</h1>
              <p className="text-sm text-gray-600 mt-1">
                {step === 'phone' && 'Nhập số điện thoại mới của bạn'}
                {step === 'otp' && 'Nhập mã OTP đã được gửi đến số điện thoại của bạn'}
                {step === 'error' && 'Số điện thoại đã được sử dụng'}
              </p>
            </div>

            <div className="flex justify-center p-8 pt-16" style={{ minHeight: '600px' }}>
              <div className="w-full max-w-md">

                {/* Step 1: Enter Phone Number */}
                {step === 'phone' && (
                  <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại mới
                      </label>
                      <Input
                        type="tel"
                        value={displayPhone}
                        onChange={handlePhoneChange}
                        placeholder="Nhập số điện thoại (vd: 0912345678)"
                        className="w-full"
                      />
                      {phoneError && (
                        <p className="text-sm text-red-600 mt-1">{phoneError}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={!isValid || phoneError !== '' || isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Đang gửi...' : 'Tiếp theo'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/user/account/profile')}
                      className="w-full"
                    >
                      Hủy
                    </Button>
                  </form>
                )}

                {/* Step 2: Enter OTP */}
                {step === 'otp' && (
                  <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                        Mã xác thực OTP
                      </label>
                      <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handleOtpPaste}
                            className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        ))}
                      </div>
                      {otpError && (
                        <p className="text-sm text-red-600 mt-2 text-center">{otpError}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={otp.join('').length !== 6 || isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Đang xác nhận...' : 'Xác nhận'}
                    </Button>

                    <div className="text-center">
                      {canResend ? (
                        <button
                          onClick={handleResendOtp}
                          disabled={isLoading}
                          className="text-sm text-primary hover:underline disabled:text-gray-400"
                        >
                          Gửi lại OTP
                        </button>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Gửi lại OTP sau {countdown}s
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Clear reCAPTCHA before going back
                        if ((window as any).recaptchaVerifier) {
                          try {
                            (window as any).recaptchaVerifier.clear();
                          } catch (error) {
                            console.log('Error clearing recaptcha on back:', error);
                          }
                          (window as any).recaptchaVerifier = null;
                        }

                        // Also clear the DOM container
                        const container = document.getElementById('recaptcha-container');
                        if (container) {
                          container.innerHTML = '';
                        }

                        // Reset state
                        setStep('phone');
                        setOtp(['', '', '', '', '', '']);
                        setOtpError('');
                        setConfirmationResult(null);
                      }}
                      className="w-full"
                      disabled={isLoading}
                    >
                      Quay lại
                    </Button>
                  </form>
                )}

                {/* Step 3: Phone Conflict Error */}
                {step === 'error' && (
                  <div className="space-y-6">
                    {/* Yellow Warning Message */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        {conflictErrorMessage}
                      </p>
                    </div>

                    {/* Return Button */}
                    <Button
                      type="button"
                      onClick={() => router.push('/user/account/profile')}
                      className="w-full"
                    >
                      Trở về
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
