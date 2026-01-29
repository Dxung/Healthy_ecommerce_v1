import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { UserHealthProfile } from './models/user-health-profile.model';
import type { FoodPreset } from './models/food-preset.model';
import type { DailyMealLog } from './models/daily-meal-log.model';
import type { ExerciseLog } from './models/exercise-log.model';
import type { DailySummary } from './models/daily-summary.model';
import type { PaginatedPresets, SearchPresetsWithPriorityResult } from './repository/food-preset.repository.interface';
import type { DietPreferenceInfo } from './repository/diet-preference.repository.interface';
import type { AllergenExclusionInfo } from './repository/allergen-exclusion.repository.interface';
import type { UserFollowInfo } from './repository/user-follow.repository.interface';
import type { VoteType } from 'src/database/typeorm/entities/meal-plan/enums/vote-type.enum';
import type { MealType } from 'src/database/typeorm/entities/meal-plan/enums/meal-type.enum';
import type {
  UpdateHealthProfileDto,
  AddMealFromProductDto,
  AddMealFromPresetDto,
  AddCustomMealDto,
  AddQuickMealDto,
  AddExerciseDto,
  UpdateExerciseDto,
  CreatePresetDto,
  UpdatePresetDto,
  UpdateMealLogDto,
} from './dto';

/**
 * Combined settings result returned by getSettings() method.
 */
export interface MealPlanSettings {
  healthProfile: UserHealthProfile;
  dietPreferences: DietPreferenceInfo[];
  allergenExclusions: AllergenExclusionInfo[];
}

export interface IMealPlanService {
  // ======================== Health Profile ========================

  getHealthProfile(userId: string): ResultAsync<UserHealthProfile, DomainError>;

  updateHealthProfile(
    userId: string,
    dto: UpdateHealthProfileDto,
  ): ResultAsync<UserHealthProfile, DomainError>;

  calculateTdee(userId: string): ResultAsync<number | null, DomainError>;

  // ======================== Settings ========================

  /**
   * Gets combined settings (health profile + diet preferences + allergen exclusions).
   */
  getSettings(userId: string): ResultAsync<MealPlanSettings, DomainError>;

  getDietPreferences(userId: string): ResultAsync<DietPreferenceInfo[], DomainError>;

  setDietPreferences(
    userId: string,
    dietTagIds: string[],
  ): ResultAsync<void, DomainError>;

  getAllergenExclusions(userId: string): ResultAsync<AllergenExclusionInfo[], DomainError>;

  setAllergenExclusions(
    userId: string,
    allergenTagIds: string[],
  ): ResultAsync<void, DomainError>;

  // ======================== Daily Summary ========================

  getDailySummary(userId: string, date: Date): ResultAsync<DailySummary, DomainError>;

  getHistory(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): ResultAsync<{ date: Date; totalConsumed: number; totalBurned: number }[], DomainError>;

  getStreak(userId: string): ResultAsync<{ current: number; longest: number }, DomainError>;

  // ======================== Meal Logs ========================

  addMealFromProduct(
    userId: string,
    dto: AddMealFromProductDto,
  ): ResultAsync<DailyMealLog, DomainError>;

  addMealFromPreset(
    userId: string,
    dto: AddMealFromPresetDto,
  ): ResultAsync<DailyMealLog, DomainError>;

  addCustomMeal(
    userId: string,
    dto: AddCustomMealDto,
  ): ResultAsync<DailyMealLog, DomainError>;

  addQuickMeal(
    userId: string,
    dto: AddQuickMealDto,
  ): ResultAsync<DailyMealLog, DomainError>;

  updateMealLog(
    userId: string,
    logId: string,
    dto: UpdateMealLogDto,
  ): ResultAsync<DailyMealLog, DomainError>;

  deleteMealLog(userId: string, logId: string): ResultAsync<void, DomainError>;

  // ======================== Exercise Logs ========================

  addExercise(userId: string, dto: AddExerciseDto): ResultAsync<ExerciseLog, DomainError>;

  updateExercise(
    userId: string,
    logId: string,
    dto: UpdateExerciseDto,
  ): ResultAsync<ExerciseLog, DomainError>;

  deleteExerciseLog(userId: string, logId: string): ResultAsync<void, DomainError>;

  // ======================== Presets ========================

  getMyPresets(userId: string): ResultAsync<FoodPreset[], DomainError>;

  createPreset(userId: string, dto: CreatePresetDto): ResultAsync<FoodPreset, DomainError>;

  updatePreset(
    userId: string,
    presetId: string,
    dto: UpdatePresetDto,
  ): ResultAsync<FoodPreset, DomainError>;

  deletePreset(userId: string, presetId: string): ResultAsync<void, DomainError>;

  searchCommunityPresets(params: {
    userId: string;
    search?: string;
    page: number;
    limit: number;
  }): ResultAsync<SearchPresetsWithPriorityResult, DomainError>;

  votePreset(
    userId: string,
    presetId: string,
    voteType: VoteType,
  ): ResultAsync<void, DomainError>;

  removeVote(userId: string, presetId: string): ResultAsync<void, DomainError>;

  // ======================== Favorites ========================

  getFavorites(userId: string): ResultAsync<FoodPreset[], DomainError>;

  addFavorite(userId: string, presetId: string): ResultAsync<void, DomainError>;

  removeFavorite(userId: string, presetId: string): ResultAsync<void, DomainError>;

  // ======================== Follows ========================

  follow(followerId: string, followingId: string): ResultAsync<void, DomainError>;

  unfollow(followerId: string, followingId: string): ResultAsync<void, DomainError>;

  getFollowing(userId: string): ResultAsync<UserFollowInfo[], DomainError>;

  getFollowers(userId: string): ResultAsync<UserFollowInfo[], DomainError>;

  isFollowing(followerId: string, followingId: string): ResultAsync<boolean, DomainError>;
}
