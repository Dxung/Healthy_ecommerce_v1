import { Inject, Injectable } from '@nestjs/common';
import { IBrandService } from './brand.service.interface';
import { BRAND_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { IBrandRepository } from './repository/brand.repository.interface';
import { Brand } from './models/brand.model';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { PRODUCT_ERRORS } from './errors/product.errors';
import type { CreateBrandArgumentDto } from './dto/brand/create-brand-argument.dto';
import type { UpdateBrandArgumentDto } from './dto/brand/update-brand-argument.dto';

@Injectable()
export class BrandService implements IBrandService {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: IBrandRepository,
  ) {}

  // ======================== ADMIN OPERATIONS ========================

  @WithPosition()
  getAllBrands(activeOnly?: boolean): ResultAsync<Brand[], DomainError> {
    const filter = activeOnly ? { isActive: true } : undefined;
    return this.brandRepository.findAll(filter);
  }

  @WithPosition()
  getBrandById(id: string): ResultAsync<Brand, DomainError> {
    return this.brandRepository.findById(id).andThen((brand) => {
      if (!brand) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.BRAND_NOT_FOUND, {
            cause: `Brand with ID ${id} not found`,
          }),
        );
      }
      return okAsync(brand);
    });
  }

  @WithPosition()
  createBrand(dto: CreateBrandArgumentDto): ResultAsync<Brand, DomainError> {
    // Check if slug already exists
    return this.brandRepository
      .slugExists(dto.slug)
      .andThen((exists) => {
        if (exists) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.BRAND_SLUG_EXISTS, {
              cause: `Slug "${dto.slug}" already exists`,
            }),
          );
        }
        return okAsync(undefined);
      })
      .andThen(() => {
        const brand = Brand.create({
          name: dto.name,
          slug: dto.slug,
          logoUrl: dto.logoUrl ?? null,
          description: dto.description ?? null,
        });

        return this.brandRepository.create(brand);
      });
  }

  @WithPosition()
  updateBrand(
    id: string,
    dto: UpdateBrandArgumentDto,
  ): ResultAsync<Brand, DomainError> {
    return this.getBrandById(id)
      .andThen((brand) => {
        // Check if slug already exists (exclude current brand)
        if (dto.slug) {
          return this.brandRepository
            .slugExists(dto.slug, id)
            .andThen((exists) => {
              if (exists) {
                return errAsync(
                  createDomainError(PRODUCT_ERRORS.BRAND_SLUG_EXISTS, {
                    cause: `Slug "${dto.slug}" already exists`,
                  }),
                );
              }
              return okAsync(brand);
            });
        }
        return okAsync(brand);
      })
      .andThen((brand) => {
        // Update info if name, slug, or description provided
        if (
          dto.name !== undefined ||
          dto.slug !== undefined ||
          dto.description !== undefined
        ) {
          brand.updateInfo(
            dto.name ?? brand.name,
            dto.slug ?? brand.slug,
            dto.description !== undefined ? dto.description : brand.description,
          );
        }

        // Update logo if provided
        if (dto.logoUrl !== undefined) {
          brand.updateLogo(dto.logoUrl);
        }

        // Update active status if provided
        if (dto.isActive !== undefined) {
          if (dto.isActive) {
            brand.activate();
          } else {
            brand.deactivate();
          }
        }

        return this.brandRepository.update(brand);
      });
  }

  @WithPosition()
  deleteBrand(id: string): ResultAsync<void, DomainError> {
    // Soft delete the brand - products keep the brand but brand becomes hidden
    // The slug becomes available for reuse after deletion
    return this.getBrandById(id).andThen(() => {
      return this.brandRepository.softDelete(id);
    });
  }

  // ======================== PUBLIC OPERATIONS ========================

  @WithPosition()
  getBrandBySlug(slug: string): ResultAsync<Brand, DomainError> {
    return this.brandRepository.findBySlug(slug).andThen((brand) => {
      if (!brand) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.BRAND_NOT_FOUND, {
            cause: `Brand with slug "${slug}" not found`,
          }),
        );
      }
      return okAsync(brand);
    });
  }
}
