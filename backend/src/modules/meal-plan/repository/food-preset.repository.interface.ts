import type { ResultAsync } from 'neverthrow';
import type { FoodPreset } from '../models/food-preset.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { VoteType } from 'src/database/typeorm/entities/meal-plan/enums/vote-type.enum';

export interface PresetFilter {
  creatorId?: string;
  isPublic?: boolean;
  search?: string;
}

export interface PaginatedPresets {
  data: FoodPreset[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchPresetsWithPriorityResult {
  data: FoodPreset[];
  total: number;
  page: number;
  limit: number;
  suggestedFromFollowed: FoodPreset[];
}

export interface IFoodPresetRepository {
  /**
   * Finds preset by its ID.
   */
  findById(id: string): ResultAsync<FoodPreset | null, DomainError>;

  /**
   * Finds presets by creator ID.
   */
  findByCreatorId(creatorId: string): ResultAsync<FoodPreset[], DomainError>;

  /**
   * Search public presets with pagination.
   */
  searchPublic(params: {
    search?: string;
    page: number;
    limit: number;
  }): ResultAsync<PaginatedPresets, DomainError>;

  /**
   * Search public presets with priority for followed users.
   * When no search term: returns top 5 presets from followed users + regular results.
   * When searching: prioritizes presets from followed users in results.
   */
  searchPublicWithPriority(params: {
    search?: string;
    page: number;
    limit: number;
    followedUserIds: string[];
  }): ResultAsync<SearchPresetsWithPriorityResult, DomainError>;

  /**
   * Get top presets from specific users (by upvote count).
   */
  getTopPresetsByCreators(creatorIds: string[], limit: number): ResultAsync<FoodPreset[], DomainError>;

  /**
   * Creates a preset.
   */
  create(preset: FoodPreset): ResultAsync<FoodPreset, DomainError>;

  /**
   * Updates a preset.
   */
  update(preset: FoodPreset): ResultAsync<FoodPreset, DomainError>;

  /**
   * Deletes a preset.
   */
  delete(id: string): ResultAsync<void, DomainError>;

  /**
   * Add or update user vote on preset.
   */
  upsertVote(presetId: string, userId: string, voteType: VoteType): ResultAsync<void, DomainError>;

  /**
   * Remove user vote from preset.
   */
  removeVote(presetId: string, userId: string): ResultAsync<void, DomainError>;

  /**
   * Get user's vote on a preset.
   */
  getUserVote(presetId: string, userId: string): ResultAsync<VoteType | null, DomainError>;

  /**
   * Increment use count for a preset.
   */
  incrementUseCount(presetId: string): ResultAsync<void, DomainError>;

  /**
   * Add preset to user favorites.
   */
  addFavorite(userId: string, presetId: string): ResultAsync<void, DomainError>;

  /**
   * Remove preset from user favorites.
   */
  removeFavorite(userId: string, presetId: string): ResultAsync<void, DomainError>;

  /**
   * Get user's favorite presets.
   */
  getFavorites(userId: string): ResultAsync<FoodPreset[], DomainError>;

  /**
   * Check if preset is favorited by user.
   */
  isFavorite(userId: string, presetId: string): ResultAsync<boolean, DomainError>;
}
