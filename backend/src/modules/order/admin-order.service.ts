import { Injectable, Inject } from '@nestjs/common';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
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
import { OrderStatus } from 'src/database/typeorm/entities/order/enums/order-status.enum';

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

  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
  ): ResultAsync<OrderWithShopAndBuyer, DomainError> {
    return this.orderRepository
      .findByIdWithItems(orderId)
      .andThen((order) => {
        if (!order) {
          return errAsync(
            createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND, { cause: null }),
          );
        }

        // Attempt admin force status change
        const transitionResult = order.adminForceStatus(newStatus, note);
        if (transitionResult.isErr()) {
          return errAsync(transitionResult.error);
        }

        return okAsync(order);
      })
      .andThen((order) => {
        // Save the updated order
        return this.orderRepository.updateOrder(order).map(() => order);
      })
      .andThen((order) => {
        // Return the updated order with shop and buyer info
        return this.orderRepository.findByIdForAdmin(order.id).andThen((result) => {
          if (!result) {
            return errAsync(
              createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND, { cause: null }),
            );
          }
          return okAsync(result);
        });
      });
  }
}
