'use client';

import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { StarRating } from './StarRating';
import { UploadReviewImageModal } from './UploadReviewImageModal';
import { apiClient, type ReviewResponse } from '@/lib/api';

interface ReviewFormProps {
  orderItemId: string;
  productName: string;
  productImageUrl?: string;
  existingReview?: ReviewResponse | null;
  onSuccess?: (review: ReviewResponse) => void;
  onCancel?: () => void;
}

export function ReviewForm({
  orderItemId,
  productName,
  productImageUrl,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [content, setContent] = useState(existingReview?.content || '');
  const [imageUrls, setImageUrls] = useState<string[]>(
    existingReview?.images.map((img) => img.imageUrl) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const isEditing = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá.');
      return;
    }

    setIsSubmitting(true);

    try {
      let review: ReviewResponse;

      if (isEditing && existingReview) {
        review = await apiClient.updateReview(existingReview.id, {
          rating,
          content: content || undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        });
      } else {
        review = await apiClient.createReview({
          orderItemId,
          rating,
          content: content || undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        });
      }

      onSuccess?.(review);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi đánh giá.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSuccess = (imageUrl: string) => {
    setImageUrls([...imageUrls, imageUrl]);
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return 'Rất tệ';
      case 2:
        return 'Tệ';
      case 3:
        return 'Bình thường';
      case 4:
        return 'Tốt';
      case 5:
        return 'Tuyệt vời';
      default:
        return 'Chọn đánh giá';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-4 space-y-4">
      {/* Product Info */}
      <div className="flex items-center gap-3 pb-4 border-b">
        {productImageUrl ? (
          <img
            src={productImageUrl}
            alt={productName}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}
        <div>
          <h3 className="font-medium text-gray-900">{productName}</h3>
          <p className="text-sm text-gray-500">
            {isEditing ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Đánh giá của bạn <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
          <span className="text-sm text-gray-600">{getRatingLabel(rating)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label htmlFor="review-content" className="block text-sm font-medium text-gray-700">
          Nhận xét
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
          rows={4}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 text-right">{content.length}/1000</p>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Hình ảnh (tùy chọn)
        </label>
        <div className="flex flex-wrap gap-2">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Review image ${index + 1}`}
                className="w-20 h-20 rounded-lg object-cover border"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {imageUrls.length < 5 && (
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="text-xs mt-1">Thêm ảnh</span>
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">Tối đa 5 hình ảnh</p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? 'Cập nhật' : 'Gửi đánh giá'}
        </button>
      </div>

      {/* Upload Image Modal */}
      <UploadReviewImageModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </form>
  );
}
