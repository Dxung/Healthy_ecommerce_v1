'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  apiClient,
  type ReviewListResponse,
  type ReviewResponse,
  type ReviewReplyResponse,
  type ApiError,
} from '@/lib/api';
import { ReviewCard, ReviewReplyForm, StarRating } from '@/components/review';
import { Loader2, Star, MessageSquareOff } from 'lucide-react';
import { toast } from 'sonner';

export default function ShopReviewsPage() {
  const [reviews, setReviews] = useState<ReviewListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(null);
  const [editingReplyReviewId, setEditingReplyReviewId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getShopReviews(page, 10);
      setReviews(data);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReply = (reviewId: string) => {
    setReplyingToReviewId(reviewId);
    setEditingReplyReviewId(null);
  };

  const handleEditReply = (reviewId: string) => {
    setEditingReplyReviewId(reviewId);
    setReplyingToReviewId(null);
  };

  const handleDeleteReply = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa phản hồi này?')) return;

    try {
      await apiClient.deleteReviewReply(reviewId);
      // Update the review in state to remove the reply
      setReviews((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map((r) =>
            r.id === reviewId ? { ...r, reply: null } : r
          ),
        };
      });
      toast.success('Đã xóa phản hồi');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa phản hồi');
    }
  };

  const handleReplySuccess = (reply: ReviewReplyResponse, reviewId: string) => {
    // Update the review in state with the new reply
    setReviews((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((r) =>
          r.id === reviewId ? { ...r, reply } : r
        ),
      };
    });
    setReplyingToReviewId(null);
    setEditingReplyReviewId(null);
    toast.success('Đã gửi phản hồi');
  };

  // Calculate rating stats
  const calculateStats = () => {
    if (!reviews || reviews.items.length === 0) {
      return { average: 0, counts: [0, 0, 0, 0, 0], total: 0 };
    }

    const counts = [0, 0, 0, 0, 0];
    let sum = 0;
    reviews.items.forEach((r) => {
      counts[r.rating - 1]++;
      sum += r.rating;
    });

    return {
      average: sum / reviews.items.length,
      counts,
      total: reviews.total,
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Star className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
      </div>

      {loading && page === 1 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !reviews || reviews.items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <MessageSquareOff className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Chưa có đánh giá nào
          </h2>
          <p className="text-gray-500">
            Khi khách hàng đánh giá sản phẩm của bạn, chúng sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {stats.average.toFixed(1)}
                </div>
                <StarRating rating={Math.round(stats.average)} size="sm" />
                <p className="text-sm text-gray-500 mt-1">{stats.total} đánh giá</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.counts[star - 1];
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-3">{star}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-gray-500 text-right">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.items.map((review) => (
              <div key={review.id} className="space-y-3">
                <ReviewCard
                  review={review}
                  isShopOwner={true}
                  onReply={handleReply}
                  onEditReply={handleEditReply}
                  onDeleteReply={handleDeleteReply}
                />

                {/* Reply Form */}
                {replyingToReviewId === review.id && (
                  <div className="ml-4">
                    <ReviewReplyForm
                      reviewId={review.id}
                      onSuccess={(reply) => handleReplySuccess(reply, review.id)}
                      onCancel={() => setReplyingToReviewId(null)}
                    />
                  </div>
                )}

                {/* Edit Reply Form */}
                {editingReplyReviewId === review.id && review.reply && (
                  <div className="ml-4">
                    <ReviewReplyForm
                      reviewId={review.id}
                      existingReply={review.reply}
                      onSuccess={(reply) => handleReplySuccess(reply, review.id)}
                      onCancel={() => setEditingReplyReviewId(null)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {reviews.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
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
