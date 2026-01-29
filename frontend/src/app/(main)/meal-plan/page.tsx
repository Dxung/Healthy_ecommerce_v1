'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient, type DailySummaryResponse, type MealLogResponse, type ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Dumbbell,
  Target,
  Plus,
  Settings,
  TrendingUp,
  Utensils,
  Calendar,
  BookOpen,
  X,
  Trash2,
  Info,
  Save,
  Pencil,
  Menu,
} from 'lucide-react';

const MEAL_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  breakfast: { label: 'Bữa sáng', icon: '🌅' },
  morning_snack: { label: 'Ăn nhẹ sáng', icon: '🍎' },
  lunch: { label: 'Bữa trưa', icon: '☀️' },
  afternoon_snack: { label: 'Ăn nhẹ chiều', icon: '🍪' },
  dinner: { label: 'Bữa tối', icon: '🌙' },
  evening_snack: { label: 'Ăn nhẹ tối', icon: '🥛' },
};

const WEEKDAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function formatDate(date: Date): string {
  // Use local date components to avoid timezone issues
  // toISOString() converts to UTC which can shift the date in timezones like Vietnam (UTC+7)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (formatDate(date) === formatDate(today)) return 'Hôm nay';
  if (formatDate(date) === formatDate(yesterday)) return 'Hôm qua';
  if (formatDate(date) === formatDate(tomorrow)) return 'Ngày mai';

  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
  });
}

