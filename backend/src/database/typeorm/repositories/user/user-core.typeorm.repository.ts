import { Injectable } from '@nestjs/common';
import {
  IUserCoreRepository,
  AdminUserFilter,
} from 'src/modules/user/repository/user-core.repository.interface';
import { ORMUserMapper } from '../../mappers/user.mapper.orm';
import { User } from 'src/modules/user/models/user.model';
import { UserStatus } from 'src/modules/user/enums/user-status.enum';
import { AsyncLocalStorage } from 'async_hooks';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { DataSource, ILike, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ORMUserCore } from '../../entities';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { USER_ERRORS } from 'src/modules/user/errors/user.errors';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { isQueryFailedPostgresError } from '../../guards/type-guard.database';
import { PG_UNIQUE_VIOLATION } from 'src/database/constant/postgresql-error.constant';
import { sanitizePostgresError } from '../../guards/sanitize-postgres-error.util';
import {
  PaginatedResult,
  PaginationParams,
  createPaginatedResult,
} from 'src/shared/types/pagination.type';

@Injectable()
export class OrmUserCoreRepository implements IUserCoreRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Finds a user by their phone number.
   * @param phone - The user's phone number
   * @returns The User domain model or null if not found. In case of system error, returns appropriate UserErrorType.
   */
  @WithPosition()
  findUserByPhone(phone: string): ResultAsync<User | null, DomainError> {
    const repo = this.getUserRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { phoneNumber: phone } }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ormUser) => {
      if (!ormUser) return null;
      return ORMUserMapper.toDomain(ormUser);
    });
  }

  /**
   * Checks if a username is available.
   * @param username - The username to check for availability.
   * @returns True if the username is available (not in DB or soft-deleted), false if taken. In case of system error, returns appropriate UserErrorType.
   */
  @WithPosition()
  isUsernameAvailable(username: string): ResultAsync<boolean, DomainError> {
    const repo = this.getUserRepository();
    return ResultAsync.fromPromise(
      repo.exists({ where: { username } }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((exists) => !exists); // Negate: if exists (true) -> unavailable (false), if not exists (false) -> available (true)
  }

  /**
   * creates a new user when using phone number registration
   * @param phoneNumber Phone number of the new user
   * @param username Username wanted for new user
   * @param password Password wanted for new user
   * @return ResultAsync that resolves to created User instance if success, otherwise return DomainError
   */
  @WithPosition()
  createUserWithPhone(user: User): ResultAsync<User, DomainError> {
    const repo = this.getUserRepository();
    const ormUser = ORMUserMapper.toOrm(user);
    return ResultAsync.fromPromise(repo.save(ormUser), (error) => {
      // Check if it's a PostgreSQL QueryFailedError using type guard
      if (isQueryFailedPostgresError(error)) {
        // Sanitize the error to remove sensitive database information
        const safeError = sanitizePostgresError(error.driverError);

        // Check if it's a unique constraint violation
        if (error.driverError.code === PG_UNIQUE_VIOLATION) {
          // Check if the violation is for the username field using constraint name
          if (error.driverError.constraint === 'user_core_username_key') {
            return createDomainError(USER_ERRORS.USERNAME_ALREADY_EXISTS, {
              cause: safeError,
            });
          }
        }
      }

      // For other database errors, return generic DB_ERROR
      return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
    }).map((createdOrmUser) => ORMUserMapper.toDomain(createdOrmUser));
  }

  /**
   * Finds a user by their username.
   * @param username - The username to search for.
   * @returns The User domain model or null if not found. In case of system error, returns appropriate DomainError.
   */
  @WithPosition()
  findUserByUsername(username: string): ResultAsync<User | null, DomainError> {
    const repo = this.getUserRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { username } }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ormUser) => {
      if (!ormUser) return null;
      return ORMUserMapper.toDomain(ormUser);
    });
  }

  /**
   * Finds a user by their email address.
   * @param email - The email address to search for.
   * @returns The User domain model or null if not found. In case of system error, returns appropriate DomainError.
   */
  @WithPosition()
  findUserByEmail(email: string): ResultAsync<User | null, DomainError> {
    const repo = this.getUserRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { email } }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ormUser) => {
      if (!ormUser) return null;
      return ORMUserMapper.toDomain(ormUser);
    });
  }

  /**
   * Finds a user by their ID.
   * @param userId - The user's ID.
   * @returns The User domain model or null if not found. In case of system error, returns appropriate DomainError.
   */
  @WithPosition()
  findUserById(userId: string): ResultAsync<User | null, DomainError> {
    const repo = this.getUserRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { id: userId } }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ormUser) => {
      if (!ormUser) return null;
      return ORMUserMapper.toDomain(ormUser);
    });
  }

  /**
   * Updates an existing user's information.
   * Uses update() instead of save() to prevent accidental creation of new records.
   * @param user - The User domain model with updated fields.
   * @returns ResultAsync that resolves to the updated User instance on success, or DomainError on failure.
   */
  @WithPosition()
  updateUser(user: User): ResultAsync<User, DomainError> {
    const repo = this.getUserRepository();
    const ormUser = ORMUserMapper.toOrm(user);

    // Use update() to only update existing records, not create new ones
    return ResultAsync.fromPromise(repo.update(user.id, ormUser), (error) => {
      return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
    }).andThen((updateResult) => {
      // Check if any rows were affected (user doesn't exist in database)
      if (updateResult.affected === 0) {
        return errAsync(
          createDomainError(SHARED_ERRORS.DB_ERROR, {
            cause: SHARED_ERRORS.DB_ERROR.message,
          }),
        );
      }

      // Fetch the updated user from database to ensure we have the latest state
      return ResultAsync.fromPromise(
        repo.findOne({ where: { id: user.id } }),
        (error) => {
          return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
        },
      ).andThen((updatedOrmUser) => {
        if (!updatedOrmUser) {
          return errAsync(
            createDomainError(SHARED_ERRORS.DB_ERROR, {
              cause: SHARED_ERRORS.DB_ERROR.message,
            }),
          );
        }
        return ResultAsync.fromSafePromise(
          Promise.resolve(ORMUserMapper.toDomain(updatedOrmUser)),
        );
      });
    });
  }

  /**
   * Gets the current EntityManager from AsyncLocalStorage, if available.
   * @returns The EntityManager or null if not found
   */
  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getUserRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMUserCore);
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Finds all users with pagination and optional filters (admin).
   * @param pagination - Pagination parameters (page, limit).
   * @param filter - Optional filter criteria (search, status, date range).
   * @returns Paginated list of User domain models.
   */
  @WithPosition()
  findAllUsers(
    pagination: PaginationParams,
    filter?: AdminUserFilter,
  ): ResultAsync<PaginatedResult<User>, DomainError> {
    const repo = this.getUserRepository();
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build query with QueryBuilder for complex filtering
    const queryBuilder = repo
      .createQueryBuilder('user')
      .withDeleted(); // Include soft-deleted users for admin view

    // Apply search filter (username, phone, email)
    if (filter?.search) {
      const searchTerm = `%${filter.search}%`;
      queryBuilder.andWhere(
        '(user.username ILIKE :search OR user.phoneNumber ILIKE :search OR user.email ILIKE :search OR user.fullName ILIKE :search)',
        { search: searchTerm },
      );
    }

    // Apply status filter
    if (filter?.status) {
      queryBuilder.andWhere('user.status = :status', { status: filter.status });
    }

    // Apply date range filter (createdAt)
    if (filter?.fromDate && filter?.toDate) {
      queryBuilder.andWhere('user.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: filter.fromDate,
        toDate: filter.toDate,
      });
    } else if (filter?.fromDate) {
      queryBuilder.andWhere('user.createdAt >= :fromDate', {
        fromDate: filter.fromDate,
      });
    } else if (filter?.toDate) {
      queryBuilder.andWhere('user.createdAt <= :toDate', {
        toDate: filter.toDate,
      });
    }

    // Order by createdAt descending (newest first)
    queryBuilder.orderBy('user.createdAt', 'DESC');

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    return ResultAsync.fromPromise(
      queryBuilder.getManyAndCount(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([ormUsers, total]) => {
      const users = ormUsers.map((ormUser) => ORMUserMapper.toDomain(ormUser));
      return createPaginatedResult(users, total, page, limit);
    });
  }

  /**
   * Soft deletes a user by ID (admin).
   * Sets deletedAt timestamp and status to DELETED.
   * @param userId - The user ID to soft delete.
   * @returns void on success, DomainError on failure.
   */
  @WithPosition()
  softDeleteUser(userId: string): ResultAsync<void, DomainError> {
    const repo = this.getUserRepository();

    // First check if user exists
    return ResultAsync.fromPromise(
      repo.findOne({ where: { id: userId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((user) => {
      if (!user) {
        return errAsync(
          createDomainError(USER_ERRORS.USER_NOT_FOUND, { cause: null }),
        );
      }

      // Perform soft delete and set status to DELETED
      return ResultAsync.fromPromise(
        repo.update(userId, {
          status: UserStatus.DELETED,
          deletedAt: new Date(),
        }),
        (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      ).map(() => undefined);
    });
  }
}
