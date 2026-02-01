'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, type PublicProductDetailResponse, type ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { VariantSelector } from '@/components/product/VariantSelector';
import { CategoryBreadcrumb } from '@/components/product/CategoryBreadcrumb';
import { ImageGallery } from '@/components/product/ImageGallery';
import { ProductPrice } from '@/components/product/ProductPrice';
import { ShopInfoSection } from '@/components/product/ShopInfoSection';
import { ProductDetailSection } from '@/components/product/ProductDetailSection';
import { ReviewList } from '@/components/review/ReviewList';
import { StarRatingVisual } from '@/components/ui/StarRatingVisual';
import { useCart } from '@/contexts/CartContext';
import {
  Loader2,
  Package,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const productId = params.id as string;
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<PublicProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [hoveredVariantImageUrl, setHoveredVariantImageUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

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
      await addToCart(selectedVariantId, quantity);
      router.push('/checkout');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thêm vào giỏ hàng');
      setBuyingNow(false);
    }
  };

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
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
    <div className="container mx-auto px-4 py-6 space-y-8" style={{ maxWidth: '1200px' }}>
      {/* Breadcrumb */}
      <CategoryBreadcrumb
        categories={product.categoryHierarchy}
        productName={product.name}
      />

      {/* Product Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
        {/* Left: Images */}
        <ImageGallery
          images={product.images}
          productName={product.name}
          thumbnailUrl={product.thumbnailUrl}
          variantImageUrl={hoveredVariantImageUrl || selectedVariant?.imageUrl}
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

      {/* Shop Info Section */}
      <ShopInfoSection shop={product.shop} />

      {/* Product Detail Section */}
      <ProductDetailSection
        categoryHierarchy={product.categoryHierarchy}
        allergenTags={product.allergenTags}
        dietTags={product.dietTags}
        description={product.description}
        nutrition={product.nutrition}
        totalStock={totalStock}
        shopProvince={product.shop.province}
      />

      {/* Reviews Section */}
      <div ref={reviewSectionRef} className="scroll-mt-4">
        <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h2>
        <ReviewList productId={product.id} />
      </div>
    </div>
  );
}
