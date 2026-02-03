import { Inject, Injectable } from '@nestjs/common';
import { IBadgeApplicationService } from './badge-application.service.interface';
import {
  SHOP_REPOSITORY,
  BADGE_APPLICATION_REPOSITORY,
  SHOP_OFFICIAL_BRAND_REPOSITORY,
  BRAND_DOCUMENT_REQUIREMENT_REPOSITORY,
  BADGE_REQUIREMENT_REPOSITORY,
  BRAND_REPOSITORY,
  PRODUCT_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import type { IShopRepository } from './repository/shop.repository.interface';
import type {
  IBadgeApplicationRepository,
  BadgeApplicationFilters,
} from './repository/badge-application.repository.interface';
import type { IShopOfficialBrandRepository } from './repository/shop-official-brand.repository.interface';
import type { IBrandDocumentRequirementRepository } from './repository/brand-document-requirement.repository.interface';
import type { IBadgeRequirementRepository } from './repository/badge-requirement.repository.interface';
import type { IBrandRepository } from '../product/repository/brand.repository.interface';
import type { IProductRepository } from '../product/repository/product.repository.interface';
import type { IUow } from 'src/shared/unitOfWork/interfaces/uow.interface';
import { UOW_TOKEN } from 'src/shared/unitOfWork/tokens/uow.token';
import {
  BadgeApplication,
  CreateBadgeApplicationDocumentData,
} from './models/badge-application.model';
import { ShopOfficialBrand } from './models/shop-official-brand.model';
import { ShopBadgeAssignment } from './models/shop-badge-assignment.model';
import { BrandDocumentRequirement } from './models/brand-document-requirement.model';
import { DocumentType } from './models/document-type.model';
import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import { RequirementType } from 'src/database/typeorm/entities/shop/enums/requirement-type.enum';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { SHOP_ERRORS } from './errors/shop.errors';
import { BADGE_APPLICATION_ERRORS } from './errors/badge-application.errors';
import { AsyncLocalStorage } from 'async_hooks';
import type { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import type {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/types/pagination.type';
import type {
  ApplyVerifiedBadgeArgumentDto,
  ApplyOfficialBadgeArgumentDto,
  AddBrandRequirementArgumentDto,
} from './dto';

@Injectable()
export class BadgeApplicationService implements IBadgeApplicationService {
  constructor(
    @Inject(SHOP_REPOSITORY)
    private readonly shopRepository: IShopRepository,
    @Inject(BADGE_APPLICATION_REPOSITORY)
    private readonly applicationRepository: IBadgeApplicationRepository,
    @Inject(SHOP_OFFICIAL_BRAND_REPOSITORY)
    private readonly officialBrandRepository: IShopOfficialBrandRepository,
    @Inject(BRAND_DOCUMENT_REQUIREMENT_REPOSITORY)
    private readonly brandRequirementRepository: IBrandDocumentRequirementRepository,
    @Inject(BADGE_REQUIREMENT_REPOSITORY)
    private readonly badgeRequirementRepository: IBadgeRequirementRepository,
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: IBrandRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(UOW_TOKEN)
    private readonly uow: IUow,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  //================================================== SHOP OWNER OPERATIONS ==================================================

  @WithPosition()
  getVerifiedRequirements(): ResultAsync<DocumentType[], DomainError> {
    // Get requirements for APPROVED badge (which is the verified badge)
    // Pass true to load documentType relation
    return this.badgeRequirementRepository
      .findByBadgeCode(ShopBadgeCode.APPROVED, true)
      .map((requirements) =>
        requirements
          .map((r) => r.documentType)
          .filter((d): d is DocumentType => d != null),
      );
  }

  @WithPosition()
  getOfficialRequirements(): ResultAsync<DocumentType[], DomainError> {
    // Get requirements for OFFICIAL badge - same for all brands
    // Pass true to load documentType relation
    return this.badgeRequirementRepository
      .findByBadgeCode(ShopBadgeCode.OFFICIAL, true)
      .map((requirements) =>
        requirements
          .map((r) => r.documentType)
          .filter((d): d is DocumentType => d != null),
      );
  }

  @WithPosition()
  applyForVerifiedBadge(
    dto: ApplyVerifiedBadgeArgumentDto,
  ): ResultAsync<BadgeApplication, DomainError> {
    return this.getCurrentShop().andThen((shop) => {
      // Check if shop already has active APPROVED badge
      const hasApprovedBadge = shop.badgeAssignments.some(
        (b) =>
          b.badgeCode === ShopBadgeCode.APPROVED &&
          b.isActive() &&
          !b.isExpired(),
      );
      if (hasApprovedBadge) {
        return errAsync(
          createDomainError(
            BADGE_APPLICATION_ERRORS.ALREADY_HAS_VERIFIED_BADGE,
            {
              cause: 'Shop already has an active Verified badge',
            },
          ),
        );
      }

      // Check for pending application
      return this.applicationRepository
        .findPendingVerifiedByShop(shop.id)
        .andThen((existing) => {
          if (existing) {
            return errAsync(
              createDomainError(
                BADGE_APPLICATION_ERRORS.ALREADY_HAS_PENDING_APPLICATION,
                {
                  cause:
                    'Shop already has a pending Verified badge application',
                },
              ),
            );
          }

          // Create application
          const documents: CreateBadgeApplicationDocumentData[] =
            dto.documents.map((doc) => ({
              documentTypeId: doc.documentTypeId,
              imageUrl: doc.imageUrl,
              expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : null,
            }));

          const application = BadgeApplication.createVerified(
            shop.id,
            documents,
          );
          return this.applicationRepository.create(application);
        });
    });
  }

  @WithPosition()
  applyForOfficialBadge(
    dto: ApplyOfficialBadgeArgumentDto,
  ): ResultAsync<BadgeApplication, DomainError> {
    return this.getCurrentShop().andThen((shop) => {
      // Check brand exists
      return this.brandRepository.findById(dto.brandId).andThen((brand) => {
        if (!brand) {
          return errAsync(
            createDomainError(BADGE_APPLICATION_ERRORS.BRAND_NOT_FOUND, {
              cause: `Brand ${dto.brandId} not found`,
            }),
          );
        }

        // Check if shop is already official for this brand
        return this.officialBrandRepository
          .isOfficialForBrand(shop.id, dto.brandId)
          .andThen((isOfficial) => {
            if (isOfficial) {
              return errAsync(
                createDomainError(
                  BADGE_APPLICATION_ERRORS.ALREADY_OFFICIAL_FOR_BRAND,
                  {
                    cause:
                      'Shop is already an official reseller for this brand',
                  },
                ),
              );
            }

            // Check for pending application
            return this.applicationRepository
              .findPendingOfficialByShopAndBrand(shop.id, dto.brandId)
              .andThen((existing) => {
                if (existing) {
                  return errAsync(
                    createDomainError(
                      BADGE_APPLICATION_ERRORS.ALREADY_HAS_PENDING_APPLICATION,
                      {
                        cause:
                          'Shop already has a pending Official badge application for this brand',
                      },
                    ),
                  );
                }

                // Create application
                const documents: CreateBadgeApplicationDocumentData[] =
                  dto.documents.map((doc) => ({
                    documentTypeId: doc.documentTypeId,
                    imageUrl: doc.imageUrl,
                    expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : null,
                  }));

                const application = BadgeApplication.createOfficial(
                  shop.id,
                  dto.brandId,
                  documents,
                );
                return this.applicationRepository.create(application);
              });
          });
      });
    });
  }

  @WithPosition()
  cancelApplication(
    applicationId: string,
  ): ResultAsync<BadgeApplication, DomainError> {
    return this.getCurrentShop().andThen((shop) => {
      return this.applicationRepository
        .findById(applicationId)
        .andThen((application) => {
          if (!application) {
            return errAsync(
              createDomainError(
                BADGE_APPLICATION_ERRORS.APPLICATION_NOT_FOUND,
                {
                  cause: `Application ${applicationId} not found`,
                },
              ),
            );
          }

          // Check ownership
          if (application.shopId !== shop.id) {
            return errAsync(
              createDomainError(BADGE_APPLICATION_ERRORS.NOT_YOUR_APPLICATION, {
                cause: 'This application does not belong to your shop',
              }),
            );
          }

          // Cancel application
          const cancelResult = application.cancel();
          if (cancelResult.isErr()) {
            return errAsync(cancelResult.error);
          }

          return this.applicationRepository.update(application);
        });
    });
  }

  @WithPosition()
  getMyApplications(): ResultAsync<BadgeApplication[], DomainError> {
    return this.getCurrentShop().andThen((shop) => {
      return this.applicationRepository.findByShopId(shop.id);
    });
  }

  @WithPosition()
  getMyBadges(): ResultAsync<ShopBadgeAssignment[], DomainError> {
    return this.getCurrentShop().map((shop) => shop.badgeAssignments);
  }

  @WithPosition()
  getMyOfficialBrands(): ResultAsync<ShopOfficialBrand[], DomainError> {
    return this.getCurrentShop().andThen((shop) => {
      return this.officialBrandRepository.findActiveByShop(shop.id);
    });
  }

  //================================================== ADMIN OPERATIONS ==================================================

  @WithPosition()
  getAllApplications(
    filters: BadgeApplicationFilters,
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<BadgeApplication>, DomainError> {
    return this.applicationRepository.findAll(filters, pagination);
  }

  @WithPosition()
  getApplicationById(
    applicationId: string,
  ): ResultAsync<BadgeApplication, DomainError> {
    return this.applicationRepository
      .findById(applicationId)
      .andThen((application) => {
        if (!application) {
          return errAsync(
            createDomainError(BADGE_APPLICATION_ERRORS.APPLICATION_NOT_FOUND, {
              cause: `Application ${applicationId} not found`,
            }),
          );
        }
        return okAsync(application);
      });
  }

  @WithPosition()
  approveApplication(
    applicationId: string,
  ): ResultAsync<BadgeApplication, DomainError> {
    const store = this.als.getStore();
    const adminId = store?.userId;

    if (!adminId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'Admin ID not found in context',
        }),
      );
    }

    return this.getApplicationById(applicationId).andThen((application) => {
      // Approve application
      const approveResult = application.approve(adminId);
      if (approveResult.isErr()) {
        return errAsync(approveResult.error);
      }

      const expiresAt = application.getEarliestDocumentExpiry();

      return this.uow.executeInTransaction(() => {
        // Update application status
        return this.applicationRepository
          .update(application)
          .andThen((updatedApp) => {
            if (application.isVerified()) {
              // Create APPROVED badge assignment
              const badge = ShopBadgeAssignment.createApproved(
                application.shopId,
                expiresAt,
              );
              return this.shopRepository
                .createBadgeAssignment(badge)
                .map(() => updatedApp);
            } else {
              // Official badge - create shop_official_brands record
              const officialBrand = ShopOfficialBrand.create(
                application.shopId,
                application.brandId!,
                application.id,
                expiresAt,
              );

              return this.officialBrandRepository
                .create(officialBrand)
                .andThen(() => {
                  // Update all products of this brand in this shop to be official
                  return this.productRepository
                    .updateOfficialStatus(
                      application.shopId,
                      application.brandId!,
                      true,
                    )
                    .andThen(() => {
                      // Get all official brand IDs for this shop to hide non-official products
                      return this.officialBrandRepository
                        .findActiveBrandIdsByShop(application.shopId)
                        .andThen((officialBrandIds) => {
                          // Hide products of non-official brands
                          return this.productRepository
                            .hideNonOfficialBrandProducts(
                              application.shopId,
                              officialBrandIds,
                            )
                            .andThen(() => {
                              // Check if shop already has OFFICIAL badge
                              return this.shopRepository
                                .findById(application.shopId)
                                .andThen((shop) => {
                                  if (!shop) {
                                    return errAsync(
                                      createDomainError(
                                        SHOP_ERRORS.SHOP_NOT_FOUND,
                                        {
                                          cause: 'Shop not found',
                                        },
                                      ),
                                    );
                                  }

                                  const hasOfficialBadge =
                                    shop.badgeAssignments.some(
                                      (b) =>
                                        b.badgeCode ===
                                          ShopBadgeCode.OFFICIAL &&
                                        b.isActive(),
                                    );

                                  if (!hasOfficialBadge) {
                                    // Create OFFICIAL badge assignment (first official brand for this shop)
                                    const badge =
                                      ShopBadgeAssignment.createOfficial(
                                        application.shopId,
                                        application.brandId!,
                                        expiresAt,
                                      );
                                    return this.shopRepository
                                      .createBadgeAssignment(badge)
                                      .map(() => updatedApp);
                                  }

                                  return okAsync(updatedApp);
                                });
                            });
                        });
                    });
                });
            }
          });
      });
    });
  }

  @WithPosition()
  rejectApplication(
    applicationId: string,
    reason: string,
  ): ResultAsync<BadgeApplication, DomainError> {
    const store = this.als.getStore();
    const adminId = store?.userId;

    if (!adminId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'Admin ID not found in context',
        }),
      );
    }

    return this.getApplicationById(applicationId).andThen((application) => {
      // Reject application
      const rejectResult = application.reject(adminId, reason);
      if (rejectResult.isErr()) {
        return errAsync(rejectResult.error);
      }

      return this.applicationRepository.update(application);
    });
  }

  @WithPosition()
  getBrandDocumentRequirements(
    brandId: string,
  ): ResultAsync<BrandDocumentRequirement[], DomainError> {
    return this.brandRequirementRepository.findAllByBrand(brandId);
  }

  @WithPosition()
  addBrandDocumentRequirement(
    brandId: string,
    dto: AddBrandRequirementArgumentDto,
  ): ResultAsync<BrandDocumentRequirement, DomainError> {
    // Check brand exists
    return this.brandRepository.findById(brandId).andThen((brand) => {
      if (!brand) {
        return errAsync(
          createDomainError(BADGE_APPLICATION_ERRORS.BRAND_NOT_FOUND, {
            cause: `Brand ${brandId} not found`,
          }),
        );
      }

      // Check if requirement already exists
      return this.brandRequirementRepository
        .existsByBrandAndDocumentType(brandId, dto.documentTypeId)
        .andThen((exists) => {
          if (exists) {
            return errAsync(
              createDomainError(
                BADGE_APPLICATION_ERRORS.REQUIREMENT_ALREADY_EXISTS,
                {
                  cause:
                    'This document requirement already exists for this brand',
                },
              ),
            );
          }

          const requirement = BrandDocumentRequirement.create(
            brandId,
            dto.documentTypeId,
          );
          return this.brandRequirementRepository.create(requirement);
        });
    });
  }

  @WithPosition()
  removeBrandDocumentRequirement(
    requirementId: string,
  ): ResultAsync<void, DomainError> {
    return this.brandRequirementRepository
      .findById(requirementId)
      .andThen((requirement) => {
        if (!requirement) {
          return errAsync(
            createDomainError(BADGE_APPLICATION_ERRORS.REQUIREMENT_NOT_FOUND, {
              cause: `Requirement ${requirementId} not found`,
            }),
          );
        }

        return this.brandRequirementRepository.delete(requirementId);
      });
  }

  //================================================== HELPERS ==================================================

  private getCurrentShop(): ResultAsync<
    import('./models/shop.model').Shop,
    DomainError
  > {
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.shopRepository.findByUserId(userId).andThen((shop) => {
      if (!shop) {
        return errAsync(
          createDomainError(SHOP_ERRORS.SHOP_NOT_FOUND, {
            cause: 'User does not own a shop',
          }),
        );
      }
      return okAsync(shop);
    });
  }
}
