'use client';

import { WalletBalanceResponse } from '@/lib/api';
import { Wallet } from 'lucide-react';

interface WalletBalanceCardProps {
  balance: WalletBalanceResponse | null;
  isLoading: boolean;
  onTopupClick: () => void;
}

export default function WalletBalanceCard({
  balance,
  isLoading,
  onTopupClick,
}: WalletBalanceCardProps) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-24 mb-2"></div>
          <div className="h-8 bg-white/20 rounded w-48 mb-4"></div>
          <div className="h-10 bg-white/20 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/20 rounded-lg">
          <Wallet className="w-6 h-6" />
        </div>
        <span className="text-lg font-medium opacity-90">Ví của tôi</span>
      </div>

      <div className="mb-6">
        <p className="text-sm opacity-80 mb-1">Số dư khả dụng</p>
        <p className="text-3xl font-bold">
          {balance?.formattedAvailableBalance || '0 ₫'}
        </p>
        {balance && balance.frozenBalance > 0 && (
          <p className="text-sm opacity-70 mt-1">
            Đang tạm giữ: {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(balance.frozenBalance)}
          </p>
        )}
      </div>

      <button
        onClick={onTopupClick}
        className="w-full bg-white text-emerald-600 font-semibold py-3 px-4 rounded-xl hover:bg-emerald-50 transition-colors"
      >
        Nạp tiền
      </button>
    </div>
  );
}
