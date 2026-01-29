'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface TopupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function TopupDialog({ isOpen, onClose }: TopupDialogProps) {
  const [amount, setAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePresetClick = (presetAmount: number) => {
    setAmount(presetAmount);
    setIsCustom(false);
    setCustomAmount('');
    setError(null);
  };

  const handleCustomAmountChange = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    setCustomAmount(numericValue);
    setIsCustom(true);
    if (numericValue) {
      setAmount(parseInt(numericValue, 10));
    }
    setError(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const handleTopup = async () => {
    const topupAmount = isCustom ? parseInt(customAmount, 10) : amount;

    if (!topupAmount || topupAmount < 10000) {
      setError('Số tiền nạp tối thiểu là 10,000 VND');
      return;
    }

    if (topupAmount > 50000000) {
      setError('Số tiền nạp tối đa là 50,000,000 VND');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.initiateTopup(topupAmount);

      // Redirect to VNPay payment page
      window.location.href = response.paymentUrl;
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Nạp tiền vào ví</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Preset amounts */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Chọn số tiền</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_AMOUNTS.map((presetAmount) => (
              <button
                key={presetAmount}
                onClick={() => handlePresetClick(presetAmount)}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  !isCustom && amount === presetAmount
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {formatCurrency(presetAmount)}đ
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Hoặc nhập số tiền khác</p>
          <div className="relative">
            <input
              type="text"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              placeholder="Nhập số tiền..."
              className={`w-full px-4 py-3 border rounded-lg text-lg ${
                isCustom
                  ? 'border-emerald-500 ring-1 ring-emerald-500'
                  : 'border-gray-200'
              } focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              VND
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Tối thiểu 10,000 VND - Tối đa 50,000,000 VND
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Số tiền nạp</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(isCustom ? parseInt(customAmount || '0', 10) : amount)} VND
            </span>
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleTopup}
          disabled={isLoading}
          className="w-full bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang xử lý...' : 'Nạp tiền qua VNPay'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Bạn sẽ được chuyển đến trang thanh toán VNPay
        </p>
      </div>
    </div>
  );
}
