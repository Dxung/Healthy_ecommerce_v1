'use client';

import { CreditCard, Wallet, Coins } from 'lucide-react';
import { type PaymentMethod } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';

interface PaymentMethodSectionProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  useCoin: boolean;
  onUseCoinChange: (useCoin: boolean) => void;
  coinBalance: number;
  walletBalance: number;
  totalAmount: number;
  subtotal: number;
  coinMaxUsagePercent: number;
}

const paymentMethods: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'wallet',
    label: 'Ví tài khoản',
    description: 'Thanh toán bằng số dư ví trên sàn',
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    value: 'vnpay',
    label: 'VNPay',
    description: 'Thanh toán qua cổng VNPay',
    icon: <CreditCard className="w-5 h-5" />,
  },
];

export function PaymentMethodSection({
  selectedMethod,
  onMethodChange,
  useCoin,
  onUseCoinChange,
  coinBalance,
  walletBalance,
  totalAmount,
  subtotal,
  coinMaxUsagePercent,
}: PaymentMethodSectionProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatCoin = (coin: number) => {
    return new Intl.NumberFormat('vi-VN').format(coin);
  };

  const isWalletInsufficient = walletBalance < totalAmount;

  // Calculate max usable coins: min of (user's balance, max allowed by percent)
  const maxCoinAllowed = Math.floor((subtotal * coinMaxUsagePercent) / 100);
  const usableCoin = Math.min(coinBalance, maxCoinAllowed);

  return (
    <div className="bg-white rounded-lg border p-4">
      <h2 className="font-medium mb-4">Phương thức thanh toán</h2>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.value;
          const isWalletDisabled = method.value === 'wallet' && isWalletInsufficient;

          return (
            <button
              key={method.value}
              onClick={() => !isWalletDisabled && onMethodChange(method.value)}
              disabled={isWalletDisabled}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-colors text-left ${
                isWalletDisabled
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  : isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isWalletDisabled
                    ? 'border-gray-300'
                    : isSelected
                    ? 'border-primary'
                    : 'border-gray-300'
                }`}
              >
                {isSelected && !isWalletDisabled && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </div>
              <div
                className={`p-2 rounded-lg ${
                  isWalletDisabled
                    ? 'bg-gray-100 text-gray-400'
                    : isSelected
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {method.icon}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isWalletDisabled ? 'text-gray-400' : ''}`}>
                  {method.label}
                </p>
                <p className={`text-sm ${isWalletDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                  {method.description}
                </p>
                {method.value === 'wallet' && (
                  <div className="mt-1">
                    <p className={`text-sm font-medium ${isWalletInsufficient ? 'text-red-500' : 'text-primary'}`}>
                      Số dư: {formatPrice(walletBalance)}
                    </p>
                    {isWalletInsufficient && (
                      <p className="text-xs text-red-500">
                        Số dư ví không đủ để thanh toán đơn hàng
                      </p>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Coin Usage Section */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              id="use-coin"
              checked={useCoin}
              onCheckedChange={(checked) => onUseCoinChange(checked === true)}
              disabled={usableCoin <= 0}
            />
            <label
              htmlFor="use-coin"
              className={`flex items-center gap-2 cursor-pointer ${
                usableCoin <= 0 ? 'text-gray-400' : 'text-gray-700'
              }`}
            >
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Sử dụng xu</span>
            </label>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Xu hiện có</p>
            <p className={`font-semibold ${coinBalance > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
              {formatCoin(coinBalance)} xu
            </p>
          </div>
        </div>
        {coinBalance <= 0 ? (
          <p className="text-xs text-gray-400 mt-2 ml-7">
            Bạn chưa có xu. Hoàn thành đơn hàng để nhận xu.
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-2 ml-7">
            Có thể dùng tối đa{' '}
            <span className="font-medium text-yellow-600">{formatCoin(usableCoin)} xu</span>
            {' '}(-{formatPrice(usableCoin)})
            {coinBalance > maxCoinAllowed && (
              <span className="text-gray-400"> (tối đa {coinMaxUsagePercent}% giá trị đơn hàng)</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
