import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { IMealPlanService } from './meal-plan.service.interface';
import { MEAL_PLAN_SERVICE } from './tokens/meal-plan.token';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { MealPlanErrorHttpMapper } from './errors/meal-plan-errors-http.mapper';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AsyncLocalStorage } from 'async_hooks';
import type { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

import {
  UpdateHealthProfileDto,
  HealthProfileResponseDto,
  GetDailySummaryQueryDto,
  GetHistoryQueryDto,
  DailySummaryResponseDto,
  AddMealFromProductDto,
  AddMealFromPresetDto,
  AddCustomMealDto,
  AddQuickMealDto,
  MealLogResponseDto,
  UpdateMealLogDto,
  AddExerciseDto,
  UpdateExerciseDto,
  ExerciseLogResponseDto,
  CreatePresetDto,
  UpdatePresetDto,
  PresetResponseDto,
  VotePresetDto,
  UpdateDietPreferencesDto,
  UpdateAllergenExclusionsDto,
  DietPreferenceDto,
  AllergenExclusionDto,
  MealPlanSettingsResponseDto,
  UserFollowResponseDto,
} from './dto';

/**
 * Controller responsible for handling meal plan related requests.
 * Route: /meal-plan
 */
@Controller('meal-plan')
@UseGuards(AuthGuard)
export class MealPlanController {
  constructor(
    @Inject(MEAL_PLAN_SERVICE)
    private readonly mealPlanService: IMealPlanService,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  private getUserId(): string {
    const store = this.als.getStore();
    const userId = store?.userId;
    if (!userId) {
      // Shouldn't happen if AuthGuard is used - indicates system issue
      throw new InternalServerErrorException('User context not available');
    }
    return userId;
  }

  //================================================== HEALTH PROFILE ==================================================

  /**
   * Gets the current user's health profile.
   * Creates a default profile if none exists.
   */
  @Get('health-profile')
  @HttpCode(HttpStatus.OK)
  getHealthProfile(): Promise<HealthProfileResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.getHealthProfile(userId).match(
      (profile) => new HealthProfileResponseDto(profile),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Updates the current user's health profile.
   */
  @Patch('health-profile')
  @HttpCode(HttpStatus.OK)
  updateHealthProfile(
    @Body() dto: UpdateHealthProfileDto,
  ): Promise<HealthProfileResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.updateHealthProfile(userId, dto).match(
      (profile) => new HealthProfileResponseDto(profile),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Calculates TDEE for the current user based on their health profile.
   */
  @Get('calculate-tdee')
  @HttpCode(HttpStatus.OK)
  calculateTdee(): Promise<{ tdee: number | null }> {
    const userId = this.getUserId();
    return this.mealPlanService.calculateTdee(userId).match(
      (tdee) => ({ tdee }),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== SETTINGS ==================================================

  /**
   * Gets complete meal plan settings (health profile + diet preferences + allergen exclusions).
   */
  @Get('settings')
  @HttpCode(HttpStatus.OK)
  getSettings(): Promise<MealPlanSettingsResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.getSettings(userId).match(
      (settings) =>
        new MealPlanSettingsResponseDto(
          new HealthProfileResponseDto(settings.healthProfile),
          settings.dietPreferences,
          settings.allergenExclusions,
        ),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Gets current user's diet preferences.
   */
  @Get('diet-preferences')
  @HttpCode(HttpStatus.OK)
  getDietPreferences(): Promise<DietPreferenceDto[]> {
    const userId = this.getUserId();
    return this.mealPlanService.getDietPreferences(userId).match(
      (prefs) => prefs.map((p) => new DietPreferenceDto(p)),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Sets current user's diet preferences (replaces all existing).
   */
  @Post('diet-preferences')
  @HttpCode(HttpStatus.NO_CONTENT)
  setDietPreferences(@Body() dto: UpdateDietPreferencesDto): Promise<void> {
    const userId = this.getUserId();
    return this.mealPlanService
      .setDietPreferences(userId, dto.dietTagIds)
      .match(
        () => undefined,
        (error) => {
          throw MealPlanErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Gets current user's allergen exclusions.
   */
  @Get('allergen-exclusions')
  @HttpCode(HttpStatus.OK)
  getAllergenExclusions(): Promise<AllergenExclusionDto[]> {
    const userId = this.getUserId();
    return this.mealPlanService.getAllergenExclusions(userId).match(
      (excls) => excls.map((e) => new AllergenExclusionDto(e)),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Sets current user's allergen exclusions (replaces all existing).
   */
  @Post('allergen-exclusions')
  @HttpCode(HttpStatus.NO_CONTENT)
  setAllergenExclusions(
    @Body() dto: UpdateAllergenExclusionsDto,
  ): Promise<void> {
    const userId = this.getUserId();
    return this.mealPlanService
      .setAllergenExclusions(userId, dto.allergenTagIds)
      .match(
        () => undefined,
        (error) => {
          throw MealPlanErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  //================================================== DAILY SUMMARY ==================================================

  /**
   * Gets daily summary for a specific date.
   */
  @Get('daily-summary')
  @HttpCode(HttpStatus.OK)
  getDailySummary(
    @Query() query: GetDailySummaryQueryDto,
  ): Promise<DailySummaryResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.getDailySummary(userId, query.date).match(
      (summary) => new DailySummaryResponseDto(summary),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Gets history for a date range.
   */
  @Get('history')
  @HttpCode(HttpStatus.OK)
  getHistory(
    @Query() query: GetHistoryQueryDto,
  ): Promise<{ date: Date; totalConsumed: number; totalBurned: number }[]> {
    const userId = this.getUserId();
    return this.mealPlanService
      .getHistory(userId, query.startDate, query.endDate)
      .match(
        (history) => history,
        (error) => {
          throw MealPlanErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Gets current and longest streak.
   */
  @Get('streak')
  @HttpCode(HttpStatus.OK)
  getStreak(): Promise<{ current: number; longest: number }> {
    const userId = this.getUserId();
    return this.mealPlanService.getStreak(userId).match(
      (streak) => streak,
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== MEAL LOGS ==================================================

  /**
   * Adds a meal from a purchased product.
   */
  @Post('meals/from-product')
  @HttpCode(HttpStatus.CREATED)
  addMealFromProduct(
    @Body() dto: AddMealFromProductDto,
  ): Promise<MealLogResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.addMealFromProduct(userId, dto).match(
      (log) => new MealLogResponseDto(log),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Adds a meal from a preset.
   */
  @Post('meals/from-preset')
  @HttpCode(HttpStatus.CREATED)
  addMealFromPreset(
    @Body() dto: AddMealFromPresetDto,
  ): Promise<MealLogResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.addMealFromPreset(userId, dto).match(
      (log) => new MealLogResponseDto(log),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Adds a custom meal with full nutrition info.
   */
  @Post('meals/custom')
  @HttpCode(HttpStatus.CREATED)
  addCustomMeal(@Body() dto: AddCustomMealDto): Promise<MealLogResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.addCustomMeal(userId, dto).match(
      (log) => new MealLogResponseDto(log),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Adds a quick meal with just calories.
   */
  @Post('meals/quick')
  @HttpCode(HttpStatus.CREATED)
  addQuickMeal(@Body() dto: AddQuickMealDto): Promise<MealLogResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.addQuickMeal(userId, dto).match(
      (log) => new MealLogResponseDto(log),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Updates a meal log (quantity and notes).
   */
  @Patch('meals/:logId')
  @HttpCode(HttpStatus.OK)
  updateMealLog(
    @Param('logId', ParseUUIDPipe) logId: string,
    @Body() dto: UpdateMealLogDto,
  ): Promise<MealLogResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.updateMealLog(userId, logId, dto).match(
      (log) => new MealLogResponseDto(log),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Deletes a meal log.
   */
  @Delete('meals/:logId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMealLog(@Param('logId', ParseUUIDPipe) logId: string): Promise<void> {
    const userId = this.getUserId();
    return this.mealPlanService.deleteMealLog(userId, logId).match(
      () => undefined,
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== EXERCISE LOGS ==================================================

  /**
   * Adds an exercise log.
   */
  @Post('exercise')
  @HttpCode(HttpStatus.CREATED)
  addExercise(@Body() dto: AddExerciseDto): Promise<ExerciseLogResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.addExercise(userId, dto).match(
      (log) => new ExerciseLogResponseDto(log),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Updates an exercise log.
   */
  @Patch('exercise/:logId')
  @HttpCode(HttpStatus.OK)
  updateExercise(
    @Param('logId', ParseUUIDPipe) logId: string,
    @Body() dto: UpdateExerciseDto,
  ): Promise<ExerciseLogResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.updateExercise(userId, logId, dto).match(
      (log) => new ExerciseLogResponseDto(log),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Deletes an exercise log.
   */
  @Delete('exercise/:logId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteExercise(@Param('logId', ParseUUIDPipe) logId: string): Promise<void> {
    const userId = this.getUserId();
    return this.mealPlanService.deleteExerciseLog(userId, logId).match(
      () => undefined,
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== PRESETS ==================================================

  /**
   * Gets current user's own presets.
   */
  @Get('presets/my')
  @HttpCode(HttpStatus.OK)
  getMyPresets(): Promise<PresetResponseDto[]> {
    const userId = this.getUserId();
    return this.mealPlanService.getMyPresets(userId).match(
      (presets) => presets.map((p) => new PresetResponseDto(p)),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Creates a new preset.
   */
  @Post('presets')
  @HttpCode(HttpStatus.CREATED)
  createPreset(@Body() dto: CreatePresetDto): Promise<PresetResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.createPreset(userId, dto).match(
      (preset) => new PresetResponseDto(preset),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Updates a preset.
   */
  @Patch('presets/:presetId')
  @HttpCode(HttpStatus.OK)
  updatePreset(
    @Param('presetId', ParseUUIDPipe) presetId: string,
    @Body() dto: UpdatePresetDto,
  ): Promise<PresetResponseDto> {
    const userId = this.getUserId();
    return this.mealPlanService.updatePreset(userId, presetId, dto).match(
      (preset) => new PresetResponseDto(preset),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Deletes a preset.
   */
  @Delete('presets/:presetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePreset(
    @Param('presetId', ParseUUIDPipe) presetId: string,
  ): Promise<void> {
    const userId = this.getUserId();
    return this.mealPlanService.deletePreset(userId, presetId).match(
      () => undefined,
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Searches community presets.
   */
  @Get('community-presets')
  @HttpCode(HttpStatus.OK)
  searchCommunityPresets(
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<{
    data: PresetResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const userId = this.getUserId();
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    return this.mealPlanService
      .searchCommunityPresets({
        userId,
        search,
        page: pageNum,
        limit: limitNum,
      })
      .match(
        (result) => ({
          data: result.data.map((p) => new PresetResponseDto(p)),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        }),
        (error) => {
          throw MealPlanErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Votes on a preset (up or down).
   */
  @Post('presets/:presetId/vote')
  @HttpCode(HttpStatus.NO_CONTENT)
  votePreset(
    @Param('presetId', ParseUUIDPipe) presetId: string,
    @Body() dto: VotePresetDto,
  ): Promise<void> {
    const userId = this.getUserId();
    return this.mealPlanService
      .votePreset(userId, presetId, dto.voteType)
      .match(
        () => undefined,
        (error) => {
          throw MealPlanErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Removes vote from a preset.
   */
  @Delete('presets/:presetId/vote')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeVote(
    @Param('presetId', ParseUUIDPipe) presetId: string,
  ): Promise<void> {
    const userId = this.getUserId();
    return this.mealPlanService.removeVote(userId, presetId).match(
      () => undefined,
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== FAVORITES ==================================================

  /**
   * Gets current user's favorite presets.
   */
  @Get('favorites')
  @HttpCode(HttpStatus.OK)
  getFavorites(): Promise<PresetResponseDto[]> {
    const userId = this.getUserId();
    return this.mealPlanService.getFavorites(userId).match(
      (presets) => presets.map((p) => new PresetResponseDto(p, null, true)),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Adds a preset to favorites.
   */
  @Post('favorites/:presetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  addFavorite(
    @Param('presetId', ParseUUIDPipe) presetId: string,
  ): Promise<void> {
    const userId = this.getUserId();
    return this.mealPlanService.addFavorite(userId, presetId).match(
      () => undefined,
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Removes a preset from favorites.
   */
  @Delete('favorites/:presetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFavorite(
    @Param('presetId', ParseUUIDPipe) presetId: string,
  ): Promise<void> {
    const userId = this.getUserId();
    return this.mealPlanService.removeFavorite(userId, presetId).match(
      () => undefined,
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== FOLLOWS ==================================================

  /**
   * Follows a user.
   */
  @Post('follow/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  follow(@Param('userId', ParseUUIDPipe) followingId: string): Promise<void> {
    const userId = this.getUserId();
    return this.mealPlanService.follow(userId, followingId).match(
      () => undefined,
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Unfollows a user.
   */
  @Delete('follow/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unfollow(@Param('userId', ParseUUIDPipe) followingId: string): Promise<void> {
    const userId = this.getUserId();
    return this.mealPlanService.unfollow(userId, followingId).match(
      () => undefined,
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Gets users the current user is following.
   */
  @Get('following')
  @HttpCode(HttpStatus.OK)
  getFollowing(): Promise<UserFollowResponseDto[]> {
    const userId = this.getUserId();
    return this.mealPlanService.getFollowing(userId).match(
      (users) => users.map((u) => new UserFollowResponseDto(u, true)),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Gets users following the current user.
   * Note: isFollowing status is not included - use is-following/:userId endpoint if needed.
   */
  @Get('followers')
  @HttpCode(HttpStatus.OK)
  getFollowers(): Promise<UserFollowResponseDto[]> {
    const userId = this.getUserId();
    return this.mealPlanService.getFollowers(userId).match(
      (users) => users.map((u) => new UserFollowResponseDto(u, false)),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Checks if current user is following another user.
   */
  @Get('is-following/:userId')
  @HttpCode(HttpStatus.OK)
  isFollowing(
    @Param('userId', ParseUUIDPipe) targetUserId: string,
  ): Promise<{ isFollowing: boolean }> {
    const userId = this.getUserId();
    return this.mealPlanService.isFollowing(userId, targetUserId).match(
      (isFollowing) => ({ isFollowing }),
      (error) => {
        throw MealPlanErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}
