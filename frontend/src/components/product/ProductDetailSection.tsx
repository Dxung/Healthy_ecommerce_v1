'use client';

import Link from 'next/link';
import { ChevronRight, AlertTriangle, Leaf, Check, X, Flame, Dumbbell, Cookie } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Product Details Section */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Chi tiet san pham</h2>

        <div className="space-y-3 text-sm">
          {/* Category */}
          {categoryHierarchy.length > 0 && (
            <div className="flex items-start">
              <span className="text-gray-500 w-24 shrink-0">Danh muc</span>
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
              <span className="text-gray-500 w-24 shrink-0">Phan loai</span>
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
            <span className={totalStock > 0 ? 'text-green-600' : 'text-red-500'}>
              {totalStock > 0 ? (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Con hang ({totalStock} san pham)
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <X className="w-4 h-4" />
                  Het hang
                </span>
              )}
            </span>
          </div>

          {/* Location */}
          {shopProvince && (
            <div className="flex items-start">
              <span className="text-gray-500 w-24 shrink-0">Dia chi</span>
              <span className="text-gray-900">{shopProvince}, Viet Nam</span>
            </div>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Mo ta san pham</h2>

        {description ? (
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {description}
          </div>
        ) : (
          <p className="text-gray-400 italic">Chua co mo ta</p>
        )}

        {/* Ingredients */}
        {ingredients && (
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-semibold text-gray-900 mb-2">Thanh phan</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{ingredients}</p>
          </div>
        )}
      </div>

      {/* Nutrition Section */}
      {hasNutritionData && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Thong tin dinh duong
            {nutrition.servingSize && nutrition.servingUnitAbbreviation && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Tren {nutrition.servingSize}{nutrition.servingUnitAbbreviation})
              </span>
            )}
          </h2>

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
                <div className="text-xs text-gray-500">Fat</div>
              </div>
            )}
          </div>

          {/* Detailed Nutrition */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {nutrition.sugar !== null && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Duong</span>
                <span className="font-medium">{nutrition.sugar}g</span>
              </div>
            )}
            {nutrition.saturatedFat !== null && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Chat beo bao hoa</span>
                <span className="font-medium">{nutrition.saturatedFat}g</span>
              </div>
            )}
            {nutrition.fiber !== null && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Chat xo</span>
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
      )}
    </div>
  );
}