function getWeekDays(centerDate: Date): Date[] {
  const days: Date[] = [];
  const start = new Date(centerDate);
  start.setDate(start.getDate() - 3); // 3 days before center

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

export default function MealPlanPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [summary, setSummary] = useState<DailySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<{ current: number; longest: number } | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedMealLog, setSelectedMealLog] = useState<MealLogResponse | null>(null);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState<number>(1);
  const [savingMealLog, setSavingMealLog] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Calculate week days based on today + offset
  const weekDays = useMemo(() => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);
    return getWeekDays(baseDate);
  }, [weekOffset]);

  const fetchDailySummary = async (date: Date) => {
    try {
      setLoading(true);
      const data = await apiClient.getDailySummary(formatDate(date));
      setSummary(data);
    } catch (err) {
      const error = err as ApiError;
      if (error.statusCode !== 401) {
        toast.error(error.message || 'Không thể tải dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStreak = async () => {
    try {
      const data = await apiClient.getMealPlanStreak();
      setStreak(data);
    } catch (err) {
      // Silently fail
    }
  };

  const handleDeleteMealLog = async (logId: string) => {
    try {
      setDeletingMealId(logId);
      await apiClient.deleteMealLog(logId);
      toast.success('Đã xóa thành công');
      setSelectedMealLog(null);
      setIsEditingQuantity(false);
      fetchDailySummary(selectedDate);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa');
    } finally {
      setDeletingMealId(null);
    }
  };

  const handleUpdateMealLog = async () => {
    if (!selectedMealLog) return;
    try {
      setSavingMealLog(true);
      const updated = await apiClient.updateMealLog(selectedMealLog.id, {
        quantity: editingQuantity,
      });
      setSelectedMealLog(updated);
      setIsEditingQuantity(false);
      toast.success('Đã cập nhật thành công');
      fetchDailySummary(selectedDate);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể cập nhật');
    } finally {
      setSavingMealLog(false);
    }
  };

  const handleStartEditing = () => {
    if (selectedMealLog) {
      setEditingQuantity(selectedMealLog.quantity);
      setIsEditingQuantity(true);
    }
  };

  const handleCancelEditing = () => {
    setIsEditingQuantity(false);
    if (selectedMealLog) {
      setEditingQuantity(selectedMealLog.quantity);
    }
  };

  // Calculate preview values based on new quantity
  const calculatePreviewValues = (log: MealLogResponse, newQuantity: number) => {
    const ratio = newQuantity / log.quantity;
    return {
      calories: Math.round(log.caloriesLogged * ratio),
      protein: log.proteinLogged !== null ? Number((log.proteinLogged * ratio).toFixed(1)) : null,
      carbs: log.carbsLogged !== null ? Number((log.carbsLogged * ratio).toFixed(1)) : null,
      fat: log.fatLogged !== null ? Number((log.fatLogged * ratio).toFixed(1)) : null,
      fiber: log.fiberLogged !== null ? Number((log.fiberLogged * ratio).toFixed(1)) : null,
      sugar: log.sugarLogged !== null ? Number((log.sugarLogged * ratio).toFixed(1)) : null,
      sodium: log.sodiumLogged !== null ? Number((log.sodiumLogged * ratio).toFixed(0)) : null,
    };
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch streak once when user is available
  useEffect(() => {
    if (user) {
      fetchStreak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch daily summary when date changes
  useEffect(() => {
    if (user) {
      fetchDailySummary(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedDate]);

  const goToPreviousWeek = () => {
    setWeekOffset((prev) => prev - 1);
  };

  const goToNextWeek = () => {
    setWeekOffset((prev) => prev + 1);
  };

  const goToToday = () => {
    setWeekOffset(0);
    setSelectedDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const isSelected = (date: Date) => {
    return formatDate(date) === formatDate(selectedDate);
  };

  // Navigation items for left sidebar
  const navItems = [
    { href: '/meal-plan', label: 'Nhật ký', icon: Calendar, isActive: pathname === '/meal-plan' },
    { href: '/meal-plan/presets', label: 'Thực đơn mẫu', icon: BookOpen, isActive: pathname === '/meal-plan/presets' },
  ];

  if (!user) {
    return null;
  }

  // Sidebar content - reused for both desktop and mobile
  const sidebarContent = (
    <nav className="bg-white rounded-xl shadow-sm p-3 lg:sticky lg:top-24">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
        Meal Plan
      </h2>
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <button
              onClick={() => {
                router.push(item.href);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                item.isActive
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Streak Badge in Sidebar */}
      {streak && streak.current > 0 && (
        <div className="mt-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-3 text-white">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5" />
            <div>
              <p className="font-bold text-sm">{streak.current} ngày</p>
              <p className="text-xs opacity-90">Kỷ lục: {streak.longest}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Link */}
      <button
        onClick={() => {
          router.push('/meal-plan/settings');
          setIsMobileSidebarOpen(false);
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
      >
        <Settings className="w-5 h-5 text-gray-400" />
        <span>Cài đặt</span>
      </button>
    </nav>
  );

  return (
    <div className="flex gap-6 max-w-6xl mx-auto py-4 lg:py-6 px-4">
      {/* Mobile menu toggle button */}
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="fixed bottom-4 left-4 z-30 lg:hidden bg-emerald-500 text-white p-3 rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gray-50 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <span className="font-semibold text-lg">Menu</span>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
          {sidebarContent}
        </div>
      </aside>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:block w-48 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kế hoạch dinh dưỡng</h1>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            Hôm nay
          </button>
        </div>

        {/* Week Calendar */}
        <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
          {/* Week Navigation Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <button
              onClick={goToPreviousWeek}
              className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-medium text-gray-700">
              {weekDays[0].toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={goToNextWeek}
              className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 7-Day Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {weekDays.map((day) => {
              const dayIsToday = isToday(day);
              const dayIsSelected = isSelected(day);

              return (
                <button
                  key={formatDate(day)}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center py-3 px-2 rounded-lg transition-all ${
                    dayIsSelected
                      ? 'bg-emerald-500 text-white shadow-md'
                      : dayIsToday
                      ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className={`text-xs font-medium mb-1 ${
                    dayIsSelected ? 'text-emerald-100' : 'text-gray-500'
                  }`}>
                    {WEEKDAY_NAMES[day.getDay()]}
                  </span>
                  <span className={`text-lg font-semibold ${
                    dayIsSelected ? 'text-white' : dayIsToday ? 'text-emerald-700' : ''
                  }`}>
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Date Display */}
          <div className="px-4 py-2 border-t bg-gray-50 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{formatDisplayDate(selectedDate)}</span>
              {' - '}
              {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 rounded-xl h-48"></div>
          <div className="bg-gray-200 rounded-xl h-32"></div>
          <div className="bg-gray-200 rounded-xl h-64"></div>
        </div>
      ) : summary ? (
        <div className="space-y-4">
          {/* Calories Summary Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Tổng quan</h2>
              {summary.calorieTarget && (
                <span className="text-sm text-gray-500">
                  Mục tiêu: {summary.calorieTarget.toLocaleString()} kcal
                </span>
              )}
            </div>

            {/* Progress Bar */}
            {summary.calorieTarget && (
              <div className="mb-4">
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      (summary.progressPercentage ?? 0) > 100
                        ? 'bg-red-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(summary.progressPercentage ?? 0, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-sm text-gray-600">
                  <span>{summary.totalCaloriesConsumed.toLocaleString()} kcal</span>
                  <span>
                    {summary.remainingCalories !== null && summary.remainingCalories > 0
                      ? `Còn lại: ${summary.remainingCalories.toLocaleString()} kcal`
                      : summary.remainingCalories !== null && summary.remainingCalories < 0
                      ? `Vượt: ${Math.abs(summary.remainingCalories).toLocaleString()} kcal`
                      : 'Đạt mục tiêu'}
                  </span>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Utensils className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-700">
                  {summary.totalCaloriesConsumed.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">Nạp vào</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Dumbbell className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-orange-700">
                  {summary.totalCaloriesBurned.toLocaleString()}
                </p>
                <p className="text-xs text-orange-600">Đốt cháy</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-700">
                  {summary.netCalories.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">Ròng</p>
              </div>
            </div>
          </div>

          {/* Macros Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Dinh dưỡng đa lượng</h3>
            <div className="flex gap-4">
              <div className="flex-1 text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-red-600">
                    {Math.round(summary.macrosDistribution.protein)}%
                  </span>
                </div>
                <p className="font-medium text-gray-700">
                  {summary.totalProtein.toFixed(1)}g
                </p>
                <p className="text-xs text-red-500">
                  {Math.round(summary.totalProtein * 4)} kcal
                </p>
                <p className="text-xs text-gray-500">Protein</p>
              </div>
              <div className="flex-1 text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-yellow-600">
                    {Math.round(summary.macrosDistribution.carbs)}%
                  </span>
                </div>
                <p className="font-medium text-gray-700">
                  {summary.totalCarbs.toFixed(1)}g
                </p>
                <p className="text-xs text-yellow-600">
                  {Math.round(summary.totalCarbs * 4)} kcal
                </p>
                <p className="text-xs text-gray-500">Carbs</p>
              </div>
              <div className="flex-1 text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-600">
                    {Math.round(summary.macrosDistribution.fat)}%
                  </span>
                </div>
                <p className="font-medium text-gray-700">
                  {summary.totalFat.toFixed(1)}g
                </p>
                <p className="text-xs text-purple-500">
                  {Math.round(summary.totalFat * 9)} kcal
                </p>
                <p className="text-xs text-gray-500">Chất béo</p>
              </div>
            </div>
            {/* Conversion reference */}
            <p className="text-xs text-gray-400 mt-3 text-center">
              1g protein = 4 kcal | 1g carbs = 4 kcal | 1g fat = 9 kcal
            </p>
          </div>

          {/* Meal Diary */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Nhật ký bữa ăn</h3>
            </div>
            <div className="divide-y">
              {Object.entries(MEAL_TYPE_LABELS).map(([mealType, { label, icon }]) => {
                const mealSummary = summary.mealsByType.find(
                  (m) => m.mealType === mealType
                );
                return (
                  <div key={mealType} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{icon}</span>
                        <span className="font-medium text-gray-900">{label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {mealSummary && mealSummary.totalCalories > 0 && (
                          <span className="text-sm text-gray-600">
                            {mealSummary.totalCalories.toLocaleString()} kcal
                          </span>
                        )}
                        <button
                          onClick={() =>
                            router.push(
                              `/meal-plan/add-meal?date=${formatDate(selectedDate)}&mealType=${mealType}`
                            )
                          }
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>
                    </div>
                    {mealSummary && mealSummary.logs.length > 0 && (
                      <div className="ml-8 space-y-1">
                        {mealSummary.logs.map((log) => (
                          <button
                            key={log.id}
                            onClick={() => setSelectedMealLog(log)}
                            className="w-full flex items-center justify-between text-sm py-2 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700">{log.foodName}</span>
                              {log.quantity > 1 && (
                                <span className="text-xs text-gray-400">x{log.quantity}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">
                                {log.caloriesLogged.toLocaleString()} kcal
                              </span>
                              <Info className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exercise Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Hoạt động thể chất</h3>
              <button
                onClick={() =>
                  router.push(`/meal-plan/add-exercise?date=${formatDate(selectedDate)}`)
                }
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
            <div className="p-4">
              {summary.exerciseLogs.length > 0 ? (
                <div className="space-y-2">
                  {summary.exerciseLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {log.exerciseName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {log.durationMinutes} phút
                        </p>
                      </div>
                      <span className="text-orange-600 font-medium">
                        -{log.caloriesBurned.toLocaleString()} kcal
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Chưa có hoạt động nào
                </p>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-500">Không có dữ liệu</p>
        </div>
      )}
      </main>

      {/* Meal Detail Modal */}
      {selectedMealLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-xl">
              <h3 className="font-semibold text-gray-900">Chi tiết món ăn</h3>
              <button
                onClick={() => setSelectedMealLog(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Food Name */}
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {selectedMealLog.foodName}
                </h4>
                <p className="text-sm text-gray-500">
                  {MEAL_TYPE_LABELS[selectedMealLog.mealType]?.label || selectedMealLog.mealType}
                </p>
              </div>

              {/* Quantity and Serving - Editable */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Khẩu phần:</span>
                  {isEditingQuantity ? (
                    <div className="flex items-center gap-2">
                      {selectedMealLog.servingSizeSnapshot && selectedMealLog.servingUnitSnapshot ? (
                        <>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={Math.round(editingQuantity * selectedMealLog.servingSizeSnapshot)}
                            onChange={(e) => {
                              const grams = parseFloat(e.target.value) || 1;
                              setEditingQuantity(grams / selectedMealLog.servingSizeSnapshot!);
                            }}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                          <span className="text-sm text-gray-500">
                            / {selectedMealLog.servingSizeSnapshot}{selectedMealLog.servingUnitSnapshot}
                          </span>
                        </>
                      ) : (
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={editingQuantity}
                          onChange={(e) => setEditingQuantity(parseFloat(e.target.value) || 0.1)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      )}
                      <button
                        onClick={handleCancelEditing}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Hủy"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {selectedMealLog.servingSizeSnapshot && selectedMealLog.servingUnitSnapshot ? (
                          <>
                            {Math.round(selectedMealLog.quantity * selectedMealLog.servingSizeSnapshot)}
                            <span className="text-gray-500">
                              /{selectedMealLog.servingSizeSnapshot}{selectedMealLog.servingUnitSnapshot}
                            </span>
                          </>
                        ) : (
                          <>{selectedMealLog.quantity} phần</>
                        )}
                      </span>
                      <button
                        onClick={handleStartEditing}
                        className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                        title="Chỉnh sửa khẩu phần"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                {isEditingQuantity && editingQuantity !== selectedMealLog.quantity && (
                  <p className="text-xs text-emerald-600 mt-2">
                    Dinh dưỡng sẽ được tính lại theo số lượng mới
                  </p>
                )}
              </div>

              {/* Nutrition Info - Shows preview when editing */}
              {(() => {
                const displayValues = isEditingQuantity && editingQuantity !== selectedMealLog.quantity
                  ? calculatePreviewValues(selectedMealLog, editingQuantity)
                  : {
                      calories: selectedMealLog.caloriesLogged,
                      protein: selectedMealLog.proteinLogged,
                      carbs: selectedMealLog.carbsLogged,
                      fat: selectedMealLog.fatLogged,
                      fiber: selectedMealLog.fiberLogged,
                      sugar: selectedMealLog.sugarLogged,
                      sodium: selectedMealLog.sodiumLogged,
                    };
                const isPreview = isEditingQuantity && editingQuantity !== selectedMealLog.quantity;

                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-700">Thông tin dinh dưỡng</h5>
                      {isPreview && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                          Xem trước
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`rounded-lg p-3 text-center ${isPreview ? 'bg-emerald-100 ring-2 ring-emerald-300' : 'bg-emerald-50'}`}>
                        <p className="text-lg font-bold text-emerald-700">
                          {displayValues.calories.toLocaleString()}
                        </p>
                        <p className="text-xs text-emerald-600">Calories</p>
                      </div>
                      {displayValues.protein !== null && (
                        <div className={`rounded-lg p-3 text-center ${isPreview ? 'bg-red-100 ring-2 ring-red-300' : 'bg-red-50'}`}>
                          <p className="text-lg font-bold text-red-700">
                            {displayValues.protein.toFixed(1)}g
                          </p>
                          <p className="text-xs text-red-600">Protein</p>
                        </div>
                      )}
                      {displayValues.carbs !== null && (
                        <div className={`rounded-lg p-3 text-center ${isPreview ? 'bg-yellow-100 ring-2 ring-yellow-300' : 'bg-yellow-50'}`}>
                          <p className="text-lg font-bold text-yellow-700">
                            {displayValues.carbs.toFixed(1)}g
                          </p>
                          <p className="text-xs text-yellow-600">Carbs</p>
                        </div>
                      )}
                      {displayValues.fat !== null && (
                        <div className={`rounded-lg p-3 text-center ${isPreview ? 'bg-purple-100 ring-2 ring-purple-300' : 'bg-purple-50'}`}>
                          <p className="text-lg font-bold text-purple-700">
                            {displayValues.fat.toFixed(1)}g
                          </p>
                          <p className="text-xs text-purple-600">Chất béo</p>
                        </div>
                      )}
                    </div>

                {/* Additional nutrients */}
                    {(displayValues.fiber || displayValues.sugar || displayValues.sodium) && (
                      <div className="mt-3 pt-3 border-t space-y-1">
                        {displayValues.fiber !== null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Chất xơ:</span>
                            <span className={`font-medium ${isPreview ? 'text-emerald-600' : ''}`}>
                              {displayValues.fiber.toFixed(1)}g
                            </span>
                          </div>
                        )}
                        {displayValues.sugar !== null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Đường:</span>
                            <span className={`font-medium ${isPreview ? 'text-emerald-600' : ''}`}>
                              {displayValues.sugar.toFixed(1)}g
                            </span>
                          </div>
                        )}
                        {displayValues.sodium !== null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Natri:</span>
                            <span className={`font-medium ${isPreview ? 'text-emerald-600' : ''}`}>
                              {displayValues.sodium.toFixed(0)}mg
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Notes */}
              {selectedMealLog.notes && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-1">Ghi chú</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    {selectedMealLog.notes}
                  </p>
                </div>
              )}

              {/* Source info */}
              <div className="text-xs text-gray-400">
                Nguồn: {selectedMealLog.sourceType === 'product' ? 'Sản phẩm' :
                        selectedMealLog.sourceType === 'preset' ? 'Thực đơn mẫu' :
                        selectedMealLog.sourceType === 'quick' ? 'Thêm nhanh' : 'Tự nhập'}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl space-y-2">
              {/* Save button - shown when editing */}
              {isEditingQuantity && editingQuantity !== selectedMealLog.quantity && (
                <button
                  onClick={handleUpdateMealLog}
                  disabled={savingMealLog}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingMealLog ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Lưu thay đổi</span>
                </button>
              )}

              {/* Delete button */}
              <button
                onClick={() => handleDeleteMealLog(selectedMealLog.id)}
                disabled={deletingMealId === selectedMealLog.id || savingMealLog}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingMealId === selectedMealLog.id ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Xóa món ăn này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MealPlanPageLoading() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kế hoạch dinh dưỡng</h1>
      <div className="animate-pulse space-y-4">
        <div className="bg-gray-200 rounded-xl h-20"></div>
        <div className="bg-gray-200 rounded-xl h-48"></div>
        <div className="bg-gray-200 rounded-xl h-32"></div>
        <div className="bg-gray-200 rounded-xl h-64"></div>
      </div>
    </div>
  );
}
