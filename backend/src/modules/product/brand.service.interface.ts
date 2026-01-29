import type { ResultAsync } from 'neverthrow';
import type { Brand } from './models/brand.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { CreateBrandArgumentDto } from './dto/brand/create-brand-argument.dto';
import type { UpdateBrandArgumentDto } from './dto/brand/update-brand-argument.dto';

export interface IBrandService {
  // ======================== ADMIN OPERATIONS ========================

  /**
   * Gets all brands with optional filter.
   * @param activeOnly - If true, returns only active brands.
   * @returns Array of Brand domain models.
   */
  getAllBrands(activeOnly?: boolean): ResultAsync<Brand[], DomainError>;

  /**
   * Gets a brand by its ID.
   * @param id - The brand ID.
   * @returns The Brand domain model.
   */
  getBrandById(id: string): ResultAsync<Brand, DomainError>;

  /**
   * Creates a new brand.
   * @param dto - The create brand DTO.
   * @returns The created Brand domain model.
   */
  createBrand(dto: CreateBrandArgumentDto): ResultAsync<Brand, DomainError>;

  /**
   * Updates an existing brand.
   * @param id - The brand ID.
   * @param dto - The update brand DTO.
   * @returns The updated Brand domain model.
   */
  updateBrand(
    id: string,
    dto: UpdateBrandArgumentDto,
  ): ResultAsync<Brand, DomainError>;

  /**
   * Deletes a brand (soft delete).
   * @param id - The brand ID.
   * @returns void on success.
   */
  deleteBrand(id: string): ResultAsync<void, DomainError>;

  // ======================== PUBLIC OPERATIONS ========================

  /**
   * Gets a brand by its slug.
   * @param slug - The brand slug.
   * @returns The Brand domain model.
   */
  getBrandBySlug(slug: string): ResultAsync<Brand, DomainError>;
}
