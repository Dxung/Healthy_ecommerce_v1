'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AccountSidebar } from '@/components/user/AccountSidebar';
import { Button } from '@/components/ui/button';
import { SessionPreview } from '@/components/user/SessionPreview';
import { SessionListModal } from '@/components/user/SessionListModal';
import { SessionInfo, apiClient } from '@/lib/api';

export default function SecurityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [passwordUpdatedAt, setPasswordUpdatedAt] = useState<Date | null>(null);
  const [loadingPasswordInfo, setLoadingPasswordInfo] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Prevent duplicate calls in React Strict Mode (development only)
    if (hasFetched.current) return;
    hasFetched.current = true;

    loadSessions();
    loadPasswordInfo();
  }, [user, router]);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const allSessions = await apiClient.getAllSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadPasswordInfo = async () => {
    try {
      setLoadingPasswordInfo(true);
      const result = await apiClient.getPasswordUpdatedAt();
      setPasswordUpdatedAt(result.updatedAt ? new Date(result.updatedAt) : null);
    } catch (error) {
      console.error('Failed to load password info:', error);
    } finally {
      setLoadingPasswordInfo(false);
    }
  };

  const getDaysAgo = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'hôm nay';
    if (diffDays === 1) return '1 ngày trước';
    return `${diffDays} ngày trước`;
  };

  if (!user) {
    return null;
  }

  const handlePasswordChange = () => {
    router.push('/user/account/password');
  };

  const handleDeleteAccount = () => {
    // Placeholder - functionality not implemented yet
    alert('Chức năng xóa tài khoản đang được phát triển');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <AccountSidebar />

          {/* Right Content Card */}
          <div className="flex-1 bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <h1 className="text-lg font-semibold text-gray-900">Bảo mật tài khoản</h1>
            </div>

            <div className="p-6 space-y-8">
              {/* Password Section */}
              <div>
                <h2 className="text-base font-medium text-gray-900 mb-4">Mật khẩu</h2>
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePasswordChange}
                  >
                    Đổi mật khẩu
                  </Button>
                  {loadingPasswordInfo ? (
                    <p className="text-sm text-gray-600">Đang tải...</p>
                  ) : passwordUpdatedAt ? (
                    <p className="text-sm text-gray-600">
                      Lần đổi gần nhất: {getDaysAgo(passwordUpdatedAt)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Chưa có thông tin thay đổi mật khẩu
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Session Preview Section */}
              <SessionPreview
                sessions={sessions}
                loading={loadingSessions}
                onViewAll={() => setShowSessionModal(true)}
              />

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Delete Account Section */}
              <div>
                <h2 className="text-base font-medium text-gray-900 mb-4">Xóa tài khoản</h2>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteAccount}
                >
                  Xóa tài khoản
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session List Modal */}
      {showSessionModal && (
        <SessionListModal
          sessions={sessions}
          loading={loadingSessions}
          onClose={() => setShowSessionModal(false)}
          onSessionsChange={loadSessions}
        />
      )}
    </div>
  );
}
