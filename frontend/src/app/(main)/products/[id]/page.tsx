'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient, type PublicProductDetailResponse, type ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { VariantSelector } from '@/components/product/VariantSelector';
import { NutritionInfo } from '@/components/product/NutritionInfo';
import { ReviewList } from '@/components/review/ReviewList';
import {
  Loader2,
  Package,
  Star,
  Store,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Leaf,
  ShoppingCart,
  BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip } from '@/components/ui/tooltip';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<PublicProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [showingVariantImage, setShowingVariantImage] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Detect if productId is UUID or slug
      const isUUID = UUID_REGEX.test(productId);
      const data = isUUID
        ? await apiClient.getPublicProductById(productId)
        : await apiClient.getPublicProductBySlug(productId);
      setProduct(data);
      // Select first active variant by default
      const firstActiveVariant = data.variants.find((v) => v.isActive && v.stockQuantity > 0);
      if (firstActiveVariant) {
        setSelectedVariantId(firstActiveVariant.id);
      }
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
      await apiClient.addToCart(selectedVariantId, quantity);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
    // Auto-switch to variant image if it has one
    const variant = product?.variants.find((v) => v.id === variantId);
    if (variant?.imageUrl) {
      setShowingVariantImage(true);
    }
  };

  const handleGalleryImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowingVariantImage(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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

  const images = product.images.length > 0 ? product.images : null;
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

  // Determine which image to show
  const displayImage = showingVariantImage && selectedVariant?.imageUrl
    ? selectedVariant.imageUrl
    : images
    ? images[currentImageIndex].imageUrl
    : product.thumbnailUrl;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden">
            {displayImage ? (
              <>
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {images && images.length > 1 && !showingVariantImage && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white shadow"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white shadow"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-20 h-20 text-gray-300" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images && images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => handleGalleryImageClick(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                    !showingVariantImage && idx === currentImageIndex
                      ? 'border-primary'
                      : 'border-transparent'
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          {/* Shop Info */}
          <Link
            href={`/shop/${product.shop.slug}`}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {product.shop.logoUrl ? (
              <img
                src={product.shop.logoUrl}
                alt={product.shop.name}
                className="w-12 h-12 rounded-full object-cover border"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <Store className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{product.shop.name}</span>
                {product.shop.badges.length > 0 && (
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <div className="text-sm text-gray-500">
                {product.shop.totalProducts} sản phẩm • {product.shop.averageRating.toFixed(1)}{' '}
                <Star className="w-3 h-3 inline fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <Button variant="outline" size="sm">
              Xem shop
            </Button>
          </Link>

          {/* Product Name */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            {product.shortDescription && (
              <p className="text-gray-600 mt-1">{product.shortDescription}</p>
            )}
          </div>

          {/* Rating & Stats */}
          <div className="flex items-center gap-4 text-sm">
            {product.averageRating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({product.totalRatings} đánh giá)</span>
              </span>
            )}
            <span className="text-gray-400">|</span>
            <span>Đã bán {product.soldCount}</span>
          </div>

          {/* Price */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-primary">
              {selectedVariant
                ? formatPrice(selectedVariant.price)
                : product.minPrice === product.maxPrice
                ? formatPrice(product.minPrice)
                : `${formatPrice(product.minPrice)} - ${formatPrice(product.maxPrice)}`}
            </div>
            {selectedVariant?.compareAtPrice && (
              <div className="text-gray-400 line-through">
                {formatPrice(selectedVariant.compareAtPrice)}
              </div>
            )}
          </div>

          {/* Tags */}
          {(product.allergenTags.length > 0 || product.dietTags.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {product.allergenTags.map((tag) => (
                <Tooltip key={tag.id} content={tag.description} position="bottom">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-full cursor-help">
                    <AlertTriangle className="w-4 h-4" />
                    {tag.name}
                  </span>
                </Tooltip>
              ))}
              {product.dietTags.map((tag) => (
                <Tooltip key={tag.id} content={tag.description} position="bottom">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-full cursor-help">
                    <Leaf className="w-4 h-4" />
                    {tag.name}
                  </span>
                </Tooltip>
              ))}
            </div>
          )}

          {/* Variant Selector */}
          <VariantSelector
            variants={product.variants}
            selectedVariantId={selectedVariantId}
            onSelect={handleVariantSelect}
            quantity={quantity}
            onQuantityChange={setQuantity}
          />

          {/* Add to Cart */}
          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={addingToCart || !selectedVariantId}
            >
              {addingToCart ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5 mr-2" />
              )}
              Thêm vào giỏ hàng
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

      {/* Description & Nutrition */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Description */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Mô tả sản phẩm</h2>
          <div className="bg-white rounded-lg border p-6">
            {product.description ? (
              <div className="prose max-w-none whitespace-pre-line">{product.description}</div>
            ) : (
              <p className="text-gray-400 italic">Chưa có mô tả</p>
            )}
          </div>
        </div>

        {/* Nutrition */}
        {product.nutrition && (
          <div>
            <h2 className="text-xl font-bold mb-4">Thông tin dinh dưỡng</h2>
            <NutritionInfo nutrition={product.nutrition} />
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h2>
        <ReviewList productId={product.id} />
      </div>
    </div>
  );
}
