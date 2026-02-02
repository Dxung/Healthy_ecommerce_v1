import { Inject, Injectable } from '@nestjs/common';
import { IDietTagService } from './diet-tag.service.interface';
import { DIET_TAG_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { IDietTagRepository } from './repository/diet-tag.repository.interface';
import { DietTag } from './models/diet-tag.model';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { PRODUCT_ERRORS } from './errors/product.errors';
import type { CreateDietTagArgumentDto } from './dto/diet-tag/create-diet-tag-argument.dto';
import type { UpdateDietTagArgumentDto } from './dto/diet-tag/update-diet-tag-argument.dto';

@Injectable()
export class DietTagService implements IDietTagService {
  constructor(
    @Inject(DIET_TAG_REPOSITORY)
    private readonly dietTagRepository: IDietTagRepository,
  ) {}

  // ======================== ADMIN OPERATIONS ========================

  @WithPosition()
  getAllDietTags(activeOnly?: boolean): ResultAsync<DietTag[], DomainError> {
    const filter = activeOnly ? { isActive: true } : undefined;
    return this.dietTagRepository.findAll(filter);
  }

  @WithPosition()
  getDietTagById(id: string): ResultAsync<DietTag, DomainError> {
    return this.dietTagRepository.findById(id).andThen((dietTag) => {
      if (!dietTag) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.DIET_TAG_NOT_FOUND, {
            cause: `Diet tag with ID ${id} not found`,
          }),
        );
      }
      return okAsync(dietTag);
    });
  }

  @WithPosition()
  createDietTag(
    dto: CreateDietTagArgumentDto,
  ): ResultAsync<DietTag, DomainError> {
    // Check if slug already exists
    return this.dietTagRepository
      .slugExists(dto.slug)
      .andThen((exists) => {
        if (exists) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.DIET_TAG_SLUG_EXISTS, {
              cause: `Slug "${dto.slug}" already exists`,
            }),
          );
        }
        return okAsync(undefined);
      })
      .andThen(() => {
        const dietTag = DietTag.create({
          name: dto.name,
          slug: dto.slug,
          description: dto.description ?? null,
          iconUrl: dto.iconUrl ?? null,
        });

        return this.dietTagRepository.create(dietTag);
      });
  }

  @WithPosition()
  updateDietTag(
    id: string,
    dto: UpdateDietTagArgumentDto,
  ): ResultAsync<DietTag, DomainError> {
    return this.getDietTagById(id)
      .andThen((dietTag) => {
        // Check if slug already exists (exclude current diet tag)
        if (dto.slug) {
          return this.dietTagRepository
            .slugExists(dto.slug, id)
            .andThen((exists) => {
              if (exists) {
                return errAsync(
                  createDomainError(PRODUCT_ERRORS.DIET_TAG_SLUG_EXISTS, {
                    cause: `Slug "${dto.slug}" already exists`,
                  }),
                );
              }
              return okAsync(dietTag);
            });
        }
        return okAsync(dietTag);
      })
      .andThen((dietTag) => {
        // Update info if name, slug, or description provided
        if (
          dto.name !== undefined ||
          dto.slug !== undefined ||
          dto.description !== undefined
        ) {
          dietTag.updateInfo(
            dto.name ?? dietTag.name,
            dto.slug ?? dietTag.slug,
            dto.description !== undefined
              ? dto.description
              : dietTag.description,
          );
        }

        // Update icon if provided
        if (dto.iconUrl !== undefined) {
          dietTag.updateIcon(dto.iconUrl);
        }

        // Update active status if provided
        if (dto.isActive !== undefined) {
          if (dto.isActive) {
            dietTag.activate();
          } else {
            dietTag.deactivate();
          }
        }

        return this.dietTagRepository.update(dietTag);
      });
  }

  @WithPosition()
  deleteDietTag(id: string): ResultAsync<void, DomainError> {
    // Soft delete the diet tag - products keep the tag but it becomes hidden
    // The slug becomes available for reuse after deletion
    return this.getDietTagById(id).andThen(() => {
      return this.dietTagRepository.softDelete(id);
    });
  }

  // ======================== PUBLIC OPERATIONS ========================

  @WithPosition()
  getDietTagBySlug(slug: string): ResultAsync<DietTag, DomainError> {
    return this.dietTagRepository.findBySlug(slug).andThen((dietTag) => {
      if (!dietTag) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.DIET_TAG_NOT_FOUND, {
            cause: `Diet tag with slug "${slug}" not found`,
          }),
        );
      }
      return okAsync(dietTag);
    });
  }
}
