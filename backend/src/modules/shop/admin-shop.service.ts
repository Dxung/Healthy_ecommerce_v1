import { Injectable, Inject } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { ResultAsync, errAsync } from 'neverthrow';
import type { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { PaginatedResult, PaginationParams } from 'src/shared/types/pagination.type';
import { createDomainError } from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { SHOP_ERRORS } from './errors/shop.errors';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { Shop } from './models/shop.model';
import { SHOP_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import type {
  IShopRepository,
  AdminShopFilters,
} from './repository/shop.repository.interface';
import type { IAdminShopService } from './admin-shop.service.interface';
import { ShopStatus } from 'src/database/typeorm/entities/shop/enums/shop-status.enum';

@Injectable()
export class AdminShopService implements IAdminShopService {
  constructor(
    @Inject(SHOP_REPOSITORY)
    private readonly shopRepository: IShopRepository,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  @WithPosition()
  getAllShops(
    filters: AdminShopFilters,
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<Shop>, DomainError> {
    return this.shopRepository.findAll(filters, pagination);
  }

  @WithPosition()
  getShopById(id: string): ResultAsync<Shop, DomainError> {
    return this.shopRepository.findById(id).andThen((shop) => {
      if (!shop) {
        return errAsync(
          createDomainError(SHOP_ERRORS.SHOP_NOT_FOUND, {
            cause: `Shop with ID ${id} not found`,
          }),
        );
      }
      return ResultAsync.fromSafePromise(Promise.resolve(shop));
    });
  }

  @WithPosition()
  suspendShop(id: string, reason: string): ResultAsync<void, DomainError> {
    const store = this.als.getStore();
    const adminId = store?.userId;

    if (!adminId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'Admin ID not found in ALS - shouldn\'t happen if AuthGuard is used',
        }),
      );
    }

    return this.shopRepository.findById(id).andThen((shop) => {
      if (!shop) {
        return errAsync(
          createDomainError(SHOP_ERRORS.SHOP_NOT_FOUND, { cause: null }),
        );
      }

      if (shop.status === ShopStatus.BANNED) {
        return errAsync(
          createDomainError(SHOP_ERRORS.ALREADY_BANNED, { cause: null }),
        );
      }

      if (shop.isAdminSuspended) {
        return errAsync(
          createDomainError(SHOP_ERRORS.CANNOT_SUSPEND, {
            cause: 'Shop is already suspended',
          }),
        );
      }

      return this.shopRepository
        .updateAdminSuspension(id, true, reason, adminId)
        .map(() => undefined);
    });
  }

  @WithPosition()
  unsuspendShop(id: string): ResultAsync<void, DomainError> {
    const store = this.als.getStore();
    const adminId = store?.userId;

    if (!adminId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'Admin ID not found in ALS - shouldn\'t happen if AuthGuard is used',
        }),
      );
    }

    return this.shopRepository.findById(id).andThen((shop) => {
      if (!shop) {
        return errAsync(
          createDomainError(SHOP_ERRORS.SHOP_NOT_FOUND, { cause: null }),
        );
      }

      if (shop.status === ShopStatus.BANNED) {
        return errAsync(
          createDomainError(SHOP_ERRORS.ALREADY_BANNED, { cause: null }),
        );
      }

      if (!shop.isAdminSuspended) {
        return errAsync(
          createDomainError(SHOP_ERRORS.CANNOT_UNSUSPEND, {
            cause: 'Shop is not suspended',
          }),
        );
      }

      return this.shopRepository
        .updateAdminSuspension(id, false, null, adminId)
        .map(() => undefined);
    });
  }

  @WithPosition()
  banShop(id: string, reason: string): ResultAsync<void, DomainError> {
    const store = this.als.getStore();
    const adminId = store?.userId;

    if (!adminId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'Admin ID not found in ALS - shouldn\'t happen if AuthGuard is used',
        }),
      );
    }

    return this.shopRepository.findById(id).andThen((shop) => {
      if (!shop) {
        return errAsync(
          createDomainError(SHOP_ERRORS.SHOP_NOT_FOUND, { cause: null }),
        );
      }

      if (shop.status === ShopStatus.BANNED) {
        return errAsync(
          createDomainError(SHOP_ERRORS.ALREADY_BANNED, { cause: null }),
        );
      }

      return this.shopRepository.banShop(id, reason, adminId).map(() => undefined);
    });
  }
}
