'use client';

import { CreditCard, Wallet } from 'lucide-react';
import { type PaymentMethod } from '@/lib/api';

interface PaymentMethodSectionProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

const paymentMethods: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'wallet',
    label: 'Ví điện tử',
    description: 'Thanh toán bằng số dư ví',
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    value: 'vnpay',
    label: 'VNPay',
    description: 'Thanh toán qua cổng VNPay',
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    value: 'wallet_vnpay',
    label: 'Ví + VNPay',
    description: 'Dùng số dư ví, phần còn lại thanh toán VNPay',
    icon: (
      <div className="flex">
        <Wallet className="w-4 h-4" />
        <CreditCard className="w-4 h-4 -ml-1" />
      </div>
    ),
  },
];

export function PaymentMethodSection({
  selectedMethod,
  onMethodChange,
}: PaymentMethodSectionProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h2 className="font-medium mb-4">Phương thức thanh toán</h2>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.value;
          return (
            <button
              key={method.value}
              onClick={() => onMethodChange(method.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-colors text-left ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-primary' : 'border-gray-300'
                }`}
              >
                {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
              </div>
              <div
                className={`p-2 rounded-lg ${
                  isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {method.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium">{method.label}</p>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
