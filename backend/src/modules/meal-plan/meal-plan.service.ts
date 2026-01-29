import { Injectable, Inject } from '@nestjs/common';
import { ResultAsync, ok, err, errAsync, okAsync } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import {
  HEALTH_PROFILE_REPOSITORY,
  FOOD_PRESET_REPOSITORY,
  MEAL_LOG_REPOSITORY,
  EXERCISE_LOG_REPOSITORY,
  USER_FOLLOW_REPOSITORY,
  DIET_PREFERENCE_REPOSITORY,
  ALLERGEN_EXCLUSION_REPOSITORY,
  PRODUCT_NUTRITION_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import { IHealthProfileRepository } from './repository/health-profile.repository.interface';
import { IFoodPresetRepository, SearchPresetsWithPriorityResult } from './repository/food-preset.repository.interface';
import { IMealLogRepository } from './repository/meal-log.repository.interface';
import { IExerciseLogRepository } from './repository/exercise-log.repository.interface';
import { IUserFollowRepository, UserFollowInfo } from './repository/user-follow.repository.interface';
import { IDietPreferenceRepository, DietPreferenceInfo } from './repository/diet-preference.repository.interface';
import { IAllergenExclusionRepository, AllergenExclusionInfo } from './repository/allergen-exclusion.repository.interface';
import { IProductNutritionRepository } from 'src/modules/product/repository/product-nutrition.repository.interface';
import { IMealPlanService, MealPlanSettings } from './meal-plan.service.interface';
import { UserHealthProfile } from './models/user-health-profile.model';
import { FoodPreset } from './models/food-preset.model';
import { DailyMealLog } from './models/daily-meal-log.model';
import { ExerciseLog } from './models/exercise-log.model';
import { DailySummary } from './models/daily-summary.model';
import { VoteType } from 'src/database/typeorm/entities/meal-plan/enums/vote-type.enum';
import { MEAL_PLAN_ERRORS } from './errors/meal-plan.errors';
import {
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
import { MealSourceType } from 'src/database/typeorm/entities/meal-plan/enums/meal-source-type.enum';

@Injectable()
export class MealPlanService implements IMealPlanService {
  constructor(
    @Inject(HEALTH_PROFILE_REPOSITORY)
    private readonly healthProfileRepo: IHealthProfileRepository,
    @Inject(FOOD_PRESET_REPOSITORY)
    private readonly presetRepo: IFoodPresetRepository,
    @Inject(MEAL_LOG_REPOSITORY)
    private readonly mealLogRepo: IMealLogRepository,
    @Inject(EXERCISE_LOG_REPOSITORY)
    private readonly exerciseLogRepo: IExerciseLogRepository,
    @Inject(USER_FOLLOW_REPOSITORY)
    private readonly followRepo: IUserFollowRepository,
    @Inject(DIET_PREFERENCE_REPOSITORY)
    private readonly dietPrefRepo: IDietPreferenceRepository,
    @Inject(ALLERGEN_EXCLUSION_REPOSITORY)
    private readonly allergenExclRepo: IAllergenExclusionRepository,
    @Inject(PRODUCT_NUTRITION_REPOSITORY)
    private readonly nutritionRepo: IProductNutritionRepository,
  ) {}

  // ======================== Health Profile ========================

  getHealthProfile(userId: string): ResultAsync<UserHealthProfile, DomainError> {
    return this.healthProfileRepo.findByUserId(userId).andThen((profile) => {
      if (profile) {
        return ok(profile);
      }
      // Create new profile if not exists
      const newProfile = UserHealthProfile.create(userId);
      return this.healthProfileRepo.create(newProfile);
    });
  }

  updateHealthProfile(
    userId: string,
    dto: UpdateHealthProfileDto,
  ): ResultAsync<UserHealthProfile, DomainError> {
    return this.getHealthProfile(userId).andThen((profile) => {
      profile.updatePhysicalAttributes({
        weightKg: dto.weightKg,
        heightCm: dto.heightCm,
        birthDate: dto.birthDate,
        gender: dto.gender,
        activityLevel: dto.activityLevel,
      });
      profile.updateGoals({
        goalType: dto.goalType,
        calorieTarget: dto.calorieTarget,
        isCalorieTargetManual: dto.isCalorieTargetManual,
      });
      return this.healthProfileRepo.update(profile);
    });
  }

  calculateTdee(userId: string): ResultAsync<number | null, DomainError> {
    return this.getHealthProfile(userId).map((profile) => profile.calculateTDEE());
  }

  // ======================== Settings ========================

  getSettings(userId: string): ResultAsync<MealPlanSettings, DomainError> {
    return ResultAsync.combine([
      this.getHealthProfile(userId),
      this.getDietPreferences(userId),
      this.getAllergenExclusions(userId),
    ]).map(([healthProfile, dietPreferences, allergenExclusions]) => ({
      healthProfile,
      dietPreferences,
      allergenExclusions,
    }));
  }

  getDietPreferences(userId: string): ResultAsync<DietPreferenceInfo[], DomainError> {
    return this.dietPrefRepo.getByUserId(userId);
  }

  setDietPreferences(
    userId: string,
    dietTagIds: string[],
  ): ResultAsync<void, DomainError> {
    return this.dietPrefRepo.setPreferences(userId, dietTagIds);
  }

  getAllergenExclusions(userId: string): ResultAsync<AllergenExclusionInfo[], DomainError> {
    return this.allergenExclRepo.getByUserId(userId);
  }

  setAllergenExclusions(
    userId: string,
    allergenTagIds: string[],
  ): ResultAsync<void, DomainError> {
    return this.allergenExclRepo.setExclusions(userId, allergenTagIds);
  }

  // ======================== Daily Summary ========================

  getDailySummary(userId: string, date: Date): ResultAsync<DailySummary, DomainError> {
    return ResultAsync.combine([
      this.mealLogRepo.findByUserAndDate(userId, date),
      this.exerciseLogRepo.findByUserAndDate(userId, date),
      this.getHealthProfile(userId),
    ]).map(([mealLogs, exerciseLogs, profile]) => {
      const calorieTarget = profile.getEffectiveCalorieTarget();
      return new DailySummary(date, mealLogs, exerciseLogs, calorieTarget);
    });
  }

  getHistory(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): ResultAsync<{ date: Date; totalConsumed: number; totalBurned: number }[], DomainError> {
    return ResultAsync.combine([
      this.mealLogRepo.findByUserAndDateRange(userId, startDate, endDate),
      this.exerciseLogRepo.findByUserAndDateRange(userId, startDate, endDate),
    ]).map(([mealLogs, exerciseLogs]) => {
      const dateMap = new Map<string, { consumed: number; burned: number }>();

      // Process meal logs
      for (const log of mealLogs) {
        const dateKey = log.logDate.toISOString().split('T')[0];
        const existing = dateMap.get(dateKey) || { consumed: 0, burned: 0 };
        existing.consumed += log.caloriesLogged;
        dateMap.set(dateKey, existing);
      }

      // Process exercise logs
      for (const log of exerciseLogs) {
        const dateKey = log.logDate.toISOString().split('T')[0];
        const existing = dateMap.get(dateKey) || { consumed: 0, burned: 0 };
        existing.burned += log.caloriesBurned;
        dateMap.set(dateKey, existing);
      }

      // Convert to array
      return Array.from(dateMap.entries())
        .map(([dateStr, data]) => ({
          date: new Date(dateStr),
          totalConsumed: data.consumed,
          totalBurned: data.burned,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    });
  }

  getStreak(userId: string): ResultAsync<{ current: number; longest: number }, DomainError> {
    return this.getHealthProfile(userId).map((profile) => ({
      current: profile.currentStreak,
      longest: profile.longestStreak,
    }));
  }

  // ======================== Meal Logs ========================

  addMealFromProduct(
    userId: string,
    dto: AddMealFromProductDto,
  ): ResultAsync<DailyMealLog, DomainError> {
    return this.nutritionRepo.findByProductId(dto.productId).andThen((nutrition) => {
      if (!nutrition) {
        return err(createDomainError(MEAL_PLAN_ERRORS.PRODUCT_NO_NUTRITION));
      }

      const log = DailyMealLog.createFromProduct({
        userId,
        logDate: dto.logDate,
        mealType: dto.mealType,
        productId: dto.productId,
        foodName: `Product ${dto.productId}`, // Will be enriched later
        quantity: dto.quantity,
        servingSize: nutrition.servingSize,
        servingUnit: nutrition.servingUnit,
        caloriesPerServing: nutrition.calories ?? 0,
        proteinPerServing: nutrition.protein,
        carbsPerServing: nutrition.carbohydrates,
        fatPerServing: nutrition.fat,
        fiberPerServing: nutrition.fiber,
        sugarPerServing: nutrition.sugar,
        sodiumPerServing: nutrition.sodium,
        notes: dto.notes,
      });

      return this.mealLogRepo.create(log).andThen((savedLog) =>
        this.updateStreakAfterLog(userId, dto.logDate).map(() => savedLog),
      );
    });
  }

  addMealFromPreset(
    userId: string,
    dto: AddMealFromPresetDto,
  ): ResultAsync<DailyMealLog, DomainError> {
    return this.presetRepo.findById(dto.presetId).andThen((preset) => {
      if (!preset) {
        return err(createDomainError(MEAL_PLAN_ERRORS.PRESET_NOT_FOUND));
      }

      const log = DailyMealLog.createFromPreset({
        userId,
        logDate: dto.logDate,
        mealType: dto.mealType,
        presetId: dto.presetId,
        foodName: preset.name,
        quantity: dto.quantity,
        servingSize: preset.servingSize,
        servingUnit: preset.servingUnit,
        caloriesPerServing: preset.calories,
        proteinPerServing: preset.protein,
        carbsPerServing: preset.carbohydrates,
        fatPerServing: preset.fat,
        fiberPerServing: preset.fiber,
        sugarPerServing: preset.sugar,
        sodiumPerServing: preset.sodium,
        notes: dto.notes,
      });

      return ResultAsync.combine([
        this.mealLogRepo.create(log),
        this.presetRepo.incrementUseCount(dto.presetId),
      ]).andThen(([savedLog]) =>
        this.updateStreakAfterLog(userId, dto.logDate).map(() => savedLog),
      );
    });
  }

  addCustomMeal(
    userId: string,
    dto: AddCustomMealDto,
  ): ResultAsync<DailyMealLog, DomainError> {
    const log = DailyMealLog.createCustom({
      userId,
      logDate: dto.logDate,
      mealType: dto.mealType,
      foodName: dto.foodName,
      quantity: dto.quantity,
      servingSize: dto.servingSize,
      servingUnit: dto.servingUnit,
      calories: dto.calories,
      protein: dto.protein,
      carbs: dto.carbs,
      fat: dto.fat,
      fiber: dto.fiber,
      sugar: dto.sugar,
      sodium: dto.sodium,
      notes: dto.notes,
    });

    return this.mealLogRepo.create(log).andThen((savedLog) =>
      this.updateStreakAfterLog(userId, dto.logDate).map(() => savedLog),
    );
  }

  addQuickMeal(
    userId: string,
    dto: AddQuickMealDto,
  ): ResultAsync<DailyMealLog, DomainError> {
    const log = DailyMealLog.createQuickAdd({
      userId,
      logDate: dto.logDate,
      mealType: dto.mealType,
      foodName: dto.foodName,
      calories: dto.calories,
      notes: dto.notes,
    });

    return this.mealLogRepo.create(log).andThen((savedLog) =>
      this.updateStreakAfterLog(userId, dto.logDate).map(() => savedLog),
    );
  }

  updateMealLog(
    userId: string,
    logId: string,
    dto: UpdateMealLogDto,
  ): ResultAsync<DailyMealLog, DomainError> {
    return this.mealLogRepo.findById(logId).andThen((log) => {
      if (!log) {
        return err(createDomainError(MEAL_PLAN_ERRORS.MEAL_LOG_NOT_FOUND));
      }
      if (!log.belongsToUser(userId)) {
        return err(createDomainError(MEAL_PLAN_ERRORS.MEAL_LOG_NOT_OWNED));
      }

      // Handle notes update
      if (dto.notes !== undefined) {
        log.updateNotes(dto.notes ?? null);
      }

      // Handle quantity update - need to get per-serving nutrition
      if (dto.quantity !== log.quantity) {
        return this.recalculateMealLogNutrition(log, dto.quantity).andThen(
          (updatedLog) => this.mealLogRepo.update(updatedLog),
        );
      }

      return this.mealLogRepo.update(log);
    });
  }

  private recalculateMealLogNutrition(
    log: DailyMealLog,
    newQuantity: number,
  ): ResultAsync<DailyMealLog, DomainError> {
    const oldQuantity = log.quantity;

    // For PRODUCT source, get nutrition from product
    if (log.sourceType === MealSourceType.PRODUCT && log.productId) {
      return this.nutritionRepo.findByProductId(log.productId).andThen((nutrition) => {
        if (!nutrition) {
          // Fallback: calculate from existing logged values
          return ok(this.recalculateFromExistingValues(log, oldQuantity, newQuantity));
        }

        log.updateQuantity(newQuantity, nutrition.calories ?? 0, {
          proteinPerServing: nutrition.protein,
          carbsPerServing: nutrition.carbohydrates,
          fatPerServing: nutrition.fat,
          fiberPerServing: nutrition.fiber,
          sugarPerServing: nutrition.sugar,
          sodiumPerServing: nutrition.sodium,
        });
        return ok(log);
      });
    }

    // For PRESET source, get nutrition from preset
    if (log.sourceType === MealSourceType.PRESET && log.presetId) {
      return this.presetRepo.findById(log.presetId).andThen((preset) => {
        if (!preset) {
          // Fallback: calculate from existing logged values
          return ok(this.recalculateFromExistingValues(log, oldQuantity, newQuantity));
        }

        log.updateQuantity(newQuantity, preset.calories, {
          proteinPerServing: preset.protein,
          carbsPerServing: preset.carbohydrates,
          fatPerServing: preset.fat,
          fiberPerServing: preset.fiber,
          sugarPerServing: preset.sugar,
          sodiumPerServing: preset.sodium,
        });
        return ok(log);
      });
    }

    // For CUSTOM and QUICK: calculate from existing logged values
    return okAsync(this.recalculateFromExistingValues(log, oldQuantity, newQuantity));
  }

  private recalculateFromExistingValues(
    log: DailyMealLog,
    oldQuantity: number,
    newQuantity: number,
  ): DailyMealLog {
    // Calculate per-serving values from existing logged values
    const caloriesPerServing = log.caloriesLogged / oldQuantity;
    const proteinPerServing = log.proteinLogged !== null ? log.proteinLogged / oldQuantity : null;
    const carbsPerServing = log.carbsLogged !== null ? log.carbsLogged / oldQuantity : null;
    const fatPerServing = log.fatLogged !== null ? log.fatLogged / oldQuantity : null;
    const fiberPerServing = log.fiberLogged !== null ? log.fiberLogged / oldQuantity : null;
    const sugarPerServing = log.sugarLogged !== null ? log.sugarLogged / oldQuantity : null;
    const sodiumPerServing = log.sodiumLogged !== null ? log.sodiumLogged / oldQuantity : null;

    log.updateQuantity(newQuantity, caloriesPerServing, {
      proteinPerServing,
      carbsPerServing,
      fatPerServing,
      fiberPerServing,
      sugarPerServing,
      sodiumPerServing,
    });
    return log;
  }

  deleteMealLog(userId: string, logId: string): ResultAsync<void, DomainError> {
    return this.mealLogRepo.findById(logId).andThen((log) => {
      if (!log) {
        return err(createDomainError(MEAL_PLAN_ERRORS.MEAL_LOG_NOT_FOUND));
      }
      if (!log.belongsToUser(userId)) {
        return err(createDomainError(MEAL_PLAN_ERRORS.MEAL_LOG_NOT_OWNED));
      }
      return this.mealLogRepo.delete(logId);
    });
  }

  private updateStreakAfterLog(userId: string, logDate: Date): ResultAsync<void, DomainError> {
    return this.healthProfileRepo.findByUserId(userId).andThen((profile) => {
      if (!profile) {
        return ok(undefined);
      }
      profile.updateStreak(logDate);
      return this.healthProfileRepo.update(profile).map(() => undefined);
    });
  }

  // ======================== Exercise Logs ========================

  addExercise(userId: string, dto: AddExerciseDto): ResultAsync<ExerciseLog, DomainError> {
    const log = ExerciseLog.create({
      userId,
      logDate: dto.logDate,
      exerciseName: dto.exerciseName,
      durationMinutes: dto.durationMinutes,
      caloriesBurned: dto.caloriesBurned,
      notes: dto.notes,
    });

    return this.exerciseLogRepo.create(log);
  }

  updateExercise(
    userId: string,
    logId: string,
    dto: UpdateExerciseDto,
  ): ResultAsync<ExerciseLog, DomainError> {
    return this.exerciseLogRepo.findById(logId).andThen((log) => {
      if (!log) {
        return err(createDomainError(MEAL_PLAN_ERRORS.EXERCISE_LOG_NOT_FOUND));
      }
      if (!log.belongsToUser(userId)) {
        return err(createDomainError(MEAL_PLAN_ERRORS.EXERCISE_LOG_NOT_OWNED));
      }
      log.updateExercise({
        exerciseName: dto.exerciseName,
        durationMinutes: dto.durationMinutes,
        caloriesBurned: dto.caloriesBurned,
        notes: dto.notes,
      });
      return this.exerciseLogRepo.update(log);
    });
  }

  deleteExerciseLog(userId: string, logId: string): ResultAsync<void, DomainError> {
    return this.exerciseLogRepo.findById(logId).andThen((log) => {
      if (!log) {
        return err(createDomainError(MEAL_PLAN_ERRORS.EXERCISE_LOG_NOT_FOUND));
      }
      if (!log.belongsToUser(userId)) {
        return err(createDomainError(MEAL_PLAN_ERRORS.EXERCISE_LOG_NOT_OWNED));
      }
      return this.exerciseLogRepo.delete(logId);
    });
  }

  // ======================== Presets ========================

  getMyPresets(userId: string): ResultAsync<FoodPreset[], DomainError> {
    return this.presetRepo.findByCreatorId(userId);
  }

  createPreset(userId: string, dto: CreatePresetDto): ResultAsync<FoodPreset, DomainError> {
    const preset = FoodPreset.create({
      creatorId: userId,
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      servingSize: dto.servingSize,
      servingUnit: dto.servingUnit,
      calories: dto.calories,
      protein: dto.protein,
      carbohydrates: dto.carbohydrates,
      fat: dto.fat,
      fiber: dto.fiber,
      sugar: dto.sugar,
      sodium: dto.sodium,
      isPublic: dto.isPublic,
    });

    return this.presetRepo.create(preset);
  }

  updatePreset(
    userId: string,
    presetId: string,
    dto: UpdatePresetDto,
  ): ResultAsync<FoodPreset, DomainError> {
    return this.presetRepo.findById(presetId).andThen((preset) => {
      if (!preset) {
        return err(createDomainError(MEAL_PLAN_ERRORS.PRESET_NOT_FOUND));
      }
      if (!preset.canBeEditedBy(userId)) {
        return err(createDomainError(MEAL_PLAN_ERRORS.PRESET_NOT_OWNED));
      }
      preset.updateInfo({
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        isPublic: dto.isPublic,
      });
      preset.updateNutrition({
        servingSize: dto.servingSize,
        servingUnit: dto.servingUnit,
        calories: dto.calories,
        protein: dto.protein,
        carbohydrates: dto.carbohydrates,
        fat: dto.fat,
        fiber: dto.fiber,
        sugar: dto.sugar,
        sodium: dto.sodium,
      });
      // Reset votes when preset is edited
      preset.resetVotes();
      return this.presetRepo.update(preset);
    });
  }

  deletePreset(userId: string, presetId: string): ResultAsync<void, DomainError> {
    return this.presetRepo.findById(presetId).andThen((preset) => {
      if (!preset) {
        return err(createDomainError(MEAL_PLAN_ERRORS.PRESET_NOT_FOUND));
      }
      if (!preset.canBeEditedBy(userId)) {
        return err(createDomainError(MEAL_PLAN_ERRORS.PRESET_NOT_OWNED));
      }
      return this.presetRepo.delete(presetId);
    });
  }

  searchCommunityPresets(params: {
    userId: string;
    search?: string;
    page: number;
    limit: number;
  }): ResultAsync<SearchPresetsWithPriorityResult, DomainError> {
    // First, get the list of users this user is following
    return this.followRepo.getFollowing(params.userId).andThen((following) => {
      const followedUserIds = following.map((f) => f.userId);
      return this.presetRepo.searchPublicWithPriority({
        search: params.search,
        page: params.page,
        limit: params.limit,
        followedUserIds,
      });
    });
  }

  votePreset(
    userId: string,
    presetId: string,
    voteType: VoteType,
  ): ResultAsync<void, DomainError> {
    return this.presetRepo.findById(presetId).andThen((preset) => {
      if (!preset) {
        return err(createDomainError(MEAL_PLAN_ERRORS.PRESET_NOT_FOUND));
      }
      return this.presetRepo.upsertVote(presetId, userId, voteType);
    });
  }

  removeVote(userId: string, presetId: string): ResultAsync<void, DomainError> {
    return this.presetRepo.removeVote(presetId, userId);
  }

  // ======================== Favorites ========================

  getFavorites(userId: string): ResultAsync<FoodPreset[], DomainError> {
    return this.presetRepo.getFavorites(userId);
  }

  addFavorite(userId: string, presetId: string): ResultAsync<void, DomainError> {
    return this.presetRepo.findById(presetId).andThen((preset) => {
      if (!preset) {
        return err(createDomainError(MEAL_PLAN_ERRORS.PRESET_NOT_FOUND));
      }
      return this.presetRepo.addFavorite(userId, presetId);
    });
  }

  removeFavorite(userId: string, presetId: string): ResultAsync<void, DomainError> {
    return this.presetRepo.removeFavorite(userId, presetId);
  }

  // ======================== Follows ========================

  follow(followerId: string, followingId: string): ResultAsync<void, DomainError> {
    if (followerId === followingId) {
      return errAsync(createDomainError(MEAL_PLAN_ERRORS.CANNOT_FOLLOW_SELF));
    }
    return this.followRepo.follow(followerId, followingId);
  }

  unfollow(followerId: string, followingId: string): ResultAsync<void, DomainError> {
    return this.followRepo.unfollow(followerId, followingId);
  }

  getFollowing(userId: string): ResultAsync<UserFollowInfo[], DomainError> {
    return this.followRepo.getFollowing(userId);
  }

  getFollowers(userId: string): ResultAsync<UserFollowInfo[], DomainError> {
    return this.followRepo.getFollowers(userId);
  }

  isFollowing(followerId: string, followingId: string): ResultAsync<boolean, DomainError> {
    return this.followRepo.isFollowing(followerId, followingId);
  }
}
