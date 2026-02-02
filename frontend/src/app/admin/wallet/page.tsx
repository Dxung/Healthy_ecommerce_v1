'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  apiClient,
  PlatformWalletResponse,
  PlatformTransactionResponse,
  AdminEscrowResponse,
  EscrowStatus,
} from '@/lib/api';
import {
  Wallet,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Ban,
} from 'lucide-react';

type TabType = 'wallet' | 'escrow';

const ESCROW_STATUSES: { value: EscrowStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'holding', label: 'Đang giữ' },
  { value: 'released', label: 'Đã giải ngân' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

const getEscrowStatusColor = (status: EscrowStatus): string => {
  switch (status) {
    case 'holding':
      return 'bg-yellow-100 text-yellow-800';
    case 'released':
      return 'bg-green-100 text-green-800';
    case 'refunded':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getEscrowStatusIcon = (status: EscrowStatus) => {
  switch (status) {
    case 'holding':
      return <ShieldCheck className="w-4 h-4" />;
    case 'released':
      return <RefreshCw className="w-4 h-4" />;
    case 'refunded':
      return <Ban className="w-4 h-4" />;
    default:
      return null;
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminWalletPage() {
  const [activeTab, setActiveTab] = useState<TabType>('wallet');

  // Wallet state
  const [wallet, setWallet] = useState<PlatformWalletResponse | null>(null);
  const [transactions, setTransactions] = useState<PlatformTransactionResponse[]>([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [txnPage, setTxnPage] = useState(1);
  const [txnTotalPages, setTxnTotalPages] = useState(1);
  const [txnTotal, setTxnTotal] = useState(0);

  // Escrow state
  const [escrows, setEscrows] = useState<AdminEscrowResponse[]>([]);
  const [escrowLoading, setEscrowLoading] = useState(true);
  const [escrowStatusFilter, setEscrowStatusFilter] = useState<EscrowStatus | ''>('');
  const [escrowFromDate, setEscrowFromDate] = useState('');
  const [escrowToDate, setEscrowToDate] = useState('');
  const [escrowPage, setEscrowPage] = useState(1);
  const [escrowTotalPages, setEscrowTotalPages] = useState(1);
  const [escrowTotal, setEscrowTotal] = useState(0);

  const limit = 20;

  const fetchWalletData = useCallback(async () => {
    setWalletLoading(true);
    try {
      const [walletData, txnData] = await Promise.all([
        apiClient.getPlatformWallet(),
        apiClient.getPlatformWalletTransactions(txnPage, limit),
      ]);
      setWallet(walletData);
      setTransactions(txnData.items);
      setTxnTotalPages(txnData.totalPages);
      setTxnTotal(txnData.total);
    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
    } finally {
      setWalletLoading(false);
    }
  }, [txnPage]);

  const fetchEscrowData = useCallback(async () => {
    setEscrowLoading(true);
    try {
      const data = await apiClient.getAdminEscrows({
        status: escrowStatusFilter || undefined,
        fromDate: escrowFromDate || undefined,
        toDate: escrowToDate || undefined,
        page: escrowPage,
        limit,
      });
      setEscrows(data.items);
      setEscrowTotalPages(data.totalPages);
      setEscrowTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch escrow data:', err);
    } finally {
      setEscrowLoading(false);
    }
  }, [escrowStatusFilter, escrowFromDate, escrowToDate, escrowPage]);

  useEffect(() => {
    if (activeTab === 'wallet') {
      fetchWalletData();
    }
  }, [activeTab, fetchWalletData]);

  useEffect(() => {
    if (activeTab === 'escrow') {
      fetchEscrowData();
    }
  }, [activeTab, fetchEscrowData]);

  const handleEscrowFilterChange = () => {
    setEscrowPage(1);
    fetchEscrowData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ví nền tảng</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý ví nền tảng và escrow holds
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'wallet'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Wallet className="w-4 h-4 inline-block mr-2" />
            Ví nền tảng
          </button>
          <button
            onClick={() => setActiveTab('escrow')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'escrow'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4 inline-block mr-2" />
            Escrow Holds
          </button>
        </nav>
      </div>

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {walletLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số dư hiện tại</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {wallet?.formattedBalance || formatCurrency(0)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số dư đóng băng</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(wallet?.frozenBalance || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Lịch sử giao dịch
                  </h2>
                </div>

                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <ArrowUpDown className="w-12 h-12 mb-2" />
                    <p>Chưa có giao dịch nào</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thời gian
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Loại
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mô tả
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Số tiền
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Số dư sau
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {transactions.map((txn) => (
                            <tr key={txn.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(txn.createdAt)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {txn.typeLabel}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500">
                                {txn.description || '-'}
                              </td>
                              <td
                                className={`px-4 py-4 whitespace-nowrap text-sm font-medium text-right ${
                                  txn.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {txn.formattedAmount}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(txn.balanceAfter)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200">
                      <div className="text-xs sm:text-sm text-gray-500">
                        Hiển thị {(txnPage - 1) * limit + 1} -{' '}
                        {Math.min(txnPage * limit, txnTotal)} trong {txnTotal} giao dịch
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setTxnPage((p) => Math.max(1, p - 1))}
                          disabled={txnPage === 1}
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm">
                          Trang {txnPage} / {txnTotalPages}
                        </span>
                        <button
                          onClick={() => setTxnPage((p) => Math.min(txnTotalPages, p + 1))}
                          disabled={txnPage === txnTotalPages}
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Escrow Tab */}
      {activeTab === 'escrow' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <select
                value={escrowStatusFilter}
                onChange={(e) => {
                  setEscrowStatusFilter(e.target.value as EscrowStatus | '');
                  setEscrowPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              >
                {ESCROW_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              {/* From Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={escrowFromDate}
                  onChange={(e) => {
                    setEscrowFromDate(e.target.value);
                    setEscrowPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  placeholder="Từ ngày"
                />
              </div>

              {/* To Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={escrowToDate}
                  onChange={(e) => {
                    setEscrowToDate(e.target.value);
                    setEscrowPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  placeholder="Đến ngày"
                />
              </div>

              {/* Search Button */}
              <button
                onClick={handleEscrowFilterChange}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Lọc
              </button>
            </div>
          </div>

          {/* Escrows Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {escrowLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : escrows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <ShieldCheck className="w-12 h-12 mb-2" />
                <p>Không có escrow nào</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mã đơn
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Shop
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số tiền
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phí nền tảng %
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày release
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {escrows.map((escrow) => (
                        <tr key={escrow.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-primary">
                              {escrow.orderCode}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {escrow.shopName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {escrow.formattedAmount}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {escrow.platformFeePercent.toFixed(2)}%
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getEscrowStatusColor(escrow.status)}`}
                            >
                              {getEscrowStatusIcon(escrow.status)}
                              {escrow.statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(escrow.createdAt)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {escrow.releasedAt ? formatDate(escrow.releasedAt) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200">
                  <div className="text-xs sm:text-sm text-gray-500">
                    Hiển thị {(escrowPage - 1) * limit + 1} -{' '}
                    {Math.min(escrowPage * limit, escrowTotal)} trong {escrowTotal} escrow
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEscrowPage((p) => Math.max(1, p - 1))}
                      disabled={escrowPage === 1}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm">
                      Trang {escrowPage} / {escrowTotalPages}
                    </span>
                    <button
                      onClick={() => setEscrowPage((p) => Math.min(escrowTotalPages, p + 1))}
                      disabled={escrowPage === escrowTotalPages}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
