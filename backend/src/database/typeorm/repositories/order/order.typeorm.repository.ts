import { Injectable } from '@nestjs/common';
import { DataSource, LessThan } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import {
  IOrderRepository,
  OrderWithShop,
  OrderWithBuyer,
  OrderWithShopAndBuyer,
  OrderItemWithOrder,
  OrderListFilters,
  AdminOrderListFilters,
  PaginationOptions,
  PaginatedResult,
} from 'src/modules/order/repository/order.repository.interface';
import { Order } from 'src/modules/order/models/order.model';
import { OrderItem } from 'src/modules/order/models/order-item.model';
import { ORMOrder } from '../../entities/order/orm.order.entity';
import { ORMOrderItem } from '../../entities/order/orm.order-item.entity';
import { ORMOrderMapper } from '../../mappers/order.mapper.orm';
import { OrderStatus } from '../../entities/order/enums/order-status.enum';
import { PaymentStatus } from '../../entities/order/enums/payment-status.enum';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

@Injectable()
export class OrmOrderRepository implements IOrderRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findByIdWithItems(orderId: string): ResultAsync<Order | null, DomainError> {
    const repo = this.getOrderRepository();

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id: orderId },
        relations: ['items'],
        order: { items: { createdAt: 'ASC' } },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormOrder) => (ormOrder ? ORMOrderMapper.toDomain(ormOrder) : null));
  }

  @WithPosition()
  findByOrderCode(orderCode: string): ResultAsync<Order | null, DomainError> {
    const repo = this.getOrderRepository();

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { orderCode },
        relations: ['items'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormOrder) => (ormOrder ? ORMOrderMapper.toDomain(ormOrder) : null));
  }

  @WithPosition()
  findByBuyerId(
    buyerId: string,
    filters: OrderListFilters,
    pagination: PaginationOptions,
  ): ResultAsync<PaginatedResult<OrderWithShop>, DomainError> {
    const repo = this.getOrderRepository();
    const skip = (pagination.page - 1) * pagination.limit;

    return ResultAsync.fromPromise(
      (async () => {
        const queryBuilder = repo
          .createQueryBuilder('order')
          .leftJoinAndSelect('order.shop', 'shop')
          .leftJoinAndSelect('order.items', 'items')
          .where('order.buyerId = :buyerId', { buyerId });

        if (filters.status) {
          queryBuilder.andWhere('order.status = :status', {
            status: filters.status,
          });
        }

        if (filters.fromDate) {
          queryBuilder.andWhere('order.createdAt >= :fromDate', {
            fromDate: filters.fromDate,
          });
        }

        if (filters.toDate) {
          queryBuilder.andWhere('order.createdAt <= :toDate', {
            toDate: filters.toDate,
          });
        }

        const [orders, total] = await queryBuilder
          .orderBy('order.createdAt', 'DESC')
          .skip(skip)
          .take(pagination.limit)
          .getManyAndCount();

        return { orders, total };
      })(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(({ orders, total }) => ({
      items: orders.map((ormOrder) => ({
        order: ORMOrderMapper.toDomain(ormOrder),
        shop: {
          id: ormOrder.shop.id,
          name: ormOrder.shop.name,
          slug: ormOrder.shop.slug,
          logoUrl: ormOrder.shop.logoUrl,
        },
      })),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    }));
  }

  @WithPosition()
  findByShopId(
    shopId: string,
    filters: OrderListFilters,
    pagination: PaginationOptions,
  ): ResultAsync<PaginatedResult<OrderWithBuyer>, DomainError> {
    const repo = this.getOrderRepository();
    const skip = (pagination.page - 1) * pagination.limit;

    return ResultAsync.fromPromise(
      (async () => {
        const queryBuilder = repo
          .createQueryBuilder('order')
          .leftJoinAndSelect('order.buyer', 'buyer')
          .leftJoinAndSelect('order.items', 'items')
          .where('order.shopId = :shopId', { shopId });

        if (filters.status) {
          queryBuilder.andWhere('order.status = :status', {
            status: filters.status,
          });
        }

        if (filters.fromDate) {
          queryBuilder.andWhere('order.createdAt >= :fromDate', {
            fromDate: filters.fromDate,
          });
        }

        if (filters.toDate) {
          queryBuilder.andWhere('order.createdAt <= :toDate', {
            toDate: filters.toDate,
          });
        }

        const [orders, total] = await queryBuilder
          .orderBy('order.createdAt', 'DESC')
          .skip(skip)
          .take(pagination.limit)
          .getManyAndCount();

        return { orders, total };
      })(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(({ orders, total }) => ({
      items: orders.map((ormOrder) => ({
        order: ORMOrderMapper.toDomain(ormOrder),
        buyer: {
          id: ormOrder.buyer.id,
          fullName: ormOrder.buyer.fullName,
          avatarUrl: ormOrder.buyer.avatarUrl,
        },
      })),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    }));
  }

  @WithPosition()
  findByIdForBuyer(
    orderId: string,
    buyerId: string,
  ): ResultAsync<OrderWithShop | null, DomainError> {
    const repo = this.getOrderRepository();

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id: orderId, buyerId },
        relations: ['items', 'shop'],
        order: { items: { createdAt: 'ASC' } },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormOrder) =>
      ormOrder
        ? {
            order: ORMOrderMapper.toDomain(ormOrder),
            shop: {
              id: ormOrder.shop.id,
              name: ormOrder.shop.name,
              slug: ormOrder.shop.slug,
              logoUrl: ormOrder.shop.logoUrl,
            },
          }
        : null,
    );
  }

  @WithPosition()
  findByIdForShop(
    orderId: string,
    shopId: string,
  ): ResultAsync<OrderWithBuyer | null, DomainError> {
    const repo = this.getOrderRepository();

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id: orderId, shopId },
        relations: ['items', 'buyer'],
        order: { items: { createdAt: 'ASC' } },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormOrder) =>
      ormOrder
        ? {
            order: ORMOrderMapper.toDomain(ormOrder),
            buyer: {
              id: ormOrder.buyer.id,
              fullName: ormOrder.buyer.fullName,
              avatarUrl: ormOrder.buyer.avatarUrl,
            },
          }
        : null,
    );
  }

  @WithPosition()
  saveOrderWithItems(
    order: Order,
    items: OrderItem[],
  ): ResultAsync<Order, DomainError> {
    const orderRepo = this.getOrderRepository();
    const itemRepo = this.getOrderItemRepository();
    const ormOrder = ORMOrderMapper.toOrm(order);
    const ormItems = items.map((item) => ORMOrderMapper.orderItemToOrm(item));

    return ResultAsync.fromPromise(orderRepo.save(ormOrder), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    )
      .andThen(() =>
        ResultAsync.fromPromise(itemRepo.save(ormItems), (error) =>
          createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
        ),
      )
      .andThen(() => this.findByIdWithItems(order.id))
      .map((savedOrder) => savedOrder!);
  }

  @WithPosition()
  updateOrder(order: Order): ResultAsync<Order, DomainError> {
    const repo = this.getOrderRepository();
    const ormOrder = ORMOrderMapper.toOrm(order);

    return ResultAsync.fromPromise(repo.save(ormOrder), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMOrderMapper.toDomain(saved));
  }

  @WithPosition()
  save(order: Order): ResultAsync<Order, DomainError> {
    return this.updateOrder(order);
  }

  @WithPosition()
  findById(orderId: string): ResultAsync<Order | null, DomainError> {
    const repo = this.getOrderRepository();

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id: orderId },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormOrder) => (ormOrder ? ORMOrderMapper.toDomain(ormOrder) : null));
  }

  @WithPosition()
  findOrdersForAutoComplete(
    daysAfterDelivery: number,
  ): ResultAsync<Order[], DomainError> {
    const repo = this.getOrderRepository();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAfterDelivery);

    return ResultAsync.fromPromise(
      repo.find({
        where: {
          status: OrderStatus.DELIVERED,
          deliveredAt: LessThan(cutoffDate),
        },
        relations: ['items'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormOrders) => ORMOrderMapper.toDomainList(ormOrders));
  }

  @WithPosition()
  countByBuyerIdAndStatus(
    buyerId: string,
    status: OrderStatus,
  ): ResultAsync<number, DomainError> {
    const repo = this.getOrderRepository();

    return ResultAsync.fromPromise(
      repo.count({ where: { buyerId, status } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  countByShopIdAndStatus(
    shopId: string,
    status: OrderStatus,
  ): ResultAsync<number, DomainError> {
    const repo = this.getOrderRepository();

    return ResultAsync.fromPromise(
      repo.count({ where: { shopId, status } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  // ===================== ADMIN METHODS =====================

  @WithPosition()
  findAllForAdmin(
    filters: AdminOrderListFilters,
    pagination: PaginationOptions,
  ): ResultAsync<PaginatedResult<OrderWithShopAndBuyer>, DomainError> {
    const repo = this.getOrderRepository();
    const skip = (pagination.page - 1) * pagination.limit;

    return ResultAsync.fromPromise(
      (async () => {
        const queryBuilder = repo
          .createQueryBuilder('order')
          .leftJoinAndSelect('order.shop', 'shop')
          .leftJoinAndSelect('order.buyer', 'buyer')
          .leftJoinAndSelect('order.items', 'items');

        if (filters.status) {
          queryBuilder.andWhere('order.status = :status', {
            status: filters.status,
          });
        }

        if (filters.shopId) {
          queryBuilder.andWhere('order.shopId = :shopId', {
            shopId: filters.shopId,
          });
        }

        if (filters.buyerId) {
          queryBuilder.andWhere('order.buyerId = :buyerId', {
            buyerId: filters.buyerId,
          });
        }

        if (filters.search) {
          queryBuilder.andWhere(
            '(order.orderCode ILIKE :search OR shop.name ILIKE :search OR buyer.fullName ILIKE :search OR buyer.phone ILIKE :search)',
            { search: `%${filters.search}%` },
          );
        }

        if (filters.fromDate) {
          queryBuilder.andWhere('order.createdAt >= :fromDate', {
            fromDate: filters.fromDate,
          });
        }

        if (filters.toDate) {
          queryBuilder.andWhere('order.createdAt <= :toDate', {
            toDate: filters.toDate,
          });
        }

        const [orders, total] = await queryBuilder
          .orderBy('order.createdAt', 'DESC')
          .skip(skip)
          .take(pagination.limit)
          .getManyAndCount();

        return { orders, total };
      })(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(({ orders, total }) => ({
      items: orders.map((ormOrder) => ({
        order: ORMOrderMapper.toDomain(ormOrder),
        shop: {
          id: ormOrder.shop.id,
          name: ormOrder.shop.name,
          slug: ormOrder.shop.slug,
          logoUrl: ormOrder.shop.logoUrl,
        },
        buyer: {
          id: ormOrder.buyer.id,
          fullName: ormOrder.buyer.fullName,
          phone: ormOrder.buyer.phoneNumber,
        },
      })),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    }));
  }

  @WithPosition()
  findByIdForAdmin(
    orderId: string,
  ): ResultAsync<OrderWithShopAndBuyer | null, DomainError> {
    const repo = this.getOrderRepository();

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id: orderId },
        relations: ['items', 'shop', 'buyer'],
        order: { items: { createdAt: 'ASC' } },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormOrder) =>
      ormOrder
        ? {
            order: ORMOrderMapper.toDomain(ormOrder),
            shop: {
              id: ormOrder.shop.id,
              name: ormOrder.shop.name,
              slug: ormOrder.shop.slug,
              logoUrl: ormOrder.shop.logoUrl,
            },
            buyer: {
              id: ormOrder.buyer.id,
              fullName: ormOrder.buyer.fullName,
              phone: ormOrder.buyer.phoneNumber,
            },
          }
        : null,
    );
  }

  // ===================== ORDER ITEM OPERATIONS =====================

  @WithPosition()
  findOrderItemById(
    orderItemId: string,
  ): ResultAsync<OrderItemWithOrder | null, DomainError> {
    const repo = this.getOrderItemRepository();

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id: orderItemId },
        relations: ['order'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormItem) => {
      if (!ormItem) return null;
      return {
        item: ORMOrderMapper.orderItemToDomain(ormItem),
        order: ORMOrderMapper.toDomain(ormItem.order),
      };
    });
  }

  @WithPosition()
  updateOrderItem(item: OrderItem): ResultAsync<OrderItem, DomainError> {
    const repo = this.getOrderItemRepository();
    const orm = ORMOrderMapper.orderItemToOrm(item);

    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMOrderMapper.orderItemToDomain(saved));
  }

  // ===================== REFUND PROCESSING =====================

  @WithPosition()
  findCancelledOrdersNeedingRefund(): ResultAsync<Order[], DomainError> {
    const repo = this.getOrderRepository();

    return ResultAsync.fromPromise(
      repo.find({
        where: {
          status: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.PAID,
        },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormOrders) => ormOrders.map((orm) => ORMOrderMapper.toDomain(orm)));
  }

  private getEntityManager() {
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getOrderRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMOrder);
  }

  private getOrderItemRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMOrderItem);
  }
}
