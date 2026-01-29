"use client";

import { Clock, FileText, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ShopRegistrationStatusResponse } from "@/lib/api";

interface PendingRegistrationProps {
  registration: ShopRegistrationStatusResponse;
}

export function PendingRegistration({ registration }: PendingRegistrationProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      title: "Đang chờ duyệt",
      description: "Yêu cầu đăng ký cửa hàng của bạn đang được xem xét. Chúng tôi sẽ thông báo cho bạn khi có kết quả.",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-500",
      borderColor: "border-yellow-200",
    },
    approved: {
      icon: CheckCircle,
      title: "Đã được duyệt",
      description: "Chúc mừng! Cửa hàng của bạn đã được duyệt thành công.",
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
      borderColor: "border-green-200",
    },
    rejected: {
      icon: XCircle,
      title: "Đã bị từ chối",
      description: "Yêu cầu đăng ký cửa hàng của bạn đã bị từ chối.",
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
      borderColor: "border-red-200",
    },
  };

  const config = statusConfig[registration.status];
  const StatusIcon = config.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center`}>
              <StatusIcon className={`w-8 h-8 ${config.iconColor}`} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
          <p className="text-gray-600 mt-2">{config.description}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Shop Info */}
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Tên cửa hàng</span>
              <span className="font-medium text-gray-900">{registration.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">URL cửa hàng</span>
              <span className="font-medium text-gray-900">/{registration.slug}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Ngày đăng ký</span>
              <span className="font-medium text-gray-900">{formatDate(registration.createdAt)}</span>
            </div>
            {registration.reviewedAt && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Ngày xét duyệt</span>
                <span className="font-medium text-gray-900">{formatDate(registration.reviewedAt)}</span>
              </div>
            )}
          </div>

          {/* Documents Info */}
          {(registration.documentsCount > 0 || registration.brandDocumentsCount > 0) && (
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">Tài liệu đã nộp</span>
              </div>
              <div className="space-y-2 text-sm">
                {registration.documentsCount > 0 && (
                  <p className="text-gray-600">
                    Tài liệu kinh doanh: {registration.documentsCount} tài liệu
                  </p>
                )}
                {registration.brandDocumentsCount > 0 && (
                  <p className="text-gray-600">
                    Tài liệu thương hiệu: {registration.brandDocumentsCount} tài liệu
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {registration.status === "rejected" && registration.rejectionReason && (
            <div className="bg-red-100 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-1">Lý do từ chối:</p>
              <p className="text-red-700">{registration.rejectionReason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
