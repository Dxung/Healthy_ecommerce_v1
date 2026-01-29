'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { apiClient, type CartPreviewResponse, type ApiError } from '@/lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartPreview: CartPreviewResponse | null;
  totalItems: number;
  totalQuantity: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartPreview, setCartPreview] = useState<CartPreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartPreview(null);
      return;
    }

    try {
      setIsLoading(true);
      const preview = await apiClient.getCartPreview();
      setCartPreview(preview);
    } catch (err) {
      // Silently fail - cart preview is not critical
      console.error('Failed to fetch cart preview:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addToCart = useCallback(
    async (variantId: string, quantity: number) => {
      await apiClient.addToCart(variantId, quantity);
      await refreshCart();
    },
    [refreshCart]
  );

  // Fetch cart preview when user changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartPreview,
        totalItems: cartPreview?.totalItems ?? 0,
        totalQuantity: cartPreview?.totalQuantity ?? 0,
        isLoading,
        refreshCart,
        addToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
