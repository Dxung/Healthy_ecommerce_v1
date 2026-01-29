'use client';

import { useState } from 'react';
import { SessionInfo, apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft } from 'lucide-react';
import { formatAbsoluteDateTime, formatRelativeTime } from '@/lib/utils/time';
import { toast } from 'sonner';

interface SessionDetailViewProps {
  session: SessionInfo;
  isCurrentSession: boolean;
  onBack: () => void;
  onClose: () => void;
  onSessionDeleted: () => void;
}

export function SessionDetailView({
  session,
  isCurrentSession,
  onBack,
  onClose,
  onSessionDeleted,
}: SessionDetailViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const maskIP = (ip: string) => {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    // For IPv6 or other formats, just show first part
    return ip.split(':')[0] + ':xxx';
  };

  const handleLogout = async () => {
    if (!confirm('Bạn có chắc muốn đăng xuất khỏi thiết bị này?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await apiClient.deleteSession(session.sessionId);
      toast.success('Đã đăng xuất khỏi thiết bị');
      onSessionDeleted();
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Không thể đăng xuất khỏi thiết bị');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Chi tiết phiên</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Location and Time */}
            <div>
              <div className="text-base font-medium text-gray-900">
                {session.location || 'Không xác định'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatRelativeTime(new Date(session.lastActiveAt))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Device Details */}
            <div className="space-y-3">
              <div className="flex">
                <span className="w-32 text-sm text-gray-700">Thiết bị:</span>
                <span className="text-sm text-gray-900 font-medium">
                  {session.browser || 'Unknown'} - {session.deviceName || session.os || 'Unknown'}
                </span>
              </div>

              <div className="flex">
                <span className="w-32 text-sm text-gray-700">Trình duyệt:</span>
                <span className="text-sm text-gray-900 font-medium">
                  {session.browser || 'Unknown'}
                </span>
              </div>

              <div className="flex">
                <span className="w-32 text-sm text-gray-700">Hệ điều hành:</span>
                <span className="text-sm text-gray-900 font-medium">
                  {session.os || 'Unknown'}
                </span>
              </div>

              <div className="flex">
                <span className="w-32 text-sm text-gray-700">Địa chỉ:</span>
                <span className="text-sm text-gray-900 font-medium">
                  {maskIP(session.ip)}
                </span>
              </div>

              <div className="flex">
                <span className="w-32 text-sm text-gray-700">Đăng nhập lúc:</span>
                <span className="text-sm text-gray-900 font-medium">
                  {formatAbsoluteDateTime(new Date(session.createdAt))}
                </span>
              </div>

              <div className="flex">
                <span className="w-32 text-sm text-gray-700">Hoạt động gần nhất:</span>
                <span className="text-sm text-gray-900 font-medium">
                  {formatAbsoluteDateTime(new Date(session.lastActiveAt))}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Recent Logins - Placeholder for now */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Lần đăng nhập gần đây:
              </h3>
              <div className="border border-gray-200 rounded-md p-3">
                <div className="text-xs text-gray-600">
                  {session.location || 'Không xác định'}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {formatRelativeTime(new Date(session.createdAt))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Only show logout button for non-current sessions */}
        {!isCurrentSession && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              disabled={isDeleting}
              variant="destructive"
              className="w-full"
            >
              {isDeleting ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
