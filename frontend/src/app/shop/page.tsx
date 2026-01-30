"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, type ShopInfoResponse, type ApiError } from "@/lib/api";
import { NoShopPlaceholder } from "@/components/shop/NoShopPlaceholder";
import { Loader2 } from "lucide-react";

type ShopState =
  | { status: "loading" }
  | { status: "no-shop" }
  | { status: "has-shop"; shop: ShopInfoResponse }
  | { status: "error"; message: string };

export default function ShopPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<ShopState>({ status: "loading" });
  const hasFetched = useRef(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (user === null) {
      router.push("/login?redirect=/shop");
      return;
    }

    // Prevent duplicate calls
    if (hasFetched.current) return;
    hasFetched.current = true;

    const checkShopStatus = async () => {
      try {
        // Check if user has a shop
        const shop = await apiClient.getMyShop();

        if (shop) {
          // User has a shop - show shop management
          setState({ status: "has-shop", shop });
        } else {
          // No shop - show "no shop" placeholder
          setState({ status: "no-shop" });
        }
      } catch (error) {
        const apiError = error as ApiError;
        setState({ status: "error", message: apiError.message || "Có lỗi xảy ra" });
      }
    };

    checkShopStatus();
  }, [user, router]);

  // Loading state
  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-500">Đang tải thông tin cửa hàng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.status === "error") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{state.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // No shop - show placeholder
  if (state.status === "no-shop") {
    return <NoShopPlaceholder />;
  }

  // Has shop - show dashboard (placeholder for now)
  if (state.status === "has-shop") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Quản lý cửa hàng</h1>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{state.shop.name}</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">Slug:</span> {state.shop.slug}</p>
            <p><span className="font-medium">Trạng thái:</span> {state.shop.status}</p>
            {state.shop.badges.length > 0 && (
              <p><span className="font-medium">Huy hiệu:</span> {state.shop.badges.join(", ")}</p>
            )}
          </div>
          <p className="text-gray-500 mt-4">
            Trang quản lý cửa hàng sẽ được phát triển trong tương lai.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
