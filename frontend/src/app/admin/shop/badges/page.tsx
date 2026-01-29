'use client';

import { useState } from 'react';
import { apiClient, type BadgeCode, type ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Settings, Award, Star, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BadgeConfigModal } from '@/components/admin/BadgeConfigModal';
import { useBadges } from '@/lib/hooks/useAdminData';

const badgeIcons: Record<BadgeCode, React.ReactNode> = {
  preferred: <Star className="w-5 h-5 text-yellow-500" />,
  approved: <CheckCircle className="w-5 h-5 text-blue-500" />,
  official: <Award className="w-5 h-5 text-purple-500" />,
};

export default function BadgesPage() {
  const { badges, isLoading: loading, refresh: refreshBadges } = useBadges();
  const [toggling, setToggling] = useState<BadgeCode | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeCode | null>(null);

  const handleToggleActive = async (code: BadgeCode) => {
    try {
      setToggling(code);
      const updated = await apiClient.toggleBadgeActive(code);
      refreshBadges();
      toast.success(
        updated.isActive ? 'Đã kích hoạt badge' : 'Đã vô hiệu hóa badge'
      );
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thay đổi trạng thái badge');
    } finally {
      setToggling(null);
    }
  };

  const handleBadgeUpdated = () => {
    refreshBadges();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cấu hình Badge</h1>
        <p className="text-gray-500 mt-1">
          Quản lý các loại badge và yêu cầu để đạt được badge
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {badges.map((badge) => (
            <div
              key={badge.code}
              className="p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {badgeIcons[badge.code]}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{badge.name}</h3>
                  <p className="text-sm text-gray-500">{badge.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    {badge.platformFeeDiscountPercent && (
                      <span>Giảm phí: {badge.platformFeeDiscountPercent}%</span>
                    )}
                    {badge.searchBoostMultiplier && (
                      <span>Boost tìm kiếm: x{badge.searchBoostMultiplier}</span>
                    )}
                    <span>Slot SP: {badge.maxProductSlots}</span>
                    <span>{badge.requirementsCount} yêu cầu</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {badge.isActive ? 'Đang bật' : 'Đang tắt'}
                  </span>
                  <Switch
                    checked={badge.isActive}
                    onCheckedChange={() => handleToggleActive(badge.code)}
                    disabled={toggling === badge.code}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBadge(badge.code)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Cấu hình
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedBadge && (
        <BadgeConfigModal
          badgeCode={selectedBadge}
          onClose={() => setSelectedBadge(null)}
          onUpdated={handleBadgeUpdated}
        />
      )}
    </div>
  );
}
