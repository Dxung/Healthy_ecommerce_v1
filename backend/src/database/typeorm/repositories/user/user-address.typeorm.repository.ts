import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import { IUserAddressRepository } from 'src/modules/user/repository/user-address.repository.interface';
import { UserAddress } from 'src/modules/user/models/user-address.model';
import { ORMUserAddress } from '../../entities/user/orm.user-address.entity';
import { ORMUserAddressMapper } from '../../mappers/user-address.mapper.orm';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

@Injectable()
export class OrmUserAddressRepository implements IUserAddressRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findAllByUserId(userId: string): ResultAsync<UserAddress[], DomainError> {
    const repo = this.getUserAddressRepository();

    return ResultAsync.fromPromise(
      repo.find({
        where: { userId },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
      }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ormAddresses) => ORMUserAddressMapper.toDomainList(ormAddresses));
  }

  @WithPosition()
  findById(addressId: string): ResultAsync<UserAddress | null, DomainError> {
    const repo = this.getUserAddressRepository();

    return ResultAsync.fromPromise(
      repo.findOne({ where: { id: addressId } }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ormAddress) => {
      if (!ormAddress) return null;
      return ORMUserAddressMapper.toDomain(ormAddress);
    });
  }

  @WithPosition()
  createAddress(address: UserAddress): ResultAsync<UserAddress, DomainError> {
    const repo = this.getUserAddressRepository();
    const ormAddress = ORMUserAddressMapper.toOrm(address);

    return ResultAsync.fromPromise(repo.save(ormAddress), (error) => {
      return createDomainError(SHARED_ERRORS.DB_ERROR, {
        cause: error,
      });
    }).map((savedAddress) => ORMUserAddressMapper.toDomain(savedAddress));
  }

  @WithPosition()
  updateAddress(address: UserAddress): ResultAsync<UserAddress, DomainError> {
    const repo = this.getUserAddressRepository();
    const ormAddress = ORMUserAddressMapper.toOrm(address);

    return ResultAsync.fromPromise(repo.save(ormAddress), (error) => {
      return createDomainError(SHARED_ERRORS.DB_ERROR, {
        cause: error,
      });
    }).map((savedAddress) => ORMUserAddressMapper.toDomain(savedAddress));
  }

  @WithPosition()
  deleteAddress(addressId: string): ResultAsync<void, DomainError> {
    const repo = this.getUserAddressRepository();

    return ResultAsync.fromPromise(repo.delete({ id: addressId }), (error) => {
      return createDomainError(SHARED_ERRORS.DB_ERROR, {
        cause: error,
      });
    }).map(() => undefined);
  }

  @WithPosition()
  unsetAllDefaults(userId: string): ResultAsync<void, DomainError> {
    const repo = this.getUserAddressRepository();

    return ResultAsync.fromPromise(
      repo.update({ userId, isDefault: true }, { isDefault: false }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map(() => undefined);
  }

  @WithPosition()
  countByUserId(userId: string): ResultAsync<number, DomainError> {
    const repo = this.getUserAddressRepository();

    return ResultAsync.fromPromise(
      repo.count({ where: { userId } }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    );
  }

  @WithPosition()
  findDefaultByUserId(
    userId: string,
  ): ResultAsync<UserAddress | null, DomainError> {
    const repo = this.getUserAddressRepository();

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { userId, isDefault: true },
      }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ormAddress) => {
      if (!ormAddress) return null;
      return ORMUserAddressMapper.toDomain(ormAddress);
    });
  }

  @WithPosition()
  setAsDefault(addressId: string): ResultAsync<void, DomainError> {
    const repo = this.getUserAddressRepository();

    return ResultAsync.fromPromise(
      repo.update({ id: addressId }, { isDefault: true }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map(() => undefined);
  }

  private getEntityManager() {
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getUserAddressRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMUserAddress);
  }
}
