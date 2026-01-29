'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  apiClient,
  type MealType,
  type AddQuickMealRequest,
  type AddCustomMealRequest,
  type PresetResponse,
  type ApiError,
} from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Zap, Edit3, BookOpen, Search, Star, Users, Bookmark, Check, ShoppingBag, Package, Plus, X, CheckCircle } from 'lucide-react';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Bữa sáng',
  morning_snack: 'Ăn nhẹ sáng',
  lunch: 'Bữa trưa',
  afternoon_snack: 'Ăn nhẹ chiều',
  dinner: 'Bữa tối',
  evening_snack: 'Ăn nhẹ tối',
};

// Units that can be used for proportional calorie calculation
const MEASURABLE_UNITS = ['g', 'ml', 'gram', 'grams', 'ml', 'milliliter', 'milliliters'];

interface PurchasedProduct {
  productId: string;
  productName: string;
  variantName: string;
  thumbnailUrl: string | null;
  nutrition: {
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number | null;
    carbohydrates: number | null;
    fat: number | null;
  } | null;
}

interface AddedMeal {
  id: string;
  name: string;
  calories: number;
  amount: string;
  unit: string;
}

function AddMealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Use local date to avoid timezone issues (toISOString converts to UTC)
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const dateParam = searchParams.get('date') || getLocalDateString();
  const mealTypeParam = (searchParams.get('mealType') || 'lunch') as MealType;

  const [activeTab, setActiveTab] = useState<'preset' | 'product' | 'quick' | 'custom'>('preset');
  const [saving, setSaving] = useState(false);
  const [mealType, setMealType] = useState<MealType>(mealTypeParam);

  // Track added meals (stay on page after adding)
  const [addedMeals, setAddedMeals] = useState<AddedMeal[]>([]);

  // Quick add form
  const [quickFoodName, setQuickFoodName] = useState('');
  const [quickCalories, setQuickCalories] = useState('');

  // Custom form
  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customQuantity, setCustomQuantity] = useState('1');
  const [customServingSize, setCustomServingSize] = useState('');
  const [customServingUnit, setCustomServingUnit] = useState('phần');

  // Preset tab state
  const [presetSubTab, setPresetSubTab] = useState<'my' | 'favorites' | 'search'>('my');
  const [myPresets, setMyPresets] = useState<PresetResponse[]>([]);
  const [favoritePresets, setFavoritePresets] = useState<PresetResponse[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetResponse | null>(null);
  const [presetAmount, setPresetAmount] = useState('');

  // Search state
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<PresetResponse[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());

  // Purchased products state
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PurchasedProduct | null>(null);
  const [productAmount, setProductAmount] = useState('');
  const hasFetchedProducts = useRef(false);
  const hasFetchedPresets = useRef(false);

  // Calculate calories for preset based on amount
  const calculatePresetCalories = useCallback(() => {
    if (!selectedPreset || !presetAmount) return 0;
    const amount = parseFloat(presetAmount) || 0;
    const ratio = amount / selectedPreset.servingSize;
    return Math.ceil(selectedPreset.calories * ratio);
  }, [selectedPreset, presetAmount]);

  // Calculate calories for product based on amount
  const calculateProductCalories = useCallback(() => {
    if (!selectedProduct?.nutrition || !productAmount) return 0;
    const amount = parseFloat(productAmount) || 0;
    const ratio = amount / selectedProduct.nutrition.servingSize;
    return Math.ceil(selectedProduct.nutrition.calories * ratio);
  }, [selectedProduct, productAmount]);

  // Fetch my presets and favorites
  const fetchPresets = useCallback(async () => {
    if (hasFetchedPresets.current) return;
    hasFetchedPresets.current = true;

    try {
      setLoadingPresets(true);
      const [myPresetsData, favoritesData, followingData] = await Promise.all([
        apiClient.getMyPresets(),
        apiClient.getMealPlanFavorites(),
        apiClient.getFollowing(),
      ]);
      setMyPresets(myPresetsData);
      setFavoritePresets(favoritesData);
      setFollowedUserIds(new Set(followingData.map((f) => f.userId)));
      setFavoriteIds(new Set(favoritesData.map((f) => f.id)));
    } catch (err) {
      const error = err as ApiError;
      if (error.statusCode !== 401) {
        toast.error('Không thể tải thực đơn');
      }
    } finally {
      setLoadingPresets(false);
    }
  }, []);

  // Fetch purchased products with nutrition info
  const fetchPurchasedProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);

      const ordersResult = await apiClient.getMyOrders({ limit: 50 });

      const validOrders = ordersResult.items.filter(
        (order) => order.status === 'delivered' || order.status === 'completed'
      );

      const productIds = new Set<string>();
      const productInfoMap = new Map<string, { productId: string; productName: string; variantName: string }>();

      for (const order of validOrders) {
        for (const item of order.items) {
          if (!productIds.has(item.productId)) {
            productIds.add(item.productId);
            productInfoMap.set(item.productId, {
              productId: item.productId,
              productName: item.productName,
              variantName: item.variantName,
            });
          }
        }
      }

      const productsWithNutrition: PurchasedProduct[] = [];

      for (const productId of productIds) {
        try {
          const productDetail = await apiClient.getPublicProductById(productId);
          const info = productInfoMap.get(productId)!;

          if (
            productDetail.nutrition &&
            productDetail.nutrition.calories &&
            productDetail.nutrition.servingSize &&
            productDetail.nutrition.servingUnitAbbreviation &&
            MEASURABLE_UNITS.includes(productDetail.nutrition.servingUnitAbbreviation.toLowerCase())
          ) {
            productsWithNutrition.push({
              productId: info.productId,
              productName: info.productName,
              variantName: info.variantName,
              thumbnailUrl: productDetail.thumbnailUrl,
              nutrition: {
                servingSize: productDetail.nutrition.servingSize,
                servingUnit: productDetail.nutrition.servingUnitAbbreviation,
                calories: productDetail.nutrition.calories,
                protein: productDetail.nutrition.protein,
                carbohydrates: productDetail.nutrition.carbohydrates,
                fat: productDetail.nutrition.fat,
              },
            });
          }
        } catch {
          // Skip unavailable products
        }
      }

      setPurchasedProducts(productsWithNutrition);
    } catch (err) {
      const error = err as ApiError;
      if (error.statusCode !== 401) {
        toast.error('Không thể tải sản phẩm đã mua');
      }
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Search presets
  const searchPresets = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoadingSearch(true);
      const result = await apiClient.searchCommunityPresets({ page: 1, limit: 50, search: query });

      const sorted = [...result.data].sort((a, b) => {
        const aIsFavorite = favoriteIds.has(a.id) ? 1 : 0;
        const bIsFavorite = favoriteIds.has(b.id) ? 1 : 0;
        if (aIsFavorite !== bIsFavorite) return bIsFavorite - aIsFavorite;

        const aIsFollowed = followedUserIds.has(a.creatorId) ? 1 : 0;
        const bIsFollowed = followedUserIds.has(b.creatorId) ? 1 : 0;
        if (aIsFollowed !== bIsFollowed) return bIsFollowed - aIsFollowed;

        return b.upvoteCount - a.upvoteCount;
      });

      setSearchResults(sorted);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tìm kiếm');
    } finally {
      setLoadingSearch(false);
    }
  }, [favoriteIds, followedUserIds]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchPresets();
  }, [user, router, fetchPresets]);

  useEffect(() => {
    if (activeTab === 'product' && !hasFetchedProducts.current && !loadingProducts) {
      hasFetchedProducts.current = true;
      fetchPurchasedProducts();
    }
  }, [activeTab, loadingProducts, fetchPurchasedProducts]);

  useEffect(() => {
    if (presetSubTab !== 'search') return;

    const timer = setTimeout(() => {
      searchPresets(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, presetSubTab, searchPresets]);

  useEffect(() => {
    if (selectedPreset) {
      setPresetAmount(String(selectedPreset.servingSize));
    }
  }, [selectedPreset]);

  useEffect(() => {
    if (selectedProduct?.nutrition) {
      setProductAmount(String(selectedProduct.nutrition.servingSize));
    }
  }, [selectedProduct]);

  const handleQuickAdd = async () => {
    if (!quickFoodName.trim() || !quickCalories) {
      toast.error('Vui lòng nhập tên và số calo');
      return;
    }

    try {
      setSaving(true);
      const data: AddQuickMealRequest = {
        logDate: dateParam,
        mealType,
        foodName: quickFoodName.trim(),
        calories: parseInt(quickCalories),
      };
      await apiClient.addQuickMeal(data);

      // Add to local list and reset form
      setAddedMeals(prev => [...prev, {
        id: Date.now().toString(),
        name: quickFoodName.trim(),
        calories: parseInt(quickCalories),
        amount: '1',
        unit: 'phần',
      }]);

      toast.success('Đã thêm bữa ăn');
      setQuickFoodName('');
      setQuickCalories('');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thêm bữa ăn');
    } finally {
      setSaving(false);
    }
  };

  const handleCustomAdd = async () => {
    if (!customFoodName.trim() || !customCalories) {
      toast.error('Vui lòng nhập tên và số calo');
      return;
    }

    try {
      setSaving(true);
      const data: AddCustomMealRequest = {
        logDate: dateParam,
        mealType,
        foodName: customFoodName.trim(),
        quantity: parseFloat(customQuantity) || 1,
        calories: parseInt(customCalories),
      };

      if (customProtein) data.protein = parseFloat(customProtein);
      if (customCarbs) data.carbs = parseFloat(customCarbs);
      if (customFat) data.fat = parseFloat(customFat);
      if (customServingSize) data.servingSize = parseFloat(customServingSize);
      if (customServingUnit) data.servingUnit = customServingUnit;

      await apiClient.addCustomMeal(data);

      setAddedMeals(prev => [...prev, {
        id: Date.now().toString(),
        name: customFoodName.trim(),
        calories: parseInt(customCalories),
        amount: customQuantity,
        unit: customServingUnit,
      }]);

      toast.success('Đã thêm bữa ăn');
      // Reset form
      setCustomFoodName('');
      setCustomCalories('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
      setCustomQuantity('1');
      setCustomServingSize('');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thêm bữa ăn');
    } finally {
      setSaving(false);
    }
  };

  const handlePresetAdd = async () => {
    if (!selectedPreset) {
      toast.error('Vui lòng chọn thực đơn');
      return;
    }

    if (!presetAmount || parseFloat(presetAmount) <= 0) {
      toast.error('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    try {
      setSaving(true);
      const amount = parseFloat(presetAmount);
      const calculatedCalories = calculatePresetCalories();
      const ratio = amount / selectedPreset.servingSize;

      // Use custom meal endpoint for more control over calories calculation
      const data: AddCustomMealRequest = {
        logDate: dateParam,
        mealType,
        foodName: selectedPreset.name,
        quantity: 1,
        servingSize: amount,
        servingUnit: selectedPreset.servingUnit,
        calories: calculatedCalories,
      };

      // Add nutrition if available
      if (selectedPreset.protein) data.protein = Math.ceil(selectedPreset.protein * ratio);
      if (selectedPreset.carbohydrates) data.carbs = Math.ceil(selectedPreset.carbohydrates * ratio);
      if (selectedPreset.fat) data.fat = Math.ceil(selectedPreset.fat * ratio);

      await apiClient.addCustomMeal(data);

      setAddedMeals(prev => [...prev, {
        id: Date.now().toString(),
        name: selectedPreset.name,
        calories: calculatedCalories,
        amount: presetAmount,
        unit: selectedPreset.servingUnit,
      }]);

      toast.success('Đã thêm bữa ăn');
      setSelectedPreset(null);
      setPresetAmount('');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thêm bữa ăn');
    } finally {
      setSaving(false);
    }
  };

  const handleProductAdd = async () => {
    if (!selectedProduct?.nutrition) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }

    if (!productAmount || parseFloat(productAmount) <= 0) {
      toast.error('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    try {
      setSaving(true);
      const calculatedCalories = calculateProductCalories();
      const amount = parseFloat(productAmount);
      const nutrition = selectedProduct.nutrition;
      const ratio = amount / nutrition.servingSize;

      const data: AddCustomMealRequest = {
        logDate: dateParam,
        mealType,
        foodName: `${selectedProduct.productName}${selectedProduct.variantName ? ` - ${selectedProduct.variantName}` : ''}`,
        quantity: 1,
        servingSize: amount,
        servingUnit: nutrition.servingUnit,
        calories: calculatedCalories,
      };

      if (nutrition.protein) data.protein = Math.ceil(nutrition.protein * ratio);
      if (nutrition.carbohydrates) data.carbs = Math.ceil(nutrition.carbohydrates * ratio);
      if (nutrition.fat) data.fat = Math.ceil(nutrition.fat * ratio);

      await apiClient.addCustomMeal(data);

      setAddedMeals(prev => [...prev, {
        id: Date.now().toString(),
        name: selectedProduct.productName,
        calories: calculatedCalories,
        amount: productAmount,
        unit: nutrition.servingUnit,
      }]);

      toast.success('Đã thêm bữa ăn');
      setSelectedProduct(null);
      setProductAmount('');
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thêm bữa ăn');
    } finally {
      setSaving(false);
    }
  };

  const renderPresetItem = (preset: PresetResponse, showBadges = false) => {
    const isSelected = selectedPreset?.id === preset.id;
    const isFavorite = favoriteIds.has(preset.id);
    const isFromFollowed = followedUserIds.has(preset.creatorId);

    return (
      <button
        key={preset.id}
        onClick={() => {
          setSelectedPreset(preset);
          setPresetAmount(String(preset.servingSize));
        }}
        className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
          isSelected
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{preset.name}</h3>
              {showBadges && (
                <div className="flex items-center gap-1">
                  {isFavorite && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      <Bookmark className="w-3 h-3" />
                    </span>
                  )}
                  {isFromFollowed && (
                    <span className="flex items-center gap-0.5 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      <Users className="w-3 h-3" />
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {preset.calories} kcal / {preset.servingSize} {preset.servingUnit}
            </p>
          </div>
          {isSelected && (
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </button>
    );
  };

  const renderProductItem = (product: PurchasedProduct) => {
    const isSelected = selectedProduct?.productId === product.productId;

    return (
      <button
        key={product.productId}
        onClick={() => {
          setSelectedProduct(product);
          setProductAmount(String(product.nutrition?.servingSize || 100));
        }}
        className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
          isSelected
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start gap-3">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt=""
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{product.productName}</h3>
            {product.variantName && (
              <p className="text-xs text-gray-400">{product.variantName}</p>
            )}
            {product.nutrition && (
              <p className="text-sm text-gray-500">
                {product.nutrition.calories} kcal / {product.nutrition.servingSize} {product.nutrition.servingUnit}
              </p>
            )}
          </div>
          {isSelected && (
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </button>
    );
  };

  if (!user) {
    return null;
  }

  const totalAddedCalories = addedMeals.reduce((sum, meal) => sum + meal.calories, 0);

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
        <h1 className="text-2xl font-bold text-gray-900">Thêm bữa ăn</h1>
      </div>

      {/* Added Meals Summary */}
      {addedMeals.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-emerald-900">Đã thêm {addedMeals.length} món</span>
            </div>
            <span className="text-emerald-700 font-semibold">{totalAddedCalories} kcal</span>
          </div>
          <div className="space-y-2">
            {addedMeals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2">
                <span className="text-gray-700">{meal.name}</span>
                <span className="text-gray-500">{meal.amount} {meal.unit} · {meal.calories} kcal</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.back()}
            className="w-full mt-3 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Xong
          </button>
        </div>
      )}

      {/* Meal Type Selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại bữa ăn
        </label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-2">
          Ngày: {new Date(dateParam).toLocaleDateString('vi-VN')}
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab('preset')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md font-medium transition-colors text-sm ${
            activeTab === 'preset'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Thực đơn
        </button>
        <button
          onClick={() => setActiveTab('product')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md font-medium transition-colors text-sm ${
            activeTab === 'product'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Đã mua
        </button>
        <button
          onClick={() => setActiveTab('quick')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md font-medium transition-colors text-sm ${
            activeTab === 'quick'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          Nhanh
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md font-medium transition-colors text-sm ${
            activeTab === 'custom'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Tùy chỉnh
        </button>
      </div>

      {/* Preset Tab */}
      {activeTab === 'preset' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Sub-tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setPresetSubTab('my')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                presetSubTab === 'my'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star className="w-4 h-4 inline mr-1.5" />
              Của tôi
            </button>
            <button
              onClick={() => setPresetSubTab('favorites')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                presetSubTab === 'favorites'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bookmark className="w-4 h-4 inline mr-1.5" />
              Đã lưu
            </button>
            <button
              onClick={() => setPresetSubTab('search')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                presetSubTab === 'search'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="w-4 h-4 inline mr-1.5" />
              Tìm kiếm
            </button>
          </div>

          <div className="p-4">
            {presetSubTab === 'my' && (
              <div className="space-y-2">
                {loadingPresets ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : myPresets.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Bạn chưa tạo thực đơn nào</p>
                  </div>
                ) : (
                  myPresets.map((preset) => renderPresetItem(preset))
                )}
              </div>
            )}

            {presetSubTab === 'favorites' && (
              <div className="space-y-2">
                {loadingPresets ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : favoritePresets.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Bạn chưa lưu thực đơn nào</p>
                  </div>
                ) : (
                  favoritePresets.map((preset) => renderPresetItem(preset))
                )}
              </div>
            )}

            {presetSubTab === 'search' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Tìm kiếm thực đơn..."
                  />
                </div>

                {loadingSearch ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-2">
                      <Bookmark className="w-3 h-3 inline text-amber-500" /> = Đã lưu ·
                      <Users className="w-3 h-3 inline text-blue-500 ml-1" /> = Đang theo dõi
                    </p>
                    {searchResults.map((preset) => renderPresetItem(preset, true))}
                  </div>
                ) : searchText ? (
                  <div className="py-8 text-center text-gray-500">
                    <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Không tìm thấy kết quả</p>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Nhập từ khóa để tìm kiếm</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedPreset && (
            <div className="border-t p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">Đã chọn:</p>
                  <p className="font-medium text-gray-900">{selectedPreset.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Chuẩn: {selectedPreset.servingSize} {selectedPreset.servingUnit}</p>
                  <p className="text-sm text-gray-600">{selectedPreset.calories} kcal</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">
                    Bạn ăn bao nhiêu ({selectedPreset.servingUnit})?
                  </label>
                  <input
                    type="number"
                    value={presetAmount}
                    onChange={(e) => setPresetAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="1"
                    step="1"
                    placeholder={String(selectedPreset.servingSize)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Tổng calo</label>
                  <p className="px-3 py-2 bg-orange-50 text-orange-700 font-semibold rounded-lg">
                    {calculatePresetCalories()} kcal
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Tính theo tỉ lệ: {presetAmount || 0} / {selectedPreset.servingSize} {selectedPreset.servingUnit} = {((parseFloat(presetAmount) || 0) / selectedPreset.servingSize * 100).toFixed(0)}%
              </p>
              <button
                onClick={handlePresetAdd}
                disabled={saving}
                className="w-full mt-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {saving ? 'Đang thêm...' : 'Thêm món này'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Purchased Products Tab */}
      {activeTab === 'product' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Sản phẩm đã mua</h2>
            <p className="text-xs text-gray-500 mt-1">
              Chỉ hiển thị sản phẩm có thông tin dinh dưỡng (kcal) và đơn vị đo được (g, ml)
            </p>
          </div>

          <div className="p-4">
            {loadingProducts ? (
              <div className="py-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Đang tải sản phẩm...</p>
              </div>
            ) : purchasedProducts.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Không có sản phẩm nào có thông tin dinh dưỡng</p>
                <p className="text-xs text-gray-400 mt-1">
                  Mua sản phẩm có thông tin calo và đơn vị (g, ml) để hiển thị ở đây
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {purchasedProducts.map((product) => renderProductItem(product))}
              </div>
            )}
          </div>

          {selectedProduct?.nutrition && (
            <div className="border-t p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">Đã chọn:</p>
                  <p className="font-medium text-gray-900">{selectedProduct.productName}</p>
                  {selectedProduct.variantName && (
                    <p className="text-xs text-gray-400">{selectedProduct.variantName}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Chuẩn: {selectedProduct.nutrition.servingSize} {selectedProduct.nutrition.servingUnit}
                  </p>
                  <p className="text-sm text-gray-600">{selectedProduct.nutrition.calories} kcal</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">
                    Bạn ăn bao nhiêu ({selectedProduct.nutrition.servingUnit})?
                  </label>
                  <input
                    type="number"
                    value={productAmount}
                    onChange={(e) => setProductAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="1"
                    step="1"
                    placeholder={String(selectedProduct.nutrition.servingSize)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Tổng calo</label>
                  <p className="px-3 py-2 bg-orange-50 text-orange-700 font-semibold rounded-lg">
                    {calculateProductCalories()} kcal
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Tính theo tỉ lệ: {productAmount || 0} / {selectedProduct.nutrition.servingSize} {selectedProduct.nutrition.servingUnit} = {((parseFloat(productAmount) || 0) / selectedProduct.nutrition.servingSize * 100).toFixed(0)}%
              </p>
              <button
                onClick={handleProductAdd}
                disabled={saving}
                className="w-full mt-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {saving ? 'Đang thêm...' : 'Thêm món này'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Form */}
      {activeTab === 'quick' && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <p className="text-sm text-gray-500">
            Thêm nhanh với tên và số calo
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên món ăn *
            </label>
            <input
              type="text"
              value={quickFoodName}
              onChange={(e) => setQuickFoodName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: Cơm gà"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calo *
            </label>
            <div className="relative">
              <input
                type="number"
                value={quickCalories}
                onChange={(e) => setQuickCalories(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="500"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                kcal
              </span>
            </div>
          </div>
          <button
            onClick={handleQuickAdd}
            disabled={saving}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {saving ? 'Đang thêm...' : 'Thêm món này'}
          </button>
        </div>
      )}

      {/* Custom Form */}
      {activeTab === 'custom' && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <p className="text-sm text-gray-500">
            Nhập đầy đủ thông tin dinh dưỡng
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên món ăn *
            </label>
            <input
              type="text"
              value={customFoodName}
              onChange={(e) => setCustomFoodName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: Cơm gà xối mỡ"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng
              </label>
              <input
                type="number"
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="1"
                min="0.1"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khẩu phần
              </label>
              <input
                type="number"
                value={customServingSize}
                onChange={(e) => setCustomServingSize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị
              </label>
              <input
                type="text"
                value={customServingUnit}
                onChange={(e) => setCustomServingUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="g"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calo *
            </label>
            <div className="relative">
              <input
                type="number"
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="500"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                kcal
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Protein
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  g
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carbs
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  g
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chất béo
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  g
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCustomAdd}
            disabled={saving}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {saving ? 'Đang thêm...' : 'Thêm món này'}
          </button>
        </div>
      )}
    </div>
  );
}

function AddMealLoading() {
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

export default function AddMealPage() {
  return (
    <Suspense fallback={<AddMealLoading />}>
      <AddMealContent />
    </Suspense>
  );
}
