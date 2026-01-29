'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient, type ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterStepProps {
  registrationToken: string;
}

// Validation regex patterns (must match backend)
const USERNAME_REGEX = /^[a-zA-Z0-9_]{6,30}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function RegisterStep({ registrationToken }: RegisterStepProps) {
  const router = useRouter();
  const { refetch } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState<number | null>(null);

  const isUsernameValid = USERNAME_REGEX.test(username);
  const isPasswordValid = PASSWORD_REGEX.test(password);
  const canSubmit = isUsernameValid && isUsernameAvailable && isPasswordValid && !loading;

  // Debounced username availability check
  useEffect(() => {
    if (!username) {
      setUsernameError(null);
      setIsUsernameAvailable(false);
      return;
    }

    // Check format first
    if (!isUsernameValid) {
      setUsernameError('Tên đăng nhập không hợp lệ (6-30 ký tự, chỉ chữ, số và _)');
      setIsUsernameAvailable(false);
      return;
    }

    // Debounce availability check
    const timeout = setTimeout(async () => {
      setIsCheckingUsername(true);
      setUsernameError(null);

      try {
        const data = await apiClient.checkUsernameAvailability(username);

        if (data.available) {
          setIsUsernameAvailable(true);
          setUsernameError(null);
        } else {
          setIsUsernameAvailable(false);
          setUsernameError('Tên đăng nhập đã tồn tại');
        }
      } catch (err: any) {
        console.error('Error checking username:', err);
        const apiError = err as ApiError;
        setUsernameError(apiError.message || 'Không thể kiểm tra tên đăng nhập');
        setIsUsernameAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeout);
  }, [username, isUsernameValid]);

  // Password validation
  useEffect(() => {
    if (!password) {
      setPasswordError(null);
      return;
    }

    if (!isPasswordValid) {
      setPasswordError(
        'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
      );
    } else {
      setPasswordError(null);
    }
  }, [password, isPasswordValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register (sets sessionToken cookie)
      await apiClient.registerBuyerWithPhone(registrationToken, username, password);

      // Step 2: Fetch user data and update client state
      await refetch();

      // Success - show notification with countdown
      setLoading(false);
      setSuccessCountdown(3);

      // Start 3-second countdown
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        countdown--;
        setSuccessCountdown(countdown);

        if (countdown === 0) {
          clearInterval(countdownInterval);
          router.push('/');
          router.refresh(); // Sync with server state
        }
      }, 1000);

    } catch (err: any) {
      console.error('Error registering:', err);
      const apiError = err as ApiError;

      // Handle 400 Bad Request - validation errors
      if (apiError.statusCode === 400) {
        if (apiError.message?.toLowerCase().includes('username')) {
          setUsernameError('Tên đăng nhập không hợp lệ');
          return;
        }
        if (apiError.message?.toLowerCase().includes('password')) {
          setPasswordError('Mật khẩu không hợp lệ');
          return;
        }
        // Handle validation errors array
        if (apiError.validationErrors) {
          const usernameError = apiError.validationErrors.find(e => e.field === 'username');
          const passwordError = apiError.validationErrors.find(e => e.field === 'password');

          if (usernameError) {
            setUsernameError(usernameError.errors.join(', '));
          }
          if (passwordError) {
            setPasswordError(passwordError.errors.join(', '));
          }
        }
        return;
      }

      // Handle 401 Unauthorized - token issues
      if (apiError.statusCode === 401) {
        // Any 401 error on registration (internal token) should restart flow
        toast.error('Xác thực có vấn đề, vui lòng đăng ký lại');
        // Show brief countdown
        setTimeout(() => {
          router.push('/buyer/signup');
        }, 3000);
        return;
      }

      // Handle 409 Conflict - username already exists (if backend implements this)
      if (apiError.statusCode === 409) {
        setUsernameError('Tên đăng nhập đã tồn tại');
        return;
      }

      // Handle 500 Internal Server Error - might be username conflict from DB
      if (apiError.statusCode === 500) {
        if (apiError.message?.toLowerCase().includes('username') ||
            apiError.message?.toLowerCase().includes('unique')) {
          setUsernameError('Tên đăng nhập đã tồn tại');
          return;
        }
        toast.error(apiError.message || 'Lỗi hệ thống. Vui lòng thử lại.');
        return;
      }

      toast.error(apiError.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Success Message with Countdown */}
      {successCountdown !== null && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-center">
            <p className="text-green-800 font-medium mb-2">
              ✓ Đăng ký thành công!
            </p>
            <p className="text-green-700 text-sm">
              Đang chuyển hướng đến trang chủ trong {successCountdown} giây...
            </p>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Tạo tài khoản</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Input */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`pr-10 ${usernameError && username ? 'border-red-500' : ''}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isCheckingUsername && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
            {!isCheckingUsername && isUsernameValid && isUsernameAvailable && (
              <Check className="w-5 h-5 text-green-500" />
            )}
          </div>
          {usernameError && username && (
            <p className="text-sm text-red-500 mt-1">{usernameError}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`pr-10 ${passwordError && password ? 'border-red-500' : ''}`}
              style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' } as any}
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
          {passwordError && password && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!canSubmit || successCountdown !== null}
          className="w-full"
        >
          {loading ? 'Đang đăng ký...' : successCountdown !== null ? 'Đăng ký thành công!' : 'ĐĂNG KÝ'}
        </Button>
      </form>
    </div>
  );
}
