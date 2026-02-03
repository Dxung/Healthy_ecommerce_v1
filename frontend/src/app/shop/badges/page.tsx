'use client';

import { useState, useEffect } from 'react';
import {
  apiClient,
  type ShopBadgeAssignmentResponse,
  type ShopOfficialBrandResponse,
  type BadgeApplicationResponse,
  type BrandResponse,
  type DocumentTypeResponse,
  type ApiError,
} from '@/lib/api';
import {
  Loader2,
  Award,
  Shield,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  FileText,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ApplyOfficialBadgeModal } from '@/components/shop/ApplyOfficialBadgeModal';
import { ApplyVerifiedBadgeModal } from '@/components/shop/ApplyVerifiedBadgeModal';

type TabType = 'badges' | 'applications' | 'official-brands';

const badgeInfo: Record<string, { name: string; description: string; icon: React.ReactNode; color: string }> = {
  preferred: {
    name: 'Shop Ưu tiên',
    description: 'Tự động cấp dựa trên chỉ số của shop (đánh giá, tỷ lệ đơn thành công, ...)',
    icon: <Star className="w-5 h-5" />,
    color: 'text-yellow-500',
  },
  approved: {
    name: 'Shop Xác thực',
    description: 'Shop đã xác thực giấy tờ hợp lệ',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-blue-500',
  },
  official: {
    name: 'Shop Chính hãng',
    description: 'Đại lý chính thức được ủy quyền bởi thương hiệu',
    icon: <Award className="w-5 h-5" />,
    color: 'text-green-500',
  },
};

const applicationStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Đang chờ duyệt', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> },
  approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
  cancelled: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700', icon: <XCircle className="w-4 h-4" /> },
};

export default function ShopBadgesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('badges');
  const [badges, setBadges] = useState<ShopBadgeAssignmentResponse[]>([]);
  const [officialBrands, setOfficialBrands] = useState<ShopOfficialBrandResponse[]>([]);
  const [applications, setApplications] = useState<BadgeApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyOfficialModal, setShowApplyOfficialModal] = useState(false);
  const [showApplyVerifiedModal, setShowApplyVerifiedModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [badgesData, brandsData, appsData] = await Promise.all([
        apiClient.getMyShopBadges(),
        apiClient.getMyOfficialBrands(),
        apiClient.getMyBadgeApplications(),
      ]);
      setBadges(badgesData);
      setOfficialBrands(brandsData);
      setApplications(appsData);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelApplication = async (applicationId: string) => {
    try {
      await apiClient.cancelBadgeApplication(applicationId);
      toast.success('Đã hủy đơn đăng ký');
      fetchData();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể hủy đơn đăng ký');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Check if shop already has badges or pending applications
  const hasVerifiedBadge = badges.some(b => b.badgeCode === 'approved' && b.status === 'active');
  const hasPendingVerifiedApplication = applications.some(
    a => a.badgeCode === 'approved' && a.status === 'pending'
  );
  const hasOfficialBadge = badges.some(b => b.badgeCode === 'official' && b.status === 'active');
  const hasPendingOfficialApplication = applications.some(
    a => a.badgeCode === 'official' && a.status === 'pending'
  );

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Huy hiệu & Chứng nhận</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý huy hiệu và đăng ký chứng nhận cho shop của bạn
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {[
            { key: 'badges', label: 'Huy hiệu của tôi', count: badges.length },
            { key: 'official-brands', label: 'Thương hiệu Chính hãng', count: officialBrands.length },
            { key: 'applications', label: 'Đơn đăng ký', count: applications.filter(a => a.status === 'pending').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          {/* Current Badges */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badges.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg border p-8 text-center">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Shop chưa có huy hiệu nào</p>
                <p className="text-sm text-gray-400 mt-1">
                  Đăng ký chứng nhận để nhận huy hiệu và các quyền lợi đặc biệt
                </p>
              </div>
            ) : (
              badges.map((badge) => {
                const info = badgeInfo[badge.badgeCode];
                return (
                  <div
                    key={badge.id}
                    className={`bg-white rounded-lg border p-4 ${
                      badge.status === 'active' ? '' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${info?.color}`}>
                        {info?.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{info?.name || badge.badgeName}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            badge.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {badge.status === 'active' ? 'Đang hoạt động' : 'Đã vô hiệu'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{info?.description}</p>
                        {badge.expiresAt && (
                          <p className="text-xs text-gray-400 mt-2">
                            Hết hạn: {formatDate(badge.expiresAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Register for Verified Badge */}
          {!hasVerifiedBadge && !hasPendingVerifiedApplication && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Đăng ký Shop Xác thực</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Xác thực giấy tờ hợp lệ để nhận huy hiệu "Shop Xác thực" và tăng độ tin cậy với khách hàng.
                  </p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => setShowApplyVerifiedModal(true)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Đăng ký ngay
                  </Button>
                </div>
              </div>
            </div>
          )}
          {hasPendingVerifiedApplication && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-700">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Đơn đăng ký Shop Xác thực đang chờ duyệt</span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'official-brands' && (
        <div className="space-y-4">
          {officialBrands.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có thương hiệu chính hãng nào</p>
              <p className="text-sm text-gray-400 mt-1">
                Đăng ký để trở thành đại lý chính thức của thương hiệu
              </p>
              <Button onClick={() => setShowApplyOfficialModal(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Đăng ký ngay
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Thương hiệu</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Ngày cấp</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Hết hạn</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {officialBrands.map((brand) => {
                    const isActive = !brand.revokedAt && new Date(brand.expiresAt) > new Date();
                    return (
                      <tr key={brand.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-medium text-gray-900">{brand.brandName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(brand.grantedAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(brand.expiresAt)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {isActive ? 'Đang hoạt động' : brand.revokedAt ? 'Đã thu hồi' : 'Hết hạn'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có đơn đăng ký nào</p>
            </div>
          ) : (
            applications.map((app) => {
              const statusConfig = applicationStatusConfig[app.status];
              const badgeInfoItem = badgeInfo[app.badgeCode];
              return (
                <div key={app.id} className="bg-white rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${badgeInfoItem?.color}`}>
                        {badgeInfoItem?.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {badgeInfoItem?.name || app.badgeCode}
                          </h3>
                          {app.brandName && (
                            <span className="text-sm text-gray-500">- {app.brandName}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            Nộp ngày: {formatDate(app.createdAt)}
                          </span>
                        </div>
                        {app.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                            <strong>Lý do từ chối:</strong> {app.rejectionReason}
                          </div>
                        )}
                        {/* Documents */}
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">Giấy tờ đã nộp:</p>
                          <div className="flex flex-wrap gap-2">
                            {app.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                              >
                                <FileText className="w-3 h-3" />
                                {doc.documentTypeName}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {app.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelApplication(app.id)}
                      >
                        Hủy đơn
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Apply Official Badge Modal */}
      {showApplyOfficialModal && (
        <ApplyOfficialBadgeModal
          onClose={() => setShowApplyOfficialModal(false)}
          onSuccess={() => {
            setShowApplyOfficialModal(false);
            fetchData();
          }}
        />
      )}

      {/* Apply Verified Badge Modal */}
      {showApplyVerifiedModal && (
        <ApplyVerifiedBadgeModal
          onClose={() => setShowApplyVerifiedModal(false)}
          onSuccess={() => {
            setShowApplyVerifiedModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
