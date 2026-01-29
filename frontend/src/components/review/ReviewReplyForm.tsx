'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiClient, type ReviewReplyResponse } from '@/lib/api';

interface ReviewReplyFormProps {
  reviewId: string;
  existingReply?: ReviewReplyResponse | null;
  onSuccess?: (reply: ReviewReplyResponse) => void;
  onCancel?: () => void;
}

export function ReviewReplyForm({
  reviewId,
  existingReply,
  onSuccess,
  onCancel,
}: ReviewReplyFormProps) {
  const [content, setContent] = useState(existingReply?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReply;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    setIsSubmitting(true);

    try {
      let reply: ReviewReplyResponse;

      if (isEditing) {
        reply = await apiClient.updateReviewReply(reviewId, content.trim());
      } else {
        reply = await apiClient.createReviewReply(reviewId, content.trim());
      }

      onSuccess?.(reply);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi phản hồi.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg border p-4 space-y-4">
      <div className="space-y-2">
        <label htmlFor="reply-content" className="block text-sm font-medium text-gray-700">
          {isEditing ? 'Chỉnh sửa phản hồi' : 'Phản hồi đánh giá'}
        </label>
        <textarea
          id="reply-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết phản hồi của bạn..."
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-white"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 text-right">{content.length}/500</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
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
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? 'Cập nhật' : 'Gửi phản hồi'}
        </button>
      </div>
    </form>
  );
}
