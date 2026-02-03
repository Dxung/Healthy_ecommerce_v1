'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  MapPin,
  ShoppingBag,
  Shield,
  Star,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Tài khoản của tôi',
    icon: <User className="w-4 h-4" />,
    children: [
      { label: 'Hồ sơ', href: '/user/account/profile', icon: <User className="w-4 h-4" /> },
      { label: 'Địa chỉ', href: '/user/account/address', icon: <MapPin className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Đơn mua',
    href: '/user/orders',
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    label: 'Đánh giá của tôi',
    href: '/user/reviews',
    icon: <Star className="w-4 h-4" />,
  },
  {
    label: 'Bảo mật',
    href: '/user/setting/security',
    icon: <Shield className="w-4 h-4" />,
  },
];

export function AccountSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Only expand "Tài khoản của tôi" when on its child pages
  const getInitialExpanded = () => {
    if (pathname.startsWith('/user/account/')) {
      return ['Tài khoản của tôi'];
    }
    return [];
  };

  const [expandedItems, setExpandedItems] = useState<string[]>(getInitialExpanded);

  // Sync expanded state when pathname changes (client-side navigation)
  useEffect(() => {
    if (pathname.startsWith('/user/account/')) {
      setExpandedItems(['Tài khoản của tôi']);
    } else {
      setExpandedItems([]);
    }
  }, [pathname]);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const collapseAll = () => {
    setExpandedItems([]);
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href;
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = isActive(item.href);

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpanded(item.label)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors',
              'hover:bg-gray-50 text-gray-700 font-medium'
            )}
          >
            <div className="flex items-center gap-2">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && item.children && (
            <div className="ml-4">
              {item.children.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    if (item.href) {
      return (
        <Link
          key={item.label}
          href={item.href}
          onClick={depth === 0 ? collapseAll : undefined}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors',
            depth > 0 && 'pl-6',
            active
              ? 'bg-primary/10 text-primary border-r-2 border-primary font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          )}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      );
    }

    return null;
  };

  return (
    <div className="w-52 bg-white rounded-lg shadow-sm">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || 'User'}
            </p>
          </div>
        </div>
        <Link
          href="/user/account/profile"
          className="block w-full text-center py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Sửa hồ sơ
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="py-2">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>
    </div>
  );
}
