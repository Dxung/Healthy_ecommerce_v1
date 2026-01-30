import { Inject, Injectable } from '@nestjs/common';
import { IAdminBadgeService } from './admin-badge.service.interface';
import {
  SHOP_BADGE_REPOSITORY,
  DOCUMENT_TYPE_REPOSITORY,
  BADGE_REQUIREMENT_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import type { IShopBadgeRepository } from './repository/shop-badge.repository.interface';
import type { IDocumentTypeRepository } from './repository/document-type.repository.interface';
import type { IBadgeRequirementRepository } from './repository/badge-requirement.repository.interface';
import { ShopBadge } from './models/shop-badge.model';
import { DocumentType } from './models/document-type.model';
import { BadgeRequirement } from './models/badge-requirement.model';
import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import { RequirementType } from 'src/database/typeorm/entities/shop/enums/requirement-type.enum';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHOP_ERRORS } from './errors/shop.errors';
import type {
  CreateDocumentTypeArgumentDto,
  UpdateDocumentTypeArgumentDto,
  AddRequirementArgumentDto,
  UpdateBadgeArgumentDto,
} from './dto';

@Injectable()
export class AdminBadgeService implements IAdminBadgeService {
  constructor(
    @Inject(SHOP_BADGE_REPOSITORY)
    private readonly badgeRepository: IShopBadgeRepository,
    @Inject(DOCUMENT_TYPE_REPOSITORY)
    private readonly documentTypeRepository: IDocumentTypeRepository,
    @Inject(BADGE_REQUIREMENT_REPOSITORY)
    private readonly requirementRepository: IBadgeRequirementRepository,
  ) {}

  // ======================== BADGE OPERATIONS ========================

  @WithPosition()
  getAllBadges(): ResultAsync<ShopBadge[], DomainError> {
    return this.badgeRepository.findAll(true);
  }

  @WithPosition()
  getBadgeByCode(code: ShopBadgeCode): ResultAsync<ShopBadge, DomainError> {
    return this.badgeRepository.findByCode(code, true).andThen((badge) => {
      if (!badge) {
        return errAsync(
          createDomainError(SHOP_ERRORS.BADGE_NOT_FOUND, {
            cause: SHOP_ERRORS.BADGE_NOT_FOUND.message,
          }),
        );
      }
      return okAsync(badge);
    });
  }

  @WithPosition()
  toggleBadgeActive(code: ShopBadgeCode): ResultAsync<ShopBadge, DomainError> {
    return this.getBadgeByCode(code).andThen((badge) => {
      badge.toggleActive();
      return this.badgeRepository.update(badge);
    });
  }

  @WithPosition()
  updateBadge(
    code: ShopBadgeCode,
    dto: UpdateBadgeArgumentDto,
  ): ResultAsync<ShopBadge, DomainError> {
    return this.getBadgeByCode(code).andThen((badge) => {
      badge.update({
        name: dto.name,
        description: dto.description,
        platformFeeDiscountPercent: dto.platformFeeDiscountPercent,
        searchBoostMultiplier: dto.searchBoostMultiplier,
        maxProductSlots: dto.maxProductSlots,
      });
      return this.badgeRepository.update(badge);
    });
  }

  // ======================== DOCUMENT TYPE OPERATIONS ========================

  @WithPosition()
  getAllDocumentTypes(): ResultAsync<DocumentType[], DomainError> {
    return this.documentTypeRepository.findAll();
  }

  @WithPosition()
  getAllDocumentTypesWithAppliedBadges(): ResultAsync<
    { documentType: DocumentType; appliedBadges: string[] }[],
    DomainError
  > {
    return this.documentTypeRepository.findAllWithAppliedBadges();
  }

  @WithPosition()
  createDocumentType(
    dto: CreateDocumentTypeArgumentDto,
  ): ResultAsync<DocumentType, DomainError> {
    const documentType = DocumentType.createNew({
      name: dto.name,
      description: dto.description,
      sampleImageUrl: dto.sampleImageUrl,
    });

    return this.documentTypeRepository.create(documentType);
  }

  @WithPosition()
  updateDocumentType(
    id: string,
    dto: UpdateDocumentTypeArgumentDto,
  ): ResultAsync<DocumentType, DomainError> {
    return this.documentTypeRepository.findById(id).andThen((documentType) => {
      if (!documentType) {
        return errAsync(
          createDomainError(SHOP_ERRORS.DOCUMENT_TYPE_NOT_FOUND, {
            cause: SHOP_ERRORS.DOCUMENT_TYPE_NOT_FOUND.message,
          }),
        );
      }

      documentType.update({
        name: dto.name,
        description: dto.description,
        sampleImageUrl: dto.sampleImageUrl,
      });

      return this.documentTypeRepository.update(documentType);
    });
  }

  @WithPosition()
  deleteDocumentType(id: string): ResultAsync<void, DomainError> {
    return this.documentTypeRepository.delete(id);
  }

  // ======================== REQUIREMENT OPERATIONS ========================

  @WithPosition()
  addRequirement(
    badgeCode: ShopBadgeCode,
    dto: AddRequirementArgumentDto,
  ): ResultAsync<BadgeRequirement, DomainError> {
    // Verify badge exists
    return this.getBadgeByCode(badgeCode).andThen(() => {
      let requirement: BadgeRequirement;

      if (dto.requirementType === RequirementType.DOCUMENT) {
        // Verify document type exists
        return this.documentTypeRepository
          .findById(dto.documentTypeId!)
          .andThen((docType) => {
            if (!docType) {
              return errAsync(
                createDomainError(SHOP_ERRORS.DOCUMENT_TYPE_NOT_FOUND, {
                  cause: SHOP_ERRORS.DOCUMENT_TYPE_NOT_FOUND.message,
                }),
              );
            }

            requirement = BadgeRequirement.createDocumentRequirement({
              badgeCode,
              documentTypeId: dto.documentTypeId!,
            });

            return this.requirementRepository.create(requirement);
          });
      } else {
        requirement = BadgeRequirement.createAttributeRequirement({
          badgeCode,
          attributeCode: dto.attributeCode!,
          operator: dto.operator!,
          attributeValue: dto.attributeValue!,
        });

        return this.requirementRepository.create(requirement);
      }
    });
  }

  @WithPosition()
  removeRequirement(requirementId: string): ResultAsync<void, DomainError> {
    return this.requirementRepository.delete(requirementId);
  }

  @WithPosition()
  toggleRequirementActive(
    requirementId: string,
  ): ResultAsync<BadgeRequirement, DomainError> {
    return this.requirementRepository
      .findById(requirementId, true)
      .andThen((requirement) => {
        if (!requirement) {
          return errAsync(
            createDomainError(SHOP_ERRORS.REQUIREMENT_NOT_FOUND, {
              cause: SHOP_ERRORS.REQUIREMENT_NOT_FOUND.message,
            }),
          );
        }

        requirement.toggleActive();
        return this.requirementRepository.update(requirement);
      });
  }
}
