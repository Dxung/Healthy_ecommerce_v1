import { Injectable } from '@nestjs/common';
import { IDocumentTypeRepository } from 'src/modules/shop/repository/document-type.repository.interface';
import { ORMDocumentTypeMapper } from '../../mappers/document-type.mapper.orm';
import { DocumentType } from 'src/modules/shop/models/document-type.model';
import { AsyncLocalStorage } from 'async_hooks';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { DataSource } from 'typeorm';
import { ORMDocumentType } from '../../entities/shop';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { SHOP_ERRORS } from 'src/modules/shop/errors/shop.errors';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';

@Injectable()
export class OrmDocumentTypeRepository implements IDocumentTypeRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  create(documentType: DocumentType): ResultAsync<DocumentType, DomainError> {
    const repo = this.getRepository();
    const ormDocType = ORMDocumentTypeMapper.toOrm(documentType);

    return ResultAsync.fromPromise(repo.save(ormDocType), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMDocumentTypeMapper.toDomain(saved));
  }

  @WithPosition()
  findAll(): ResultAsync<DocumentType[], DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(
      repo.find({
        order: { name: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormDocTypes) => ORMDocumentTypeMapper.toDomainList(ormDocTypes));
  }

  @WithPosition()
  findAllActive(): ResultAsync<DocumentType[], DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(
      repo.find({
        where: { isActive: true },
        order: { name: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormDocTypes) => ORMDocumentTypeMapper.toDomainList(ormDocTypes));
  }

  @WithPosition()
  findById(id: string): ResultAsync<DocumentType | null, DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormDocType) => {
      if (!ormDocType) return null;
      return ORMDocumentTypeMapper.toDomain(ormDocType);
    });
  }

  @WithPosition()
  update(documentType: DocumentType): ResultAsync<DocumentType, DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(
      repo.update(documentType.id, {
        name: documentType.name,
        description: documentType.description,
        sampleImageUrl: documentType.sampleImageUrl,
        isActive: documentType.isActive,
        updatedAt: documentType.updatedAt,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((updateResult) => {
      if (updateResult.affected === 0) {
        return errAsync(
          createDomainError(SHOP_ERRORS.DOCUMENT_TYPE_NOT_FOUND, {
            cause: SHOP_ERRORS.DOCUMENT_TYPE_NOT_FOUND.message,
          }),
        );
      }
      return this.findById(documentType.id).andThen((result) => {
        if (!result) {
          return errAsync(
            createDomainError(SHARED_ERRORS.DB_ERROR, {
              cause: SHARED_ERRORS.DB_ERROR.message,
            }),
          );
        }
        return okAsync(result);
      });
    });
  }

  @WithPosition()
  delete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getRepository();

    // Soft delete by setting isActive = false
    return ResultAsync.fromPromise(
      repo.update(id, {
        isActive: false,
        updatedAt: new Date(),
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((updateResult) => {
      if (updateResult.affected === 0) {
        return errAsync(
          createDomainError(SHOP_ERRORS.DOCUMENT_TYPE_NOT_FOUND, {
            cause: SHOP_ERRORS.DOCUMENT_TYPE_NOT_FOUND.message,
          }),
        );
      }
      return okAsync(undefined);
    });
  }

  @WithPosition()
  findAllWithAppliedBadges(): ResultAsync<
    { documentType: DocumentType; appliedBadges: string[] }[],
    DomainError
  > {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('dt')
        .leftJoinAndSelect(
          'dt.badgeRequirements',
          'br',
          'br.isActive = :isActive',
          {
            isActive: true,
          },
        )
        .leftJoinAndSelect('br.badge', 'b')
        .orderBy('dt.name', 'ASC')
        .getMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormDocTypes) =>
      ormDocTypes.map((ormDocType) => {
        // Extract unique badge names from requirements
        const appliedBadges = [
          ...new Set(
            (ormDocType.badgeRequirements || [])
              .filter((br) => br.badge)
              .map((br) => br.badge.name),
          ),
        ];
        return {
          documentType: ORMDocumentTypeMapper.toDomain(ormDocType),
          appliedBadges,
        };
      }),
    );
  }

  // ======================== HELPERS ========================

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMDocumentType);
  }
}
