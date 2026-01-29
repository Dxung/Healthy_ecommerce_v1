import { Injectable } from '@nestjs/common';
import { IShopRegistrationRequestRepository } from 'src/modules/shop/repository/shop-registration-request.repository.interface';
import { ORMShopRegistrationRequestMapper } from '../../mappers/shop-registration-request.mapper.orm';
import { ShopRegistrationRequest } from 'src/modules/shop/models/shop-registration-request.model';
import { AsyncLocalStorage } from 'async_hooks';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { DataSource } from 'typeorm';
import {
  ORMShopRegistrationRequest,
  ORMShopRegistrationDocument,
  ORMShopRegistrationBrandDocument,
} from '../../entities/shop';
import { ShopRegistrationStatus } from '../../entities/shop/enums/shop-registration-status.enum';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { SHOP_ERRORS } from 'src/modules/shop/errors/shop.errors';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { isQueryFailedPostgresError } from '../../guards/type-guard.database';
import { PG_UNIQUE_VIOLATION } from 'src/database/constant/postgresql-error.constant';
import { sanitizePostgresError } from '../../guards/sanitize-postgres-error.util';

@Injectable()
export class OrmShopRegistrationRequestRepository
  implements IShopRegistrationRequestRepository
{
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new shop registration request with its documents.
   */
  @WithPosition()
  create(
    request: ShopRegistrationRequest,
  ): ResultAsync<ShopRegistrationRequest, DomainError> {
    const registrationRepo = this.getRegistrationRepository();
    const documentRepo = this.getDocumentRepository();
    const brandDocumentRepo = this.getBrandDocumentRepository();

    const ormRequest = ORMShopRegistrationRequestMapper.toOrm(request);

    // Save the main request first
    return ResultAsync.fromPromise(
      registrationRepo.save(ormRequest),
      (error) => {
        // Check if it's a PostgreSQL QueryFailedError using type guard
        if (isQueryFailedPostgresError(error)) {
          // Sanitize the error to remove sensitive database information
          const safeError = sanitizePostgresError(error.driverError);

          // Check if it's a unique constraint violation
          if (error.driverError.code === PG_UNIQUE_VIOLATION) {
            // Check constraint name to determine which field caused the violation
            if (
              error.driverError.constraint ===
              'shop_registration_requests_slug_key'
            ) {
              return createDomainError(SHOP_ERRORS.SLUG_ALREADY_EXISTS, {
                cause: safeError,
              });
            }
            if (
              error.driverError.constraint ===
              'shop_registration_requests_name_key'
            ) {
              return createDomainError(SHOP_ERRORS.SHOP_NAME_ALREADY_EXISTS, {
                cause: safeError,
              });
            }
            // Partial unique index for pending registrations per user
            if (error.driverError.constraint === 'idx_shop_reg_user_pending') {
              return createDomainError(
                SHOP_ERRORS.ALREADY_HAS_PENDING_REQUEST,
                {
                  cause: safeError,
                },
              );
            }
          }
        }

        // For other database errors, return generic DB_ERROR
        return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
      },
    ).andThen((savedRequest) => {
      // Save documents if any
      const documents = ormRequest.documents || [];
      const brandDocuments = ormRequest.brandDocuments || [];

      const saveDocumentsPromise =
        documents.length > 0
          ? documentRepo.save(documents)
          : Promise.resolve([]);

      const saveBrandDocumentsPromise =
        brandDocuments.length > 0
          ? brandDocumentRepo.save(brandDocuments)
          : Promise.resolve([]);

      return ResultAsync.fromPromise(
        Promise.all([saveDocumentsPromise, saveBrandDocumentsPromise]),
        (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      ).andThen(() => {
        // Fetch the complete request with relations
        return this.findById(savedRequest.id).andThen((result) => {
          if (!result) {
            return errAsync(
              createDomainError(SHARED_ERRORS.DB_ERROR, {
                cause: 'Failed to fetch created registration',
              }),
            );
          }
          return okAsync(result);
        });
      });
    });
  }

  /**
   * Finds a registration request by its ID.
   */
  @WithPosition()
  findById(
    id: string,
  ): ResultAsync<ShopRegistrationRequest | null, DomainError> {
    const repo = this.getRegistrationRepository();
    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id },
        relations: ['documents', 'brandDocuments'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormRequest) => {
      if (!ormRequest) return null;
      return ORMShopRegistrationRequestMapper.toDomain(ormRequest);
    });
  }

  /**
   * Finds a registration request by user ID (any status).
   */
  @WithPosition()
  findByUserId(
    userId: string,
  ): ResultAsync<ShopRegistrationRequest | null, DomainError> {
    const repo = this.getRegistrationRepository();
    return ResultAsync.fromPromise(
      repo.findOne({
        where: { userId },
        relations: ['documents', 'brandDocuments'],
        order: { createdAt: 'DESC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormRequest) => {
      if (!ormRequest) return null;
      return ORMShopRegistrationRequestMapper.toDomain(ormRequest);
    });
  }

  /**
   * Finds a pending registration request by user ID.
   */
  @WithPosition()
  findPendingByUserId(
    userId: string,
  ): ResultAsync<ShopRegistrationRequest | null, DomainError> {
    const repo = this.getRegistrationRepository();
    return ResultAsync.fromPromise(
      repo.findOne({
        where: { userId, status: ShopRegistrationStatus.PENDING },
        relations: ['documents', 'brandDocuments'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormRequest) => {
      if (!ormRequest) return null;
      return ORMShopRegistrationRequestMapper.toDomain(ormRequest);
    });
  }

  /**
   * Finds all registration requests by status.
   */
  @WithPosition()
  findAllByStatus(
    status: ShopRegistrationStatus,
  ): ResultAsync<ShopRegistrationRequest[], DomainError> {
    const repo = this.getRegistrationRepository();
    return ResultAsync.fromPromise(
      repo.find({
        where: { status },
        relations: ['documents', 'brandDocuments'],
        order: { createdAt: 'DESC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormRequests) =>
      ORMShopRegistrationRequestMapper.toDomainList(ormRequests),
    );
  }

  /**
   * Finds all registration requests.
   */
  @WithPosition()
  findAll(): ResultAsync<ShopRegistrationRequest[], DomainError> {
    const repo = this.getRegistrationRepository();
    return ResultAsync.fromPromise(
      repo.find({
        relations: ['documents', 'brandDocuments'],
        order: { createdAt: 'DESC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormRequests) =>
      ORMShopRegistrationRequestMapper.toDomainList(ormRequests),
    );
  }

  /**
   * Updates an existing registration request.
   */
  @WithPosition()
  update(
    request: ShopRegistrationRequest,
  ): ResultAsync<ShopRegistrationRequest, DomainError> {
    const repo = this.getRegistrationRepository();
    const ormRequest = ORMShopRegistrationRequestMapper.toOrm(request);

    // Only update the main request fields (not relations)
    return ResultAsync.fromPromise(
      repo.update(request.id, {
        status: ormRequest.status,
        rejectionReason: ormRequest.rejectionReason,
        reviewedBy: ormRequest.reviewedBy,
        reviewedAt: ormRequest.reviewedAt,
        updatedAt: ormRequest.updatedAt,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((updateResult) => {
      if (updateResult.affected === 0) {
        return errAsync(
          createDomainError(SHOP_ERRORS.REGISTRATION_NOT_FOUND, {
            cause: 'Registration not found for update',
          }),
        );
      }
      return this.findById(request.id).andThen((result) => {
        if (!result) {
          return errAsync(
            createDomainError(SHARED_ERRORS.DB_ERROR, {
              cause: 'Failed to fetch updated registration',
            }),
          );
        }
        return okAsync(result);
      });
    });
  }

  /**
   * Checks if a slug already exists in registrations or shops.
   */
  @WithPosition()
  isSlugExists(slug: string): ResultAsync<boolean, DomainError> {
    const repo = this.getRegistrationRepository();
    return ResultAsync.fromPromise(repo.exists({ where: { slug } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
    // TODO: Also check shops table when it exists
  }

  /**
   * Checks if a shop name already exists in registrations or shops.
   */
  @WithPosition()
  isNameExists(name: string): ResultAsync<boolean, DomainError> {
    const repo = this.getRegistrationRepository();
    return ResultAsync.fromPromise(repo.exists({ where: { name } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
    // TODO: Also check shops table when it exists
  }

  /**
   * Checks if a slug exists in non-rejected registrations (pending/approved).
   * Used in 2-phase registration to validate shop name availability.
   */
  @WithPosition()
  existsBySlugExcludingRejected(
    slug: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getRegistrationRepository();
    return ResultAsync.fromPromise(
      repo.exists({
        where: [
          { slug, status: ShopRegistrationStatus.PENDING },
          { slug, status: ShopRegistrationStatus.APPROVED },
        ],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
    // TODO: Also check shops table when it exists
  }

  /**
   * Gets the current EntityManager from AsyncLocalStorage, if available.
   */
  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getRegistrationRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMShopRegistrationRequest);
  }

  private getDocumentRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMShopRegistrationDocument);
  }

  private getBrandDocumentRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMShopRegistrationBrandDocument);
  }
}
