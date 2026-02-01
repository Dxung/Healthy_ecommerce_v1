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
import {
  Loader2,
  Package,
  Star,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
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
      // Select first active variant by default
      const firstActiveVariant = data.variants.find((v) => v.isActive && v.stockQuantity > 0);
      if (firstActiveVariant) {
        setSelectedVariantId(firstActiveVariant.id);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Khong the tai thong tin san pham');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      toast.error('Vui long chon phan loai');
      return;
    }

    try {
      setAddingToCart(true);
      await apiClient.addToCart(selectedVariantId, quantity);
      toast.success('Da them vao gio hang');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Khong the them vao gio hang');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariantId) {
      toast.error('Vui long chon phan loai');
      return;
    }

    try {
      setBuyingNow(true);
      await apiClient.addToCart(selectedVariantId, quantity);
      router.push('/checkout');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Khong the them vao gio hang');
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
        <h2 className="text-xl font-medium text-gray-900 mb-2">Khong tim thay san pham</h2>
        <Link href="/products">
          <Button>Quay lai danh sach</Button>
        </Link>
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

  // Get current price for display
  const displayPrice = selectedVariant
    ? selectedVariant.price
    : product.minPrice;
  const displayCompareAtPrice = selectedVariant?.compareAtPrice;

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Breadcrumb */}
      <CategoryBreadcrumb
        categories={product.categoryHierarchy}
        productName={product.name}
      />

      {/* Product Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Images */}
        <ImageGallery
          images={product.images}
          productName={product.name}
          thumbnailUrl={product.thumbnailUrl}
          variantImageUrl={hoveredVariantImageUrl || selectedVariant?.imageUrl}
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
            {product.averageRating > 0 && (
              <button
                onClick={scrollToReviews}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({product.totalRatings} danh gia)</span>
              </button>
            )}
            <span className="text-gray-400">|</span>
            <span>Da ban {product.soldCount}</span>
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
              Them vao gio
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
                  <span className="text-gray-500">Danh muc:</span> {product.categoryName}
                </p>
              )}
              {product.brandName && (
                <p>
                  <span className="text-gray-500">Thuong hieu:</span> {product.brandName}
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
        <h2 className="text-xl font-bold mb-4">Danh gia san pham</h2>
        <ReviewList productId={product.id} />
      </div>
    </div>
  );
}
