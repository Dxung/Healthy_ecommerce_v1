import { Injectable, Inject } from '@nestjs/common';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
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
import type { IProductVariantRepository } from '../product/repository/product-variant.repository.interface';
import {
  ORDER_REPOSITORY,
  PRODUCT_VARIANT_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { ORDER_ERRORS } from './errors/order.errors';
import { OrderStatus } from 'src/database/typeorm/entities/order/enums/order-status.enum';
import { Order } from './models/order.model';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

@Injectable()
export class AdminOrderService implements IAdminOrderService {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly variantRepository: IProductVariantRepository,
  ) {}

  private getUserId(): string | undefined {
    const store = this.als.getStore();
    return store?.userId;
  }

  /**
   * Restores stock for cancelled order items.
   */
  private restoreStockForOrder(order: Order): ResultAsync<void, DomainError> {
    const items = order.items;
    if (items.length === 0) {
      return okAsync(undefined);
    }

    // Aggregate quantities by variant
    const stockMap = new Map<string, number>();
    for (const item of items) {
      const currentQty = stockMap.get(item.variantId) ?? 0;
      stockMap.set(item.variantId, currentQty + item.quantity);
    }

    const stockRestoreItems = Array.from(stockMap.entries()).map(
      ([variantId, quantity]) => ({ variantId, quantity }),
    );

    return this.variantRepository.restoreStock(stockRestoreItems);
  }

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
    const adminId = this.getUserId();

    return this.orderRepository
      .findByIdWithItems(orderId)
      .andThen((order) => {
        if (!order) {
          return errAsync(
            createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND, { cause: null }),
          );
        }

        // Attempt admin force status change with admin ID for tracking
        const transitionResult = order.adminForceStatus(
          newStatus,
          note,
          adminId ?? undefined,
        );
        if (transitionResult.isErr()) {
          return errAsync(transitionResult.error);
        }

        return okAsync(order);
      })
      .andThen((order) => {
        // If order was cancelled, restore stock to inventory
        if (newStatus === OrderStatus.CANCELLED) {
          return this.restoreStockForOrder(order).map(() => order);
        }
        return okAsync(order);
      })
      .andThen((order) => {
        // Save the updated order
        return this.orderRepository.updateOrder(order).map(() => order);
      })
      .andThen((order) => {
        // Return the updated order with shop and buyer info
        return this.orderRepository
          .findByIdForAdmin(order.id)
          .andThen((result) => {
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
