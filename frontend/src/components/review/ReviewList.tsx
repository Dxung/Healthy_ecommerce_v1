'use client';

import { useState, useEffect } from 'react';
import { Loader2, Star, MessageSquareOff, MessageCircle, Image } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { StarRating } from './StarRating';
import { apiClient, type ReviewResponse, type ReviewListResponse } from '@/lib/api';

type FilterType = 'all' | 'rating' | 'hasContent' | 'hasImages';

interface ActiveFilter {
  type: FilterType;
  value?: number;
}

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

  // Active filter
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: 'all' });

  // Rating stats
  const [ratingStats, setRatingStats] = useState({
    average: 0,
    counts: [0, 0, 0, 0, 0],
    withContentCount: 0,
    withImagesCount: 0,
  });

  const fetchReviews = async (
    pageNum: number,
    filter: ActiveFilter,
  ) => {
    setLoading(true);
    setError(null);

    try {
      let response: ReviewListResponse;

      if (showAsShopOwner) {
        response = await apiClient.getShopReviews(pageNum, 10);
      } else if (productId) {
        const rating = filter.type === 'rating' ? filter.value : undefined;
        const hasContent = filter.type === 'hasContent' ? true : undefined;
        const hasImages = filter.type === 'hasImages' ? true : undefined;
        response = await apiClient.getProductReviews(productId, pageNum, 10, rating, hasContent, hasImages);
      } else {
        throw new Error('Product ID is required');
      }

      setReviews(response.items);
      setTotalPages(response.totalPages);
      setTotal(response.total);

      // Calculate rating stats from first page (only when no filter)
      if (pageNum === 1 && filter.type === 'all' && response.items.length > 0) {
        const counts = [0, 0, 0, 0, 0];
        let sum = 0;
        let withContentCount = 0;
        let withImagesCount = 0;

        response.items.forEach((r) => {
          counts[r.rating - 1]++;
          sum += r.rating;
          if (r.content && r.content.trim().length > 0) withContentCount++;
          if (r.images && r.images.length > 0) withImagesCount++;
        });

        setRatingStats({
          average: response.total > 0 ? sum / response.items.length : 0,
          counts,
          withContentCount,
          withImagesCount,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Khong the tai danh gia.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page, activeFilter);
  }, [page, productId, showAsShopOwner, activeFilter]);

  const handleFilterChange = (newFilter: ActiveFilter) => {
    // Toggle off if same filter
    if (newFilter.type === activeFilter.type && newFilter.value === activeFilter.value) {
      setActiveFilter({ type: 'all' });
    } else {
      setActiveFilter(newFilter);
    }
    setPage(1);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Ban co chac muon xoa danh gia nay?')) return;

    try {
      await apiClient.deleteReview(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      onDeleteReview?.(reviewId);
    } catch (err) {
      alert('Khong the xoa danh gia. Vui long thu lai.');
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    if (!confirm('Ban co chac muon xoa phan hoi nay?')) return;

    try {
      await apiClient.deleteReviewReply(reviewId);
      setReviews(
        reviews.map((r) =>
          r.id === reviewId ? { ...r, reply: null } : r
        )
      );
      onDeleteReply?.(reviewId);
    } catch (err) {
      alert('Khong the xoa phan hoi. Vui long thu lai.');
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
          onClick={() => fetchReviews(page, activeFilter)}
          className="mt-4 text-primary hover:underline"
        >
          Thu lai
        </button>
      </div>
    );
  }

  if (reviews.length === 0 && activeFilter.type === 'all') {
    return (
      <div className="text-center py-12">
        <MessageSquareOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Chua co danh gia nao.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary and Filters (for product reviews) */}
      {!showAsShopOwner && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Average Rating */}
            <div className="text-center shrink-0">
              <div className="text-4xl font-bold text-primary">
                {ratingStats.average.toFixed(1)}
              </div>
              <StarRating rating={Math.round(ratingStats.average)} size="sm" />
              <p className="text-sm text-gray-500 mt-1">{total} danh gia</p>
            </div>

            {/* Rating Bars */}
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingStats.counts[star - 1];
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const isActive = activeFilter.type === 'rating' && activeFilter.value === star;
                return (
                  <button
                    key={star}
                    onClick={() => handleFilterChange({ type: 'rating', value: star })}
                    className={`flex items-center gap-2 text-sm w-full p-1 rounded transition-colors ${
                      isActive
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

          {/* Filter Buttons */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange({ type: 'all' })}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                activeFilter.type === 'all'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
              }`}
            >
              Tat ca
            </button>
            <button
              onClick={() => handleFilterChange({ type: 'hasContent' })}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1 ${
                activeFilter.type === 'hasContent'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Co binh luan ({ratingStats.withContentCount})
            </button>
            <button
              onClick={() => handleFilterChange({ type: 'hasImages' })}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1 ${
                activeFilter.type === 'hasImages'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
              }`}
            >
              <Image className="w-4 h-4" />
              Co hinh anh ({ratingStats.withImagesCount})
            </button>
          </div>

          {/* Active Filter Indicator */}
          {activeFilter.type !== 'all' && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Dang loc:{' '}
                {activeFilter.type === 'rating' && `${activeFilter.value} sao`}
                {activeFilter.type === 'hasContent' && 'Co binh luan'}
                {activeFilter.type === 'hasImages' && 'Co hinh anh'}
              </span>
              <button
                onClick={() => handleFilterChange({ type: 'all' })}
                className="text-primary hover:underline"
              >
                Xoa bo loc
              </button>
            </div>
          )}
        </div>
      )}

      {/* No results with filter */}
      {reviews.length === 0 && activeFilter.type !== 'all' && (
        <div className="text-center py-8">
          <p className="text-gray-500">Khong co danh gia nao phu hop voi bo loc.</p>
          <button
            onClick={() => handleFilterChange({ type: 'all' })}
            className="mt-2 text-primary hover:underline"
          >
            Xoa bo loc
          </button>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Truoc
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
