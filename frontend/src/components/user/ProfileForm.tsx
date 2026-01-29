'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserProfileResponse, apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { EmailUpdateDialog } from './EmailUpdateDialog';

interface ProfileFormProps {
  profile: UserProfileResponse;
  onUpdate: () => void;
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [username, setUsername] = useState(profile.username);

  // Parse existing date of birth if available
  const existingDate = profile.dateOfBirth ? new Date(profile.dateOfBirth) : null;
  const [day, setDay] = useState<string>(existingDate ? String(existingDate.getDate()) : '');
  const [month, setMonth] = useState<string>(existingDate ? String(existingDate.getMonth() + 1) : '');
  const [year, setYear] = useState<string>(existingDate ? String(existingDate.getFullYear()) : '');
  const [dateError, setDateError] = useState('');

  const [gender, setGender] = useState<string>(profile.gender || '');
  const [showGenderWarning, setShowGenderWarning] = useState(false);
  const [showDateWarning, setShowDateWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  const canChangeDateOfBirth = profile.dateOfBirthChangedAt === null;
  const canChangeGender = profile.genderChangedAt === null;

  // Generate day options (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  // Generate month options (1-12)
  const monthOptions = [
    { value: '1', label: 'Tháng 1' },
    { value: '2', label: 'Tháng 2' },
    { value: '3', label: 'Tháng 3' },
    { value: '4', label: 'Tháng 4' },
    { value: '5', label: 'Tháng 5' },
    { value: '6', label: 'Tháng 6' },
    { value: '7', label: 'Tháng 7' },
    { value: '8', label: 'Tháng 8' },
    { value: '9', label: 'Tháng 9' },
    { value: '10', label: 'Tháng 10' },
    { value: '11', label: 'Tháng 11' },
    { value: '12', label: 'Tháng 12' },
  ];

  // Generate year options (current year - 100 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 101 }, (_, i) => currentYear - i);

  const handleGenderChange = (value: string) => {
    setGender(value);
    if (canChangeGender) {
      setShowGenderWarning(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError('');

    // Validate date of birth if any field is filled
    if (canChangeDateOfBirth && (day || month || year)) {
      if (!day || !month || !year) {
        setDateError('Cần nhập đủ ngày/tháng/năm sinh');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Build update data object
      const updateData: {
        fullName?: string;
        dateOfBirth?: string;
        gender?: 'male' | 'female' | 'other' | 'do_not_want_to_say';
      } = {};

      // Add fullName if changed
      if (fullName !== (profile.fullName || '')) {
        updateData.fullName = fullName;
      }

      // Add dateOfBirth if all fields are filled and changed
      if (canChangeDateOfBirth && day && month && year) {
        const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const existingDateStr = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '';
        if (dateStr !== existingDateStr) {
          updateData.dateOfBirth = dateStr;
        }
      }

      // Add gender if changed
      if (gender && gender !== (profile.gender || '')) {
        updateData.gender = gender as 'male' | 'female' | 'other' | 'do_not_want_to_say';
      }

      // Call API to update profile
      await apiClient.updateProfile(updateData);

      toast.success('Cập nhật hồ sơ thành công!');
      onUpdate();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneUpdate = () => {
    router.push('/user/account/phone');
  };

  const handleEmailUpdate = () => {
    setShowEmailDialog(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Hồ sơ của tôi</h1>
        <p className="text-sm text-gray-600 mt-1">
          Quản lý thông tin hồ sơ để bảo mật tài khoản
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Section 1: Personal Information */}
        <div className="space-y-4">
          <h2 className="text-base font-medium text-gray-900 mb-4">
            Thông tin cá nhân
          </h2>

          {/* Full Name */}
          <div className="flex items-center">
            <label className="w-40 text-sm text-gray-700">Họ và tên</label>
            <div className="flex-1">
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="max-w-md"
              />
            </div>
          </div>

          {/* Username - Always readonly */}
          <div className="flex items-center">
            <label className="w-40 text-sm text-gray-700">Tên đăng nhập</label>
            <div className="flex-1">
              <Input
                type="text"
                value={username}
                className="max-w-md bg-gray-50"
                disabled
                readOnly
              />
            </div>
          </div>

          {/* Date of Birth - 3 Dropdowns */}
          <div className="flex items-start">
            <label className="w-40 text-sm text-gray-700 pt-2">Ngày sinh</label>
            <div className="flex-1">
              {dateError && (
                <div className="mb-2 text-sm text-red-600">
                  {dateError}
                </div>
              )}
              <div className="flex items-center gap-2">
                {/* Day Dropdown */}
                <select
                  value={day}
                  onChange={(e) => {
                    const newDay = e.target.value;
                    setDay(newDay);
                    setDateError('');

                    // Show warning if any dropdown has value, hide if all are empty
                    if (canChangeDateOfBirth) {
                      if (newDay || month || year) {
                        setShowDateWarning(true);
                      } else {
                        setShowDateWarning(false);
                      }
                    }
                  }}
                  disabled={!canChangeDateOfBirth}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Ngày</option>
                  {dayOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Month Dropdown */}
                <select
                  value={month}
                  onChange={(e) => {
                    const newMonth = e.target.value;
                    setMonth(newMonth);
                    setDateError('');

                    // Show warning if any dropdown has value, hide if all are empty
                    if (canChangeDateOfBirth) {
                      if (day || newMonth || year) {
                        setShowDateWarning(true);
                      } else {
                        setShowDateWarning(false);
                      }
                    }
                  }}
                  disabled={!canChangeDateOfBirth}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Tháng</option>
                  {monthOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={year}
                  onChange={(e) => {
                    const newYear = e.target.value;
                    setYear(newYear);
                    setDateError('');

                    // Show warning if any dropdown has value, hide if all are empty
                    if (canChangeDateOfBirth) {
                      if (day || month || newYear) {
                        setShowDateWarning(true);
                      } else {
                        setShowDateWarning(false);
                      }
                    }
                  }}
                  disabled={!canChangeDateOfBirth}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Năm</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              {showDateWarning && canChangeDateOfBirth && (
                <p className="text-sm text-yellow-600 mt-2 bg-yellow-50 px-3 py-2 rounded-md border border-yellow-200">
                  Lưu ý: Ngày sinh chỉ được cập nhật một lần duy nhất
                </p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-start">
            <label className="w-40 text-sm text-gray-700 pt-2">Giới tính</label>
            <div className="flex-1">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === 'male'}
                    onChange={(e) => handleGenderChange(e.target.value)}
                    disabled={!canChangeGender}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Nam</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === 'female'}
                    onChange={(e) => handleGenderChange(e.target.value)}
                    disabled={!canChangeGender}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Nữ</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={gender === 'other'}
                    onChange={(e) => handleGenderChange(e.target.value)}
                    disabled={!canChangeGender}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Khác</span>
                </label>
              </div>
              {showGenderWarning && canChangeGender && (
                <p className="text-sm text-yellow-600 mt-2 bg-yellow-50 px-3 py-2 rounded-md border border-yellow-200">
                  Lưu ý: Giới tính chỉ được cập nhật một lần duy nhất
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Section 2: Contact Information */}
        <div className="space-y-4">
          <h2 className="text-base font-medium text-gray-900 mb-4">
            Số điện thoại và Email
          </h2>

          {/* Phone Number */}
          <div className="flex items-center">
            <label className="w-40 text-sm text-gray-700">Số điện thoại</label>
            <div className="flex-1 flex items-center gap-4">
              <span className="text-sm text-gray-900 font-medium">
                {profile.phoneNumber || 'Chưa cập nhật'}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePhoneUpdate}
              >
                Cập nhật
              </Button>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center">
            <label className="w-40 text-sm text-gray-700">Địa chỉ email</label>
            <div className="flex-1 flex items-center gap-4">
              <span className="text-sm text-gray-900 font-medium">
                {profile.email || 'Chưa cập nhật'}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEmailUpdate}
              >
                Cập nhật
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-8"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>

      {/* Email Update Dialog */}
      <EmailUpdateDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        currentEmail={profile.email}
        onSuccess={onUpdate}
      />
    </div>
  );
}
