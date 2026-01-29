"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { useState } from "react";
import { User, ShoppingBag, Store, LogOut, Shield, Utensils, Wallet, Menu, X } from "lucide-react";
import { CartDropdown } from "@/components/cart/CartDropdown";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isSignupPage = pathname?.startsWith("/buyer/signup");
  const isLoginPage = pathname?.startsWith("/login");

  // Check if user has admin or super_admin role
  const isAdmin = user?.roles?.some(role => role === 'admin' || role === 'super_admin') ?? false;

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
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-base md:text-lg">H</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-foreground hidden sm:block">HealthyFood</span>
          </Link>
          {(isSignupPage || isLoginPage) && (
            <span className="text-xs md:text-sm text-muted-foreground">
              {isSignupPage ? "Đăng ký" : "Đăng nhập"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Cart - show for logged in non-admin users only */}
          {user && !isAdmin && <CartDropdown />}

          {user ? (
            <>
              {/* Desktop dropdown - hidden on mobile */}
              <div className="relative group hidden md:block">
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
                    {/* Tài khoản của tôi - hide for admin */}
                    {!isAdmin && (
                      <Link
                        href="/user/account/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Tài khoản của tôi</span>
                      </Link>
                    )}

                    {/* Đơn mua - hide for admin */}
                    {!isAdmin && (
                      <Link
                        href="/user/orders"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Đơn mua</span>
                      </Link>
                    )}

                    {/* Ví của tôi - hide for admin */}
                    {!isAdmin && (
                      <Link
                        href="/user/wallet"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Wallet className="w-4 h-4" />
                        <span>Ví của tôi</span>
                      </Link>
                    )}

                    {/* Kế hoạch dinh dưỡng - hide for admin */}
                    {!isAdmin && (
                      <Link
                        href="/meal-plan"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>Kế hoạch dinh dưỡng</span>
                      </Link>
                    )}

                    {/* Cửa hàng của tôi - hide for admin */}
                    {!isAdmin && (
                      <Link
                        href="/shop"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Store className="w-4 h-4" />
                        <span>Cửa hàng của tôi</span>
                      </Link>
                    )}

                    {/* Trang quản trị - Only show for admin */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Trang quản trị</span>
                      </Link>
                    )}

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

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* Mobile menu overlay */}
              {isMobileMenuOpen && (
                <div
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}

              {/* Mobile menu drawer */}
              <div
                className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
                  isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                }`}
              >
                <div className="flex flex-col h-full">
                  {/* Mobile menu header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-gray-500">Xin chào!</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mobile menu links */}
                  <nav className="flex-1 overflow-y-auto py-4">
                    {!isAdmin && (
                      <>
                        <Link
                          href="/user/account/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-5 h-5" />
                          <span>Tài khoản của tôi</span>
                        </Link>
                        <Link
                          href="/user/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <ShoppingBag className="w-5 h-5" />
                          <span>Đơn mua</span>
                        </Link>
                        <Link
                          href="/user/wallet"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Wallet className="w-5 h-5" />
                          <span>Ví của tôi</span>
                        </Link>
                        <Link
                          href="/meal-plan"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Utensils className="w-5 h-5" />
                          <span>Kế hoạch dinh dưỡng</span>
                        </Link>
                        <Link
                          href="/shop"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Store className="w-5 h-5" />
                          <span>Cửa hàng của tôi</span>
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Shield className="w-5 h-5" />
                        <span>Trang quản trị</span>
                      </Link>
                    )}
                  </nav>

                  {/* Mobile menu footer - logout */}
                  <div className="border-t p-4">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            !isLoginPage && !isSignupPage && (
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
            )
          )}
        </div>
      </div>
    </header>
  );
}
