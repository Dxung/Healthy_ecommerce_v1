'use client';

import { useState } from 'react';
import { User, Store, MoreVertical, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { StarRating } from './StarRating';
import { type ReviewResponse } from '@/lib/api';

interface ReviewCardProps {
  review: ReviewResponse;
  showProductInfo?: boolean;
  showShopReply?: boolean;
  isOwner?: boolean;
  isShopOwner?: boolean;
  onEdit?: (review: ReviewResponse) => void;
  onDelete?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;
  onEditReply?: (reviewId: string) => void;
  onDeleteReply?: (reviewId: string) => void;
}

export function ReviewCard({
  review,
  showProductInfo = false,
  showShopReply = true,
  isOwner = false,
  isShopOwner = false,
  onEdit,
  onDelete,
  onReply,
  onEditReply,
  onDeleteReply,
}: ReviewCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReplyMenu, setShowReplyMenu] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Người mua</p>
            <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>

        {/* Owner Actions */}
        {isOwner && (onEdit || onDelete) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 min-w-[120px] z-10">
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(review);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(review.id);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <StarRating rating={review.rating} size="sm" />

      {/* Content */}
      {review.content && (
        <p className="text-gray-700 text-sm whitespace-pre-wrap">{review.content}</p>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.images.map((image) => (
            <img
              key={image.id}
              src={image.imageUrl}
              alt="Review image"
              className="w-20 h-20 rounded-lg object-cover border cursor-pointer hover:opacity-90"
              onClick={() => window.open(image.imageUrl, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Shop Reply */}
      {showShopReply && review.reply && (
        <div className="mt-3 pl-4 border-l-2 border-primary/30 bg-gray-50 rounded-r-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Phản hồi từ Shop</span>
              <span className="text-xs text-gray-500">
                {formatDate(review.reply.createdAt)}
              </span>
            </div>

            {/* Shop Reply Actions */}
            {isShopOwner && (onEditReply || onDeleteReply) && (
              <div className="relative">
                <button
                  onClick={() => setShowReplyMenu(!showReplyMenu)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                {showReplyMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 min-w-[120px] z-10">
                    {onEditReply && (
                      <button
                        onClick={() => {
                          setShowReplyMenu(false);
                          onEditReply(review.id);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Chỉnh sửa
                      </button>
                    )}
                    {onDeleteReply && (
                      <button
                        onClick={() => {
                          setShowReplyMenu(false);
                          onDeleteReply(review.id);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.reply.content}</p>
        </div>
      )}

      {/* Shop Reply Action (when no reply exists) */}
      {showShopReply && !review.reply && isShopOwner && onReply && (
        <button
          onClick={() => onReply(review.id)}
          className="mt-2 text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          <MessageSquare className="w-4 h-4" />
          Phản hồi đánh giá
        </button>
      )}
    </div>
  );
}
