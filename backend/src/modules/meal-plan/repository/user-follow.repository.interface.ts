import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface UserFollowInfo {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  presetCount: number;
  totalLikes: number;
  totalDislikes: number;
}

export interface IUserFollowRepository {
  /**
   * Follow a user.
   */
  follow(followerId: string, followingId: string): ResultAsync<void, DomainError>;

  /**
   * Unfollow a user.
   */
  unfollow(followerId: string, followingId: string): ResultAsync<void, DomainError>;

  /**
   * Check if user is following another user.
   */
  isFollowing(followerId: string, followingId: string): ResultAsync<boolean, DomainError>;

  /**
   * Get users that a user is following.
   */
  getFollowing(userId: string): ResultAsync<UserFollowInfo[], DomainError>;

  /**
   * Get users that follow a user.
   */
  getFollowers(userId: string): ResultAsync<UserFollowInfo[], DomainError>;

  /**
   * Get follower count for a user.
   */
  getFollowerCount(userId: string): ResultAsync<number, DomainError>;

  /**
   * Get following count for a user.
   */
  getFollowingCount(userId: string): ResultAsync<number, DomainError>;
}
