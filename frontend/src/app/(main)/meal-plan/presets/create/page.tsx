'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, type CreatePresetRequest, type ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Globe, Lock, AlertTriangle } from 'lucide-react';

const SERVING_UNITS = ['g', 'ml', 'phần', 'bát', 'đĩa', 'cái', 'miếng', 'lát', 'muỗng'];

export default function CreatePresetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showPublicConfirm, setShowPublicConfirm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbohydrates, setCarbohydrates] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Validation
  const isFormValid = name.trim() && servingSize && calories;

  const handlePublicToggle = (checked: boolean) => {
    if (checked) {
      setShowPublicConfirm(true);
    } else {
      setIsPublic(false);
    }
  };

  const confirmPublic = () => {
    setIsPublic(true);
    setShowPublicConfirm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setSaving(true);

      const data: CreatePresetRequest = {
        name: name.trim(),
        servingSize: parseFloat(servingSize),
        servingUnit,
        calories: parseFloat(calories),
        isPublic,
      };

      if (description.trim()) data.description = description.trim();
      if (protein) data.protein = parseFloat(protein);
      if (carbohydrates) data.carbohydrates = parseFloat(carbohydrates);
      if (fat) data.fat = parseFloat(fat);
      if (fiber) data.fiber = parseFloat(fiber);
      if (sugar) data.sugar = parseFloat(sugar);
      if (sodium) data.sodium = parseFloat(sodium);

      await apiClient.createPreset(data);
      toast.success('Đã tạo thực đơn mẫu thành công!');
      router.push('/meal-plan/presets');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tạo thực đơn mẫu');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Tạo thực đơn mẫu</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên thực đơn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="VD: Cơm gà xào rau"
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Mô tả ngắn về thực đơn..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Serving Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Khẩu phần</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kích thước <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="100"
                min="0.1"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị <span className="text-red-500">*</span>
              </label>
              <select
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SERVING_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Nutrition Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Thông tin dinh dưỡng (mỗi khẩu phần)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calo (kcal) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                value={carbohydrates}
                onChange={(e) => setCarbohydrates(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chất béo (g)
              </label>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chất xơ (g)
              </label>
              <input
                type="number"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đường (g)
              </label>
              <input
                type="number"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Natri (mg)
              </label>
              <input
                type="number"
                value={sodium}
                onChange={(e) => setSodium(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Chế độ hiển thị</h2>
          <div className="space-y-3">
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                !isPublic
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="mt-1 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Riêng tư</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Chỉ bạn có thể xem và sử dụng thực đơn này
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                isPublic
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                checked={isPublic}
                onChange={() => handlePublicToggle(true)}
                className="mt-1 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-gray-900">Công khai</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Chia sẻ với cộng đồng, mọi người có thể tìm và sử dụng thực đơn này
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving || !isFormValid}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Đang tạo...' : 'Tạo thực đơn mẫu'}
        </button>
      </form>

      {/* Public Confirmation Dialog */}
      {showPublicConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Công khai thực đơn?</h3>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Khi bạn công khai thực đơn này:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Mọi người có thể tìm thấy và sử dụng thực đơn của bạn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Người khác có thể bình chọn (like/dislike) cho thực đơn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Bạn có thể thay đổi về riêng tư bất cứ lúc nào</span>
              </li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPublicConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmPublic}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Xác nhận công khai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
