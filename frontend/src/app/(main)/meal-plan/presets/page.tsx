'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient, type PresetResponse, type UserFollowResponse, type ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calendar,
  BookOpen,
  Settings,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Trash2,
  Search,
  X,
  Plus,
  User,
  Users,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  UserPlus,
  UserCheck,
  Star,
} from 'lucide-react';

// Sidebar navigation items
const navItems = [
  { href: '/meal-plan', label: 'Nhật ký', icon: Calendar },
  { href: '/meal-plan/presets', label: 'Thực đơn mẫu', icon: BookOpen },
];

// Normalize search text: remove spaces and special characters
function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export default function PresetsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // My presets state
  const [myPresets, setMyPresets] = useState<PresetResponse[]>([]);
  const [loadingMyPresets, setLoadingMyPresets] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<PresetResponse | null>(null);

  // Search state
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<PresetResponse[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);

  // Edit/Delete dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presetToEdit, setPresetToEdit] = useState<PresetResponse | null>(null);
  const [presetToDelete, setPresetToDelete] = useState<PresetResponse | null>(null);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);

  // User profile dialog
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<{
    presetCount: number;
    totalLikes: number;
    totalDislikes: number;
    displayName: string;
  } | null>(null);

  // Streak for sidebar
  const [streak, setStreak] = useState<{ current: number; longest: number } | null>(null);

  // Followed users and favorites
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
  const [favoritePresetIds, setFavoritePresetIds] = useState<Set<string>>(new Set());
  const [suggestedPresets, setSuggestedPresets] = useState<PresetResponse[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Following tab state
  const [currentView, setCurrentView] = useState<'presets' | 'following' | 'collection'>('presets');
  const [followingList, setFollowingList] = useState<UserFollowResponse[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [selectedFollowedUser, setSelectedFollowedUser] = useState<UserFollowResponse | null>(null);
  const [followedUserPresets, setFollowedUserPresets] = useState<PresetResponse[]>([]);
  const [loadingUserPresets, setLoadingUserPresets] = useState(false);

  // Collection (favorites) state
  const [favoritePresets, setFavoritePresets] = useState<PresetResponse[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Fetch my presets
  const fetchMyPresets = useCallback(async () => {
    try {
      setLoadingMyPresets(true);
      const data = await apiClient.getMyPresets();
      setMyPresets(data);
    } catch (err) {
      const error = err as ApiError;
      if (error.statusCode !== 401) {
        toast.error(error.message || 'Không thể tải thực đơn của bạn');
      }
    } finally {
      setLoadingMyPresets(false);
    }
  }, []);

  // Fetch streak
  const fetchStreak = useCallback(async () => {
    try {
      const data = await apiClient.getMealPlanStreak();
      setStreak(data);
    } catch {
      // Silently fail
    }
  }, []);

  // Fetch followed users
  const fetchFollowing = useCallback(async () => {
    try {
      const following = await apiClient.getFollowing();
      setFollowedUserIds(new Set(following.map((f) => f.userId)));
    } catch {
      // Silently fail
    }
  }, []);

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    try {
      const favorites = await apiClient.getMealPlanFavorites();
      setFavoritePresetIds(new Set(favorites.map((f) => f.id)));
    } catch {
      // Silently fail
    }
  }, []);

  // Handle save/unsave preset
  const handleToggleFavorite = async (presetId: string) => {
    const isFavorite = favoritePresetIds.has(presetId);
    setLoadingAction(`favorite-${presetId}`);
    try {
      if (isFavorite) {
        await apiClient.removeMealPlanFavorite(presetId);
        setFavoritePresetIds((prev) => {
          const next = new Set(prev);
          next.delete(presetId);
          return next;
        });
        toast.success('Đã xóa khỏi bộ sưu tập');
      } else {
        await apiClient.addMealPlanFavorite(presetId);
        setFavoritePresetIds((prev) => new Set(prev).add(presetId));
        toast.success('Đã lưu vào bộ sưu tập');
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thực hiện');
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle follow/unfollow user
  const handleToggleFollow = async (userId: string) => {
    const isFollowing = followedUserIds.has(userId);
    setLoadingAction(`follow-${userId}`);
    try {
      if (isFollowing) {
        await apiClient.unfollowUser(userId);
        setFollowedUserIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        // Remove from following list
        setFollowingList((prev) => prev.filter((u) => u.userId !== userId));
        toast.success('Đã bỏ theo dõi');
      } else {
        await apiClient.followUser(userId);
        setFollowedUserIds((prev) => new Set(prev).add(userId));
        toast.success('Đã theo dõi tác giả');
        // Refresh following list if on following view
        if (currentView === 'following') {
          fetchFollowingList();
        }
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể thực hiện');
    } finally {
      setLoadingAction(null);
    }
  };

  // Search community presets
  const searchPresets = useCallback(async (query: string, page: number = 1) => {
    try {
      setLoadingSearch(true);
      const result = await apiClient.searchCommunityPresets({
        search: query.trim() || undefined,
        page,
        limit: 20,
      });
      setSearchResults(result.data);
      setSearchTotal(result.total);
      setSearchPage(page);

      // Update suggested presets from followed authors
      if (result.suggestedFromFollowed && result.suggestedFromFollowed.length > 0) {
        setSuggestedPresets(result.suggestedFromFollowed);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Lỗi tìm kiếm');
    } finally {
      setLoadingSearch(false);
    }
  }, []);

  // Fetch following list for the Following tab
  const fetchFollowingList = useCallback(async () => {
    try {
      setLoadingFollowing(true);
      const following = await apiClient.getFollowing();
      setFollowingList(following);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải danh sách theo dõi');
    } finally {
      setLoadingFollowing(false);
    }
  }, []);

  // Fetch favorite presets for collection view (full data)
  const fetchFavoritePresets = useCallback(async () => {
    try {
      setLoadingFavorites(true);
      const favorites = await apiClient.getMealPlanFavorites();
      setFavoritePresets(favorites);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải bộ sưu tập');
    } finally {
      setLoadingFavorites(false);
    }
  }, []);

  // Fetch presets of a specific user (sorted by likes)
  const fetchUserPresets = useCallback(async (userId: string) => {
    try {
      setLoadingUserPresets(true);
      // Search for all public presets and filter by creator
      const result = await apiClient.searchCommunityPresets({
        page: 1,
        limit: 100,
      });
      const userPresets = result.data
        .filter((p) => p.creatorId === userId)
        .sort((a, b) => b.upvoteCount - a.upvoteCount);
      setFollowedUserPresets(userPresets);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể tải thực đơn');
    } finally {
      setLoadingUserPresets(false);
    }
  }, []);

  // Handle selecting a followed user
  const handleSelectFollowedUser = (userFollow: UserFollowResponse) => {
    setSelectedFollowedUser(userFollow);
    fetchUserPresets(userFollow.userId);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchMyPresets();
      fetchStreak();
      fetchFollowing();
      fetchFavorites();
      // Fetch initial search to get suggested presets
      searchPresets('');
    }
  }, [user, fetchMyPresets, fetchStreak, fetchFollowing, fetchFavorites, searchPresets]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPresets(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, searchPresets]);

  // Fetch data when switching views
  useEffect(() => {
    if (currentView === 'following') {
      fetchFollowingList();
    } else if (currentView === 'collection') {
      fetchFavoritePresets();
    }
  }, [currentView, fetchFollowingList, fetchFavoritePresets]);

  // Handle delete preset
  const handleDeletePreset = async () => {
    if (!presetToDelete) return;

    try {
      await apiClient.deletePreset(presetToDelete.id);
      toast.success('Đã xóa thực đơn');
      setMyPresets((prev) => prev.filter((p) => p.id !== presetToDelete.id));
      setDeleteDialogOpen(false);
      setPresetToDelete(null);
      if (selectedPreset?.id === presetToDelete.id) {
        setSelectedPreset(null);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể xóa thực đơn');
    }
  };

  // Handle edit confirmation
  const handleConfirmEdit = () => {
    setConfirmEditOpen(false);
    setEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async (updatedData: Partial<PresetResponse>) => {
    if (!presetToEdit) return;

    try {
      const updated = await apiClient.updatePreset(presetToEdit.id, {
        name: updatedData.name,
        description: updatedData.description || undefined,
        servingSize: updatedData.servingSize,
        servingUnit: updatedData.servingUnit,
        calories: updatedData.calories,
        protein: updatedData.protein || undefined,
        carbohydrates: updatedData.carbohydrates || undefined,
        fat: updatedData.fat || undefined,
        fiber: updatedData.fiber || undefined,
        sugar: updatedData.sugar || undefined,
        sodium: updatedData.sodium || undefined,
        isPublic: updatedData.isPublic,
      });

      // Update local state - likes/dislikes will be reset by backend
      setMyPresets((prev) =>
        prev.map((p) => (p.id === presetToEdit.id ? { ...updated, upvoteCount: 0, downvoteCount: 0 } : p))
      );

      toast.success('Đã cập nhật thực đơn (lượt thích đã được đặt lại)');
      setEditDialogOpen(false);
      setPresetToEdit(null);

      if (selectedPreset?.id === presetToEdit.id) {
        setSelectedPreset({ ...updated, upvoteCount: 0, downvoteCount: 0 });
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Không thể cập nhật thực đơn');
    }
  };

  // Calculate user stats from their presets (simplified - in real app, this would be a backend endpoint)
  const handleViewUserProfile = async (userId: string) => {
    // For now, we'll search for user's presets and calculate stats
    // In a real app, this would be a dedicated API endpoint
    try {
      const result = await apiClient.searchCommunityPresets({
        search: '',
        page: 1,
        limit: 100,
      });

      const userPresets = result.data.filter((p) => p.creatorId === userId);
      const totalLikes = userPresets.reduce((sum, p) => sum + p.upvoteCount, 0);
      const totalDislikes = userPresets.reduce((sum, p) => sum + p.downvoteCount, 0);

      setUserStats({
        presetCount: userPresets.length,
        totalLikes,
        totalDislikes,
        displayName: `Người dùng`, // Would come from backend in real implementation
      });
      setSelectedUserId(userId);
      setUserProfileOpen(true);
    } catch {
      toast.error('Không thể tải thông tin người dùng');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex gap-6 max-w-6xl mx-auto py-6 px-4">
      {/* Left Sidebar Navigation */}
      <aside className="w-48 flex-shrink-0">
        <nav className="bg-white rounded-xl shadow-sm p-3 sticky top-24">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
            Meal Plan
          </h2>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    pathname === item.href
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Presets Page Sub-navigation */}
          {pathname === '/meal-plan/presets' && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs font-medium text-gray-400 uppercase px-3 mb-2">Xem</p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => {
                      setCurrentView('presets');
                      setSelectedFollowedUser(null);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                      currentView === 'presets'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <BookOpen className={`w-4 h-4 ${currentView === 'presets' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span>Thực đơn</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setCurrentView('following');
                      setSelectedFollowedUser(null);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                      currentView === 'following'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Users className={`w-4 h-4 ${currentView === 'following' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span>Đang theo dõi</span>
                    {followedUserIds.size > 0 && (
                      <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {followedUserIds.size}
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setCurrentView('collection');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                      currentView === 'collection'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <BookmarkCheck className={`w-4 h-4 ${currentView === 'collection' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span>Bộ sưu tập</span>
                    {favoritePresetIds.size > 0 && (
                      <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {favoritePresetIds.size}
                      </span>
                    )}
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Streak Badge */}
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
            onClick={() => router.push('/meal-plan/settings')}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
            <span>Cài đặt</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 space-y-6">
        {currentView === 'presets' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Thực đơn mẫu</h1>
              <button
                onClick={() => router.push('/meal-plan/presets/create')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo mới</span>
              </button>
            </div>

            {/* My Presets Section */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Thực đơn của tôi</h2>
              <p className="text-sm text-gray-500 mt-1">Các thực đơn bạn đã tạo</p>
            </div>
            <button
              onClick={() => router.push('/meal-plan/presets/create')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo mới
            </button>
          </div>

          {loadingMyPresets ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">Đang tải...</p>
            </div>
          ) : myPresets.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Bạn chưa tạo thực đơn nào</p>
              <button
                onClick={() => router.push('/meal-plan/presets/create')}
                className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Tạo thực đơn đầu tiên →
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {myPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Preset Info */}
                    <button
                      onClick={() => setSelectedPreset(preset)}
                      className="flex-1 text-left"
                    >
                      <h3 className="font-medium text-gray-900 hover:text-emerald-600 transition-colors">
                        {preset.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {preset.calories} kcal · {preset.servingSize} {preset.servingUnit}
                      </p>
                      {preset.description && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                          {preset.description}
                        </p>
                      )}
                    </button>

                    {/* Like/Dislike counts */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <ThumbsUp className="w-4 h-4" />
                        {preset.upvoteCount}
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <ThumbsDown className="w-4 h-4" />
                        {preset.downvoteCount}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPresetToEdit(preset);
                          setConfirmEditOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setPresetToDelete(preset);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Suggested Presets from Followed Authors */}
        {suggestedPresets.length > 0 && !searchText && (
          <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-sm overflow-hidden border border-amber-200">
            <div className="p-4 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-gray-900">Đề xuất từ người bạn theo dõi</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">Top thực đơn được yêu thích từ các tác giả bạn theo dõi</p>
            </div>

            <div className="divide-y divide-amber-100">
              {suggestedPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 hover:bg-amber-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      onClick={() => setSelectedPreset(preset)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 hover:text-emerald-600 transition-colors">
                          {preset.name}
                        </h3>
                        {followedUserIds.has(preset.creatorId) && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            Đang theo dõi
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {preset.calories} kcal · {preset.servingSize} {preset.servingUnit}
                      </p>
                    </button>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <ThumbsUp className="w-4 h-4" />
                        {preset.upvoteCount}
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <ThumbsDown className="w-4 h-4" />
                        {preset.downvoteCount}
                      </span>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => handleToggleFavorite(preset.id)}
                      disabled={loadingAction === `favorite-${preset.id}`}
                      className={`p-1.5 rounded transition-colors ${
                        favoritePresetIds.has(preset.id)
                          ? 'text-amber-600 hover:bg-amber-100'
                          : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                      title={favoritePresetIds.has(preset.id) ? 'Bỏ lưu' : 'Lưu vào bộ sưu tập'}
                    >
                      {favoritePresetIds.has(preset.id) ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search Section */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Tìm kiếm thực đơn cộng đồng</h2>
            <p className="text-sm text-gray-500 mt-1">Khám phá thực đơn từ người dùng khác</p>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Tìm kiếm theo tên thực đơn..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          {loadingSearch ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">Đang tìm kiếm...</p>
            </div>
          ) : searchText && searchResults.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không tìm thấy kết quả cho &quot;{searchText}&quot;</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y">
              {searchResults.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Preset Info */}
                    <button
                      onClick={() => setSelectedPreset(preset)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 hover:text-emerald-600 transition-colors">
                          {preset.name}
                        </h3>
                        {followedUserIds.has(preset.creatorId) && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            Đang theo dõi
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {preset.calories} kcal · {preset.servingSize} {preset.servingUnit}
                      </p>
                    </button>

                    {/* Like/Dislike counts */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <ThumbsUp className="w-4 h-4" />
                        {preset.upvoteCount}
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <ThumbsDown className="w-4 h-4" />
                        {preset.downvoteCount}
                      </span>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => handleToggleFavorite(preset.id)}
                      disabled={loadingAction === `favorite-${preset.id}`}
                      className={`p-1.5 rounded transition-colors ${
                        favoritePresetIds.has(preset.id)
                          ? 'text-amber-600 hover:bg-amber-100'
                          : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                      title={favoritePresetIds.has(preset.id) ? 'Bỏ lưu' : 'Lưu vào bộ sưu tập'}
                    >
                      {favoritePresetIds.has(preset.id) ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    {/* Follow Button */}
                    {preset.creatorId !== user?.id && (
                      <button
                        onClick={() => handleToggleFollow(preset.creatorId)}
                        disabled={loadingAction === `follow-${preset.creatorId}`}
                        className={`p-1.5 rounded transition-colors ${
                          followedUserIds.has(preset.creatorId)
                            ? 'text-emerald-600 hover:bg-emerald-100'
                            : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={followedUserIds.has(preset.creatorId) ? 'Bỏ theo dõi' : 'Theo dõi tác giả'}
                      >
                        {followedUserIds.has(preset.creatorId) ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {/* Creator Info */}
                    <button
                      onClick={() => handleViewUserProfile(preset.creatorId)}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Xem</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Load more */}
              {searchResults.length < searchTotal && (
                <div className="p-4 text-center">
                  <button
                    onClick={() => searchPresets(searchText, searchPage + 1)}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Xem thêm ({searchTotal - searchResults.length} còn lại)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nhập từ khóa để tìm kiếm thực đơn</p>
            </div>
          )}
        </section>
          </>
        )}

        {currentView === 'following' && (
          /* Following View */
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedFollowedUser && (
                  <button
                    onClick={() => setSelectedFollowedUser(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedFollowedUser ? selectedFollowedUser.displayName || 'Người dùng' : 'Người đang theo dõi'}
                </h1>
              </div>
              {selectedFollowedUser && (
                <button
                  onClick={() => handleToggleFollow(selectedFollowedUser.userId)}
                  disabled={loadingAction === `follow-${selectedFollowedUser.userId}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    followedUserIds.has(selectedFollowedUser.userId)
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {followedUserIds.has(selectedFollowedUser.userId) ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Đang theo dõi</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Theo dõi</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {selectedFollowedUser ? (
              /* Selected User's Presets */
              <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {selectedFollowedUser.avatarUrl ? (
                        <img
                          src={selectedFollowedUser.avatarUrl}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedFollowedUser.displayName || 'Người dùng'}
                      </h2>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{selectedFollowedUser.presetCount} thực đơn</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                          {selectedFollowedUser.totalLikes}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                          {selectedFollowedUser.totalDislikes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {loadingUserPresets ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-2">Đang tải thực đơn...</p>
                  </div>
                ) : followedUserPresets.length === 0 ? (
                  <div className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Người dùng này chưa có thực đơn công khai</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {followedUserPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <button
                            onClick={() => setSelectedPreset(preset)}
                            className="flex-1 text-left"
                          >
                            <h3 className="font-medium text-gray-900 hover:text-emerald-600 transition-colors">
                              {preset.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {preset.calories} kcal · {preset.servingSize} {preset.servingUnit}
                            </p>
                            {preset.description && (
                              <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                                {preset.description}
                              </p>
                            )}
                          </button>

                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-green-600">
                              <ThumbsUp className="w-4 h-4" />
                              {preset.upvoteCount}
                            </span>
                            <span className="flex items-center gap-1 text-red-500">
                              <ThumbsDown className="w-4 h-4" />
                              {preset.downvoteCount}
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleFavorite(preset.id)}
                            disabled={loadingAction === `favorite-${preset.id}`}
                            className={`p-2 rounded-lg transition-colors ${
                              favoritePresetIds.has(preset.id)
                                ? 'text-amber-600 bg-amber-100 hover:bg-amber-200'
                                : 'text-gray-400 hover:text-amber-600 hover:bg-amber-100'
                            }`}
                            title={favoritePresetIds.has(preset.id) ? 'Bỏ lưu' : 'Lưu vào bộ sưu tập'}
                          >
                            {favoritePresetIds.has(preset.id) ? (
                              <BookmarkCheck className="w-4 h-4" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              /* Following List */
              <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="font-semibold text-gray-900">Danh sách theo dõi</h2>
                  <p className="text-sm text-gray-500 mt-1">Những người bạn đang theo dõi</p>
                </div>

                {loadingFollowing ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-2">Đang tải...</p>
                  </div>
                ) : followingList.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Bạn chưa theo dõi ai</p>
                    <button
                      onClick={() => setCurrentView('presets')}
                      className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Khám phá thực đơn cộng đồng →
                    </button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {followingList.map((userFollow) => (
                      <div
                        key={userFollow.userId}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <button
                            onClick={() => handleSelectFollowedUser(userFollow)}
                            className="flex items-center gap-4 flex-1 text-left"
                          >
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                              {userFollow.avatarUrl ? (
                                <img
                                  src={userFollow.avatarUrl}
                                  alt=""
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 hover:text-emerald-600 transition-colors">
                                {userFollow.displayName || 'Người dùng'}
                              </h3>
                              <p className="text-sm text-gray-500">{userFollow.presetCount} thực đơn công khai</p>
                            </div>
                            {/* Stats badges */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span className="font-medium">{userFollow.totalLikes}</span>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-full text-sm">
                                <ThumbsDown className="w-3.5 h-3.5" />
                                <span className="font-medium">{userFollow.totalDislikes}</span>
                              </div>
                            </div>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleFollow(userFollow.userId)}
                              disabled={loadingAction === `follow-${userFollow.userId}`}
                              className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                            >
                              Bỏ theo dõi
                            </button>
                            <button
                              onClick={() => handleSelectFollowedUser(userFollow)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {currentView === 'collection' && (
          /* Collection (Favorites) View */
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Bộ sưu tập</h1>
            </div>

            {/* Favorites Section */}
            <section className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">Thực đơn đã lưu</h2>
                <p className="text-sm text-gray-500 mt-1">Các thực đơn bạn đã thích và lưu lại</p>
              </div>

              {loadingFavorites ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-2">Đang tải...</p>
                </div>
              ) : favoritePresets.length === 0 ? (
                <div className="p-8 text-center">
                  <BookmarkCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Bạn chưa lưu thực đơn nào</p>
                  <button
                    onClick={() => setCurrentView('presets')}
                    className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Khám phá thực đơn cộng đồng →
                  </button>
                </div>
              ) : (
                <div className="divide-y">
                  {favoritePresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          onClick={() => setSelectedPreset(preset)}
                          className="flex-1 text-left"
                        >
                          <h3 className="font-medium text-gray-900 hover:text-emerald-600 transition-colors">
                            {preset.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {preset.calories} kcal · {preset.servingSize} {preset.servingUnit}
                          </p>
                          {preset.description && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                              {preset.description}
                            </p>
                          )}
                        </button>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-sm text-green-600">
                              <ThumbsUp className="w-4 h-4" />
                              {preset.upvoteCount}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-red-500">
                              <ThumbsDown className="w-4 h-4" />
                              {preset.downvoteCount}
                            </span>
                          </div>
                          <button
                            onClick={() => handleToggleFavorite(preset.id)}
                            disabled={loadingAction === `favorite-${preset.id}`}
                            className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Bỏ lưu"
                          >
                            <BookmarkCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Preset Detail Modal */}
      {selectedPreset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedPreset.name}</h2>
                <button
                  onClick={() => setSelectedPreset(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedPreset.description && (
                <p className="text-gray-600 mb-4">{selectedPreset.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Khẩu phần</span>
                  <span className="font-medium">{selectedPreset.servingSize} {selectedPreset.servingUnit}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Calories</span>
                  <span className="font-medium text-orange-600">{selectedPreset.calories} kcal</span>
                </div>
                {selectedPreset.protein !== null && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Protein</span>
                    <span className="font-medium">{selectedPreset.protein}g</span>
                  </div>
                )}
                {selectedPreset.carbohydrates !== null && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Carbohydrates</span>
                    <span className="font-medium">{selectedPreset.carbohydrates}g</span>
                  </div>
                )}
                {selectedPreset.fat !== null && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Chất béo</span>
                    <span className="font-medium">{selectedPreset.fat}g</span>
                  </div>
                )}
                {selectedPreset.fiber !== null && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Chất xơ</span>
                    <span className="font-medium">{selectedPreset.fiber}g</span>
                  </div>
                )}
                {selectedPreset.sugar !== null && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Đường</span>
                    <span className="font-medium">{selectedPreset.sugar}g</span>
                  </div>
                )}
                {selectedPreset.sodium !== null && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Sodium</span>
                    <span className="font-medium">{selectedPreset.sodium}mg</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
                <span className="flex items-center gap-2 text-green-600">
                  <ThumbsUp className="w-5 h-5" />
                  <span className="font-medium">{selectedPreset.upvoteCount} thích</span>
                </span>
                <span className="flex items-center gap-2 text-red-500">
                  <ThumbsDown className="w-5 h-5" />
                  <span className="font-medium">{selectedPreset.downvoteCount} không thích</span>
                </span>
              </div>

              {/* Action Buttons */}
              {selectedPreset.creatorId !== user?.id && (
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleToggleFavorite(selectedPreset.id)}
                    disabled={loadingAction === `favorite-${selectedPreset.id}`}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${
                      favoritePresetIds.has(selectedPreset.id)
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {favoritePresetIds.has(selectedPreset.id) ? (
                      <>
                        <BookmarkCheck className="w-5 h-5" />
                        <span>Đã lưu</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-5 h-5" />
                        <span>Lưu thực đơn</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleFollow(selectedPreset.creatorId)}
                    disabled={loadingAction === `follow-${selectedPreset.creatorId}`}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${
                      followedUserIds.has(selectedPreset.creatorId)
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {followedUserIds.has(selectedPreset.creatorId) ? (
                      <>
                        <UserCheck className="w-5 h-5" />
                        <span>Đang theo dõi</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Theo dõi tác giả</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Edit Dialog */}
      {confirmEditOpen && presetToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Xác nhận chỉnh sửa</h2>
            <p className="text-gray-600 mb-6">
              Khi bạn chỉnh sửa thực đơn &quot;{presetToEdit.name}&quot;, số lượt thích và không thích sẽ được đặt lại về 0.
              Bạn có chắc chắn muốn tiếp tục?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setConfirmEditOpen(false);
                  setPresetToEdit(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tiếp tục chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editDialogOpen && presetToEdit && (
        <EditPresetDialog
          preset={presetToEdit}
          onClose={() => {
            setEditDialogOpen(false);
            setPresetToEdit(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && presetToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Xóa thực đơn</h2>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa thực đơn &quot;{presetToDelete.name}&quot;? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setPresetToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeletePreset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Dialog */}
      {userProfileOpen && userStats && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Thông tin tác giả</h2>
              <button
                onClick={() => {
                  setUserProfileOpen(false);
                  setUserStats(null);
                  setSelectedUserId(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{userStats.displayName}</p>
                <p className="text-sm text-gray-500">ID: {selectedUserId?.slice(0, 8)}...</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{userStats.presetCount}</p>
                <p className="text-sm text-gray-500">Thực đơn</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{userStats.totalLikes}</p>
                <p className="text-sm text-gray-500">Lượt thích</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-500">{userStats.totalDislikes}</p>
                <p className="text-sm text-gray-500">Không thích</p>
              </div>
            </div>

            {/* Follow Button */}
            {selectedUserId && selectedUserId !== user?.id && (
              <button
                onClick={() => handleToggleFollow(selectedUserId)}
                disabled={loadingAction === `follow-${selectedUserId}`}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${
                  followedUserIds.has(selectedUserId)
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {followedUserIds.has(selectedUserId) ? (
                  <>
                    <UserCheck className="w-5 h-5" />
                    <span>Đang theo dõi</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Theo dõi tác giả này</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Edit Preset Dialog Component
function EditPresetDialog({
  preset,
  onClose,
  onSave,
}: {
  preset: PresetResponse;
  onClose: () => void;
  onSave: (data: Partial<PresetResponse>) => void;
}) {
  const [formData, setFormData] = useState({
    name: preset.name,
    description: preset.description || '',
    servingSize: preset.servingSize,
    servingUnit: preset.servingUnit,
    calories: preset.calories,
    protein: preset.protein || 0,
    carbohydrates: preset.carbohydrates || 0,
    fat: preset.fat || 0,
    fiber: preset.fiber || 0,
    sugar: preset.sugar || 0,
    sodium: preset.sodium || 0,
    isPublic: preset.isPublic,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Chỉnh sửa thực đơn</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên thực đơn *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khẩu phần *</label>
                <input
                  type="number"
                  value={formData.servingSize}
                  onChange={(e) => setFormData({ ...formData, servingSize: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị *</label>
                <input
                  type="text"
                  value={formData.servingUnit}
                  onChange={(e) => setFormData({ ...formData, servingUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calories (kcal) *</label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="0"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={formData.carbohydrates}
                  onChange={(e) => setFormData({ ...formData, carbohydrates: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chất béo (g)</label>
                <input
                  type="number"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chất xơ (g)</label>
                <input
                  type="number"
                  value={formData.fiber}
                  onChange={(e) => setFormData({ ...formData, fiber: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đường (g)</label>
                <input
                  type="number"
                  value={formData.sugar}
                  onChange={(e) => setFormData({ ...formData, sugar: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sodium (mg)</label>
                <input
                  type="number"
                  value={formData.sodium}
                  onChange={(e) => setFormData({ ...formData, sodium: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                Công khai cho cộng đồng
              </label>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
