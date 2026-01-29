'use client';

import { useState, useEffect } from 'react';
import { apiClient, SystemConfigResponse } from '@/lib/api';
import { Settings, Percent, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<SystemConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Platform fee state
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(5);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const [configsData, feeData] = await Promise.all([
        apiClient.getSystemConfigs(),
        apiClient.getPlatformFee(),
      ]);
      setConfigs(configsData);
      setPlatformFeePercent(feeData.platformFeePercent);
    } catch (err) {
      console.error('Failed to fetch configs:', err);
      setError('Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlatformFee = async () => {
    if (platformFeePercent < 0 || platformFeePercent > 100) {
      setError('Phí nền tảng phải từ 0% đến 100%');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.updatePlatformFee(platformFeePercent);
      setSuccess('Cập nhật phí nền tảng thành công');
      fetchConfigs();
    } catch (err) {
      console.error('Failed to update platform fee:', err);
      setError('Không thể cập nhật phí nền tảng');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các cấu hình chung của nền tảng
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Platform Fee Config */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Phí nền tảng
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Phần trăm phí mà nền tảng thu từ mỗi đơn hàng
          </p>
        </div>
        <div className="p-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phí nền tảng (%)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={platformFeePercent}
                  onChange={(e) => setPlatformFeePercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              <button
                onClick={handleSavePlatformFee}
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Ví dụ: Nếu đặt 5%, một đơn hàng 100.000đ sẽ thu phí 5.000đ từ shop.
            </p>
          </div>
        </div>
      </div>

      {/* All Configs Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Tất cả cấu hình
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá trị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cập nhật lần cuối
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {configs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Chưa có cấu hình nào
                  </td>
                </tr>
              ) : (
                configs.map((config) => (
                  <tr key={config.key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-800">
                        {config.key}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {config.value}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {config.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(config.updatedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
