'use client';

import { type ProductNutritionResponse } from '@/lib/api';

interface NutritionInfoProps {
  nutrition: ProductNutritionResponse;
}

export function NutritionInfo({ nutrition }: NutritionInfoProps) {
  const items = [
    { label: 'Calories', value: nutrition.calories, unit: 'kcal' },
    { label: 'Protein', value: nutrition.protein, unit: 'g' },
    { label: 'Carbohydrate', value: nutrition.carbohydrates, unit: 'g' },
    { label: 'Đường', value: nutrition.sugar, unit: 'g', indent: true },
    { label: 'Chất béo', value: nutrition.fat, unit: 'g' },
    { label: 'Béo bão hòa', value: nutrition.saturatedFat, unit: 'g', indent: true },
    { label: 'Chất xơ', value: nutrition.fiber, unit: 'g' },
    { label: 'Natri', value: nutrition.sodium, unit: 'mg' },
  ];

  const servingText = nutrition.servingSize
    ? `${nutrition.servingSize}${nutrition.servingUnitAbbreviation || 'g'}`
    : null;

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold">Thông tin dinh dưỡng</h3>
        {servingText && (
          <p className="text-sm text-gray-500">
            Khẩu phần: {servingText}
          </p>
        )}
      </div>

      {/* Nutrition Items */}
      <div className="divide-y">
        {items.map(
          (item) =>
            item.value !== null && (
              <div
                key={item.label}
                className={`flex items-center justify-between px-4 py-2 text-sm ${
                  item.indent ? 'pl-8 text-gray-600' : ''
                }`}
              >
                <span>{item.label}</span>
                <span className="font-medium">
                  {item.value}
                  {item.unit}
                </span>
              </div>
            )
        )}
      </div>

      {/* Note */}
      <div className="p-3 bg-gray-50 text-xs text-gray-500">
        * Giá trị dinh dưỡng tham khảo
      </div>
    </div>
  );
}
