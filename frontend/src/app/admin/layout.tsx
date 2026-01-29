'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Store,
  Package,
  ShoppingCart,
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Context for mobile sidebar state
const SidebarContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({ isOpen: false, setIsOpen: () => {} });

interface SubNavItem {
  label: string;
  href: string;
}

interface NavChild {
  label: string;
  href?: string;
  children?: SubNavItem[];
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    label: 'Quản lý tài khoản',
    icon: <Users className="w-5 h-5" />,
    children: [
      { label: 'Danh sách người dùng', href: '/admin/accounts/users' },
      { label: 'Thiết lập vai trò và quyền', href: '/admin/accounts/roles' },
    ],
  },
  {
    label: 'Quản lý Shop',
    icon: <Store className="w-5 h-5" />,
    children: [
      { label: 'Danh sách Shop', href: '/admin/shop/shops' },
      { label: 'Đơn đăng ký Shop', href: '/admin/shop/registrations' },
      {
        label: 'Cấu hình huy hiệu shop',
        children: [
          { label: 'Quản lý giấy tờ', href: '/admin/shop/documents' },
          { label: 'Thiết lập huy hiệu', href: '/admin/shop/badges' },
        ],
      },
    ],
  },
  {
    label: 'Quản lý Đơn hàng',
    icon: <ShoppingCart className="w-5 h-5" />,
    children: [
      { label: 'Tất cả đơn hàng', href: '/admin/orders' },
    ],
  },
  {
    label: 'Quản lý sản phẩm',
    icon: <Package className="w-5 h-5" />,
    children: [
      { label: 'Cấu hình Unit sản phẩm', href: '/admin/product/units' },
      { label: 'Quản lý nhãn dị ứng', href: '/admin/product/allergens' },
      { label: 'Quản lý nhãn chế độ ăn', href: '/admin/product/diet-tags' },
      { label: 'Quản lý danh mục', href: '/admin/product/categories' },
      { label: 'Quản lý thương hiệu', href: '/admin/product/brands' },
    ],
  },
  {
    label: 'Cài đặt hệ thống',
    icon: <Settings className="w-5 h-5" />,
    href: '/admin/settings',
  },
];

function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { isOpen, setIsOpen } = useContext(SidebarContext);

  // Check if any descendant is active (supports nested children)
  const isDescendantActive = useCallback((children: NavChild[]): boolean => {
    return children.some((child) => {
      if (child.href && pathname === child.href) return true;
      if (child.children) return child.children.some((sub) => pathname === sub.href);
      return false;
    });
  }, [pathname]);

  const isSubParentActive = useCallback((children: SubNavItem[]): boolean => {
    return children.some((child) => pathname === child.href);
  }, [pathname]);

  // Auto-expand only the menu containing the active item
  useEffect(() => {
    const newExpanded: string[] = [];

    for (const item of navItems) {
      if (item.children && isDescendantActive(item.children)) {
        newExpanded.push(item.label);
        // Also expand nested submenus if active
        for (const child of item.children) {
          if (child.children && isSubParentActive(child.children)) {
            newExpanded.push(child.label);
          }
        }
      }
    }

    setExpandedItems(newExpanded);
  }, [pathname, isDescendantActive, isSubParentActive]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  const toggleExpand = (label: string, isTopLevel: boolean = false) => {
    setExpandedItems((prev) => {
      if (prev.includes(label)) {
        // Collapse: remove this item and its children
        return prev.filter((item) => item !== label);
      } else {
        if (isTopLevel) {
          // Expand top-level: collapse other top-level items, keep nested items
          const topLevelLabels = navItems.map((i) => i.label);
          const withoutOtherTopLevel = prev.filter((item) => !topLevelLabels.includes(item));
          return [...withoutOtherTopLevel, label];
        } else {
          // Expand nested item
          return [...prev, label];
        }
      }
    });
  };

  const isActive = (href: string) => pathname === href;

  const sidebarContent = (
    <nav className="p-4">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.label}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleExpand(item.label, true)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDescendantActive(item.children)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {expandedItems.includes(item.label) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedItems.includes(item.label) && (
                  <ul className="mt-1 ml-8 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        {child.children ? (
                          // Nested submenu (level 3) - no extra left margin for the parent
                          <div className="-ml-4">
                            <button
                              onClick={() => toggleExpand(child.label, false)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                isSubParentActive(child.children)
                                  ? 'text-primary font-medium'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <span>{child.label}</span>
                              {expandedItems.includes(child.label) ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </button>
                            {expandedItems.includes(child.label) && (
                              <ul className="mt-1 ml-4 space-y-1">
                                {child.children.map((subChild) => (
                                  <li key={subChild.href}>
                                    <Link
                                      href={subChild.href}
                                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                        isActive(subChild.href)
                                          ? 'bg-primary text-white'
                                          : 'text-gray-600 hover:bg-gray-100'
                                      }`}
                                    >
                                      {subChild.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          // Direct link (level 2)
                          <Link
                            href={child.href!}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive(child.href!)
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {child.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                href={item.href!}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href!)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-120px)]">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold text-lg">Menu quản trị</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-65px)]">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen }}>
      <Header />
      <div className="flex flex-1 bg-gray-50">
        {/* Mobile menu toggle button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-4 left-4 z-30 lg:hidden bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <AdminSidebar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
      <Footer />
    </SidebarContext.Provider>
  );
}
