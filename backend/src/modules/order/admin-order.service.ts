import { Injectable, Inject } from '@nestjs/common';
import { ResultAsync, errAsync } from 'neverthrow';
import type {
  IAdminOrderService,
  AdminOrderFilters,
  PaginationParams,
} from './admin-order.service.interface';
import type { IOrderRepository } from './repository/order.repository.interface';
import type {
  OrderWithShopAndBuyer,
  PaginatedResult,
} from './repository/order.repository.interface';
import { ORDER_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { ORDER_ERRORS } from './errors/order.errors';

@Injectable()
export class AdminOrderService implements IAdminOrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  getAllOrders(
    filters: AdminOrderFilters,
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<OrderWithShopAndBuyer>, DomainError> {
    return this.orderRepository.findAllForAdmin(
      {
        status: filters.status,
        search: filters.search,
        shopId: filters.shopId,
        buyerId: filters.buyerId,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      },
      pagination,
    );
  }

  getOrderById(
    orderId: string,
  ): ResultAsync<OrderWithShopAndBuyer, DomainError> {
    return this.orderRepository.findByIdForAdmin(orderId).andThen((result) => {
      if (!result) {
        return errAsync(
          createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND, { cause: null }),
        );
      }
      return ResultAsync.fromSafePromise(Promise.resolve(result));
    });
  }
}
