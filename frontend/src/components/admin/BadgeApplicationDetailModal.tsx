'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  apiClient,
  type BadgeApplicationResponse,
  type ApiError,
} from '@/lib/api';
import {
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Award,
  FileText,
  Store,
  Building2,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface BadgeApplicationDetailModalProps {
  applicationId: string;
  onClose: () => void;
  onActionComplete: () => void;
}

const statusConfig = {
  pending: {
    label: 'Chờ duyệt',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Clock className="w-4 h-4" />,
  },
  approved: {
    label: 'Đã duyệt',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  rejected: {
    label: 'Từ chối',
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-gray-100 text-gray-700',
    icon: <XCircle className="w-4 h-4" />,
  },
};

export function BadgeApplicationDetailModal({
  applicationId,
  onClose,
  onActionComplete,
}: BadgeApplicationDetailModalProps) {
  const [application, setApplication] = useState<BadgeApplicationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAdminBadgeApplicationById(applicationId);
      setApplication(data);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải thông tin đơn đăng ký');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      await apiClient.approveBadgeApplication(applicationId);
      toast.success('Đã duyệt đơn đăng ký thành công');
      onActionComplete();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể duyệt đơn đăng ký');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setRejecting(true);
      await apiClient.rejectBadgeApplication(applicationId, rejectReason);
      toast.success('Đã từ chối đơn đăng ký');
      onActionComplete();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể từ chối đơn đăng ký');
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không có hạn';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getApplicationType = (badgeCode: string) => {
    return badgeCode === 'approved' ? 'verified' : 'official';
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!application) {
    return null;
  }

  const status = statusConfig[application.status];
  const appType = getApplicationType(application.badgeCode);
  const isPending = application.status === 'pending';

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {appType === 'verified' ? (
                <Shield className="w-5 h-5 text-blue-500" />
              ) : (
                <Award className="w-5 h-5 text-green-500" />
              )}
              Đơn đăng ký {appType === 'verified' ? 'Shop Xác thực' : 'Shop Chính hãng'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded ${status.color}`}
              >
                {status.icon}
                {status.label}
              </span>
              <span className="text-sm text-gray-500">
                Nộp ngày: {formatDateTime(application.createdAt)}
              </span>
            </div>

            {/* Shop Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Shop</p>
                  <p className="font-semibold text-gray-900">
                    {application.shopName || `Shop #${application.shopId.slice(0, 8)}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Brand Info (for Official badge) */}
            {application.brandName && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Thương hiệu</p>
                    <p className="font-semibold text-gray-900">{application.brandName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Documents */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Giấy tờ đã nộp ({application.documents.length})
              </h3>
              <div className="space-y-3">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 border rounded-lg flex items-start gap-4"
                  >
                    <button
                      onClick={() => setSelectedImageUrl(doc.imageUrl)}
                      className="relative group"
                    >
                      <img
                        src={doc.imageUrl}
                        alt={doc.documentTypeName}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                        <ExternalLink className="w-6 h-6 text-white" />
                      </div>
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{doc.documentTypeName}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Hạn sử dụng:{' '}
                          {doc.expiresAt ? (
                            formatDate(doc.expiresAt)
                          ) : (
                            <span className="text-green-600 font-medium">Không có hạn</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rejection Reason (if rejected) */}
            {application.rejectionReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Lý do từ chối</p>
                    <p className="text-sm text-red-700 mt-1">{application.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Review info (if approved/rejected) */}
            {application.reviewedAt && (
              <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
                <p>
                  Xử lý lúc: {formatDateTime(application.reviewedAt)}
                </p>
              </div>
            )}

            {/* Action Buttons (for pending applications) */}
            {isPending && !showRejectForm && (
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>
                <Button onClick={handleApprove} disabled={approving}>
                  {approving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Duyệt đơn
                </Button>
              </div>
            )}

            {/* Reject Form */}
            {isPending && showRejectForm && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor="rejectReason">Lý do từ chối</Label>
                  <Textarea
                    id="rejectReason"
                    placeholder="Nhập lý do từ chối đơn đăng ký..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason('');
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={rejecting || !rejectReason.trim()}
                  >
                    {rejecting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Xác nhận từ chối
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {selectedImageUrl && (
        <Dialog open onOpenChange={() => setSelectedImageUrl(null)}>
          <DialogContent className="max-w-4xl p-2">
            <img
              src={selectedImageUrl}
              alt="Document preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
