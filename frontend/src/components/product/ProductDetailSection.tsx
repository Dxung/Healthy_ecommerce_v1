'use client';

import Link from 'next/link';
import { ChevronRight, AlertTriangle, Leaf, Flame, Dumbbell, Cookie } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';

interface CategoryBreadcrumbItem {
  id: string;
  name: string;
  slug: string;
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl?: string | null;
}

interface NutritionInfo {
  servingSize: number | null;
  servingUnitName: string | null;
  servingUnitAbbreviation: string | null;
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  sugar: number | null;
  fat: number | null;
  saturatedFat: number | null;
  fiber: number | null;
  sodium: number | null;
}

interface ProductDetailSectionProps {
  categoryHierarchy: CategoryBreadcrumbItem[];
  allergenTags: TagItem[];
  dietTags: TagItem[];
  description: string | null;
  ingredients?: string | null;
  nutrition: NutritionInfo | null;
  totalStock: number;
  shopProvince?: string | null;
}

export function ProductDetailSection({
  categoryHierarchy,
  allergenTags,
  dietTags,
  description,
  ingredients,
  nutrition,
  totalStock,
  shopProvince,
}: ProductDetailSectionProps) {
  const hasNutritionData = nutrition && (
    nutrition.calories !== null ||
    nutrition.protein !== null ||
    nutrition.carbohydrates !== null ||
    nutrition.fat !== null
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Chi tiết sản phẩm Header */}
      <div className="px-6 py-3 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Chi tiết sản phẩm</h2>
      </div>

      {/* Chi tiết sản phẩm Content */}
      <div className="p-6">
        <div className="space-y-3 text-sm">
          {/* Category */}
          {categoryHierarchy.length > 0 && (
            <div className="flex items-start">
              <span className="text-gray-500 w-24 shrink-0">Danh mục</span>
              <div className="flex items-center flex-wrap gap-1">
                {categoryHierarchy.map((cat, idx) => (
                  <span key={cat.id} className="flex items-center">
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-300 mx-1" />}
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="text-primary hover:underline"
                    >
                      {cat.name}
                    </Link>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {(allergenTags.length > 0 || dietTags.length > 0) && (
            <div className="flex items-start">
              <span className="text-gray-500 w-24 shrink-0">Phân loại</span>
              <div className="flex flex-wrap gap-2">
                {allergenTags.map((tag) => (
                  <Tooltip key={tag.id} content={tag.description} position="bottom">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full cursor-help">
                      <AlertTriangle className="w-3 h-3" />
                      {tag.name}
                    </span>
                  </Tooltip>
                ))}
                {dietTags.map((tag) => (
                  <Tooltip key={tag.id} content={tag.description} position="bottom">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full cursor-help">
                      <Leaf className="w-3 h-3" />
                      {tag.name}
                    </span>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="flex items-start">
            <span className="text-gray-500 w-24 shrink-0">Kho</span>
            <span className="text-gray-900">
              {totalStock > 0 ? 'Còn hàng' : 'Hết hàng'}
            </span>
          </div>

          {/* Location */}
          {shopProvince && (
            <div className="flex items-start">
              <span className="text-gray-500 w-24 shrink-0">Địa chỉ</span>
              <span className="text-gray-900">{shopProvince}, Việt Nam</span>
            </div>
          )}
        </div>
      </div>

      {/* Mô tả sản phẩm Header */}
      <div className="mx-6 py-3 bg-gray-100 rounded-lg px-4">
        <h3 className="font-semibold text-gray-900">Mô tả sản phẩm</h3>
      </div>

      {/* Mô tả sản phẩm Content */}
      <div className="p-6 pt-4">
        {description ? (
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {description}
          </div>
        ) : (
          <p className="text-gray-400 italic">Chưa có mô tả</p>
        )}
      </div>

      {/* Thành phần sản phẩm */}
      {ingredients && (
        <>
          <div className="mx-6 py-3 bg-gray-100 rounded-lg px-4">
            <h3 className="font-semibold text-gray-900">Thành phần sản phẩm</h3>
          </div>
          <div className="p-6 pt-4">
            <p className="text-sm text-gray-700 whitespace-pre-line">{ingredients}</p>
          </div>
        </>
      )}

      {/* Thông tin dinh dưỡng */}
      {hasNutritionData && (
        <>
          <div className="mx-6 py-3 bg-gray-100 rounded-lg px-4">
            <h3 className="font-semibold text-gray-900">
              Thông tin dinh dưỡng
              {nutrition.servingSize && nutrition.servingUnitAbbreviation && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Trên {nutrition.servingSize}{nutrition.servingUnitAbbreviation})
                </span>
              )}
            </h3>
          </div>
          <div className="p-6 pt-4">
            {/* Nutrition Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {nutrition.calories !== null && (
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-orange-600">{nutrition.calories}</div>
                  <div className="text-xs text-gray-500">Calories (kcal)</div>
                </div>
              )}
              {nutrition.protein !== null && (
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <Dumbbell className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-blue-600">{nutrition.protein}g</div>
                  <div className="text-xs text-gray-500">Protein</div>
                </div>
              )}
              {nutrition.carbohydrates !== null && (
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <Cookie className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-amber-600">{nutrition.carbohydrates}g</div>
                  <div className="text-xs text-gray-500">Carbs</div>
                </div>
              )}
              {nutrition.fat !== null && (
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="w-6 h-6 mx-auto mb-1 text-purple-500 font-bold text-sm flex items-center justify-center">
                    FAT
                  </div>
                  <div className="text-xl font-bold text-purple-600">{nutrition.fat}g</div>
                  <div className="text-xs text-gray-500">Chất béo</div>
                </div>
              )}
            </div>

            {/* Detailed Nutrition */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {nutrition.sugar !== null && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Đường</span>
                  <span className="font-medium">{nutrition.sugar}g</span>
                </div>
              )}
              {nutrition.saturatedFat !== null && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Chất béo bão hòa</span>
                  <span className="font-medium">{nutrition.saturatedFat}g</span>
                </div>
              )}
              {nutrition.fiber !== null && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Chất xơ</span>
                  <span className="font-medium">{nutrition.fiber}g</span>
                </div>
              )}
              {nutrition.sodium !== null && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Natri</span>
                  <span className="font-medium">{nutrition.sodium}mg</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
