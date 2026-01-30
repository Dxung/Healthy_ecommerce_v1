'use client';

import { useState, useEffect, useRef } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isValidPhone, formatPhoneForDisplay, normalizePhone, getPhoneErrorMessage } from '@/lib/phoneUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';
import { apiClient, type ApiError, type Province, type District, type Ward, type ShopInfoResponse } from '@/lib/api';

interface ShopInfoStepProps {
  onSuccess: (shop: ShopInfoResponse) => void;
  userPhone: string | null; // User's existing phone number from profile
}

type InternalStep = 'form' | 'otp';

export function ShopInfoStep({ onSuccess, userPhone }: ShopInfoStepProps) {
  // Check if user already has a phone (no OTP needed)
  const userHasPhone = !!userPhone;

  // Internal step state
  const [internalStep, setInternalStep] = useState<InternalStep>('form');

  // Form fields
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(userPhone || '');
  const [addressLine, setAddressLine] = useState('');

  // Location selection
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);

  // OTP state
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  // If user has phone from profile, trust it (already verified). Otherwise validate manually entered phone.
  const isPhoneValid = userHasPhone || isValidPhone(phone);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid =
    shopName.trim().length > 0 &&
    isEmailValid &&
    isPhoneValid &&
    selectedProvince &&
    selectedDistrict &&
    selectedWard &&
    addressLine.trim().length > 0;

  const isOtpComplete = otp.every((digit) => digit !== '');
  const canResend = countdown === 0;

  // Load provinces on mount (with cleanup to handle StrictMode double-mount)
  useEffect(() => {
    let isCancelled = false;

    const loadProvinces = async () => {
      try {
        const data = await apiClient.getAllProvinces();
        if (!isCancelled) {
          setProvinces(data);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load provinces:', err);
        }
      }
    };
    loadProvinces();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict('');
      setWards([]);
      setSelectedWard('');
      return;
    }

    const loadDistricts = async () => {
      setLoadingLocations(true);
      try {
        const data = await apiClient.getDistrictsByProvince(selectedProvince);
        setDistricts(data);
        setSelectedDistrict('');
        setWards([]);
        setSelectedWard('');
      } catch (err) {
        console.error('Failed to load districts:', err);
      } finally {
        setLoadingLocations(false);
      }
    };
    loadDistricts();
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard('');
      return;
    }

    const loadWards = async () => {
      setLoadingLocations(true);
      try {
        const data = await apiClient.getWardsByDistrict(selectedDistrict);
        setWards(data);
        setSelectedWard('');
      } catch (err) {
        console.error('Failed to load wards:', err);
      } finally {
        setLoadingLocations(false);
      }
    };
    loadWards();
  }, [selectedDistrict]);

  // OTP countdown timer
  useEffect(() => {
    if (internalStep === 'otp' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, internalStep]);

  // Cleanup reCAPTCHA on unmount
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

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (error) {
        console.log('Error clearing existing recaptcha:', error);
      }
      (window as any).recaptchaVerifier = null;
    }

    const container = document.getElementById('recaptcha-container');
    if (!container) {
      console.error('reCAPTCHA container not found');
      return;
    }

    (window as any).recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => {},
      }
    );
  };

  // Handle form submit - either direct submit (has phone) or send OTP (no phone)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError(null);

    // If user already has phone, submit directly without OTP
    if (userHasPhone) {
      try {
        // Don't send phone - backend will use user's phone from database
        // (userPhone from frontend is masked, so we can't use it)
        const shop = await apiClient.registerShop({
          name: shopName.trim(),
          email: email.trim(),
          // phone not sent - backend uses user's phone from DB
          provinceId: selectedProvince,
          districtId: selectedDistrict,
          wardId: selectedWard,
          addressLine: addressLine.trim(),
          // No firebaseOtpToken - user already has phone verified
        });

        // Success - pass shop to parent
        onSuccess(shop);
      } catch (err: any) {
        console.error('Error submitting registration:', err);
        const apiError = err as ApiError;
        if (apiError.statusCode === 400) {
          setError(apiError.message || 'Thông tin không hợp lệ');
        } else if (apiError.statusCode === 409) {
          setError(apiError.message || 'Tên cửa hàng đã tồn tại');
        } else {
          setError(apiError.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // User has no phone - need OTP verification
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const normalizedPhone = normalizePhone(phone);

      if (!normalizedPhone) {
        throw new Error('Số điện thoại không hợp lệ');
      }

      const result = await signInWithPhoneNumber(auth, normalizedPhone, appVerifier);
      setConfirmationResult(result);
      setInternalStep('otp');
      setCountdown(60);
    } catch (err: any) {
      console.error('Error sending OTP:', err);

      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }

      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

    if (digits.length > 0) {
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // Handle OTP submit
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOtpComplete || !confirmationResult) {
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

      // Step 3: Call backend to register shop
      const normalizedPhone = normalizePhone(phone)!;
      const shop = await apiClient.registerShop({
        name: shopName.trim(),
        email: email.trim(),
        phone: normalizedPhone,
        provinceId: selectedProvince,
        districtId: selectedDistrict,
        wardId: selectedWard,
        addressLine: addressLine.trim(),
        firebaseOtpToken: firebaseToken,
      });

      // Success - pass shop to parent
      onSuccess(shop);
    } catch (err: any) {
      console.error('Error verifying OTP:', err);

      // Handle Firebase errors
      if (err.code === 'auth/invalid-verification-code') {
        setError('Mã OTP không đúng, vui lòng nhập lại');
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
        return;
      } else if (err.code === 'auth/code-expired') {
        setError('Mã OTP đã hết hạn, vui lòng quay lại để gửi lại');
        return;
      }

      // Handle API errors
      const apiError = err as ApiError;
      if (apiError.statusCode === 400) {
        setError(apiError.message || 'Thông tin không hợp lệ');
      } else if (apiError.statusCode === 409) {
        setError(apiError.message || 'Tên cửa hàng đã tồn tại');
      } else {
        setError(apiError.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setInternalStep('form');
    setOtp(Array(6).fill(''));
    setError(null);
  };

  // ===================== RENDER: FORM STEP =====================
  if (internalStep === 'form') {
    return (
      <div className="w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Đăng ký cửa hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Bước 1: Thông tin cửa hàng</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên cửa hàng <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Nhập tên cửa hàng"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email liên hệ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={email && !isEmailValid ? 'border-red-500' : ''}
              />
              {email && isEmailValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>
            {email && !isEmailValid && (
              <p className="text-sm text-red-500 mt-1">Email không hợp lệ</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="tel"
                placeholder="0912345678"
                autoComplete="off"
                value={userHasPhone ? formatPhoneForDisplay(phone) : (isPhoneValid ? formatPhoneForDisplay(phone) : phone)}
                onChange={(e) => !userHasPhone && setPhone(e.target.value)}
                readOnly={userHasPhone}
                className={`${!userHasPhone && phone && !isPhoneValid ? 'border-red-500' : ''} ${userHasPhone ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {/* Show green check: if user has phone (always valid) OR if manually entered phone is valid */}
              {(userHasPhone || isPhoneValid) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>
            {userHasPhone && (
              <p className="text-sm text-gray-500 mt-1">Số điện thoại từ tài khoản của bạn</p>
            )}
            {!userHasPhone && phone && !isPhoneValid && (
              <p className="text-sm text-red-500 mt-1">{getPhoneErrorMessage(phone)}</p>
            )}
          </div>

          {/* Location Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Địa chỉ cửa hàng <span className="text-red-500">*</span>
            </label>

            {/* Province */}
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>

            {/* District */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedProvince || loadingLocations}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            >
              <option value="">Chọn Quận/Huyện</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>

            {/* Ward */}
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              disabled={!selectedDistrict || loadingLocations}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            >
              <option value="">Chọn Phường/Xã</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name}
                </option>
              ))}
            </select>

            {/* Address Line */}
            <Input
              type="text"
              placeholder="Số nhà, tên đường..."
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {userHasPhone ? 'Đang xử lý...' : 'Đang gửi OTP...'}
              </>
            ) : userHasPhone ? (
              'Tiếp theo'
            ) : (
              'Tiếp theo - Xác thực số điện thoại'
            )}
          </Button>
        </form>

        {/* Recaptcha Container */}
        <div id="recaptcha-container"></div>
      </div>
    );
  }

  // ===================== RENDER: OTP STEP =====================
  return (
    <div className="w-full">
      {/* Back Button */}
      <button
        onClick={handleBackToForm}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Quay lại
      </button>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Nhập mã xác nhận</h1>
        <p className="text-sm text-gray-500">
          Mã OTP đã được gửi đến số điện thoại
        </p>
        <p className="text-lg font-medium mt-1">{formatPhoneForDisplay(phone)}</p>
      </div>

      <form onSubmit={handleOtpSubmit} className="space-y-6">
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
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={handleOtpPaste}
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
              Bạn chưa nhận được mã?{' '}
              <button
                type="button"
                onClick={handleBackToForm}
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
          disabled={!isOtpComplete || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xác thực...
            </>
          ) : (
            'Xác nhận'
          )}
        </Button>
      </form>
    </div>
  );
}
