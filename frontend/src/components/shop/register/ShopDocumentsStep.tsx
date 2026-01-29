'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, FileText, CheckCircle } from 'lucide-react';
import { apiClient, type ApiError, type ShopRegistrationStatusResponse } from '@/lib/api';

interface ShopDocumentsStepProps {
  token: string;
  shopName: string;
  onSuccess: (result: ShopRegistrationStatusResponse) => void;
  onBack: () => void;
}

export function ShopDocumentsStep({ token, shopName, onSuccess, onBack }: ShopDocumentsStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For now, we'll skip document upload and just complete the registration
  // Document upload feature can be added later
  const handleSubmit = async (skipDocuments: boolean = true) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.completeShopRegistration({
        token,
        // No documents for now - user can apply for badge later
        documents: [],
        brandDocuments: [],
      });

      onSuccess(response);
    } catch (err: any) {
      console.error('Error completing registration:', err);
      const apiError = err as ApiError;

      if (apiError.statusCode === 401) {
        setError('Phiên đăng ký đã hết hạn. Vui lòng bắt đầu lại.');
      } else if (apiError.statusCode === 400) {
        setError(apiError.message || 'Thông tin không hợp lệ');
      } else {
        setError(apiError.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={loading}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900 disabled:opacity-50"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Quay lại
      </button>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Hoàn tất đăng ký</h1>
        <p className="text-sm text-gray-500 mt-1">Bước 2: Tài liệu (tùy chọn)</p>
      </div>

      {/* Shop Info Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Thông tin cửa hàng đã được ghi nhận</span>
        </div>
        <p className="text-green-600 mt-1 ml-7">{shopName}</p>
      </div>

      {/* Documents Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">Tài liệu kinh doanh</h3>
            <p className="text-sm text-gray-500 mt-1">
              Bạn có thể nộp tài liệu kinh doanh sau để được cấp huy hiệu &quot;Đã xác thực&quot;.
              Điều này giúp tăng độ tin cậy với khách hàng.
            </p>
            <p className="text-sm text-primary mt-2">
              Tính năng upload tài liệu sẽ được cập nhật trong thời gian tới.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => handleSubmit(true)}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            'Hoàn tất đăng ký'
          )}
        </Button>

        <p className="text-xs text-center text-gray-500">
          Bạn có thể bổ sung tài liệu sau trong phần quản lý cửa hàng
        </p>
      </div>
    </div>
  );
}
