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
import { Checkbox } from '@/components/ui/checkbox';
import {
  apiClient,
  type DocumentTypeResponse,
  type ApiError,
} from '@/lib/api';
import { Loader2, Shield, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ApplyVerifiedBadgeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface DocumentUpload {
  documentTypeId: string;
  documentTypeName: string;
  imageUrl: string;
  expiresAt: string;
  noExpiry: boolean;
}

export function ApplyVerifiedBadgeModal({ onClose, onSuccess }: ApplyVerifiedBadgeModalProps) {
  const [step, setStep] = useState<'upload-docs' | 'confirm'>('upload-docs');
  const [requirements, setRequirements] = useState<DocumentTypeResponse[]>([]);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const requirementsData = await apiClient.getVerifiedBadgeRequirements();
      setRequirements(requirementsData);

      // Initialize documents array
      setDocuments(
        requirementsData.map(req => ({
          documentTypeId: req.id,
          documentTypeName: req.name,
          imageUrl: '',
          expiresAt: '',
          noExpiry: false,
        }))
      );
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentTypeId: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File không được vượt quá 5MB');
      return;
    }

    try {
      setUploading(documentTypeId);
      const result = await apiClient.uploadProductImage(file);

      setDocuments(prev => prev.map(doc =>
        doc.documentTypeId === documentTypeId
          ? { ...doc, imageUrl: result.imageUrl }
          : doc
      ));

      toast.success('Đã tải ảnh lên thành công');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(null);
    }
  };

  const handleExpiryChange = (documentTypeId: string, expiresAt: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.documentTypeId === documentTypeId
        ? { ...doc, expiresAt }
        : doc
    ));
  };

  const handleNoExpiryChange = (documentTypeId: string, noExpiry: boolean) => {
    setDocuments(prev => prev.map(doc =>
      doc.documentTypeId === documentTypeId
        ? { ...doc, noExpiry, expiresAt: noExpiry ? '' : doc.expiresAt }
        : doc
    ));
  };

  const handleRemoveImage = (documentTypeId: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.documentTypeId === documentTypeId
        ? { ...doc, imageUrl: '' }
        : doc
    ));
  };

  // Document is complete if it has imageUrl and either has expiresAt or noExpiry is checked
  const isDocumentsComplete = documents.every(doc =>
    doc.imageUrl && (doc.expiresAt || doc.noExpiry)
  );

  const handleSubmit = async () => {
    if (!isDocumentsComplete) {
      toast.error('Vui lòng tải lên đầy đủ giấy tờ và ngày hết hạn');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.applyForVerifiedBadge({
        documents: documents.map(doc => ({
          documentTypeId: doc.documentTypeId,
          imageUrl: doc.imageUrl,
          expiresAt: doc.noExpiry ? null : doc.expiresAt,
        })),
      });

      toast.success('Đã gửi đơn đăng ký thành công');
      onSuccess();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể gửi đơn đăng ký');
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum date for expiry (tomorrow)
  const minExpiryDate = new Date();
  minExpiryDate.setDate(minExpiryDate.getDate() + 1);
  const minExpiryDateStr = minExpiryDate.toISOString().split('T')[0];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Đăng ký Shop Xác thực
          </DialogTitle>
          <DialogDescription>
            Xác thực giấy tờ để nhận huy hiệu và tăng độ tin cậy với khách hàng
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : requirements.length === 0 ? (
          <div className="py-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600">
              Chưa có yêu cầu giấy tờ nào được thiết lập.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Vui lòng liên hệ quản trị viên.
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4">
              {['upload-docs', 'confirm'].map((s, index) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === s
                        ? 'bg-primary text-white'
                        : index < ['upload-docs', 'confirm'].indexOf(step)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index < ['upload-docs', 'confirm'].indexOf(step) ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 1 && (
                    <div className={`w-16 h-1 mx-2 ${
                      index < ['upload-docs', 'confirm'].indexOf(step)
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            {step === 'upload-docs' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-blue-900">Shop Xác thực</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Xác thực thông tin kinh doanh để nhận huy hiệu "Shop Xác thực"
                  </p>
                </div>

                <div>
                  <Label className="text-base font-medium">Giấy tờ yêu cầu</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Tải lên các giấy tờ cần thiết để xác thực shop
                  </p>
                </div>

                <div className="space-y-4">
                  {documents.map((doc) => {
                    const req = requirements.find(r => r.id === doc.documentTypeId);
                    return (
                      <div key={doc.documentTypeId} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{doc.documentTypeName}</p>
                            {req?.description && (
                              <p className="text-sm text-gray-500">{req.description}</p>
                            )}
                          </div>
                          {doc.imageUrl && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>

                        {/* Image Upload */}
                        {doc.imageUrl ? (
                          <div className="relative inline-block">
                            <img
                              src={doc.imageUrl}
                              alt={doc.documentTypeName}
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(doc.documentTypeId)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col items-center justify-center py-4">
                              {uploading === doc.documentTypeId ? (
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-500">
                                    Click để tải ảnh lên
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    PNG, JPG (tối đa 5MB)
                                  </p>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(doc.documentTypeId, file);
                                }
                              }}
                              disabled={uploading !== null}
                            />
                          </label>
                        )}

                        {/* Expiry Date */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`no-expiry-${doc.documentTypeId}`}
                              checked={doc.noExpiry}
                              onCheckedChange={(checked) =>
                                handleNoExpiryChange(doc.documentTypeId, checked === true)
                              }
                            />
                            <label
                              htmlFor={`no-expiry-${doc.documentTypeId}`}
                              className="text-sm text-gray-600 cursor-pointer"
                            >
                              Không có hạn sử dụng (vĩnh viễn)
                            </label>
                          </div>

                          {!doc.noExpiry && (
                            <div>
                              <Label className="text-sm">Ngày hết hạn giấy tờ</Label>
                              <Input
                                type="date"
                                min={minExpiryDateStr}
                                value={doc.expiresAt}
                                onChange={(e) => handleExpiryChange(doc.documentTypeId, e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          )}
                        </div>

                        {/* Sample Image */}
                        {req?.sampleImageUrl && (
                          <div className="text-sm">
                            <a
                              href={req.sampleImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Xem mẫu giấy tờ
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={onClose}>
                    Hủy
                  </Button>
                  <Button
                    onClick={() => setStep('confirm')}
                    disabled={!isDocumentsComplete}
                  >
                    Tiếp tục
                  </Button>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">Xác nhận đăng ký</p>
                  <p className="text-sm text-green-700 mt-1">
                    Vui lòng kiểm tra lại thông tin trước khi gửi đơn đăng ký
                  </p>
                </div>

                {/* Summary */}
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900">Đăng ký Shop Xác thực</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Giấy tờ đã nộp:</p>
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc.documentTypeId} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{doc.documentTypeName}</span>
                          <span className="text-xs text-gray-400">
                            {doc.noExpiry
                              ? '(Không có hạn)'
                              : `(HH: ${new Date(doc.expiresAt).toLocaleDateString('vi-VN')})`
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Lưu ý:</strong> Sau khi gửi đơn, quản trị viên sẽ xem xét và phê duyệt.
                    Bạn sẽ nhận được thông báo khi đơn được xử lý.
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep('upload-docs')}>
                    Quay lại
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Gửi đơn đăng ký
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
