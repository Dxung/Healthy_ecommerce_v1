'use client';

interface ProductPriceProps {
  price: number;
  compareAtPrice?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export function ProductPrice({
  price,
  compareAtPrice,
  size = 'md',
  showBadge = true,
}: ProductPriceProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const discountPercentage =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  const sizeClasses = {
    sm: {
      current: 'text-lg font-bold',
      original: 'text-sm',
      badge: 'text-xs px-1.5 py-0.5',
    },
    md: {
      current: 'text-2xl font-bold',
      original: 'text-base',
      badge: 'text-sm px-2 py-1',
    },
    lg: {
      current: 'text-3xl font-bold',
      original: 'text-lg',
      badge: 'text-sm px-2 py-1',
    },
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={`${sizeClasses[size].current} text-primary`}>
        {formatPrice(price)}
      </span>

      {compareAtPrice && compareAtPrice > price && (
        <>
          <span className={`${sizeClasses[size].original} text-gray-400 line-through`}>
            {formatPrice(compareAtPrice)}
          </span>
          {showBadge && discountPercentage > 0 && (
            <span
              className={`${sizeClasses[size].badge} bg-red-500 text-white rounded font-medium`}
            >
              -{discountPercentage}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
