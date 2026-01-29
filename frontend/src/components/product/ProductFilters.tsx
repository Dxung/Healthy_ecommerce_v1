'use client';

import { type CategoryHierarchyResponse, type DietTagResponse, type AllergenTagResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip } from '@/components/ui/tooltip';
import { Search, Loader2, FolderTree, Leaf, AlertTriangle } from 'lucide-react';

interface ProductFiltersProps {
  categories: CategoryHierarchyResponse[];
  dietTags: DietTagResponse[];
  allergenTags: AllergenTagResponse[];
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  selectedDietTags: string[];
  onDietTagsChange: (value: string[]) => void;
  allergenFreeIds: string[];
  onAllergenFreeChange: (value: string[]) => void;
  minPrice: string;
  onMinPriceChange: (value: string) => void;
  maxPrice: string;
  onMaxPriceChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  loading: boolean;
}

function flattenCategories(
  categories: CategoryHierarchyResponse[],
  level = 0
): { id: string; name: string; level: number }[] {
  const result: { id: string; name: string; level: number }[] = [];
  for (const cat of categories) {
    result.push({ id: cat.id, name: cat.name, level });
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategories(cat.children, level + 1));
    }
  }
  return result;
}

export function ProductFilters({
  categories,
  dietTags,
  allergenTags,
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  selectedDietTags,
  onDietTagsChange,
  allergenFreeIds,
  onAllergenFreeChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  onApply,
  onClear,
  loading,
}: ProductFiltersProps) {
  const flatCategories = flattenCategories(categories);

  const toggleDietTag = (id: string) => {
    onDietTagsChange(
      selectedDietTags.includes(id)
        ? selectedDietTags.filter((t) => t !== id)
        : [...selectedDietTags, id]
    );
  };

  const toggleAllergenFree = (id: string) => {
    onAllergenFreeChange(
      allergenFreeIds.includes(id)
        ? allergenFreeIds.filter((t) => t !== id)
        : [...allergenFreeIds, id]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>Tìm kiếm</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tên sản phẩm..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FolderTree className="w-4 h-4" />
          Danh mục
        </Label>
        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
        >
          <option value="">Tất cả danh mục</option>
          {flatCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {'　'.repeat(cat.level)}
              {cat.level > 0 ? '└ ' : ''}
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Diet Tags */}
      {dietTags.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-500" />
            Chế độ ăn
          </Label>
          <div className="flex flex-wrap gap-2">
            {dietTags.map((tag) => (
              <Tooltip key={tag.id} content={tag.description} position="bottom">
                <button
                  type="button"
                  onClick={() => toggleDietTag(tag.id)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    selectedDietTags.includes(tag.id)
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tag.name}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      {/* Allergen Free */}
      {allergenTags.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Không chứa
          </Label>
          <p className="text-xs text-gray-500">Loại bỏ sản phẩm chứa:</p>
          <div className="flex flex-wrap gap-2">
            {allergenTags.map((tag) => (
              <Tooltip key={tag.id} content={tag.description} position="bottom">
                <button
                  type="button"
                  onClick={() => toggleAllergenFree(tag.id)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    allergenFreeIds.includes(tag.id)
                      ? 'bg-orange-100 border-orange-300 text-orange-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tag.name}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Khoảng giá (VND)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Từ"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="flex-1"
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            placeholder="Đến"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onApply} className="flex-1">
          Áp dụng
        </Button>
        <Button variant="outline" onClick={onClear}>
          Xóa
        </Button>
      </div>
    </div>
  );
}
