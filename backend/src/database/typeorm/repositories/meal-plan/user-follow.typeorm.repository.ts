import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { v7 as uuidv7 } from 'uuid';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import {
  IUserFollowRepository,
  UserFollowInfo,
} from 'src/modules/meal-plan/repository/user-follow.repository.interface';
import { ORMUserFollow, ORMFoodPreset } from '../../entities/meal-plan';
import { ORMUserCore } from '../../entities/user';

@Injectable()
export class OrmUserFollowRepository implements IUserFollowRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  follow(
    followerId: string,
    followingId: string,
  ): ResultAsync<void, DomainError> {
    const repo = this.getRepository();
    const follow = new ORMUserFollow();
    follow.id = uuidv7();
    follow.followerId = followerId;
    follow.followingId = followingId;

    return ResultAsync.fromPromise(
      repo.upsert(follow, ['followerId', 'followingId']),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  unfollow(
    followerId: string,
    followingId: string,
  ): ResultAsync<void, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.delete({ followerId, followingId }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  isFollowing(
    followerId: string,
    followingId: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.exists({ where: { followerId, followingId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  getFollowing(userId: string): ResultAsync<UserFollowInfo[], DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;

    return ResultAsync.fromPromise(
      em
        .createQueryBuilder(ORMUserFollow, 'follow')
        .innerJoin(
          ORMUserCore,
          'user',
          '"user"."id" = "follow"."following_id" AND "user"."deleted_at" IS NULL',
        )
        .leftJoin(
          (qb) =>
            qb
              .select('"preset"."creator_id"', 'creatorId')
              .addSelect('COUNT(*)', 'presetCount')
              .addSelect(
                'COALESCE(SUM("preset"."upvote_count"), 0)',
                'totalLikes',
              )
              .addSelect(
                'COALESCE(SUM("preset"."downvote_count"), 0)',
                'totalDislikes',
              )
              .from(ORMFoodPreset, 'preset')
              .where('"preset"."is_public" = true')
              .groupBy('"preset"."creator_id"'),
          'presetStats',
          '"presetStats"."creatorId" = "follow"."following_id"',
        )
        .select([
          '"follow"."following_id" AS "userId"',
          '"user"."full_name" AS "displayName"',
          '"user"."avatar_url" AS "avatarUrl"',
          'COALESCE("presetStats"."presetCount", 0) AS "presetCount"',
          'COALESCE("presetStats"."totalLikes", 0) AS "totalLikes"',
          'COALESCE("presetStats"."totalDislikes", 0) AS "totalDislikes"',
        ])
        .where('"follow"."follower_id" = :userId', { userId })
        .orderBy('"follow"."created_at"', 'DESC')
        .getRawMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((results) =>
      results.map((r) => ({
        userId: r.userId,
        displayName: r.displayName,
        avatarUrl: r.avatarUrl,
        presetCount: parseInt(r.presetCount, 10),
        totalLikes: parseInt(r.totalLikes, 10),
        totalDislikes: parseInt(r.totalDislikes, 10),
      })),
    );
  }

  @WithPosition()
  getFollowers(userId: string): ResultAsync<UserFollowInfo[], DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;

    return ResultAsync.fromPromise(
      em
        .createQueryBuilder(ORMUserFollow, 'follow')
        .innerJoin(
          ORMUserCore,
          'user',
          '"user"."id" = "follow"."follower_id" AND "user"."deleted_at" IS NULL',
        )
        .leftJoin(
          (qb) =>
            qb
              .select('"preset"."creator_id"', 'creatorId')
              .addSelect('COUNT(*)', 'presetCount')
              .addSelect(
                'COALESCE(SUM("preset"."upvote_count"), 0)',
                'totalLikes',
              )
              .addSelect(
                'COALESCE(SUM("preset"."downvote_count"), 0)',
                'totalDislikes',
              )
              .from(ORMFoodPreset, 'preset')
              .where('"preset"."is_public" = true')
              .groupBy('"preset"."creator_id"'),
          'presetStats',
          '"presetStats"."creatorId" = "follow"."follower_id"',
        )
        .select([
          '"follow"."follower_id" AS "userId"',
          '"user"."full_name" AS "displayName"',
          '"user"."avatar_url" AS "avatarUrl"',
          'COALESCE("presetStats"."presetCount", 0) AS "presetCount"',
          'COALESCE("presetStats"."totalLikes", 0) AS "totalLikes"',
          'COALESCE("presetStats"."totalDislikes", 0) AS "totalDislikes"',
        ])
        .where('"follow"."following_id" = :userId', { userId })
        .orderBy('"follow"."created_at"', 'DESC')
        .getRawMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((results) =>
      results.map((r) => ({
        userId: r.userId,
        displayName: r.displayName,
        avatarUrl: r.avatarUrl,
        presetCount: parseInt(r.presetCount, 10),
        totalLikes: parseInt(r.totalLikes, 10),
        totalDislikes: parseInt(r.totalDislikes, 10),
      })),
    );
  }

  @WithPosition()
  getFollowerCount(userId: string): ResultAsync<number, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.count({ where: { followingId: userId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  getFollowingCount(userId: string): ResultAsync<number, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.count({ where: { followerId: userId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMUserFollow);
  }
}
