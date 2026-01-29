'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, type AddExerciseRequest, type ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Dumbbell } from 'lucide-react';

const COMMON_EXERCISES = [
  { name: 'Chạy bộ', caloriesPerMin: 10 },
  { name: 'Đi bộ', caloriesPerMin: 5 },
  { name: 'Đạp xe', caloriesPerMin: 8 },
  { name: 'Bơi lội', caloriesPerMin: 11 },
  { name: 'Yoga', caloriesPerMin: 4 },
  { name: 'Tập gym', caloriesPerMin: 7 },
  { name: 'Nhảy dây', caloriesPerMin: 12 },
  { name: 'Aerobic', caloriesPerMin: 8 },
];

function AddExerciseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [saving, setSaving] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const selectExercise = (exercise: (typeof COMMON_EXERCISES)[0]) => {
    setExerciseName(exercise.name);
    if (durationMinutes) {
      setCaloriesBurned(
        Math.round(exercise.caloriesPerMin * parseInt(durationMinutes)).toString()
      );
    }
  };

  const handleDurationChange = (value: string) => {
    setDurationMinutes(value);
    // Auto-calculate calories if exercise is selected
    const selectedExercise = COMMON_EXERCISES.find(
      (e) => e.name === exerciseName
    );
    if (selectedExercise && value) {
      setCaloriesBurned(
        Math.round(selectedExercise.caloriesPerMin * parseInt(value)).toString()
      );
    }
  };

  const handleSubmit = async () => {
    if (!exerciseName.trim() || !durationMinutes || !caloriesBurned) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setSaving(true);
      const data: AddExerciseRequest = {
        logDate: dateParam,
        exerciseName: exerciseName.trim(),
        durationMinutes: parseInt(durationMinutes),
        caloriesBurned: parseInt(caloriesBurned),
      };
      if (notes.trim()) {
        data.notes = notes.trim();
      }

      await apiClient.addExercise(data);
      toast.success('Đã thêm hoạt động');
      router.back();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thêm hoạt động');
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Thêm hoạt động</h1>
      </div>

      <div className="space-y-6">
        {/* Date Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Ngày: {new Date(dateParam).toLocaleDateString('vi-VN')}
          </p>
        </div>

        {/* Common Exercises */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Hoạt động phổ biến</h3>
          <div className="flex flex-wrap gap-2">
            {COMMON_EXERCISES.map((exercise) => (
              <button
                key={exercise.name}
                onClick={() => selectExercise(exercise)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  exerciseName === exercise.name
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {exercise.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên hoạt động *
            </label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="VD: Chạy bộ"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="30"
                  min="1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  phút
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calo đốt cháy *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="300"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  kcal
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ghi chú thêm..."
              rows={2}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Dumbbell className="w-5 h-5" />
            {saving ? 'Đang thêm...' : 'Thêm hoạt động'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddExerciseLoading() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="animate-pulse space-y-4">
        <div className="bg-gray-200 rounded h-10 w-48"></div>
        <div className="bg-gray-200 rounded-xl h-20"></div>
        <div className="bg-gray-200 rounded-xl h-64"></div>
      </div>
    </div>
  );
}

export default function AddExercisePage() {
  return (
    <Suspense fallback={<AddExerciseLoading />}>
      <AddExerciseContent />
    </Suspense>
  );
}
