import { Inject, Injectable } from '@nestjs/common';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import {
  ICartService,
  CartFullResponse,
  CartPreviewData,
  CheckoutPreviewData,
  AddToCartResult,
} from './cart.service.interface';
import { ICartRepository } from './repository/cart.repository.interface';
import { IPublicProductService } from '../product/public-product.service.interface';
import { ISystemConfigService } from '../system-config/system-config.service.interface';
import { CART_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { PUBLIC_PRODUCT_SERVICE } from '../product/tokens/product.token';
import { SYSTEM_CONFIG_SERVICE } from '../system-config/tokens/system-config.token';
import { SHIPPING_FEE_DEFAULT } from '../order/constants/order.constants';
import { CartItem } from './models/cart-item.model';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { CART_ERRORS } from './errors/cart.errors';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

const CART_PREVIEW_LIMIT = 5;

@Injectable()
export class CartService implements ICartService {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(PUBLIC_PRODUCT_SERVICE)
    private readonly productService: IPublicProductService,
    @Inject(SYSTEM_CONFIG_SERVICE)
    private readonly systemConfigService: ISystemConfigService,
  ) {}

  private getUserId(): string | undefined {
    const store = this.als.getStore();
    return store?.userId;
  }

  @WithPosition()
  getMyCart(): ResultAsync<CartFullResponse, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.cartRepository.findOrCreateByUserId(userId).andThen((cart) =>
      this.cartRepository
        .findCartItemsWithDetails(cart.id)
        .map((itemsWithDetails) => ({
          cartId: cart.id,
          itemsWithDetails,
        })),
    );
  }

  @WithPosition()
  getCartPreview(): ResultAsync<CartPreviewData, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.cartRepository.findOrCreateByUserId(userId).andThen((cart) =>
      ResultAsync.combine([
        this.cartRepository.findRecentItemsWithDetails(
          cart.id,
          CART_PREVIEW_LIMIT,
        ),
        this.cartRepository.getItemCount(cart.id),
      ]).map(([recentItems, itemCount]) => ({
        recentItems,
        totalItems: itemCount,
        totalQuantity: itemCount,
      })),
    );
  }

  @WithPosition()
  addToCart(
    variantId: string,
    quantity: number,
    selectItem: boolean = false,
  ): ResultAsync<AddToCartResult, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    // Get variant with product info
    return this.productService
      .getVariantForCart(variantId)
      .andThen((variant) => {
        if (!variant) {
          return errAsync(createDomainError(CART_ERRORS.VARIANT_NOT_FOUND));
        }

        // Check variant is active
        if (!variant.isActive || variant.deletedAt) {
          return errAsync(createDomainError(CART_ERRORS.VARIANT_NOT_ACTIVE));
        }

        // Check if variant is expired
        if (variant.expiryDate && new Date(variant.expiryDate) < new Date()) {
          return errAsync(createDomainError(CART_ERRORS.VARIANT_EXPIRED));
        }

        // Check product is available
        if (
          !variant.product ||
          !variant.product.isVisible ||
          variant.product.status !== 'active'
        ) {
          return errAsync(createDomainError(CART_ERRORS.PRODUCT_NOT_AVAILABLE));
        }

        // Check stock
        if (variant.stockQuantity < quantity) {
          return errAsync(createDomainError(CART_ERRORS.INSUFFICIENT_STOCK));
        }

        return okAsync(variant);
      })
      .andThen((variant) =>
        this.cartRepository.findOrCreateByUserId(userId).andThen((cart) => {
          // If selectItem is true (Buy Now), deselect all other items first
          const deselectFirst = selectItem
            ? this.cartRepository.updateAllItemsSelection(cart.id, false)
            : okAsync(undefined);

          return deselectFirst.andThen(() =>
            this.cartRepository
              .findCartItemByVariantId(cart.id, variantId)
              .andThen((existingItem) => {
                if (existingItem) {
                  // Update quantity
                  const newQuantity = existingItem.quantity + quantity;
                  if (newQuantity > variant.stockQuantity) {
                    return errAsync(
                      createDomainError(CART_ERRORS.INSUFFICIENT_STOCK),
                    );
                  }
                  existingItem.updateQuantity(newQuantity);
                  // Select item if requested (for "Buy Now" feature)
                  if (selectItem) {
                    existingItem.select();
                  }
                  return this.cartRepository
                    .updateItem(existingItem)
                    .map((updated) => ({ cartItemId: updated.id }));
                } else {
                  // Create new item
                  const newItem = CartItem.createNew(
                    cart.id,
                    variant.product.shopId,
                    variant.product.id,
                    variantId,
                    quantity,
                    variant.price,
                    selectItem, // Select item if requested (for "Buy Now" feature)
                  );
                  return this.cartRepository
                    .addItem(newItem)
                    .map((added) => ({ cartItemId: added.id }));
                }
              }),
          );
        }),
      );
  }

  @WithPosition()
  updateItemQuantity(
    cartItemId: string,
    quantity: number,
  ): ResultAsync<void, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.cartRepository
      .findByUserId(userId)
      .andThen((cart) => {
        if (!cart) {
          return errAsync(createDomainError(CART_ERRORS.CART_NOT_FOUND));
        }
        return okAsync(cart);
      })
      .andThen((cart) =>
        this.cartRepository.findCartItemById(cartItemId).andThen((item) => {
          if (!item) {
            return errAsync(createDomainError(CART_ERRORS.CART_ITEM_NOT_FOUND));
          }
          if (item.cartId !== cart.id) {
            return errAsync(createDomainError(CART_ERRORS.CART_ITEM_NOT_OWNED));
          }
          return okAsync(item);
        }),
      )
      .andThen((item) =>
        this.productService
          .getVariantForCart(item.variantId)
          .andThen((variant) => {
            if (!variant || !variant.isActive) {
              return errAsync(
                createDomainError(CART_ERRORS.VARIANT_NOT_ACTIVE),
              );
            }
            if (variant.stockQuantity < quantity) {
              return errAsync(
                createDomainError(CART_ERRORS.INSUFFICIENT_STOCK),
              );
            }
            item.updateQuantity(quantity);
            return this.cartRepository.updateItem(item);
          }),
      )
      .map(() => undefined);
  }

  @WithPosition()
  removeItem(cartItemId: string): ResultAsync<void, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.cartRepository
      .findByUserId(userId)
      .andThen((cart) => {
        if (!cart) {
          return errAsync(createDomainError(CART_ERRORS.CART_NOT_FOUND));
        }
        return okAsync(cart);
      })
      .andThen((cart) =>
        this.cartRepository.findCartItemById(cartItemId).andThen((item) => {
          if (!item) {
            return errAsync(createDomainError(CART_ERRORS.CART_ITEM_NOT_FOUND));
          }
          if (item.cartId !== cart.id) {
            return errAsync(createDomainError(CART_ERRORS.CART_ITEM_NOT_OWNED));
          }
          return this.cartRepository.removeItem(cartItemId);
        }),
      );
  }

  @WithPosition()
  removeItems(cartItemIds: string[]): ResultAsync<void, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.cartRepository.findByUserId(userId).andThen((cart) => {
      if (!cart) {
        return errAsync(createDomainError(CART_ERRORS.CART_NOT_FOUND));
      }
      return this.cartRepository
        .findCartWithItems(userId)
        .andThen((cartWithItems) => {
          if (!cartWithItems) {
            return errAsync(createDomainError(CART_ERRORS.CART_NOT_FOUND));
          }
          // Verify all items belong to user's cart
          const cartItemIdsSet = new Set(
            cartWithItems.items.map((item) => item.id),
          );
          const invalidItems = cartItemIds.filter(
            (id) => !cartItemIdsSet.has(id),
          );
          if (invalidItems.length > 0) {
            return errAsync(createDomainError(CART_ERRORS.CART_ITEM_NOT_OWNED));
          }
          return this.cartRepository.removeItems(cartItemIds);
        });
    });
  }

  @WithPosition()
  removeInactiveItems(): ResultAsync<{ removedCount: number }, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.cartRepository.findByUserId(userId).andThen((cart) => {
      if (!cart) {
        return okAsync({ removedCount: 0 });
      }
      return this.cartRepository
        .findInactiveItemIds(cart.id)
        .andThen((inactiveIds) => {
          if (inactiveIds.length === 0) {
            return okAsync({ removedCount: 0 });
          }
          return this.cartRepository
            .removeItems(inactiveIds)
            .map(() => ({ removedCount: inactiveIds.length }));
        });
    });
  }

  @WithPosition()
  toggleItemSelection(cartItemId: string): ResultAsync<void, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.cartRepository
      .findByUserId(userId)
      .andThen((cart) => {
        if (!cart) {
          return errAsync(createDomainError(CART_ERRORS.CART_NOT_FOUND));
        }
        return okAsync(cart);
      })
      .andThen((cart) =>
        this.cartRepository.findCartItemById(cartItemId).andThen((item) => {
          if (!item) {
            return errAsync(createDomainError(CART_ERRORS.CART_ITEM_NOT_FOUND));
          }
          if (item.cartId !== cart.id) {
            return errAsync(createDomainError(CART_ERRORS.CART_ITEM_NOT_OWNED));
          }
          item.toggleSelection();
          return this.cartRepository.updateItem(item);
        }),
      )
      .map(() => undefined);
  }

  @WithPosition()
  selectAllItems(): ResultAsync<void, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.cartRepository.findByUserId(userId).andThen((cart) => {
      if (!cart) {
        return errAsync(createDomainError(CART_ERRORS.CART_NOT_FOUND));
      }
      return this.cartRepository.updateAllItemsSelection(cart.id, true);
    });
  }

  @WithPosition()
  deselectAllItems(): ResultAsync<void, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.cartRepository.findByUserId(userId).andThen((cart) => {
      if (!cart) {
        return errAsync(createDomainError(CART_ERRORS.CART_NOT_FOUND));
      }
      return this.cartRepository.updateAllItemsSelection(cart.id, false);
    });
  }

  @WithPosition()
  selectShopItems(shopId: string): ResultAsync<void, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.cartRepository.findByUserId(userId).andThen((cart) => {
      if (!cart) {
        return errAsync(createDomainError(CART_ERRORS.CART_NOT_FOUND));
      }
      return this.cartRepository.updateShopItemsSelection(
        cart.id,
        shopId,
        true,
      );
    });
  }

  @WithPosition()
  deselectShopItems(shopId: string): ResultAsync<void, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.cartRepository.findByUserId(userId).andThen((cart) => {
      if (!cart) {
        return errAsync(createDomainError(CART_ERRORS.CART_NOT_FOUND));
      }
      return this.cartRepository.updateShopItemsSelection(
        cart.id,
        shopId,
        false,
      );
    });
  }

  @WithPosition()
  prepareCheckout(): ResultAsync<CheckoutPreviewData, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.cartRepository
      .findByUserId(userId)
      .andThen((cart) => {
        if (!cart) {
          return errAsync(createDomainError(CART_ERRORS.CART_NOT_FOUND));
        }
        return okAsync(cart);
      })
      .andThen((cart) =>
        ResultAsync.combine([
          this.cartRepository.findCartItemsWithDetails(cart.id),
          this.cartRepository.findInactiveItemIds(cart.id),
          this.systemConfigService.getShippingFreeThreshold(),
        ]).andThen(([itemsWithDetails, inactiveIds, shippingFreeThreshold]) => {
          const selectedItems = itemsWithDetails.filter(
            (item) => item.cartItem.isSelected,
          );

          if (selectedItems.length === 0) {
            return errAsync(createDomainError(CART_ERRORS.NO_ITEMS_SELECTED));
          }

          return okAsync({
            selectedItems,
            hasInactiveItems: inactiveIds.length > 0,
            shippingFeeDefault: SHIPPING_FEE_DEFAULT,
            shippingFreeThreshold,
          });
        }),
      );
  }
}
