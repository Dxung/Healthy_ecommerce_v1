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
import { Switch } from '@/components/ui/switch';
import {
  apiClient,
  type BadgeCode,
  type BadgeDetailResponse,
  type BadgeRequirementResponse,
  type DocumentTypeResponse,
  type ShopAttributeCode,
  type ComparisonOperator,
  type ApiError,
} from '@/lib/api';
import {
  Loader2,
  Plus,
  Trash2,
  FileText,
  BarChart3,
  Settings2,
} from 'lucide-react';
import { toast } from 'sonner';

interface BadgeConfigModalProps {
  badgeCode: BadgeCode;
  onClose: () => void;
  onUpdated: () => void;
}

const attributeLabels: Record<ShopAttributeCode, string> = {
  average_rating: 'Đánh giá trung bình',
  order_success_rate: 'Tỷ lệ đơn thành công (%)',
  total_orders_30d: 'Đơn hàng 30 ngày',
  response_time_hours: 'Thời gian phản hồi (giờ)',
  return_rate: 'Tỷ lệ hoàn hàng (%)',
  penalty_points: 'Điểm phạt',
  penalty_tier: 'Cấp độ phạt',
};

const operatorLabels: Record<ComparisonOperator, string> = {
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  eq: '=',
};

// Preferred badge uses attribute requirements (auto-granted)
// Approved badge uses document requirements
// Official badge uses brand-specific document requirements (configured in brand management)
const isPreferredBadge = (code: BadgeCode) => code === 'preferred';
const isOfficialBadge = (code: BadgeCode) => code === 'official';

