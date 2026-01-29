'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, CategoryHierarchyResponse } from '@/lib/api';
import { Leaf, ChevronRight, ChevronDown } from 'lucide-react';

function CategoryCard({
  category,
  isChild = false,
}: {
  category: CategoryHierarchyResponse;
  isChild?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.filter((c) => c.isActive).length > 0;

  return (
    <div className={`${isChild ? 'pl-8' : ''}`}>
      <div
        className={`flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all ${isChild ? 'ml-4' : ''}`}
      >
        {/* Expand/Collapse button */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-primary transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        ) : (
          <div className="w-6 h-6 flex-shrink-0" />
        )}

        <Link
          href={`/categories/${category.slug}`}
          className="flex items-center gap-4 flex-1 min-w-0"
        >
          <div
            className={`${isChild ? 'w-12 h-12' : 'w-16 h-16'} bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0`}
          >
            {category.iconUrl ? (
              <img
                src={category.iconUrl}
                alt={category.name}
                className={`${isChild ? 'w-6 h-6' : 'w-8 h-8'}`}
              />
            ) : (
              <Leaf className={`${isChild ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium text-gray-900 ${isChild ? 'text-sm' : 'text-base'}`}
            >
              {category.name}
            </h3>
            <span className="text-xs text-gray-400">
              {category.productCount} sản phẩm
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>

      {/* Render children - only when expanded */}
      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {category.children!
            .filter((c) => c.isActive)
            .map((child) => (
              <CategoryCard key={child.id} category={child} isChild />
            ))}
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryHierarchyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiClient.getPublicCategories();
      setCategories(data.filter((c) => c.isActive));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Danh mục sản phẩm</h1>
          <p className="text-gray-500 mt-2">
            Khám phá các danh mục thực phẩm lành mạnh
          </p>
        </div>

        {/* Categories */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Chưa có danh mục nào
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
