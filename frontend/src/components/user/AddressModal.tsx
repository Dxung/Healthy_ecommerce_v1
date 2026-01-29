'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { apiClient, type AddressResponse, type Province, type District, type Ward } from '@/lib/api';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  address?: AddressResponse | null;
}

export function AddressModal({ isOpen, onClose, onSuccess, address }: AddressModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address label enum
  enum AddressLabel {
    HOME = 'HOME',
    OFFICE = 'OFFICE',
  }

  // Form state
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [label, setLabel] = useState<AddressLabel>(AddressLabel.HOME);
  const [isDefault, setIsDefault] = useState(false);

  // Location state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load provinces on mount
  useEffect(() => {
    if (isOpen) {
      loadProvinces();
    }
  }, [isOpen]);

  // Load form data when editing
  useEffect(() => {
    if (address && isOpen) {
      setRecipientName(address.recipientName);
      setRecipientPhone(formatPhoneDisplay(address.recipientPhone));
      setAddressLine(address.addressLine);
      // Set label from address
      setLabel(address.label === 'OFFICE' ? AddressLabel.OFFICE : AddressLabel.HOME);
      setIsDefault(address.isDefault);
      setSelectedProvinceId(address.provinceId);
      setSelectedDistrictId(address.districtId);
      setSelectedWardId(address.wardId);

      // Load cascading data
      if (address.provinceId) {
        loadDistricts(address.provinceId);
      }
      if (address.districtId) {
        loadWards(address.districtId);
      }
    } else if (isOpen) {
      // Reset form for new address
      resetForm();
    }
  }, [address, isOpen]);

  const resetForm = () => {
    setRecipientName('');
    setRecipientPhone('');
    setAddressLine('');
    setLabel(AddressLabel.HOME);
    setIsDefault(false);
    setSelectedProvinceId('');
    setSelectedDistrictId('');
    setSelectedWardId('');
    setDistricts([]);
    setWards([]);
    setErrors({});
    setError(null);
  };

  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const data = await apiClient.getAllProvinces();
      setProvinces(data);
    } catch (err: any) {
      console.error('Failed to load provinces:', err);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadDistricts = async (provinceId: string) => {
    try {
      setLoadingDistricts(true);
      const data = await apiClient.getDistrictsByProvince(provinceId);
      setDistricts(data);
    } catch (err: any) {
      console.error('Failed to load districts:', err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const loadWards = async (districtId: string) => {
    try {
      setLoadingWards(true);
      const data = await apiClient.getWardsByDistrict(districtId);
      setWards(data);
    } catch (err: any) {
      console.error('Failed to load wards:', err);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId('');
    setSelectedWardId('');
    setDistricts([]);
    setWards([]);

    if (provinceId) {
      loadDistricts(provinceId);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setSelectedDistrictId(districtId);
    setSelectedWardId('');
    setWards([]);

    if (districtId) {
      loadWards(districtId);
    }
  };

  const validatePhoneNumber = (phone: string): { isValid: boolean; errorMessage: string } => {
    if (!phone.trim()) {
      return { isValid: false, errorMessage: 'Vui lòng nhập số điện thoại' };
    }

    // Remove all non-digit characters to validate
    const digits = phone.replace(/\D/g, '');

    // Check valid formats:
    // 1. Starts with 0 and has 10 digits total (0912345678)
    // 2. Starts with 84 and has 11 digits total (84912345678)
    // 3. Just 9 digits (912345678)
    const isValidFormat =
      (digits.startsWith('0') && digits.length === 10) ||
      (digits.startsWith('84') && digits.length === 11) ||
      (!digits.startsWith('0') && !digits.startsWith('84') && digits.length === 9);

    if (!isValidFormat) {
      return { isValid: false, errorMessage: 'Số điện thoại không hợp lệ. Vui lòng nhập 9 chữ số (0xxxxxxxxx) hoặc (+84) xxxxxxxxx' };
    }

    return { isValid: true, errorMessage: '' };
  };

  const formatPhoneDisplay = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    if (digits.length === 0) return '';

    let phoneDigits = '';

    // If starts with 84 and has exactly 11 digits, extract 9 digits
    if (digits.startsWith('84') && digits.length === 11) {
      phoneDigits = digits.substring(2, 11);
    }
    // If starts with 0 and has exactly 10 digits, remove the 0
    else if (digits.startsWith('0') && digits.length === 10) {
      phoneDigits = digits.substring(1, 10);
    }
    // If just 9 digits
    else if (digits.length === 9 && !digits.startsWith('0') && !digits.startsWith('84')) {
      phoneDigits = digits;
    }
    // If incomplete or invalid, return original
    else {
      return phone;
    }

    // Format as (+84) 912 345 678 (3-3-3 pattern)
    if (phoneDigits.length === 9) {
      return `(+84) ${phoneDigits.substring(0, 3)} ${phoneDigits.substring(3, 6)} ${phoneDigits.substring(6, 9)}`;
    }

    return phone;
  };

  const handlePhoneBlur = () => {
    if (!recipientPhone.trim()) {
      return; // Don't validate empty field on blur
    }

    // Validate phone number
    const validation = validatePhoneNumber(recipientPhone);

    if (!validation.isValid) {
      // Show error
      setErrors(prev => ({ ...prev, recipientPhone: validation.errorMessage }));
    } else {
      // Clear error and format phone display
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.recipientPhone;
        return newErrors;
      });
      const formatted = formatPhoneDisplay(recipientPhone);
      setRecipientPhone(formatted);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!recipientName.trim()) {
      newErrors.recipientName = 'Vui lòng nhập họ và tên';
    }

    // Use the validatePhoneNumber function
    const phoneValidation = validatePhoneNumber(recipientPhone);
    if (!phoneValidation.isValid) {
      newErrors.recipientPhone = phoneValidation.errorMessage;
    }

    if (!selectedProvinceId) {
      newErrors.provinceId = 'Vui lòng chọn Tỉnh/Thành phố';
    }

    if (!selectedDistrictId) {
      newErrors.districtId = 'Vui lòng chọn Quận/Huyện';
    }

    if (!selectedWardId) {
      newErrors.wardId = 'Vui lòng chọn Phường/Xã';
    }

    if (!addressLine.trim()) {
      newErrors.addressLine = 'Vui lòng nhập địa chỉ cụ thể';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const normalizePhoneForBackend = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Convert to +84xxxxxxxxx format (no spaces, exactly 9 digits after +84)
    if (digits.startsWith('84') && digits.length === 11) {
      // Extract exactly 9 digits after 84
      return '+84' + digits.substring(2, 11);
    }
    if (digits.startsWith('0') && digits.length === 10) {
      // Remove 0 and take 9 digits
      return '+84' + digits.substring(1, 10);
    }
    if (digits.length === 9 && !digits.startsWith('0') && !digits.startsWith('84')) {
      // Already 9 digits without prefix
      return '+84' + digits;
    }

    // Fallback: try to extract 9 digits
    if (digits.startsWith('84') && digits.length >= 11) {
      return '+84' + digits.substring(2, 11);
    }
    if (digits.startsWith('0') && digits.length >= 10) {
      return '+84' + digits.substring(1, 10);
    }
    if (digits.length >= 9) {
      return '+84' + digits.substring(0, 9);
    }

    // Fallback - should not reach here if validation passed
    return '+84' + digits;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const normalizedPhone = normalizePhoneForBackend(recipientPhone);

      const data = {
        recipientName: recipientName.trim(),
        recipientPhone: normalizedPhone,
        addressLine: addressLine.trim(),
        provinceId: selectedProvinceId,
        districtId: selectedDistrictId,
        wardId: selectedWardId,
        label,
        isDefault,
      };

      if (address) {
        // Update existing address
        await apiClient.updateAddress(address.id, data);
      } else {
        // Create new address
        await apiClient.createAddress(data);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {address ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Recipient Name and Phone - Same Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Nhập họ và tên"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.recipientName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.recipientName && (
                <p className="text-red-500 text-xs mt-1">{errors.recipientName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => {
                  setRecipientPhone(e.target.value);
                  // Clear phone error when user starts typing
                  if (errors.recipientPhone) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.recipientPhone;
                      return newErrors;
                    });
                  }
                }}
                onBlur={handlePhoneBlur}
                placeholder="0xxxxxxxxx hoặc (+84) xxx xxx xxx"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.recipientPhone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.recipientPhone && (
                <p className="text-red-500 text-xs mt-1">{errors.recipientPhone}</p>
              )}
            </div>
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProvinceId}
              onChange={handleProvinceChange}
              disabled={loadingProvinces}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.provinceId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
            {errors.provinceId && (
              <p className="text-red-500 text-xs mt-1">{errors.provinceId}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDistrictId}
              onChange={handleDistrictChange}
              disabled={!selectedProvinceId || loadingDistricts}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.districtId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Chọn Quận/Huyện</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
            {errors.districtId && (
              <p className="text-red-500 text-xs mt-1">{errors.districtId}</p>
            )}
          </div>

          {/* Ward */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phường/Xã <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              disabled={!selectedDistrictId || loadingWards}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.wardId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Chọn Phường/Xã</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name}
                </option>
              ))}
            </select>
            {errors.wardId && (
              <p className="text-red-500 text-xs mt-1">{errors.wardId}</p>
            )}
          </div>

          {/* Address Line */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ cụ thể <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Số nhà, tên đường..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.addressLine ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.addressLine && (
              <p className="text-red-500 text-xs mt-1">{errors.addressLine}</p>
            )}
          </div>

          {/* Label Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại địa chỉ
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value={AddressLabel.HOME}
                  checked={label === AddressLabel.HOME}
                  onChange={(e) => setLabel(e.target.value as AddressLabel)}
                  className="mr-2"
                />
                <span className="text-sm">Nhà riêng</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value={AddressLabel.OFFICE}
                  checked={label === AddressLabel.OFFICE}
                  onChange={(e) => setLabel(e.target.value as AddressLabel)}
                  className="mr-2"
                />
                <span className="text-sm">Văn phòng</span>
              </label>
            </div>
          </div>

          {/* Set as Default Checkbox */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Trở lại
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Hoàn thành'}
          </button>
        </div>
      </div>
    </div>
  );
}
