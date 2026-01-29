'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  apiClient,
  type MealPlanSettingsResponse,
  type UpdateHealthProfileRequest,
  type ApiError,
  type ActivityLevel,
  type GoalType,
  type Gender,
} from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Calculator } from 'lucide-react';

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Ít vận động', description: 'Công việc văn phòng, ít đi lại' },
  { value: 'lightly_active', label: 'Nhẹ nhàng', description: 'Tập thể dục nhẹ 1-3 ngày/tuần' },
  { value: 'moderately_active', label: 'Trung bình', description: 'Tập thể dục 3-5 ngày/tuần' },
  { value: 'very_active', label: 'Năng động', description: 'Tập thể dục nặng 6-7 ngày/tuần' },
];

const GOAL_TYPES: { value: GoalType; label: string; description: string }[] = [
  { value: 'lose', label: 'Giảm cân', description: 'Thâm hụt khoảng 500 kcal/ngày' },
  { value: 'maintain', label: 'Duy trì', description: 'Giữ nguyên cân nặng hiện tại' },
  { value: 'gain', label: 'Tăng cân', description: 'Thặng dư khoảng 300 kcal/ngày' },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
];

export default function MealPlanSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [settings, setSettings] = useState<MealPlanSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [weightKg, setWeightKg] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('sedentary');
  const [goalType, setGoalType] = useState<GoalType>('maintain');
  const [calorieTarget, setCalorieTarget] = useState<string>('');
  const [isCalorieTargetManual, setIsCalorieTargetManual] = useState(false);

  // Helper to calculate age from birth date
  const calculateAgeFromBirthDate = (birthDateStr: string | null | undefined): number | null => {
    if (!birthDateStr) return null;
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge > 0 ? calculatedAge : null;
  };

  // Helper to convert age to birth date string (approximate - Jan 1st of birth year)
  const ageToBirthDate = (ageValue: number): string => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - ageValue;
    return `${birthYear}-01-01`;
  };

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMealPlanSettings();
      setSettings(data);

      // Populate form
      const hp = data.healthProfile;
      setWeightKg(hp.weightKg?.toString() || '');
      setHeightCm(hp.heightCm?.toString() || '');
      // Calculate age from birth date
      const calculatedAge = calculateAgeFromBirthDate(hp.birthDate);
      setAge(calculatedAge?.toString() || '');
      setGender(hp.gender || '');
      setActivityLevel(hp.activityLevel);
      setGoalType(hp.goalType);
      setCalorieTarget(hp.calorieTarget?.toString() || '');
      setIsCalorieTargetManual(hp.isCalorieTargetManual);
    } catch (err) {
      const error = err as ApiError;
      if (error.statusCode !== 401) {
        toast.error(error.message || 'Không thể tải cài đặt');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchSettings();
  }, [user, fetchSettings, router]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const data: UpdateHealthProfileRequest = {
        activityLevel,
        goalType,
        isCalorieTargetManual,
      };

      if (weightKg) data.weightKg = parseFloat(weightKg);
      if (heightCm) data.heightCm = parseFloat(heightCm);
      // Convert age to birth date
      if (age) {
        const ageNum = parseInt(age);
        if (ageNum > 0 && ageNum < 150) {
          data.birthDate = ageToBirthDate(ageNum);
        }
      }
      if (gender) data.gender = gender as Gender;
      if (isCalorieTargetManual && calorieTarget) {
        data.calorieTarget = parseInt(calorieTarget);
      }

      await apiClient.updateMealPlanHealthProfile(data);
      toast.success('Đã lưu cài đặt');
      fetchSettings(); // Refresh to get updated TDEE
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleCalculateTdee = async () => {
    // Check required fields before making API call
    const missingFields: string[] = [];
    if (!weightKg) missingFields.push('cân nặng');
    if (!heightCm) missingFields.push('chiều cao');
    if (!age) missingFields.push('tuổi');
    if (!gender) missingFields.push('giới tính');

    if (missingFields.length > 0) {
      toast.error(`Vui lòng nhập: ${missingFields.join(', ')}`);
      return;
    }

    // Save current data first to ensure backend has latest values
    try {
      setSaving(true);
      const saveData: UpdateHealthProfileRequest = {
        activityLevel,
        goalType,
        isCalorieTargetManual: false,
      };

      if (weightKg) saveData.weightKg = parseFloat(weightKg);
      if (heightCm) saveData.heightCm = parseFloat(heightCm);
      if (age) {
        const ageNum = parseInt(age);
        if (ageNum > 0 && ageNum < 150) {
          saveData.birthDate = ageToBirthDate(ageNum);
        }
      }
      if (gender) saveData.gender = gender as Gender;

      await apiClient.updateMealPlanHealthProfile(saveData);

      // Now calculate TDEE
      const result = await apiClient.calculateTdee();
      if (result.tdee !== null) {
        setCalorieTarget(result.tdee.toString());
        setIsCalorieTargetManual(false);
        toast.success(`TDEE tính được: ${result.tdee.toLocaleString()} kcal`);
        fetchSettings(); // Refresh to get updated values
      } else {
        toast.error('Không thể tính TDEE. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tính TDEE');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 rounded h-10 w-48"></div>
          <div className="bg-gray-200 rounded-xl h-64"></div>
          <div className="bg-gray-200 rounded-xl h-48"></div>
        </div>
      </div>
    );
  }

  if (!user) {
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
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt dinh dưỡng</h1>
      </div>

      <div className="space-y-6">
        {/* Physical Attributes */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Thông tin cơ thể</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cân nặng (kg)
              </label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="60"
                min="20"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chiều cao (cm)
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="170"
                min="50"
                max="300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tuổi
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="25"
                min="1"
                max="150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Chọn giới tính</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Activity Level */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Mức độ hoạt động</h2>
          <div className="space-y-3">
            {ACTIVITY_LEVELS.map((level) => (
              <label
                key={level.value}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  activityLevel === level.value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="activityLevel"
                  value={level.value}
                  checked={activityLevel === level.value}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="mt-1 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-medium text-gray-900">{level.label}</p>
                  <p className="text-sm text-gray-500">{level.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Mục tiêu</h2>
          <div className="space-y-3">
            {GOAL_TYPES.map((goal) => (
              <label
                key={goal.value}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  goalType === goal.value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="goalType"
                  value={goal.value}
                  checked={goalType === goal.value}
                  onChange={(e) => setGoalType(e.target.value as GoalType)}
                  className="mt-1 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-medium text-gray-900">{goal.label}</p>
                  <p className="text-sm text-gray-500">{goal.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Calorie Target */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Mục tiêu calo hàng ngày</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="manualTarget"
                checked={isCalorieTargetManual}
                onChange={(e) => setIsCalorieTargetManual(e.target.checked)}
                className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 rounded"
              />
              <label htmlFor="manualTarget" className="text-sm text-gray-700">
                Tự nhập mục tiêu calo
              </label>
            </div>

            {isCalorieTargetManual ? (
              <div>
                <input
                  type="number"
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="2000"
                  min="500"
                  max="10000"
                />
                <p className="text-sm text-gray-500 mt-1">kcal/ngày</p>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleCalculateTdee}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  Tính TDEE tự động
                </button>
                {settings?.healthProfile.effectiveCalorieTarget && (
                  <p className="text-sm text-gray-600 mt-2">
                    Mục tiêu hiện tại:{' '}
                    <span className="font-semibold">
                      {settings.healthProfile.effectiveCalorieTarget.toLocaleString()} kcal/ngày
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </div>
  );
}
