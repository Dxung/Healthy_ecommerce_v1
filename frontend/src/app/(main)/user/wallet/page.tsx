'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  apiClient,
  type WalletBalanceResponse,
  type WalletTransactionResponse,
  type CoinWalletResponse,
  type CoinTransactionResponse,
  type ApiError,
} from '@/lib/api';
import {
  WalletBalanceCard,
  TransactionHistory,
  TopupDialog,
} from '@/components/wallet';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function WalletPageContent() {
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState<WalletBalanceResponse | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [showTopupDialog, setShowTopupDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Coin wallet state
  const [coinWallet, setCoinWallet] = useState<CoinWalletResponse | null>(null);
  const [coinTransactions, setCoinTransactions] = useState<CoinTransactionResponse[]>([]);
  const [coinLoading, setCoinLoading] = useState(true);
  const [coinTxLoading, setCoinTxLoading] = useState(true);
  const [coinPage, setCoinPage] = useState(1);
  const [coinHasMore, setCoinHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'vnd' | 'coin'>('vnd');

  // Handle payment status from URL params
  useEffect(() => {
    const status = searchParams.get('status');
    const amount = searchParams.get('amount');

    if (status === 'success') {
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>Nạp tiền thành công{amount ? `: ${parseInt(amount).toLocaleString('vi-VN')} VND` : ''}</span>
        </div>
      );
      // Refresh balance after successful topup
      fetchBalance();
      fetchTransactions(1);
    } else if (status === 'failed') {
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <span>Nạp tiền thất bại. Vui lòng thử lại.</span>
        </div>
      );
    } else if (status === 'error') {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span>Có lỗi xảy ra. Vui lòng liên hệ hỗ trợ.</span>
        </div>
      );
    }
  }, [searchParams]);

  const fetchBalance = useCallback(async () => {
    try {
      setBalanceLoading(true);
      const data = await apiClient.getWalletBalance();
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
      const data = await apiClient.getWalletTransactions(pageNum, 10);

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

  const fetchCoinWallet = useCallback(async () => {
    try {
      setCoinLoading(true);
      const data = await apiClient.getCoinWallet();
      setCoinWallet(data);
    } catch (err) {
      const error = err as ApiError;
      if (error.statusCode !== 401) {
        console.error('Failed to load coin wallet:', error.message);
      }
    } finally {
      setCoinLoading(false);
    }
  }, []);

  const fetchCoinTransactions = useCallback(async (pageNum: number) => {
    try {
      setCoinTxLoading(true);
      const data = await apiClient.getCoinTransactions(pageNum, 10);

      if (pageNum === 1) {
        setCoinTransactions(data.items);
      } else {
        setCoinTransactions((prev) => [...prev, ...data.items]);
      }

      setCoinHasMore(pageNum < data.totalPages);
      setCoinPage(pageNum);
    } catch (err) {
      const error = err as ApiError;
      if (error.statusCode !== 401) {
        console.error('Failed to load coin transactions:', error.message);
      }
    } finally {
      setCoinTxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchTransactions(1);
    fetchCoinWallet();
    fetchCoinTransactions(1);
  }, [fetchBalance, fetchTransactions, fetchCoinWallet, fetchCoinTransactions]);

  const handleLoadMore = () => {
    if (!transactionsLoading && hasMore) {
      fetchTransactions(page + 1);
    }
  };

  const handleCoinLoadMore = () => {
    if (!coinTxLoading && coinHasMore) {
      fetchCoinTransactions(coinPage + 1);
    }
  };

  const handleTopupClick = () => {
    setShowTopupDialog(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ví của tôi</h1>

      {/* Wallet Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('vnd')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'vnd'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          💰 Ví tiền
        </button>
        <button
          onClick={() => setActiveTab('coin')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'coin'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Coins className="w-4 h-4 inline-block mr-1" />
          Xu tích lũy
        </button>
      </div>

      {activeTab === 'vnd' ? (
        <div className="space-y-6">
          {/* Balance Card */}
          <WalletBalanceCard
            balance={balance}
            isLoading={balanceLoading}
            onTopupClick={handleTopupClick}
          />

          {/* Transaction History */}
          <TransactionHistory
            transactions={transactions}
            isLoading={transactionsLoading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Coin Balance Card */}
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5" />
              <span className="text-amber-100">Xu tích lũy</span>
            </div>
            {coinLoading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-white/20 rounded w-32 mb-2"></div>
              </div>
            ) : (
              <>
                <div className="text-4xl font-bold mb-1">
                  {coinWallet?.balance.toLocaleString('vi-VN') || 0} xu
                </div>
                <p className="text-amber-100 text-sm">
                  Tương đương {((coinWallet?.balance || 0)).toLocaleString('vi-VN')} VND
                </p>
              </>
            )}
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-amber-100">
                💡 Mua hàng để tích xu. Cứ 1,000 VND = 1 xu
              </p>
            </div>
          </div>

          {/* Coin Transaction History */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Lịch sử xu</h3>
            {coinTxLoading && coinTransactions.length === 0 ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : coinTransactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Chưa có giao dịch xu nào</p>
            ) : (
              <div className="space-y-3">
                {coinTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'earned' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {tx.type === 'earned' ? (
                        <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {tx.description || (tx.type === 'earned' ? 'Nhận xu' : 'Sử dụng xu')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className={`font-semibold ${
                      tx.type === 'earned' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'earned' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} xu
                    </div>
                  </div>
                ))}
                {coinHasMore && (
                  <button
                    onClick={handleCoinLoadMore}
                    disabled={coinTxLoading}
                    className="w-full py-2 text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
                  >
                    {coinTxLoading ? 'Đang tải...' : 'Xem thêm'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Topup Dialog */}
      <TopupDialog
        isOpen={showTopupDialog}
        onClose={() => setShowTopupDialog(false)}
      />
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<WalletPageLoading />}>
      <WalletPageContent />
    </Suspense>
  );
}

function WalletPageLoading() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ví của tôi</h1>
      <div className="animate-pulse space-y-6">
        <div className="bg-gray-200 rounded-2xl h-48"></div>
        <div className="bg-gray-200 rounded-xl h-64"></div>
      </div>
    </div>
  );
}
