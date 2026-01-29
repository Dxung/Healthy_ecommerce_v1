'use client';

import { useState } from 'react';
import { SessionInfo, apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X, ChevronRight } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/time';
import { SessionDetailView } from './SessionDetailView';
import { toast } from 'sonner';

interface SessionListModalProps {
  sessions: SessionInfo[];
  loading: boolean;
  onClose: () => void;
  onSessionsChange: () => void;
}

export function SessionListModal({ sessions, loading, onClose, onSessionsChange }: SessionListModalProps) {
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getCurrentSession = () => {
    if (sessions.length === 0) return null;
    return sessions.reduce((mostRecent, session) =>
      new Date(session.lastActiveAt) > new Date(mostRecent.lastActiveAt) ? session : mostRecent
    );
  };

  const getOtherSessions = () => {
    const currentSession = getCurrentSession();
    if (!currentSession) return sessions;
    return sessions
      .filter(s => s.sessionId !== currentSession.sessionId)
      .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
  };

  const formatSessionDisplay = (session: SessionInfo) => {
    const browser = session.browser || 'Unknown Browser';
    const os = session.os || 'Unknown OS';
    return `${browser} - ${os}`;
  };

  const handleLogoutAllOther = async () => {
    if (!confirm('Bạn có chắc muốn đăng xuất khỏi tất cả thiết bị khác?')) {
      return;
    }

    try {
      setIsLoggingOut(true);
      await apiClient.deleteAllOtherSessions();
      toast.success('Đã đăng xuất khỏi tất cả thiết bị khác');
      onSessionsChange();
    } catch (error) {
      console.error('Failed to logout from other sessions:', error);
      toast.error('Không thể đăng xuất khỏi các thiết bị khác');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSessionDeleted = () => {
    setSelectedSession(null);
    onSessionsChange();
  };

  const currentSession = getCurrentSession();
  const otherSessions = getOtherSessions();

  // If a session is selected, show the detail view
  if (selectedSession) {
    return (
      <SessionDetailView
        session={selectedSession}
        isCurrentSession={currentSession?.sessionId === selectedSession.sessionId}
        onBack={() => setSelectedSession(null)}
        onClose={onClose}
        onSessionDeleted={handleSessionDeleted}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Phiên đăng nhập</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : (
            <div className="space-y-6">
              {/* Current Session */}
              {currentSession && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Bạn đang đăng nhập trên các thiết bị này:
                  </h3>
                  <button
                    onClick={() => setSelectedSession(currentSession)}
                    className="w-full border-2 border-primary bg-primary/5 rounded-md p-4 hover:bg-primary/10 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatSessionDisplay(currentSession)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {currentSession.location || 'Không xác định'}
                        </div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-white text-xs font-semibold rounded mt-2">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Thiết bị này
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-primary" />
                    </div>
                  </button>
                </div>
              )}

              {/* Other Sessions */}
              {otherSessions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Lần đăng nhập trên thiết bị khác:
                  </h3>
                  <div className="space-y-3">
                    {otherSessions.map((session) => (
                      <button
                        key={session.sessionId}
                        onClick={() => setSelectedSession(session)}
                        className="w-full border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {formatSessionDisplay(session)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {session.location || 'Không xác định'}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {formatRelativeTime(new Date(session.lastActiveAt))}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && otherSessions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Button
              onClick={handleLogoutAllOther}
              disabled={isLoggingOut}
              variant="destructive"
              className="w-full"
            >
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất khỏi tất cả thiết bị khác'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
