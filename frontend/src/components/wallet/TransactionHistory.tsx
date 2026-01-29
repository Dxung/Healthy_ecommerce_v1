'use client';

import { WalletTransactionResponse } from '@/lib/api';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: WalletTransactionResponse[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

function getTransactionIcon(type: string, amount: number) {
  const isPositive = amount >= 0;
  if (isPositive) {
    return <ArrowDownLeft className="w-5 h-5 text-emerald-500" />;
  }
  return <ArrowUpRight className="w-5 h-5 text-red-500" />;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function TransactionHistory({
  transactions,
  isLoading,
  hasMore,
  onLoadMore,
}: TransactionHistoryProps) {
  if (isLoading && transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Lịch sử giao dịch
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Lịch sử giao dịch
        </h2>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có giao dịch nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Lịch sử giao dịch
      </h2>
      <div className="divide-y divide-gray-100">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="py-4 flex items-center gap-4 first:pt-0 last:pb-0"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              {getTransactionIcon(transaction.type, transaction.amount)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {transaction.typeLabel}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {transaction.description || formatDate(transaction.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold ${
                  transaction.amount >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {transaction.formattedAmount}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full mt-4 py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
        >
          {isLoading ? 'Đang tải...' : 'Xem thêm'}
        </button>
      )}
    </div>
  );
}
