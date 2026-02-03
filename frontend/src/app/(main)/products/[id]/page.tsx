'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, type PublicProductDetailResponse, type ApiError, type ReviewableOrderItemResponse, type ReviewResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { VariantSelector } from '@/components/product/VariantSelector';
import { CategoryBreadcrumb } from '@/components/product/CategoryBreadcrumb';
import { ImageGallery } from '@/components/product/ImageGallery';
import { ProductPrice } from '@/components/product/ProductPrice';
import { ShopInfoSection } from '@/components/product/ShopInfoSection';
import { ProductDetailSection } from '@/components/product/ProductDetailSection';
import { ReviewList } from '@/components/review/ReviewList';
import { ReviewForm } from '@/components/review/ReviewForm';
import { StarRatingVisual } from '@/components/ui/StarRatingVisual';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Loader2,
  Package,
  ShoppingCart,
  Zap,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const productId = params.id as string;
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<PublicProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [hoveredVariantImageUrl, setHoveredVariantImageUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // Review-related state
  const [reviewableItems, setReviewableItems] = useState<ReviewableOrderItemResponse[]>([]);
  const [selectedReviewItem, setSelectedReviewItem] = useState<ReviewableOrderItemResponse | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewListKey, setReviewListKey] = useState(0); // To force refresh ReviewList

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Fetch reviewable items when user is logged in and product is loaded
  useEffect(() => {
    if (user && product?.id) {
      fetchReviewableItems();
    }
  }, [user, product?.id]);

  const fetchReviewableItems = async () => {
    if (!product?.id) return;
    try {
      const items = await apiClient.getReviewableItemsForProduct(product.id);
      setReviewableItems(items);
    } catch {
      // Silently fail - user may not have any reviewable items
      setReviewableItems([]);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const isUUID = UUID_REGEX.test(productId);
      const data = isUUID
        ? await apiClient.getPublicProductById(productId)
        : await apiClient.getPublicProductBySlug(productId);
      setProduct(data);
      // Don't auto-select variant, let user choose
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      toast.error('Vui lòng chọn phân loại');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(selectedVariantId, quantity);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariantId) {
      toast.error('Vui lòng chọn phân loại');
      return;
    }

    try {
      setBuyingNow(true);
      await addToCart(selectedVariantId, quantity, true); // selectItem = true
      router.push('/cart');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thêm vào giỏ hàng');
      setBuyingNow(false);
    }
  };

  const handleVariantSelect = (variantId: string) => {
    // Toggle selection - click again to deselect
    if (selectedVariantId === variantId) {
      setSelectedVariantId(null);
    } else {
      setSelectedVariantId(variantId);
    }
    setHoveredVariantImageUrl(null);
  };

  const handleVariantHover = (variantId: string | null) => {
    if (variantId) {
      const variant = product?.variants.find((v) => v.id === variantId);
      setHoveredVariantImageUrl(variant?.imageUrl || null);
    } else {
      setHoveredVariantImageUrl(null);
    }
  };

  const scrollToReviews = () => {
    reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReviewSuccess = (review: ReviewResponse) => {
    toast.success('Đánh giá của bạn đã được gửi thành công!');
    setShowReviewForm(false);
    setSelectedReviewItem(null);
    // Remove the reviewed item from the list
    setReviewableItems((prev) => prev.filter((item) => item.orderItemId !== review.orderItemId));
    // Refresh the review list
    setReviewListKey((prev) => prev + 1);
  };

  const handleStartReview = (item: ReviewableOrderItemResponse) => {
    setSelectedReviewItem(item);
    setShowReviewForm(true);
    // Scroll to review section
    setTimeout(() => {
      reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
        <Link href="/products">
          <Button>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

  // Get current price for display - use first variant price as default when none selected
  const firstVariant = product.variants[0];
  const displayPrice = selectedVariant
    ? selectedVariant.price
    : firstVariant?.price ?? product.minPrice;
  const displayCompareAtPrice = selectedVariant?.compareAtPrice ?? firstVariant?.compareAtPrice;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-6 space-y-4" style={{ maxWidth: '1200px' }}>
        {/* Breadcrumb */}
        <CategoryBreadcrumb
          categories={product.categoryHierarchy}
          productName={product.name}
        />

        {/* Product Overview Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
            {/* Left: Images */}
            <ImageGallery
              images={product.images}
              productName={product.name}
              thumbnailUrl={product.thumbnailUrl}
              hoveredVariantImageUrl={hoveredVariantImageUrl}
              selectedVariantImageUrl={selectedVariant?.imageUrl}
              selectedVariantId={selectedVariantId}
            />

            {/* Right: Info */}
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                {product.shortDescription && (
                  <p className="text-gray-600 mt-1">{product.shortDescription}</p>
                )}
              </div>

              {/* Rating & Stats */}
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={scrollToReviews}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <StarRatingVisual rating={product.averageRating} size="md" />
                  <span className="font-medium">{product.averageRating.toFixed(1)}</span>
                  <span className="text-gray-400">({product.totalRatings} đánh giá)</span>
                </button>
                <span className="text-gray-400">|</span>
                <span>Đã bán {product.soldCount}</span>
              </div>

              {/* Price */}
              <div className="bg-gray-50 p-4 rounded-lg">
                {selectedVariant ? (
                  <ProductPrice
                    price={displayPrice}
                    compareAtPrice={displayCompareAtPrice}
                    size="lg"
                  />
                ) : (
                  <div className="text-3xl font-bold text-primary">
                    {product.minPrice === product.maxPrice
                      ? new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(product.minPrice)
                      : `${new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(product.minPrice)} - ${new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(product.maxPrice)}`}
                  </div>
                )}
              </div>

              {/* Variant Selector */}
              <VariantSelector
                variants={product.variants}
                selectedVariantId={selectedVariantId}
                onSelect={handleVariantSelect}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onHover={handleVariantHover}
              />

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 border-primary text-primary hover:bg-primary/10"
                  onClick={handleAddToCart}
                  disabled={addingToCart || buyingNow || !selectedVariantId}
                >
                  {addingToCart ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 mr-2" />
                  )}
                  Thêm vào giỏ
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={addingToCart || buyingNow || !selectedVariantId}
                >
                  {buyingNow ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2" />
                  )}
                  Mua ngay
                </Button>
              </div>

              {/* Category & Brand */}
              {(product.categoryName || product.brandName) && (
                <div className="text-sm space-y-1 pt-4 border-t">
                  {product.categoryName && (
                    <p>
                      <span className="text-gray-500">Danh mục:</span> {product.categoryName}
                    </p>
                  )}
                  {product.brandName && (
                    <p>
                      <span className="text-gray-500">Thương hiệu:</span> {product.brandName}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shop Info Section */}
        <ShopInfoSection shop={product.shop} />

        {/* Product Detail Section */}
        <ProductDetailSection
          categoryHierarchy={product.categoryHierarchy}
          allergenTags={product.allergenTags}
          dietTags={product.dietTags}
          description={product.description}
          ingredients={product.ingredients}
          nutrition={product.nutrition}
          totalStock={totalStock}
          shopProvince={product.shop.province}
        />

        {/* Reviews Section */}
        <div ref={reviewSectionRef} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 scroll-mt-4">
          <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h2>

          {/* Reviewable Items Banner */}
          {reviewableItems.length > 0 && (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Star className="w-5 h-5" />
                <span className="font-medium">Bạn có thể đánh giá sản phẩm này!</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Bạn đã mua sản phẩm này và có thể viết đánh giá cho {reviewableItems.length} đơn hàng.
              </p>
              {showReviewForm && selectedReviewItem ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500">
                      Đánh giá cho đơn hàng #{selectedReviewItem.orderCode} ({selectedReviewItem.variantName})
                    </p>
                    <button
                      onClick={() => {
                        setShowReviewForm(false);
                        setSelectedReviewItem(null);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Thu gọn
                    </button>
                  </div>
                  <ReviewForm
                    orderItemId={selectedReviewItem.orderItemId}
                    productName={product.name}
                    productImageUrl={product.thumbnailUrl ?? undefined}
                    onSuccess={handleReviewSuccess}
                    onCancel={() => {
                      setShowReviewForm(false);
                      setSelectedReviewItem(null);
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {reviewableItems.map((item) => (
                    <button
                      key={item.orderItemId}
                      onClick={() => handleStartReview(item)}
                      className="w-full flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-sm">Đơn hàng #{item.orderCode}</p>
                        <p className="text-xs text-gray-500">
                          {item.variantName} - Hoàn thành{' '}
                          {new Date(item.completedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Star className="w-5 h-5 text-primary" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <ReviewList key={reviewListKey} productId={product.id} />
        </div>
      </div>
    </div>
  );
}
