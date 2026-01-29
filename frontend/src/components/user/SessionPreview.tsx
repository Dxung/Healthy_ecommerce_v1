'use client';

import { SessionInfo } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { formatShortDateTime } from '@/lib/utils/time';

interface SessionPreviewProps {
  sessions: SessionInfo[];
  loading: boolean;
  onViewAll: () => void;
}

export function SessionPreview({ sessions, loading, onViewAll }: SessionPreviewProps) {

  // Find current session and most recent other session
  const getCurrentSession = () => {
    // For now, we'll use a simple heuristic: the session with the most recent lastActiveAt
    // In a real implementation, you'd compare session tokens
    if (sessions.length === 0) return null;
    return sessions.reduce((mostRecent, session) =>
      new Date(session.lastActiveAt) > new Date(mostRecent.lastActiveAt) ? session : mostRecent
    );
  };

  const getMostRecentOtherSession = () => {
    const currentSession = getCurrentSession();
    if (!currentSession || sessions.length <= 1) return null;

    const otherSessions = sessions.filter(s => s.sessionId !== currentSession.sessionId);
    if (otherSessions.length === 0) return null;

    return otherSessions.reduce((mostRecent, session) =>
      new Date(session.lastActiveAt) > new Date(mostRecent.lastActiveAt) ? session : mostRecent
    );
  };

  const formatSessionDisplay = (session: SessionInfo) => {
    const browser = session.browser || 'Unknown Browser';
    const device = session.deviceName || session.os || 'Unknown Device';
    const sessionLocation = session.location || 'Không xác định';
    return { device: `${browser} - ${device}`, location: sessionLocation };
  };

  const currentSession = getCurrentSession();
  const mostRecentOther = getMostRecentOtherSession();

  if (loading) {
    return (
      <div>
        <h2 className="text-base font-medium text-gray-900 mb-4">
          Phiên đăng nhập
        </h2>
        <div className="text-sm text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-medium text-gray-900 mb-4">
        Phiên đăng nhập ({sessions.length} thiết bị)
      </h2>

      <div className="space-y-3">
        {/* Current Session */}
        {currentSession && (
          <div className="border-2 border-primary bg-primary/5 rounded-md p-3">
            <div className="text-sm font-semibold text-gray-900">
              {formatSessionDisplay(currentSession).device}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {formatSessionDisplay(currentSession).location}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-white text-xs font-semibold rounded mt-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Thiết bị này
            </div>
          </div>
        )}

        {/* Most Recent Other Session */}
        {mostRecentOther && (
          <div className="border border-gray-200 rounded-md p-3">
            <div className="text-sm font-medium text-gray-900">
              {formatSessionDisplay(mostRecentOther).device}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {formatSessionDisplay(mostRecentOther).location}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {formatShortDateTime(new Date(mostRecentOther.lastActiveAt))}
            </div>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="link"
        onClick={onViewAll}
        className="mt-3 p-0 h-auto text-primary"
      >
        Xem tất cả phiên →
      </Button>
    </div>
  );
}
