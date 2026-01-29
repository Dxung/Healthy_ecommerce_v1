'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  apiClient,
  type WalletBalanceResponse,
  type WalletTransactionResponse,
  type ApiError,
} from '@/lib/api';
import { toast } from 'sonner';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, RefreshCw } from 'lucide-react';

const TRANSACTION_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; colorClass: string }
> = {
  escrow_release: {
    label: 'Nhận tiền từ đơn hàng',
    icon: <ArrowDownLeft className="w-4 h-4" />,
    colorClass: 'text-emerald-600 bg-emerald-50',
  },
  platform_fee: {
    label: 'Phí nền tảng',
    icon: <ArrowUpRight className="w-4 h-4" />,
    colorClass: 'text-red-600 bg-red-50',
  },
  withdrawal: {
    label: 'Rút tiền',
    icon: <ArrowUpRight className="w-4 h-4" />,
    colorClass: 'text-orange-600 bg-orange-50',
  },
  refund_deducted: {
    label: 'Hoàn tiền cho khách',
    icon: <ArrowUpRight className="w-4 h-4" />,
    colorClass: 'text-red-600 bg-red-50',
  },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ShopWalletPage() {
  const [balance, setBalance] = useState<WalletBalanceResponse | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBalance = useCallback(async () => {
    try {
      setBalanceLoading(true);
      const data = await apiClient.getShopWalletBalance();
      setBalance(data);
    } catch (err) {
      const error = err as ApiError;
      if (error.statusCode !== 401) {
        toast.error(error.message || 'Không thể tải thông tin ví');
      }
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (pageNum: number) => {
    try {
      setTransactionsLoading(true);
      const data = await apiClient.getShopWalletTransactions(pageNum, 10);

      if (pageNum === 1) {
        setTransactions(data.items);
      } else {
        setTransactions((prev) => [...prev, ...data.items]);
      }

      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (err) {
      const error = err as ApiError;
      if (error.statusCode !== 401) {
        toast.error(error.message || 'Không thể tải lịch sử giao dịch');
      }
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchTransactions(1);
  }, [fetchBalance, fetchTransactions]);

  const handleLoadMore = () => {
    if (!transactionsLoading && hasMore) {
      fetchTransactions(page + 1);
    }
  };

  const handleRefresh = () => {
    fetchBalance();
    fetchTransactions(1);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ví của Shop</h1>
        <button
          onClick={handleRefresh}
          disabled={balanceLoading || transactionsLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${(balanceLoading || transactionsLoading) ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      <div className="space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-emerald-100 font-medium">Số dư khả dụng</span>
          </div>

          {balanceLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-white/20 rounded w-48 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-32"></div>
            </div>
          ) : balance ? (
            <>
              <div className="text-4xl font-bold mb-1">
                {formatCurrency(balance.availableBalance)} <span className="text-2xl">VND</span>
              </div>
              {balance.frozenBalance > 0 && (
                <div className="flex items-center gap-2 text-emerald-100 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Đang chờ: {formatCurrency(balance.frozenBalance)} VND</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-emerald-100">Không thể tải số dư</div>
          )}
        </div>

        {/* Pending Escrow Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Về tiền chờ xử lý</h3>
              <p className="text-sm text-amber-700 mt-1">
                Tiền từ đơn hàng sẽ được chuyển vào ví sau khi khách hàng xác nhận đã nhận hàng.
                Thời gian xử lý thường từ 1-3 ngày làm việc.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lịch sử giao dịch</h2>
          </div>

          {transactionsLoading && transactions.length === 0 ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {transactions.map((transaction) => {
                  const config = TRANSACTION_TYPE_CONFIG[transaction.type] || {
                    label: transaction.typeLabel,
                    icon: <ArrowDownLeft className="w-4 h-4" />,
                    colorClass: 'text-gray-600 bg-gray-50',
                  };
                  const isPositive = transaction.amount > 0;

                  return (
                    <div
                      key={transaction.id}
                      className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${config.colorClass}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {config.label}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </p>
                        {transaction.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                      <div className={`text-right ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        <span className="font-semibold">
                          {isPositive ? '+' : ''}{formatCurrency(transaction.amount)} VND
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <button
                    onClick={handleLoadMore}
                    disabled={transactionsLoading}
                    className="w-full py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                  >
                    {transactionsLoading ? 'Đang tải...' : 'Xem thêm'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
