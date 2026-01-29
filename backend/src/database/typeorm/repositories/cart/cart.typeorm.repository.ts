import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { ResultAsync, okAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import {
  ICartRepository,
  CartItemWithDetails,
} from 'src/modules/cart/repository/cart.repository.interface';
import { Cart } from 'src/modules/cart/models/cart.model';
import { CartItem } from 'src/modules/cart/models/cart-item.model';
import { ORMCart } from '../../entities/cart/orm.cart.entity';
import { ORMCartItem } from '../../entities/cart/orm.cart-item.entity';
import { ORMCartMapper } from '../../mappers/cart.mapper.orm';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { ProductStatus } from '../../entities/product/enums/product-status.enum';

@Injectable()
export class OrmCartRepository implements ICartRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findByUserId(userId: string): ResultAsync<Cart | null, DomainError> {
    const repo = this.getCartRepository();

    return ResultAsync.fromPromise(
      repo.findOne({ where: { userId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormCart) => (ormCart ? ORMCartMapper.toDomain(ormCart) : null));
  }

  @WithPosition()
  findOrCreateByUserId(userId: string): ResultAsync<Cart, DomainError> {
    return this.findByUserId(userId).andThen((cart) => {
      if (cart) return okAsync(cart);

      const newCart = Cart.createNew(userId);
      const ormCart = ORMCartMapper.toOrm(newCart);
      const repo = this.getCartRepository();

      return ResultAsync.fromPromise(repo.save(ormCart), (error) =>
        createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      ).map(() => newCart);
    });
  }

  @WithPosition()
  findCartWithItems(userId: string): ResultAsync<Cart | null, DomainError> {
    const repo = this.getCartRepository();

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { userId },
        relations: ['items'],
        order: { items: { createdAt: 'DESC' } },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormCart) => (ormCart ? ORMCartMapper.toDomain(ormCart) : null));
  }

  @WithPosition()
  findCartItemsWithDetails(
    cartId: string,
  ): ResultAsync<CartItemWithDetails[], DomainError> {
    const repo = this.getCartItemRepository();

    return ResultAsync.fromPromise(
      repo.find({
        where: { cartId },
        relations: ['variant', 'variant.product', 'product', 'shop'],
        order: { createdAt: 'DESC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormCartItems) =>
      ormCartItems.map((item) => {
        const currentPrice = Number(item.variant.price);
        const priceAtAdded = Number(item.priceAtAdded);
        return {
          cartItem: ORMCartMapper.cartItemToDomain(item),
          variant: {
            id: item.variant.id,
            name: item.variant.name,
            price: currentPrice,
            compareAtPrice: item.variant.compareAtPrice
              ? Number(item.variant.compareAtPrice)
              : null,
            imageUrl: item.variant.imageUrl,
            stockQuantity: item.variant.stockQuantity,
            isActive: item.variant.isActive,
            sku: item.variant.sku,
          },
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            thumbnailUrl: item.product.thumbnailUrl,
            isVisible: item.product.isVisible,
            status: item.product.status,
          },
          shop: {
            id: item.shop.id,
            name: item.shop.name,
            slug: item.shop.slug,
            logoUrl: item.shop.logoUrl,
          },
          hasPriceChanged: currentPrice !== priceAtAdded,
        };
      }),
    );
  }

  @WithPosition()
  findCartItemById(
    cartItemId: string,
  ): ResultAsync<CartItem | null, DomainError> {
    const repo = this.getCartItemRepository();

    return ResultAsync.fromPromise(
      repo.findOne({ where: { id: cartItemId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormCartItem) =>
      ormCartItem ? ORMCartMapper.cartItemToDomain(ormCartItem) : null,
    );
  }

  @WithPosition()
  findCartItemByVariantId(
    cartId: string,
    variantId: string,
  ): ResultAsync<CartItem | null, DomainError> {
    const repo = this.getCartItemRepository();

    return ResultAsync.fromPromise(
      repo.findOne({ where: { cartId, variantId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormCartItem) =>
      ormCartItem ? ORMCartMapper.cartItemToDomain(ormCartItem) : null,
    );
  }

  @WithPosition()
  addItem(cartItem: CartItem): ResultAsync<CartItem, DomainError> {
    const repo = this.getCartItemRepository();
    const ormCartItem = ORMCartMapper.cartItemToOrm(cartItem);

    return ResultAsync.fromPromise(repo.save(ormCartItem), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMCartMapper.cartItemToDomain(saved));
  }

  @WithPosition()
  updateItem(cartItem: CartItem): ResultAsync<CartItem, DomainError> {
    const repo = this.getCartItemRepository();
    const ormCartItem = ORMCartMapper.cartItemToOrm(cartItem);

    return ResultAsync.fromPromise(repo.save(ormCartItem), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMCartMapper.cartItemToDomain(saved));
  }

  @WithPosition()
  removeItem(cartItemId: string): ResultAsync<void, DomainError> {
    const repo = this.getCartItemRepository();

    return ResultAsync.fromPromise(repo.delete({ id: cartItemId }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  removeItems(cartItemIds: string[]): ResultAsync<void, DomainError> {
    if (cartItemIds.length === 0) return okAsync(undefined);

    const repo = this.getCartItemRepository();

    return ResultAsync.fromPromise(
      repo.delete({ id: In(cartItemIds) }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  updateCart(cart: Cart): ResultAsync<Cart, DomainError> {
    const repo = this.getCartRepository();
    const ormCart = ORMCartMapper.toOrm(cart);

    return ResultAsync.fromPromise(repo.save(ormCart), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMCartMapper.toDomain(saved));
  }

  @WithPosition()
  clearCart(cartId: string): ResultAsync<void, DomainError> {
    const repo = this.getCartItemRepository();

    return ResultAsync.fromPromise(repo.delete({ cartId }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  updateItemsSelection(
    cartItemIds: string[],
    isSelected: boolean,
  ): ResultAsync<void, DomainError> {
    if (cartItemIds.length === 0) return okAsync(undefined);

    const repo = this.getCartItemRepository();

    return ResultAsync.fromPromise(
      repo.update({ id: In(cartItemIds) }, { isSelected }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  updateShopItemsSelection(
    cartId: string,
    shopId: string,
    isSelected: boolean,
  ): ResultAsync<void, DomainError> {
    const repo = this.getCartItemRepository();

    return ResultAsync.fromPromise(
      repo.update({ cartId, shopId }, { isSelected }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  updateAllItemsSelection(
    cartId: string,
    isSelected: boolean,
  ): ResultAsync<void, DomainError> {
    const repo = this.getCartItemRepository();

    return ResultAsync.fromPromise(
      repo.update({ cartId }, { isSelected }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  findInactiveItemIds(cartId: string): ResultAsync<string[], DomainError> {
    const repo = this.getCartItemRepository();

    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('item')
        .leftJoinAndSelect('item.variant', 'variant')
        .leftJoinAndSelect('item.product', 'product')
        .where('item.cartId = :cartId', { cartId })
        .andWhere(
          `(
            variant.deletedAt IS NOT NULL
            OR variant.isActive = false
            OR variant.stockQuantity <= 0
            OR product.deletedAt IS NOT NULL
            OR product.isVisible = false
            OR product.status != :activeStatus
          )`,
          { activeStatus: ProductStatus.ACTIVE },
        )
        .getMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((items) => items.map((item) => item.id));
  }

  @WithPosition()
  getItemCount(cartId: string): ResultAsync<number, DomainError> {
    const repo = this.getCartItemRepository();

    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('item')
        .where('item.cartId = :cartId', { cartId })
        .select('COALESCE(SUM(item.quantity), 0)', 'total')
        .getRawOne<{ total: string }>(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((result) => parseInt(result?.total || '0', 10));
  }

  @WithPosition()
  findRecentItemsWithDetails(
    cartId: string,
    limit: number,
  ): ResultAsync<CartItemWithDetails[], DomainError> {
    const repo = this.getCartItemRepository();

    return ResultAsync.fromPromise(
      repo.find({
        where: { cartId },
        relations: ['variant', 'variant.product', 'product', 'shop'],
        order: { createdAt: 'DESC' },
        take: limit,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormCartItems) =>
      ormCartItems.map((item) => {
        const currentPrice = Number(item.variant.price);
        const priceAtAdded = Number(item.priceAtAdded);
        return {
          cartItem: ORMCartMapper.cartItemToDomain(item),
          variant: {
            id: item.variant.id,
            name: item.variant.name,
            price: currentPrice,
            compareAtPrice: item.variant.compareAtPrice
              ? Number(item.variant.compareAtPrice)
              : null,
            imageUrl: item.variant.imageUrl,
            stockQuantity: item.variant.stockQuantity,
            isActive: item.variant.isActive,
            sku: item.variant.sku,
          },
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            thumbnailUrl: item.product.thumbnailUrl,
            isVisible: item.product.isVisible,
            status: item.product.status,
          },
          shop: {
            id: item.shop.id,
            name: item.shop.name,
            slug: item.shop.slug,
            logoUrl: item.shop.logoUrl,
          },
          hasPriceChanged: currentPrice !== priceAtAdded,
        };
      }),
    );
  }

  private getEntityManager() {
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getCartRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMCart);
  }

  private getCartItemRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMCartItem);
  }
}
