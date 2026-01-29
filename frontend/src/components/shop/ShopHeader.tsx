"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { useState } from "react";
import { User, Store, LogOut, Home } from "lucide-react";

export function ShopHeader() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await apiClient.logout();
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="w-full bg-white border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-foreground">HealthyFood</span>
          </Link>
          {/* Shop section indicator */}
          <div className="flex items-center gap-2 pl-4 border-l border-gray-300">
            <Store className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold text-primary">Cửa hàng</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative group">
              {/* Hover Area - Avatar + Username */}
              <div className="flex items-center gap-3 cursor-pointer py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium">Xin chào, {user.username}</span>
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  {/* Trang chủ */}
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    <span>Trang chủ</span>
                  </Link>

                  {/* Tài khoản của tôi */}
                  <Link
                    href="/user/account/profile"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Tài khoản của tôi</span>
                  </Link>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-1"></div>

                  {/* Đăng xuất */}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/buyer/signup"
                className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
