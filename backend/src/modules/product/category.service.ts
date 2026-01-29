import { Inject, Injectable } from '@nestjs/common';
import { ICategoryService } from './category.service.interface';
import { CATEGORY_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import type { ICategoryRepository } from './repository/category.repository.interface';
import { Category } from './models/category.model';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { PRODUCT_ERRORS } from './errors/product.errors';
import type { CreateCategoryArgumentDto } from './dto/category/create-category-argument.dto';
import type { UpdateCategoryArgumentDto } from './dto/category/update-category-argument.dto';

@Injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  // ======================== ADMIN OPERATIONS ========================

  @WithPosition()
  getAllCategories(activeOnly?: boolean): ResultAsync<Category[], DomainError> {
    const filter = activeOnly ? { isActive: true } : undefined;
    return this.categoryRepository.findAll(filter);
  }

  @WithPosition()
  getCategoryById(id: string): ResultAsync<Category, DomainError> {
    return this.categoryRepository.findById(id).andThen((category) => {
      if (!category) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.CATEGORY_NOT_FOUND, {
            cause: `Category with ID ${id} not found`,
          }),
        );
      }
      return okAsync(category);
    });
  }

  @WithPosition()
  createCategory(
    dto: CreateCategoryArgumentDto,
  ): ResultAsync<Category, DomainError> {
    // Check if slug already exists
    return this.categoryRepository
      .slugExists(dto.slug)
      .andThen((exists) => {
        if (exists) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.CATEGORY_SLUG_EXISTS, {
              cause: `Slug "${dto.slug}" already exists`,
            }),
          );
        }
        return okAsync(undefined);
      })
      .andThen(() => {
        // If parentId provided, validate parent exists and get its level
        if (dto.parentId) {
          return this.categoryRepository
            .findById(dto.parentId)
            .andThen((parent) => {
              if (!parent) {
                return errAsync(
                  createDomainError(PRODUCT_ERRORS.CATEGORY_PARENT_NOT_FOUND, {
                    cause: `Parent category with ID ${dto.parentId} not found`,
                  }),
                );
              }
              // Check level limit (max 3 levels)
              if (parent.level >= 3) {
                return errAsync(
                  createDomainError(PRODUCT_ERRORS.CATEGORY_LEVEL_EXCEEDED, {
                    cause: `Cannot create category under level ${parent.level} parent`,
                  }),
                );
              }
              return okAsync(parent.level + 1);
            });
        }
        // Root category (level 1)
        return okAsync(1);
      })
      .andThen((level) => {
        const category = Category.create({
          parentId: dto.parentId ?? null,
          name: dto.name,
          slug: dto.slug,
          iconUrl: dto.iconUrl ?? null,
          level,
          sortOrder: dto.sortOrder ?? 0,
        });

        return this.categoryRepository.create(category);
      });
  }

  @WithPosition()
  updateCategory(
    id: string,
    dto: UpdateCategoryArgumentDto,
  ): ResultAsync<Category, DomainError> {
    return this.getCategoryById(id)
      .andThen((category) => {
        // Check if slug already exists (exclude current category)
        if (dto.slug) {
          return this.categoryRepository
            .slugExists(dto.slug, id)
            .andThen((exists) => {
              if (exists) {
                return errAsync(
                  createDomainError(PRODUCT_ERRORS.CATEGORY_SLUG_EXISTS, {
                    cause: `Slug "${dto.slug}" already exists`,
                  }),
                );
              }
              return okAsync(category);
            });
        }
        return okAsync(category);
      })
      .andThen((category) => {
        // Update info if name, slug, or iconUrl provided
        if (
          dto.name !== undefined ||
          dto.slug !== undefined ||
          dto.iconUrl !== undefined
        ) {
          category.updateInfo(
            dto.name ?? category.name,
            dto.slug ?? category.slug,
            dto.iconUrl !== undefined ? dto.iconUrl : category.iconUrl,
          );
        }

        // Update sort order if provided
        if (dto.sortOrder !== undefined) {
          category.updateSortOrder(dto.sortOrder);
        }

        // Update active status if provided
        if (dto.isActive !== undefined) {
          if (dto.isActive) {
            category.activate();
          } else {
            category.deactivate();
          }
        }

        return this.categoryRepository.update(category);
      });
  }

  @WithPosition()
  deleteCategory(id: string): ResultAsync<void, DomainError> {
    // Soft delete category and all its descendants
    return this.getCategoryById(id).andThen(() => {
      return this.categoryRepository.softDeleteWithDescendants(id);
    });
  }

  @WithPosition()
  toggleCategoryStatus(
    id: string,
    isActive: boolean,
  ): ResultAsync<Category, DomainError> {
    return this.getCategoryById(id).andThen((category) => {
      if (isActive) {
        category.activate();
      } else {
        category.deactivate();
      }
      return this.categoryRepository.update(category);
    });
  }

  // ======================== PUBLIC OPERATIONS ========================

  @WithPosition()
  getCategoryHierarchy(
    activeOnly = true,
  ): ResultAsync<Category[], DomainError> {
    return this.categoryRepository.findHierarchy(activeOnly);
  }

  @WithPosition()
  getCategoryBySlug(slug: string): ResultAsync<Category, DomainError> {
    return this.categoryRepository.findBySlug(slug).andThen((category) => {
      if (!category) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.CATEGORY_NOT_FOUND, {
            cause: `Category with slug "${slug}" not found`,
          }),
        );
      }
      return okAsync(category);
    });
  }
}
