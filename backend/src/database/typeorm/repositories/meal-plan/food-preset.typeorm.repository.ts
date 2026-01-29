import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, In } from 'typeorm';
import { ResultAsync, okAsync } from 'neverthrow';
import { v7 as uuidv7 } from 'uuid';

/**
 * Normalize Vietnamese text for search:
 * - Remove diacritics (á -> a, ế -> e, etc.)
 * - Remove spaces and special characters
 * - Convert to lowercase
 */
function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]/g, ''); // Remove spaces and special chars
}
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import {
  IFoodPresetRepository,
  PaginatedPresets,
  SearchPresetsWithPriorityResult,
} from 'src/modules/meal-plan/repository/food-preset.repository.interface';
import { FoodPreset } from 'src/modules/meal-plan/models/food-preset.model';
import { VoteType } from '../../entities/meal-plan/enums/vote-type.enum';
import {
  ORMFoodPreset,
  ORMPresetReaction,
  ORMFavoritePreset,
} from '../../entities/meal-plan';
import { ORMFoodPresetMapper } from '../../mappers/food-preset.mapper.orm';

@Injectable()
export class OrmFoodPresetRepository implements IFoodPresetRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findById(id: string): ResultAsync<FoodPreset | null, DomainError> {
    const repo = this.getPresetRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { id } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMFoodPresetMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findByCreatorId(creatorId: string): ResultAsync<FoodPreset[], DomainError> {
    const repo = this.getPresetRepository();
    return ResultAsync.fromPromise(
      repo.find({
        where: { creatorId },
        order: { createdAt: 'DESC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMFoodPresetMapper.toDomainList(orms));
  }

  @WithPosition()
  searchPublic(params: {
    search?: string;
    page: number;
    limit: number;
  }): ResultAsync<PaginatedPresets, DomainError> {
    const repo = this.getPresetRepository();
    const { search, page, limit } = params;
    const skip = (page - 1) * limit;

    // If no search term, return all public presets with pagination
    if (!search || !search.trim()) {
      return ResultAsync.fromPromise(
        Promise.all([
          repo.find({
            where: { isPublic: true },
            order: { upvoteCount: 'DESC', createdAt: 'DESC' },
            skip,
            take: limit,
          }),
          repo.count({ where: { isPublic: true } }),
        ]),
        (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      ).map(([orms, total]) => ({
        data: ORMFoodPresetMapper.toDomainList(orms),
        total,
        page,
        limit,
      }));
    }

    // Normalize search term for Vietnamese text matching
    const normalizedSearch = normalizeVietnamese(search);

    // Fetch all public presets and filter in application layer
    // This allows proper Vietnamese diacritics and space-insensitive matching
    return ResultAsync.fromPromise(
      repo.find({
        where: { isPublic: true },
        order: { upvoteCount: 'DESC', createdAt: 'DESC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => {
      // Filter presets by normalized name matching
      const filtered = orms.filter((orm) => {
        const normalizedName = normalizeVietnamese(orm.name);
        return normalizedName.includes(normalizedSearch);
      });

      // Apply pagination to filtered results
      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit);

      return {
        data: ORMFoodPresetMapper.toDomainList(paginated),
        total,
        page,
        limit,
      };
    });
  }

  @WithPosition()
  searchPublicWithPriority(params: {
    search?: string;
    page: number;
    limit: number;
    followedUserIds: string[];
  }): ResultAsync<SearchPresetsWithPriorityResult, DomainError> {
    const repo = this.getPresetRepository();
    const { search, page, limit, followedUserIds } = params;
    const skip = (page - 1) * limit;
    const hasFollowedUsers = followedUserIds.length > 0;

    // Get top 5 presets from followed users (for suggestions)
    const getSuggestedPromise = hasFollowedUsers
      ? repo.find({
          where: { isPublic: true, creatorId: In(followedUserIds) },
          order: { upvoteCount: 'DESC', createdAt: 'DESC' },
          take: 5,
        }).catch(() => [])
      : Promise.resolve([]);

    // If no search term, return suggestions + regular results
    if (!search || !search.trim()) {
      return ResultAsync.fromPromise(
        Promise.all([
          getSuggestedPromise,
          repo.find({
            where: { isPublic: true },
            order: { upvoteCount: 'DESC', createdAt: 'DESC' },
            skip,
            take: limit,
          }),
          repo.count({ where: { isPublic: true } }),
        ]),
        (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      ).map(([suggested, orms, total]) => ({
        data: ORMFoodPresetMapper.toDomainList(orms),
        total,
        page,
        limit,
        suggestedFromFollowed: ORMFoodPresetMapper.toDomainList(suggested),
      }));
    }

    // With search term: fetch all and filter, prioritizing followed users
    const normalizedSearch = normalizeVietnamese(search);

    return ResultAsync.fromPromise(
      Promise.all([
        getSuggestedPromise,
        repo.find({
          where: { isPublic: true },
          order: { upvoteCount: 'DESC', createdAt: 'DESC' },
        }),
      ]),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([suggested, orms]) => {
      // Filter by search term
      const filtered = orms.filter((orm) => {
        const normalizedName = normalizeVietnamese(orm.name);
        return normalizedName.includes(normalizedSearch);
      });

      // Sort: followed users first, then by upvote count
      const followedSet = new Set(followedUserIds);
      filtered.sort((a, b) => {
        const aFollowed = followedSet.has(a.creatorId) ? 1 : 0;
        const bFollowed = followedSet.has(b.creatorId) ? 1 : 0;
        if (aFollowed !== bFollowed) {
          return bFollowed - aFollowed; // Followed users come first
        }
        return b.upvoteCount - a.upvoteCount;
      });

      // Apply pagination
      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit);

      return {
        data: ORMFoodPresetMapper.toDomainList(paginated),
        total,
        page,
        limit,
        suggestedFromFollowed: ORMFoodPresetMapper.toDomainList(suggested),
      };
    });
  }

  @WithPosition()
  getTopPresetsByCreators(
    creatorIds: string[],
    limit: number,
  ): ResultAsync<FoodPreset[], DomainError> {
    if (creatorIds.length === 0) {
      return okAsync([]);
    }

    const repo = this.getPresetRepository();
    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('preset')
        .where('preset.isPublic = :isPublic', { isPublic: true })
        .andWhere('preset.creatorId IN (:...creatorIds)', { creatorIds })
        .orderBy('preset.upvoteCount', 'DESC')
        .addOrderBy('preset.createdAt', 'DESC')
        .take(limit)
        .getMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMFoodPresetMapper.toDomainList(orms));
  }

  @WithPosition()
  create(preset: FoodPreset): ResultAsync<FoodPreset, DomainError> {
    const repo = this.getPresetRepository();
    const orm = ORMFoodPresetMapper.toOrm(preset);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMFoodPresetMapper.toDomain(saved));
  }

  @WithPosition()
  update(preset: FoodPreset): ResultAsync<FoodPreset, DomainError> {
    const repo = this.getPresetRepository();
    const orm = ORMFoodPresetMapper.toOrm(preset);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMFoodPresetMapper.toDomain(saved));
  }

  @WithPosition()
  delete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getPresetRepository();
    return ResultAsync.fromPromise(repo.delete(id), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  upsertVote(
    presetId: string,
    userId: string,
    voteType: VoteType,
  ): ResultAsync<void, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;

    return ResultAsync.fromPromise(
      em.transaction(async (txManager) => {
        const reactionRepo = txManager.getRepository(ORMPresetReaction);
        const presetRepo = txManager.getRepository(ORMFoodPreset);

        // Find existing reaction
        const existing = await reactionRepo.findOne({
          where: { presetId, userId },
        });

        const oldVoteType = existing?.voteType;

        if (existing) {
          // Update existing reaction
          existing.voteType = voteType;
          existing.updatedAt = new Date();
          await reactionRepo.save(existing);
        } else {
          // Create new reaction
          const reaction = new ORMPresetReaction();
          reaction.id = uuidv7();
          reaction.presetId = presetId;
          reaction.userId = userId;
          reaction.voteType = voteType;
          await reactionRepo.save(reaction);
        }

        // Update preset vote counts
        const preset = await presetRepo.findOne({ where: { id: presetId } });
        if (preset) {
          // Reverse old vote if exists
          if (oldVoteType === VoteType.UP) {
            preset.upvoteCount = Math.max(0, preset.upvoteCount - 1);
          } else if (oldVoteType === VoteType.DOWN) {
            preset.downvoteCount = Math.max(0, preset.downvoteCount - 1);
          }

          // Apply new vote
          if (voteType === VoteType.UP) {
            preset.upvoteCount++;
          } else {
            preset.downvoteCount++;
          }

          await presetRepo.save(preset);
        }
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  removeVote(presetId: string, userId: string): ResultAsync<void, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;

    return ResultAsync.fromPromise(
      em.transaction(async (txManager) => {
        const reactionRepo = txManager.getRepository(ORMPresetReaction);
        const presetRepo = txManager.getRepository(ORMFoodPreset);

        const existing = await reactionRepo.findOne({
          where: { presetId, userId },
        });

        if (existing) {
          // Update preset vote counts
          const preset = await presetRepo.findOne({ where: { id: presetId } });
          if (preset) {
            if (existing.voteType === VoteType.UP) {
              preset.upvoteCount = Math.max(0, preset.upvoteCount - 1);
            } else {
              preset.downvoteCount = Math.max(0, preset.downvoteCount - 1);
            }
            await presetRepo.save(preset);
          }

          await reactionRepo.delete({ presetId, userId });
        }
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  getUserVote(
    presetId: string,
    userId: string,
  ): ResultAsync<VoteType | null, DomainError> {
    const repo = this.getReactionRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { presetId, userId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? orm.voteType : null));
  }

  @WithPosition()
  incrementUseCount(presetId: string): ResultAsync<void, DomainError> {
    const repo = this.getPresetRepository();
    return ResultAsync.fromPromise(
      repo.increment({ id: presetId }, 'useCount', 1),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  addFavorite(userId: string, presetId: string): ResultAsync<void, DomainError> {
    const repo = this.getFavoriteRepository();
    const favorite = new ORMFavoritePreset();
    favorite.id = uuidv7();
    favorite.userId = userId;
    favorite.presetId = presetId;

    return ResultAsync.fromPromise(
      repo.upsert(favorite, ['userId', 'presetId']),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  removeFavorite(userId: string, presetId: string): ResultAsync<void, DomainError> {
    const repo = this.getFavoriteRepository();
    return ResultAsync.fromPromise(
      repo.delete({ userId, presetId }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  getFavorites(userId: string): ResultAsync<FoodPreset[], DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return ResultAsync.fromPromise(
      em
        .createQueryBuilder(ORMFavoritePreset, 'fav')
        .innerJoinAndSelect('fav.preset', 'preset')
        .where('fav.userId = :userId', { userId })
        .orderBy('fav.createdAt', 'DESC')
        .getMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((favorites) =>
      favorites.map((fav) => ORMFoodPresetMapper.toDomain(fav.preset)),
    );
  }

  @WithPosition()
  isFavorite(userId: string, presetId: string): ResultAsync<boolean, DomainError> {
    const repo = this.getFavoriteRepository();
    return ResultAsync.fromPromise(
      repo.exists({ where: { userId, presetId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getPresetRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMFoodPreset);
  }

  private getReactionRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMPresetReaction);
  }

  private getFavoriteRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMFavoritePreset);
  }
}
