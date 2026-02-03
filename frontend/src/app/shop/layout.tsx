'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShopHeader } from '@/components/shop/ShopHeader';
import { Footer } from '@/components/layout/Footer';
import {
  Package,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Plus,
  LayoutDashboard,
  Wallet,
  Award,
  Star,
} from 'lucide-react';
import { useState } from 'react';

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    label: 'Tổng quan',
    href: '/shop',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Quản lý đơn hàng',
    href: '/shop/orders',
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    label: 'Quản lý sản phẩm',
    icon: <Package className="w-5 h-5" />,
    children: [
      { label: 'Tất cả sản phẩm', href: '/shop/products' },
      { label: 'Thêm sản phẩm', href: '/shop/products/new' },
    ],
  },
  {
    label: 'Quản lý đánh giá',
    href: '/shop/reviews',
    icon: <Star className="w-5 h-5" />,
  },
  {
    label: 'Huy hiệu & Chứng nhận',
    href: '/shop/badges',
    icon: <Award className="w-5 h-5" />,
  },
  {
    label: 'Ví của Shop',
    href: '/shop/wallet',
    icon: <Wallet className="w-5 h-5" />,
  },
];

// Pages that should show sidebar (shop management pages)
const pagesWithSidebar = ['/shop', '/shop/orders', '/shop/products', '/shop/reviews', '/shop/badges', '/shop/wallet'];

function ShopSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Quản lý sản phẩm']);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isChildActive = (children: NavChild[]) =>
    children.some((child) => pathname === child.href || pathname.startsWith(child.href + '/'));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-120px)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isChildActive(item.children)
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
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive(child.href)
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {child.label}
                          </Link>
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
    </aside>
  );
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if current page should show sidebar
  const showSidebar = pagesWithSidebar.some(
    (page) => pathname === page || pathname.startsWith(page + '/')
  ) && !pathname.startsWith('/shop/register');

  return (
    <>
      <ShopHeader />
      {showSidebar ? (
        <div className="flex flex-1 bg-gray-50">
          <ShopSidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      ) : (
        <main className="flex-1 bg-gray-50">{children}</main>
      )}
      <Footer />
    </>
  );
}
