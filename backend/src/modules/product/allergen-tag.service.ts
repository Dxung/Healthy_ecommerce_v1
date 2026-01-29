import { Inject, Injectable } from '@nestjs/common';
import { IAllergenTagService } from './allergen-tag.service.interface';
import { ALLERGEN_TAG_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { IAllergenTagRepository } from './repository/allergen-tag.repository.interface';
import { AllergenTag } from './models/allergen-tag.model';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { PRODUCT_ERRORS } from './errors/product.errors';
import type { CreateAllergenTagArgumentDto } from './dto/allergen-tag/create-allergen-tag-argument.dto';
import type { UpdateAllergenTagArgumentDto } from './dto/allergen-tag/update-allergen-tag-argument.dto';

@Injectable()
export class AllergenTagService implements IAllergenTagService {
  constructor(
    @Inject(ALLERGEN_TAG_REPOSITORY)
    private readonly allergenTagRepository: IAllergenTagRepository,
  ) {}

  // ======================== ADMIN OPERATIONS ========================

  @WithPosition()
  getAllAllergenTags(
    activeOnly?: boolean,
  ): ResultAsync<AllergenTag[], DomainError> {
    const filter = activeOnly ? { isActive: true } : undefined;
    return this.allergenTagRepository.findAll(filter);
  }

  @WithPosition()
  getAllergenTagById(id: string): ResultAsync<AllergenTag, DomainError> {
    return this.allergenTagRepository.findById(id).andThen((allergenTag) => {
      if (!allergenTag) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.ALLERGEN_TAG_NOT_FOUND, {
            cause: `Allergen tag with ID ${id} not found`,
          }),
        );
      }
      return okAsync(allergenTag);
    });
  }

  @WithPosition()
  createAllergenTag(
    dto: CreateAllergenTagArgumentDto,
  ): ResultAsync<AllergenTag, DomainError> {
    // Check if slug already exists
    return this.allergenTagRepository
      .slugExists(dto.slug)
      .andThen((exists) => {
        if (exists) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.ALLERGEN_TAG_SLUG_EXISTS, {
              cause: `Slug "${dto.slug}" already exists`,
            }),
          );
        }
        return okAsync(undefined);
      })
      .andThen(() => {
        const allergenTag = AllergenTag.create({
          name: dto.name,
          slug: dto.slug,
          description: dto.description ?? null,
          iconUrl: dto.iconUrl ?? null,
        });

        return this.allergenTagRepository.create(allergenTag);
      });
  }

  @WithPosition()
  updateAllergenTag(
    id: string,
    dto: UpdateAllergenTagArgumentDto,
  ): ResultAsync<AllergenTag, DomainError> {
    return this.getAllergenTagById(id)
      .andThen((allergenTag) => {
        // Check if slug already exists (exclude current allergen tag)
        if (dto.slug) {
          return this.allergenTagRepository
            .slugExists(dto.slug, id)
            .andThen((exists) => {
              if (exists) {
                return errAsync(
                  createDomainError(PRODUCT_ERRORS.ALLERGEN_TAG_SLUG_EXISTS, {
                    cause: `Slug "${dto.slug}" already exists`,
                  }),
                );
              }
              return okAsync(allergenTag);
            });
        }
        return okAsync(allergenTag);
      })
      .andThen((allergenTag) => {
        // Update info if name, slug, or description provided
        if (
          dto.name !== undefined ||
          dto.slug !== undefined ||
          dto.description !== undefined
        ) {
          allergenTag.updateInfo(
            dto.name ?? allergenTag.name,
            dto.slug ?? allergenTag.slug,
            dto.description !== undefined
              ? dto.description
              : allergenTag.description,
          );
        }

        // Update icon if provided
        if (dto.iconUrl !== undefined) {
          allergenTag.updateIcon(dto.iconUrl);
        }

        // Update active status if provided
        if (dto.isActive !== undefined) {
          if (dto.isActive) {
            allergenTag.activate();
          } else {
            allergenTag.deactivate();
          }
        }

        return this.allergenTagRepository.update(allergenTag);
      });
  }

  @WithPosition()
  deleteAllergenTag(id: string): ResultAsync<void, DomainError> {
    // Soft delete the allergen tag - products keep the tag but it becomes hidden
    // The slug becomes available for reuse after deletion
    return this.getAllergenTagById(id).andThen(() => {
      return this.allergenTagRepository.softDelete(id);
    });
  }

  // ======================== PUBLIC OPERATIONS ========================

  @WithPosition()
  getAllergenTagBySlug(slug: string): ResultAsync<AllergenTag, DomainError> {
    return this.allergenTagRepository
      .findBySlug(slug)
      .andThen((allergenTag) => {
        if (!allergenTag) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.ALLERGEN_TAG_NOT_FOUND, {
              cause: `Allergen tag with slug "${slug}" not found`,
            }),
          );
        }
        return okAsync(allergenTag);
      });
  }
}
