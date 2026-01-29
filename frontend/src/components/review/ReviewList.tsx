'use client';

import { useState, useEffect } from 'react';
import { Loader2, Star, MessageSquareOff } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { StarRating } from './StarRating';
import { apiClient, type ReviewResponse, type ReviewListResponse } from '@/lib/api';

interface ReviewListProps {
  productId?: string;
  showAsShopOwner?: boolean;
  currentUserId?: string;
  onEditReview?: (review: ReviewResponse) => void;
  onDeleteReview?: (reviewId: string) => void;
  onReplyReview?: (reviewId: string) => void;
  onEditReply?: (reviewId: string) => void;
  onDeleteReply?: (reviewId: string) => void;
}

export function ReviewList({
  productId,
  showAsShopOwner = false,
  currentUserId,
  onEditReview,
  onDeleteReview,
  onReplyReview,
  onEditReply,
  onDeleteReply,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Rating filter
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Rating stats
  const [ratingStats, setRatingStats] = useState({
    average: 0,
    counts: [0, 0, 0, 0, 0],
  });

  const fetchReviews = async (pageNum: number, rating?: number | null) => {
    setLoading(true);
    setError(null);

    try {
      let response: ReviewListResponse;

      if (showAsShopOwner) {
        response = await apiClient.getShopReviews(pageNum, 10);
      } else if (productId) {
        response = await apiClient.getProductReviews(productId, pageNum, 10, rating ?? undefined);
      } else {
        throw new Error('Product ID is required');
      }

      setReviews(response.items);
      setTotalPages(response.totalPages);
      setTotal(response.total);

      // Calculate rating stats from first page (only when not filtering)
      if (pageNum === 1 && !rating && response.items.length > 0) {
        const counts = [0, 0, 0, 0, 0];
        let sum = 0;
        response.items.forEach((r) => {
          counts[r.rating - 1]++;
          sum += r.rating;
        });
        setRatingStats({
          average: response.total > 0 ? sum / response.items.length : 0,
          counts,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải đánh giá.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page, selectedRating);
  }, [page, productId, showAsShopOwner, selectedRating]);

  const handleRatingFilter = (rating: number | null) => {
    setSelectedRating(rating);
    setPage(1);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await apiClient.deleteReview(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      onDeleteReview?.(reviewId);
    } catch (err) {
      alert('Không thể xóa đánh giá. Vui lòng thử lại.');
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa phản hồi này?')) return;

    try {
      await apiClient.deleteReviewReply(reviewId);
      setReviews(
        reviews.map((r) =>
          r.id === reviewId ? { ...r, reply: null } : r
        )
      );
      onDeleteReply?.(reviewId);
    } catch (err) {
      alert('Không thể xóa phản hồi. Vui lòng thử lại.');
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => fetchReviews(page)}
          className="mt-4 text-primary hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquareOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Chưa có đánh giá nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary (for product reviews) */}
      {!showAsShopOwner && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {ratingStats.average.toFixed(1)}
              </div>
              <StarRating rating={Math.round(ratingStats.average)} size="sm" />
              <p className="text-sm text-gray-500 mt-1">{total} đánh giá</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingStats.counts[star - 1];
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <button
                    key={star}
                    onClick={() => handleRatingFilter(selectedRating === star ? null : star)}
                    className={`flex items-center gap-2 text-sm w-full p-1 rounded transition-colors ${
                      selectedRating === star
                        ? 'bg-yellow-50 ring-1 ring-yellow-300'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-3">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-500">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Active Filter Indicator */}
          {selectedRating && (
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Đang lọc: {selectedRating} sao
              </span>
              <button
                onClick={() => handleRatingFilter(null)}
                className="text-sm text-primary hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwner={currentUserId === review.userId}
            isShopOwner={showAsShopOwner}
            onEdit={currentUserId === review.userId ? onEditReview : undefined}
            onDelete={currentUserId === review.userId ? handleDeleteReview : undefined}
            onReply={showAsShopOwner ? onReplyReview : undefined}
            onEditReply={showAsShopOwner ? onEditReply : undefined}
            onDeleteReply={showAsShopOwner ? handleDeleteReply : undefined}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-gray-600">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
