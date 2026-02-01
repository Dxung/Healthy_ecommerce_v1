'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient, type CartResponse, type CartItemResponse, type ApiError } from '@/lib/api';
import { CartShopGroup } from '@/components/cart/CartShopGroup';
import { InactiveItemsSection } from '@/components/cart/InactiveItemsSection';
import { CartStickyBar } from '@/components/cart/CartStickyBar';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const { refreshCart } = useCart();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [operating, setOperating] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCart();
      setCart(data);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Collect inactive items across all shops
  const inactiveItems: CartItemResponse[] = [];
  const activeShops =
    cart?.shops.map((shopGroup) => {
      const activeItems: CartItemResponse[] = [];
      shopGroup.items.forEach((item) => {
        const isInactive =
          !item.variant.isActive ||
          !item.product.isVisible ||
          item.product.status !== 'active' ||
          item.variant.stockQuantity === 0;
        if (isInactive) {
          inactiveItems.push(item);
        } else {
          activeItems.push(item);
        }
      });
      return {
        ...shopGroup,
        items: activeItems,
      };
    }).filter((shopGroup) => shopGroup.items.length > 0) ?? [];

  // Calculate selected count and total from active items only
  const selectedCount =
    activeShops.reduce(
      (sum, shop) => sum + shop.items.filter((item) => item.isSelected).length,
      0
    ) ?? 0;
  const selectedTotal =
    activeShops.reduce(
      (sum, shop) =>
        sum +
        shop.items
          .filter((item) => item.isSelected)
          .reduce((itemSum, item) => itemSum + item.variant.price * item.quantity, 0),
      0
    ) ?? 0;
  const totalActiveItems =
    activeShops.reduce((sum, shop) => sum + shop.items.length, 0) ?? 0;
  const allSelected = totalActiveItems > 0 && selectedCount === totalActiveItems;

  const handleToggleShopSelect = async (shopId: string, isSelected: boolean) => {
    try {
      setOperating(true);
      if (isSelected) {
        await apiClient.selectShopItems(shopId);
      } else {
        await apiClient.deselectShopItems(shopId);
      }
      await fetchCart();
      await refreshCart();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Thao tác thất bại');
    } finally {
      setOperating(false);
    }
  };

  const handleToggleItemSelect = async (cartItemId: string) => {
    try {
      setOperating(true);
      await apiClient.toggleCartItemSelection(cartItemId);
      await fetchCart();
      await refreshCart();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Thao tác thất bại');
    } finally {
      setOperating(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      setOperating(true);
      await apiClient.updateCartItem(cartItemId, quantity);
      await fetchCart();
      await refreshCart();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Cập nhật số lượng thất bại');
    } finally {
      setOperating(false);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      setOperating(true);
      await apiClient.removeCartItem(cartItemId);
      toast.success('Đã xóa sản phẩm');
      await fetchCart();
      await refreshCart();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Xóa sản phẩm thất bại');
    } finally {
      setOperating(false);
    }
  };

  const handleRemoveInactive = async () => {
    try {
      setOperating(true);
      const result = await apiClient.removeInactiveItems();
      toast.success(`Đã xóa ${result.removedCount} sản phẩm không khả dụng`);
      await fetchCart();
      await refreshCart();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Xóa sản phẩm thất bại');
    } finally {
      setOperating(false);
    }
  };

  const handleToggleSelectAll = async (selected: boolean) => {
    try {
      setOperating(true);
      if (selected) {
        await apiClient.selectAllCartItems();
      } else {
        await apiClient.deselectAllCartItems();
      }
      await fetchCart();
      await refreshCart();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Thao tác thất bại');
    } finally {
      setOperating(false);
    }
  };

  const handleRemoveSelected = async () => {
    const selectedItemIds = activeShops
      .flatMap((shop) => shop.items.filter((item) => item.isSelected))
      .map((item) => item.id);

    if (selectedItemIds.length === 0) return;

    try {
      setOperating(true);
      await apiClient.removeCartItems(selectedItemIds);
      toast.success(`Đã xóa ${selectedItemIds.length} sản phẩm`);
      await fetchCart();
      await refreshCart();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Xóa sản phẩm thất bại');
    } finally {
      setOperating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isEmpty = !cart || cart.totalItems === 0;

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
        <Link href="/">
          <Button>
            <Package className="w-5 h-5 mr-2" />
            Khám phá sản phẩm
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Giỏ hàng ({cart.totalQuantity})
        </h1>
      </div>

      {/* Inactive Items Warning */}
      {inactiveItems.length > 0 && (
        <div className="mb-6">
          <InactiveItemsSection
            items={inactiveItems}
            onRemoveInactive={handleRemoveInactive}
            disabled={operating}
          />
        </div>
      )}

      {/* Cart Header (Table Header) */}
      {activeShops.length > 0 && (
        <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-t-lg border-b text-sm font-medium text-gray-500">
          <div className="w-4" /> {/* Checkbox space */}
          <div className="flex-1">Sản phẩm</div>
          <div className="w-24 text-right">Đơn giá</div>
          <div className="w-28 text-center">Số lượng</div>
          <div className="w-28 text-right">Thành tiền</div>
          <div className="w-10" /> {/* Delete button space */}
        </div>
      )}

      {/* Shop Groups */}
      <div className="space-y-4">
        {activeShops.map((shopGroup) => (
          <CartShopGroup
            key={shopGroup.shop.id}
            shopGroup={shopGroup}
            onToggleShopSelect={handleToggleShopSelect}
            onToggleItemSelect={handleToggleItemSelect}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            disabled={operating}
          />
        ))}
      </div>

      {/* Empty active items */}
      {activeShops.length === 0 && inactiveItems.length > 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Tất cả sản phẩm trong giỏ hàng đều không khả dụng.
            <br />
            Vui lòng xóa và thêm sản phẩm mới.
          </p>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <CartStickyBar
        totalItems={totalActiveItems}
        selectedCount={selectedCount}
        selectedTotal={selectedTotal}
        allSelected={allSelected}
        hasInactiveItems={inactiveItems.length > 0}
        onToggleSelectAll={handleToggleSelectAll}
        onRemoveSelected={handleRemoveSelected}
        disabled={operating}
      />
    </div>
  );
}
