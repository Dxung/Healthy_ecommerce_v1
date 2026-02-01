'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface CategoryBreadcrumbItem {
  id: string;
  name: string;
  slug: string;
}

interface CategoryBreadcrumbProps {
  categories: CategoryBreadcrumbItem[];
  productName?: string;
}

export function CategoryBreadcrumb({ categories, productName }: CategoryBreadcrumbProps) {
  if (categories.length === 0 && !productName) return null;

  return (
    <nav className="flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-2">
      <Link
        href="/"
        className="flex items-center hover:text-primary transition-colors shrink-0"
      >
        <Home className="w-4 h-4" />
      </Link>

      {categories.map((category, index) => (
        <span key={category.id} className="flex items-center shrink-0">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-300" />
          <Link
            href={`/categories/${category.slug}`}
            className="hover:text-primary transition-colors"
          >
            {category.name}
          </Link>
        </span>
      ))}

      {productName && (
        <span className="flex items-center shrink-0">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-300" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]" title={productName}>
            {productName}
          </span>
        </span>
      )}
    </nav>
  );
}
