import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { ORMSystemConfig } from '../../entities/config';
import { SystemConfigOrmMapper } from '../../mappers/system-config.mapper.orm';
import { ISystemConfigRepository } from 'src/modules/system-config/repository/system-config.repository.interface';
import { SystemConfig } from 'src/modules/system-config/models/system-config.model';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';

@Injectable()
export class OrmSystemConfigRepository implements ISystemConfigRepository {
  private readonly repo: Repository<ORMSystemConfig>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(ORMSystemConfig);
  }

  findByKey(key: string): ResultAsync<SystemConfig | null, DomainError> {
    return ResultAsync.fromPromise(
      this.repo.findOne({ where: { configKey: key } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? SystemConfigOrmMapper.toDomain(orm) : null));
  }

  findAll(): ResultAsync<SystemConfig[], DomainError> {
    return ResultAsync.fromPromise(
      this.repo.find({ order: { configKey: 'ASC' } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => SystemConfigOrmMapper.toDomainList(orms));
  }

  save(config: SystemConfig): ResultAsync<SystemConfig, DomainError> {
    const orm = SystemConfigOrmMapper.toOrm(config);

    return ResultAsync.fromPromise(
      this.repo.upsert(orm, {
        conflictPaths: ['configKey'],
        skipUpdateIfNoValuesChanged: true,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen(() => this.findByKey(config.key).map((result) => result!));
  }

  deleteByKey(key: string): ResultAsync<void, DomainError> {
    return ResultAsync.fromPromise(
      this.repo.delete({ configKey: key }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }
}