export function BadgeConfigModal({
  badgeCode,
  onClose,
  onUpdated,
}: BadgeConfigModalProps) {
  const [badge, setBadge] = useState<BadgeDetailResponse | null>(null);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingType, setAddingType] = useState<'document' | 'attribute' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingProperties, setSavingProperties] = useState(false);

  // Form state for badge properties
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPlatformFeeDiscount, setEditPlatformFeeDiscount] = useState('');
  const [editSearchBoost, setEditSearchBoost] = useState('');
  const [editMaxProductSlots, setEditMaxProductSlots] = useState('');

  // Form state for adding requirements
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<string>('');
  const [selectedAttribute, setSelectedAttribute] = useState<ShopAttributeCode>('average_rating');
  const [selectedOperator, setSelectedOperator] = useState<ComparisonOperator>('gte');
  const [attributeValue, setAttributeValue] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [badgeCode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [badgeData, docTypesData] = await Promise.all([
        apiClient.getBadgeByCode(badgeCode),
        apiClient.getAllDocumentTypes(),
      ]);
      setBadge(badgeData);
      setDocumentTypes(docTypesData.filter((dt) => dt.isActive));

      // Initialize form values
      setEditName(badgeData.name);
      setEditDescription(badgeData.description || '');
      setEditPlatformFeeDiscount(badgeData.platformFeeDiscountPercent?.toString() || '');
      setEditSearchBoost(badgeData.searchBoostMultiplier?.toString() || '');
      setEditMaxProductSlots(badgeData.maxProductSlots?.toString() || '');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProperties = async () => {
    try {
      setSavingProperties(true);
      await apiClient.updateBadge(badgeCode, {
        name: editName,
        description: editDescription || null,
        platformFeeDiscountPercent: editPlatformFeeDiscount ? parseFloat(editPlatformFeeDiscount) : null,
        searchBoostMultiplier: editSearchBoost ? parseFloat(editSearchBoost) : null,
        maxProductSlots: editMaxProductSlots ? parseInt(editMaxProductSlots) : undefined,
      });
      toast.success('Đã cập nhật thông tin badge');
      fetchData();
      onUpdated();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể cập nhật badge');
    } finally {
      setSavingProperties(false);
    }
  };

  const handleAddDocumentRequirement = async () => {
    if (!selectedDocTypeId) {
      toast.error('Vui lòng chọn loại tài liệu');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.addBadgeRequirement(badgeCode, {
        requirementType: 'document',
        documentTypeId: selectedDocTypeId,
      });
      toast.success('Đã thêm yêu cầu tài liệu');
      setAddingType(null);
      setSelectedDocTypeId('');
      fetchData();
      onUpdated();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thêm yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAttributeRequirement = async () => {
    if (!attributeValue) {
      toast.error('Vui lòng nhập giá trị');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.addBadgeRequirement(badgeCode, {
        requirementType: 'attribute',
        attributeCode: selectedAttribute,
        operator: selectedOperator,
        attributeValue: parseFloat(attributeValue),
      });
      toast.success('Đã thêm yêu cầu chỉ số');
      setAddingType(null);
      setAttributeValue('');
      fetchData();
      onUpdated();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thêm yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveRequirement = async (requirementId: string) => {
    try {
      await apiClient.removeBadgeRequirement(requirementId);
      toast.success('Đã xóa yêu cầu');
      fetchData();
      onUpdated();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa yêu cầu');
    }
  };

  const handleToggleRequirement = async (requirementId: string) => {
    try {
      await apiClient.toggleRequirementActive(requirementId);
      fetchData();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thay đổi trạng thái');
    }
  };

  const documentRequirements = badge?.requirements.filter(
    (r) => r.requirementType === 'document'
  ) ?? [];

  const attributeRequirements = badge?.requirements.filter(
    (r) => r.requirementType === 'attribute'
  ) ?? [];

  const isPreferred = isPreferredBadge(badgeCode);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cấu hình {badge?.name}</DialogTitle>
          <DialogDescription>
            {isPreferred
              ? 'Badge này được tự động cấp/gỡ dựa trên chỉ số của shop (cronjob chạy hàng ngày)'
              : 'Badge này yêu cầu shop nộp giấy tờ khi đăng ký'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Badge Properties Section */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium flex items-center gap-2 mb-4">
                <Settings2 className="w-4 h-4" />
                Thuộc tính Badge
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Tên badge</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Mô tả</Label>
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="mt-1"
                    placeholder="Mô tả về badge..."
                  />
                </div>

                <div>
                  <Label>Giảm phí nền tảng (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editPlatformFeeDiscount}
                    onChange={(e) => setEditPlatformFeeDiscount(e.target.value)}
                    className="mt-1"
                    placeholder="VD: 10"
                  />
                </div>

                <div>
                  <Label>Boost tìm kiếm (x)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    value={editSearchBoost}
                    onChange={(e) => setEditSearchBoost(e.target.value)}
                    className="mt-1"
                    placeholder="VD: 1.5"
                  />
                </div>

                <div>
                  <Label>Giới hạn sản phẩm</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editMaxProductSlots}
                    onChange={(e) => setEditMaxProductSlots(e.target.value)}
                    className="mt-1"
                    placeholder="VD: 100"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleSaveProperties}
                    disabled={savingProperties}
                  >
                    {savingProperties && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Lưu thuộc tính
                  </Button>
                </div>
              </div>
            </div>

            {/* Requirements Section */}
            {isPreferred ? (
              // Preferred badge: Attribute requirements only
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Yêu cầu chỉ số (Tự động kiểm tra)
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingType('attribute')}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm
                  </Button>
                </div>

                <p className="text-sm text-gray-500 mb-3">
                  Shop sẽ tự động được cấp/gỡ badge khi đạt/không đạt các yêu cầu này
                </p>

                {attributeRequirements.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2">
                    Chưa có yêu cầu chỉ số nào
                  </p>
                ) : (
                  <div className="space-y-2">
                    {attributeRequirements.map((req) => (
                      <RequirementItem
                        key={req.id}
                        requirement={req}
                        onToggle={() => handleToggleRequirement(req.id)}
                        onRemove={() => handleRemoveRequirement(req.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Add attribute form */}
                {addingType === 'attribute' && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>Chỉ số</Label>
                        <select
                          value={selectedAttribute}
                          onChange={(e) =>
                            setSelectedAttribute(e.target.value as ShopAttributeCode)
                          }
                          className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                          {Object.entries(attributeLabels).map(([code, label]) => (
                            <option key={code} value={code}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Toán tử</Label>
                        <select
                          value={selectedOperator}
                          onChange={(e) =>
                            setSelectedOperator(e.target.value as ComparisonOperator)
                          }
                          className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                        >
                          {Object.entries(operatorLabels).map(([code, label]) => (
                            <option key={code} value={code}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Giá trị</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={attributeValue}
                          onChange={(e) => setAttributeValue(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddAttributeRequirement}
                        disabled={submitting}
                      >
                        {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                        Thêm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddingType(null)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : isOfficialBadge(badgeCode) ? (
              // Official badge: Brand-specific document requirements (configured in brand management)
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" />
                  <h3 className="font-medium">Yêu cầu tài liệu</h3>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    Badge "Shop Chính hãng" sử dụng yêu cầu giấy tờ riêng cho từng thương hiệu.
                  </p>
                  <p className="text-sm text-blue-700">
                    Khi shop đăng ký làm đại lý chính hãng, họ sẽ chọn thương hiệu và hệ thống sẽ hiển thị các giấy tờ cần thiết theo thương hiệu đó.
                  </p>
                  <p className="text-sm text-blue-600 mt-3">
                    Vui lòng cấu hình yêu cầu giấy tờ trong phần <strong>Quản lý thương hiệu</strong>.
                  </p>
                </div>

                {/* Show existing document requirements as read-only (if any legacy data exists) */}
                {documentRequirements.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Yêu cầu cũ (không còn sử dụng):</p>
                    <div className="space-y-2 opacity-60">
                      {documentRequirements.map((req) => (
                        <RequirementItem
                          key={req.id}
                          requirement={req}
                          onToggle={() => handleToggleRequirement(req.id)}
                          onRemove={() => handleRemoveRequirement(req.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Approved badge: Document requirements
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Yêu cầu tài liệu (Shop nộp khi đăng ký)
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingType('document')}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm
                  </Button>
                </div>

                {documentRequirements.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2">
                    Chưa có yêu cầu tài liệu nào
                  </p>
                ) : (
                  <div className="space-y-2">
                    {documentRequirements.map((req) => (
                      <RequirementItem
                        key={req.id}
                        requirement={req}
                        onToggle={() => handleToggleRequirement(req.id)}
                        onRemove={() => handleRemoveRequirement(req.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Add document form */}
                {addingType === 'document' && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                    <div>
                      <Label>Loại tài liệu</Label>
                      <select
                        value={selectedDocTypeId}
                        onChange={(e) => setSelectedDocTypeId(e.target.value)}
                        className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                      >
                        <option value="">Chọn loại tài liệu...</option>
                        {documentTypes.map((dt) => (
                          <option key={dt.id} value={dt.id}>
                            {dt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddDocumentRequirement}
                        disabled={submitting}
                      >
                        {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                        Thêm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddingType(null)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RequirementItem({
  requirement,
  onToggle,
  onRemove,
}: {
  requirement: BadgeRequirementResponse;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const getDescription = () => {
    if (requirement.requirementType === 'document') {
      return requirement.documentTypeName || 'Tài liệu không xác định';
    }

    const attrLabel =
      attributeLabels[requirement.attributeCode as ShopAttributeCode] ||
      requirement.attributeCode;
    const opLabel = operatorLabels[requirement.operator as ComparisonOperator] || '?';
    return `${attrLabel} ${opLabel} ${requirement.attributeValue}`;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
      <div className="flex items-center gap-3">
        {requirement.requirementType === 'document' ? (
          <FileText className="w-4 h-4 text-gray-400" />
        ) : (
          <BarChart3 className="w-4 h-4 text-gray-400" />
        )}
        <span className={requirement.isActive ? '' : 'text-gray-400 line-through'}>
          {getDescription()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={requirement.isActive} onCheckedChange={onToggle} />
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}
