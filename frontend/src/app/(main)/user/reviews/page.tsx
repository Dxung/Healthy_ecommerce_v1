'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  apiClient,
  type ReviewListResponse,
  type ReviewResponse,
  type ApiError,
} from '@/lib/api';
import { ReviewCard, ReviewForm } from '@/components/review';
import { Loader2, Star, MessageSquareOff } from 'lucide-react';
import { toast } from 'sonner';

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<ReviewListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMyReviews(page, 10);
      setReviews(data);

      // Get current user ID from first review (for ownership check)
      if (data.items.length > 0 && !currentUserId) {
        setCurrentUserId(data.items[0].userId);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, [page, currentUserId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleEditReview = (review: ReviewResponse) => {
    setEditingReview(review);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await apiClient.deleteReview(reviewId);
      toast.success('Đã xóa đánh giá');
      await fetchReviews();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa đánh giá');
    }
  };

  const handleReviewUpdated = async () => {
    setEditingReview(null);
    await fetchReviews();
    toast.success('Đã cập nhật đánh giá');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Đánh giá của tôi</h1>
      </div>

      {/* Edit Review Form */}
      {editingReview && (
        <div className="mb-6">
          <ReviewForm
            orderItemId={editingReview.orderItemId}
            productName="Sản phẩm"
            existingReview={editingReview}
            onSuccess={handleReviewUpdated}
            onCancel={() => setEditingReview(null)}
          />
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !reviews || reviews.items.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquareOff className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Chưa có đánh giá nào
          </h2>
          <p className="text-gray-500">
            Bạn chưa viết đánh giá cho sản phẩm nào. Hãy mua sắm và chia sẻ trải nghiệm của bạn!
          </p>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{reviews.total}</p>
                <p className="text-sm text-gray-500">Đánh giá</p>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Cảm ơn bạn đã chia sẻ trải nghiệm mua sắm. Đánh giá của bạn giúp ích cho người mua khác!
                </p>
              </div>
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-4">
            {reviews.items.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwner={true}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>

          {/* Pagination */}
          {reviews.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {page} / {reviews.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(reviews.totalPages, p + 1))}
                disabled={page === reviews.totalPages || loading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
