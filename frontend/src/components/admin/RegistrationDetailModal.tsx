'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  apiClient,
  type RegistrationDetailResponse,
  type ApproveBadgeType,
  type ApiError,
} from '@/lib/api';
import {
  Loader2,
  Store,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface RegistrationDetailModalProps {
  registrationId: string;
  onClose: () => void;
  onUpdated: () => void;
}

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export function RegistrationDetailModal({
  registrationId,
  onClose,
  onUpdated,
}: RegistrationDetailModalProps) {
  const [registration, setRegistration] = useState<RegistrationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Approve options
  const [approveMode, setApproveMode] = useState<'shop_only' | 'with_badge'>('shop_only');
  const [selectedBadge, setSelectedBadge] = useState<ApproveBadgeType>('approved');

  // Reject
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [registrationId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getShopRegistrationById(registrationId);
      setRegistration(data);
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
      setSubmitting(true);
      await apiClient.approveShopRegistration(registrationId, {
        approveShopOnly: approveMode === 'shop_only',
        approveBadge: approveMode === 'with_badge' ? selectedBadge : undefined,
      });
      toast.success('Đã duyệt đơn đăng ký');
      onUpdated();
      onClose();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể duyệt đơn đăng ký');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.rejectShopRegistration(registrationId, rejectReason);
      toast.success('Đã từ chối đơn đăng ký');
      onUpdated();
      onClose();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể từ chối đơn đăng ký');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!registration) return null;

  const isPending = registration.status === 'pending';

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Store className="w-6 h-6" />
            {registration.name}
          </DialogTitle>
          <DialogDescription>
            Chi tiết đơn đăng ký shop
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Trạng thái:</span>
            <span
              className={`inline-flex px-3 py-1 text-sm font-medium rounded ${
                statusColors[registration.status]
              }`}
            >
              {statusLabels[registration.status]}
            </span>
          </div>

          {/* Rejection Reason (if rejected) */}
          {registration.status === 'rejected' && registration.rejectionReason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-700">Lý do từ chối:</p>
              <p className="text-sm text-red-600 mt-1">{registration.rejectionReason}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Slug</p>
              <p className="font-medium">{registration.slug}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Ngày đăng ký</p>
              <p className="font-medium">{formatDate(registration.createdAt)}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Thông tin liên hệ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{registration.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{registration.phone}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p>{registration.addressLine}</p>
                <p className="text-gray-500">
                  {registration.wardName}, {registration.districtName}, {registration.provinceName}
                </p>
              </div>
            </div>
          </div>

          {/* Documents */}
          {registration.documents.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Giấy tờ kinh doanh ({registration.documents.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {registration.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={doc.imageUrl}
                      alt="Document"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Giấy tờ</p>
                      {doc.expiresAt && (
                        <p className="text-xs text-gray-500">
                          HSD: {formatDate(doc.expiresAt)}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Brand Documents */}
          {registration.brandDocuments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Giấy ủy quyền thương hiệu ({registration.brandDocuments.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {registration.brandDocuments.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={doc.imageUrl}
                      alt="Brand Document"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Giấy ủy quyền</p>
                      {doc.expiresAt && (
                        <p className="text-xs text-gray-500">
                          HSD: {formatDate(doc.expiresAt)}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions for Pending */}
          {isPending && !showRejectForm && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-gray-900">Phê duyệt đơn đăng ký</h3>

              {/* Approve Options */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="approveMode"
                    value="shop_only"
                    checked={approveMode === 'shop_only'}
                    onChange={() => setApproveMode('shop_only')}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">Chỉ duyệt shop</p>
                    <p className="text-sm text-gray-500">
                      Tạo shop mà không cấp huy hiệu. Người bán có thể đăng ký huy hiệu sau.
                    </p>
                  </div>
                </label>

                {(registration.documents.length > 0 || registration.brandDocuments.length > 0) && (
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="approveMode"
                      value="with_badge"
                      checked={approveMode === 'with_badge'}
                      onChange={() => setApproveMode('with_badge')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Duyệt shop + Cấp huy hiệu</p>
                      <p className="text-sm text-gray-500 mb-2">
                        Tạo shop và cấp huy hiệu dựa trên giấy tờ đã nộp.
                      </p>
                      {approveMode === 'with_badge' && (
                        <div className="flex gap-2 mt-2">
                          {registration.documents.length > 0 && (
                            <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-gray-100">
                              <input
                                type="radio"
                                name="badge"
                                value="approved"
                                checked={selectedBadge === 'approved'}
                                onChange={() => setSelectedBadge('approved')}
                              />
                              <span className="text-sm">Approved</span>
                            </label>
                          )}
                          {registration.brandDocuments.length > 0 && (
                            <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-gray-100">
                              <input
                                type="radio"
                                name="badge"
                                value="official"
                                checked={selectedBadge === 'official'}
                                onChange={() => setSelectedBadge('official')}
                              />
                              <span className="text-sm">Official</span>
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Duyệt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  disabled={submitting}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>
              </div>
            </div>
          )}

          {/* Reject Form */}
          {isPending && showRejectForm && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-red-600">Từ chối đơn đăng ký</h3>
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Lý do từ chối *</Label>
                <textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason('');
                  }}
                  disabled={submitting}
                >
                  Quay lại
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={submitting || !rejectReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Xác nhận từ chối
                </Button>
              </div>
            </div>
          )}

          {/* Review Info (for approved/rejected) */}
          {!isPending && registration.reviewedAt && (
            <div className="pt-4 border-t text-sm text-gray-500">
              <p>
                {registration.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'} vào{' '}
                {formatDate(registration.reviewedAt)}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
