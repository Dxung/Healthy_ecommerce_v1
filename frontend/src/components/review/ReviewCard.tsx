'use client';

import { useState } from 'react';
import { User, Store, MoreVertical, Edit2, Trash2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { StarRating } from './StarRating';
import { type ReviewResponse } from '@/lib/api';

interface ReviewCardProps {
  review: ReviewResponse;
  showProductInfo?: boolean;
  showShopReply?: boolean;
  isOwner?: boolean;
  isShopOwner?: boolean;
  variantName?: string;
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
  variantName,
  onEdit,
  onDelete,
  onReply,
  onEditReply,
  onDeleteReply,
}: ReviewCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReplyMenu, setShowReplyMenu] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const toggleImageExpand = (imageUrl: string) => {
    setExpandedImage(expandedImage === imageUrl ? null : imageUrl);
  };

  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium text-gray-900">Nguoi mua</span>
              <StarRating rating={review.rating} size="sm" />
              <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
            </div>
            {variantName && (
              <p className="text-xs text-gray-500 mt-0.5">
                Phan loai: <span className="text-gray-700">{variantName}</span>
              </p>
            )}
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
                    Chinh sua
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
                    Xoa
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {review.content && (
        <p className="text-gray-700 text-sm whitespace-pre-wrap">{review.content}</p>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {review.images.map((image) => (
              <button
                key={image.id}
                onClick={() => toggleImageExpand(image.imageUrl)}
                className={`relative rounded-lg overflow-hidden border transition-all ${
                  expandedImage === image.imageUrl
                    ? 'ring-2 ring-primary'
                    : 'hover:opacity-90'
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt="Review image"
                  className="w-20 h-20 object-cover"
                />
                {expandedImage === image.imageUrl && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <ChevronUp className="w-5 h-5 text-white drop-shadow" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Expanded Image Preview */}
          {expandedImage && (
            <div className="relative rounded-lg overflow-hidden border bg-gray-50">
              <img
                src={expandedImage}
                alt="Review image expanded"
                className="w-full max-h-96 object-contain"
              />
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Shop Reply */}
      {showShopReply && review.reply && (
        <div className="mt-3 pl-4 border-l-2 border-primary/30 bg-gray-50 rounded-r-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Phan hoi tu Shop</span>
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
                        Chinh sua
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
                        Xoa
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
          Phan hoi danh gia
        </button>
      )}
    </div>
  );
}
