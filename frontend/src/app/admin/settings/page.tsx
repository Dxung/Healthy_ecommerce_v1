'use client';

import { useState, useEffect } from 'react';
import { apiClient, SystemConfigResponse } from '@/lib/api';
import { Settings, Save, AlertCircle, CheckCircle, Pencil, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Config key to Vietnamese label mapping
const CONFIG_LABELS: Record<string, string> = {
  platform_fee_percent: 'Phí nền tảng (%)',
  review_window_days: 'Số ngày đánh giá',
  escrow_hold_days: 'Số ngày giữ tiền',
  coin_earn_rate_percent: 'Tỷ lệ tích xu (%)',
  coin_max_usage_percent: 'Giới hạn dùng xu (%)',
  default_max_product_slots: 'Số sản phẩm tối đa (shop chưa badge)',
};

// Config key to unit/suffix mapping
const CONFIG_UNITS: Record<string, string> = {
  platform_fee_percent: '%',
  review_window_days: 'ngày',
  escrow_hold_days: 'ngày',
  coin_earn_rate_percent: '%',
  coin_max_usage_percent: '%',
  default_max_product_slots: 'sản phẩm',
};

interface EditingState {
  key: string;
  value: string;
}

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<SystemConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const configsData = await apiClient.getSystemConfigs();
      setConfigs(configsData);
    } catch (err) {
      console.error('Failed to fetch configs:', err);
      setError('Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: SystemConfigResponse) => {
    setEditing({
      key: config.key,
      value: config.value,
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditing(null);
  };

  const validateValue = (key: string, value: string): string | null => {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return 'Giá trị phải là số';
    }

    if (numValue < 0) {
      return 'Giá trị không được âm';
    }

    // Percentage configs must be between 0-100
    if (key.includes('percent') && (numValue < 0 || numValue > 100)) {
      return 'Giá trị phần trăm phải từ 0 đến 100';
    }

    // Days configs must be integers
    if (key.includes('days') && !Number.isInteger(numValue)) {
      return 'Số ngày phải là số nguyên';
    }

    // Product slots must be positive integer
    if (key === 'default_max_product_slots' && (!Number.isInteger(numValue) || numValue < 1)) {
      return 'Số sản phẩm phải là số nguyên dương';
    }

    return null;
  };

  const handleSave = async () => {
    if (!editing) return;

    const validationError = validateValue(editing.key, editing.value);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.updateSystemConfig(editing.key, editing.value);
      setSuccess(`Đã cập nhật ${CONFIG_LABELS[editing.key] || editing.key}`);
      setEditing(null);
      fetchConfigs();
    } catch (err) {
      console.error('Failed to update config:', err);
      setError('Không thể cập nhật cấu hình');
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

  const getConfigLabel = (key: string): string => {
    return CONFIG_LABELS[key] || key;
  };

  const getConfigUnit = (key: string): string => {
    return CONFIG_UNITS[key] || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

      {/* Configs List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Cấu hình hệ thống
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {configs.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Chưa có cấu hình nào
            </div>
          ) : (
            configs.map((config) => (
              <div key={config.key} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {getConfigLabel(config.key)}
                      </h3>
                      <code className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                        {config.key}
                      </code>
                    </div>
                    {config.description && (
                      <p className="text-sm text-gray-500 mb-2">
                        {config.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Cập nhật: {formatDate(config.updatedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {editing?.key === config.key ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editing.value}
                            onChange={(e) =>
                              setEditing({ ...editing, value: e.target.value })
                            }
                            className="w-24 text-right"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSave();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <span className="text-sm text-gray-500 min-w-[60px]">
                            {getConfigUnit(config.key)}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={saving}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-gray-900">
                            {config.value}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            {getConfigUnit(config.key)}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(config)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Lưu ý</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Các thay đổi sẽ có hiệu lực ngay lập tức</li>
          <li>Phí nền tảng: Phần trăm thu từ mỗi đơn hàng khi shop nhận tiền</li>
          <li>Số ngày đánh giá: Thời gian buyer có thể đánh giá sau khi đơn hoàn thành</li>
          <li>Số ngày giữ tiền: Thời gian chờ trước khi chuyển tiền cho shop sau khi đơn hoàn thành</li>
          <li>Tỷ lệ tích xu: Phần trăm giá trị đơn hàng được quy đổi thành xu</li>
          <li>Giới hạn dùng xu: Phần trăm tối đa giá trị đơn có thể thanh toán bằng xu</li>
          <li>Số sản phẩm tối đa: Giới hạn số sản phẩm shop chưa có badge có thể đăng bán</li>
        </ul>
      </div>
    </div>
  );
}
