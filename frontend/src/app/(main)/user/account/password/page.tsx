'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AccountSidebar } from '@/components/user/AccountSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

// Password validation regex (must match backend)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const isNewPasswordValid = PASSWORD_REGEX.test(newPassword);
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword !== '';
  const isNewPasswordSameAsOld = currentPassword && newPassword && currentPassword === newPassword;
  const isFormValid =
    currentPassword.trim() !== '' &&
    newPassword.trim() !== '' &&
    confirmPassword.trim() !== '' &&
    isNewPasswordValid &&
    doPasswordsMatch &&
    !isNewPasswordSameAsOld;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.changePassword({
        currentPassword,
        newPassword,
      });

      toast.success('Cập nhật mật khẩu thành công!');

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Navigate back to profile
      router.push('/user/account/profile');
    } catch (error: any) {
      console.error('Error changing password:', error);

      // Use the error message from backend, or fallback to generic message
      toast.error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <AccountSidebar />

          {/* Right Content Card */}
          <div className="flex-1 bg-white rounded-lg shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200">
              <h1 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h1>
              <p className="text-sm text-gray-600 mt-1">
                Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
              </p>
            </div>

            <div className="flex justify-center p-8 pt-16" style={{ minHeight: '600px' }}>
              <form onSubmit={handleSubmit} className="w-full max-w-md">
              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {newPassword && !isNewPasswordValid && (
                    <p className="text-sm text-red-600 mt-2">
                      Mật khẩu cần có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt (@$!%*?&)
                    </p>
                  )}
                  {newPassword && isNewPasswordSameAsOld && (
                    <p className="text-sm text-red-600 mt-2">
                      Mật khẩu mới không thể giống mật khẩu cũ
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhập lại mật khẩu mới
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && !doPasswordsMatch && (
                    <p className="text-sm text-red-600 mt-2">
                      Mật khẩu nhập lại và mật khẩu mới cần trùng nhau
                    </p>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="px-8"
                  >
                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/user/account/profile')}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
