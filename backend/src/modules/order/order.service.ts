import { Inject, Injectable } from '@nestjs/common';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import {
  IOrderService,
  CreateOrderInput,
  CreateOrderResult,
  OrderListFilters,
  PaginationOptions,
} from './order.service.interface';
import {
  IOrderRepository,
  OrderWithShop,
  OrderWithBuyer,
  PaginatedResult,
} from './repository/order.repository.interface';
import { ICartService } from '../cart/cart.service.interface';
import { CartItemWithDetails } from '../cart/repository/cart.repository.interface';
import { IUserService } from '../user/user.service.interface';
import { IShopService } from '../shop/shop.service.interface';
import { IWalletService } from '../payment/services/wallet.service.interface';
import { IEscrowService } from '../payment/services/escrow.service.interface';
import { IPaymentService } from '../payment/payment.service.interface';
import { IBuyerService } from '../buyer/buyer.service.interface';
import { IBuyerCoinWalletRepository } from '../buyer/repository/buyer-coin-wallet.repository.interface';
import { IProductVariantRepository } from '../product/repository/product-variant.repository.interface';
import { ISystemConfigService } from '../system-config/system-config.service.interface';
import { IShopBadgeBenefitsService } from '../shop/shop-badge-benefits.service.interface';
import { IVnpayService } from '../payment/services/vnpay.service.interface';
import { IPaymentTransactionRepository } from '../payment/repository/payment-transaction.repository.interface';
import {
  ORDER_REPOSITORY,
  PRODUCT_VARIANT_REPOSITORY,
  BUYER_COIN_WALLET_REPOSITORY,
  PAYMENT_TRANSACTION_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import { CART_SERVICE } from '../cart/tokens/cart.token';
import { USER_SERVICE } from '../user/tokens/user.token';
import {
  SHOP_SERVICE,
  SHOP_BADGE_BENEFITS_SERVICE,
} from '../shop/tokens/shop.token';
import { BUYER_SERVICE } from '../buyer/tokens/buyer.token';
import {
  WALLET_SERVICE,
  ESCROW_SERVICE,
  PAYMENT_SERVICE,
  VNPAY_SERVICE,
} from '../payment/tokens/payment.token';
import { SYSTEM_CONFIG_SERVICE } from '../system-config/tokens/system-config.token';
import { UOW_TOKEN } from 'src/shared/unitOfWork/tokens/uow.token';
import { IUow } from 'src/shared/unitOfWork/interfaces/uow.interface';
import { Order } from './models/order.model';
import { OrderItem } from './models/order-item.model';
import { SHIPPING_FEE_DEFAULT } from './constants/order.constants';
import { CancelledBy } from 'src/database/typeorm/entities/order/enums/cancelled-by.enum';
import { PaymentMethod } from 'src/database/typeorm/entities/order/enums/payment-method.enum';
import { PaymentStatus } from 'src/database/typeorm/entities/order/enums/payment-status.enum';
import { OrderStatus } from 'src/database/typeorm/entities/order/enums/order-status.enum';
import { EscrowStatus } from 'src/database/typeorm/entities/payment/enums/escrow-status.enum';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { ORDER_ERRORS } from './errors/order.errors';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { CUSTOM_LOG } from 'src/shared/custom-loggers/tokens/custom-logger.token';
import { ICustomLoggerService } from 'src/shared/custom-loggers/interfaces/custom-logger.service.interface';

@Injectable()
export class OrderService implements IOrderService {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(CART_SERVICE)
    private readonly cartService: ICartService,
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
    @Inject(SHOP_SERVICE)
    private readonly shopService: IShopService,
    @Inject(WALLET_SERVICE)
    private readonly walletService: IWalletService,
    @Inject(ESCROW_SERVICE)
    private readonly escrowService: IEscrowService,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentService: IPaymentService,
    @Inject(BUYER_SERVICE)
    private readonly buyerService: IBuyerService,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly variantRepository: IProductVariantRepository,
    @Inject(BUYER_COIN_WALLET_REPOSITORY)
    private readonly buyerCoinWalletRepository: IBuyerCoinWalletRepository,
    @Inject(SYSTEM_CONFIG_SERVICE)
    private readonly systemConfigService: ISystemConfigService,
    @Inject(UOW_TOKEN)
    private readonly transactionUow: IUow,
    @Inject(CUSTOM_LOG)
    private readonly logger: ICustomLoggerService,
    @Inject(SHOP_BADGE_BENEFITS_SERVICE)
    private readonly badgeBenefitsService: IShopBadgeBenefitsService,
    @Inject(VNPAY_SERVICE)
    private readonly vnpayService: IVnpayService,
    @Inject(PAYMENT_TRANSACTION_REPOSITORY)
    private readonly paymentTransactionRepository: IPaymentTransactionRepository,
  ) {}

  private getUserId(): string | undefined {
    const store = this.als.getStore();
    return store?.userId;
  }

  /**
   * Gets the current user's shop ID by calling shop service.
   * Returns the shop ID if user owns a shop, or errAsync if not.
   */
  private getShopIdFromService(): ResultAsync<string, DomainError> {
    return this.shopService.getMyShop().andThen((shop) => {
      if (!shop) {
        return errAsync(
          createDomainError(ORDER_ERRORS.NO_SHOP_PERMISSION, {
            cause: 'User does not own a shop',
          }),
        );
      }
      return okAsync(shop.id);
    });
  }

  /**
   * Restores stock for cancelled order items.
   * Called when an order is cancelled to return stock to inventory.
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

  // ===================== BUYER METHODS =====================

  @WithPosition()
  createOrder(
    input: CreateOrderInput,
  ): ResultAsync<CreateOrderResult, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    // Step 1: Validate address exists and belongs to user (using user service)
    return this.userService
      .getAddressById(input.addressId)
      .andThen((address) =>
        // Step 2: Get selected cart items (using cart service)
        this.cartService.prepareCheckout().andThen((checkoutData) => {
          const { selectedItems, hasInactiveItems } = checkoutData;

          if (hasInactiveItems) {
            return errAsync(
              createDomainError(ORDER_ERRORS.PRODUCT_UNAVAILABLE),
            );
          }

          // Check for price changes - warn user if any
          const hasPriceChanged = selectedItems.some(
            (item) => item.hasPriceChanged,
          );
          if (hasPriceChanged) {
            return errAsync(createDomainError(ORDER_ERRORS.PRICE_CHANGED));
          }

          // Check stock availability
          const insufficientStock = selectedItems.some(
            (item) =>
              item.variant.stockQuantity < item.cartItem.quantity ||
              !item.variant.isActive,
          );
          if (insufficientStock) {
            return errAsync(createDomainError(ORDER_ERRORS.INSUFFICIENT_STOCK));
          }

          // Check for expired products
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const hasExpiredProducts = selectedItems.some(
            (item) =>
              item.variant.expiryDate &&
              new Date(item.variant.expiryDate) < today,
          );
          if (hasExpiredProducts) {
            return errAsync(createDomainError(ORDER_ERRORS.PRODUCT_EXPIRED));
          }

          // Check product availability
          const productUnavailable = selectedItems.some(
            (item) =>
              !item.product.isVisible || item.product.status !== 'active',
          );
          if (productUnavailable) {
            return errAsync(
              createDomainError(ORDER_ERRORS.PRODUCT_UNAVAILABLE),
            );
          }

          return okAsync({ selectedItems, address });
        }),
      )
      .andThen(({ selectedItems, address }) =>
        // Step 3: Get coin config + shipping threshold + buyer coin balance
        ResultAsync.combine([
          this.systemConfigService.getCoinMaxUsagePercent(),
          this.systemConfigService.getShippingFreeThreshold(),
          input.useCoin
            ? this.buyerCoinWalletRepository.findByBuyerId(userId)
            : okAsync(null),
        ]).map(([coinMaxPercent, shippingFreeThreshold, coinWallet]) => ({
          selectedItems,
          address,
          coinMaxPercent,
          shippingFreeThreshold,
          availableCoins: coinWallet?.balance ?? 0,
        })),
      )
      .andThen(
        ({
          selectedItems,
          address,
          coinMaxPercent,
          shippingFreeThreshold,
          availableCoins,
        }) => {
          // Step 4: Group items by shop and calculate subtotals
          const shopGroups = new Map<string, CartItemWithDetails[]>();
          for (const item of selectedItems) {
            const existing = shopGroups.get(item.shop.id);
            if (existing) {
              existing.push(item);
            } else {
              shopGroups.set(item.shop.id, [item]);
            }
          }

          // Calculate subtotal for each shop
          const shopSubtotals = new Map<string, number>();
          let grandSubtotal = 0;
          for (const [shopId, items] of shopGroups) {
            const subtotal = items.reduce(
              (sum, item) => sum + item.variant.price * item.cartItem.quantity,
              0,
            );
            shopSubtotals.set(shopId, subtotal);
            grandSubtotal += subtotal;
          }

          // Step 5: Calculate coin usage
          const maxCoinAllowed = Math.floor(
            (grandSubtotal * coinMaxPercent) / 100,
          );
          let totalCoinToUse = 0;
          if (input.useCoin && availableCoins > 0) {
            // If specific amount requested, use min of requested, available, and max allowed
            if (input.coinAmount !== undefined && input.coinAmount > 0) {
              totalCoinToUse = Math.min(
                input.coinAmount,
                availableCoins,
                maxCoinAllowed,
              );
            } else {
              // Use as much as allowed
              totalCoinToUse = Math.min(availableCoins, maxCoinAllowed);
            }
          }

          // Prepare stock deduction items (aggregate by variant)
          const stockDeductionMap = new Map<string, number>();
          for (const item of selectedItems) {
            const currentQty = stockDeductionMap.get(item.variant.id) ?? 0;
            stockDeductionMap.set(
              item.variant.id,
              currentQty + item.cartItem.quantity,
            );
          }
          const stockDeductionItems = Array.from(
            stockDeductionMap.entries(),
          ).map(([variantId, quantity]) => ({ variantId, quantity }));

          // Step 6: Execute stock deduction + coin deduction + order creation in transaction
          return this.transactionUow
            .executeInTransaction(() => {
              // Deduct stock with pessimistic lock
              return this.variantRepository
                .deductStockWithLock(stockDeductionItems)
                .andThen(() => {
                  // Deduct coins with lock if using coins
                  if (totalCoinToUse > 0) {
                    return this.buyerCoinWalletRepository
                      .debitCoinsWithLock(
                        userId,
                        totalCoinToUse,
                        'order_payment',
                        null, // Will be updated with order IDs after creation
                        `Thanh toán đơn hàng bằng ${totalCoinToUse} xu`,
                      )
                      .map(() => totalCoinToUse);
                  }
                  return okAsync(0);
                })
                .andThen((coinUsedTotal) => {
                  // Create orders for each shop
                  const shopNoteMap = new Map(
                    (input.shopNotes ?? []).map((n) => [n.shopId, n.note]),
                  );

                  // Pre-calculate coin distribution to handle rounding
                  const shopIds = Array.from(shopGroups.keys());
                  const coinDistribution = new Map<string, number>();
                  let distributedCoins = 0;

                  for (let i = 0; i < shopIds.length; i++) {
                    const shopId = shopIds[i];
                    const subtotal = shopSubtotals.get(shopId) ?? 0;

                    if (i === shopIds.length - 1) {
                      // Last shop gets remaining coins to avoid rounding loss
                      coinDistribution.set(
                        shopId,
                        coinUsedTotal - distributedCoins,
                      );
                    } else {
                      const coinForShop =
                        grandSubtotal > 0
                          ? Math.floor(
                              coinUsedTotal * (subtotal / grandSubtotal),
                            )
                          : 0;
                      coinDistribution.set(shopId, coinForShop);
                      distributedCoins += coinForShop;
                    }
                  }

                  const orderCreationResults: ResultAsync<
                    OrderWithShop,
                    DomainError
                  >[] = [];

                  for (const [shopId, items] of shopGroups) {
                    const shopNote = shopNoteMap.get(shopId) ?? null;
                    const subtotal = shopSubtotals.get(shopId) ?? 0;

                    // Calculate shipping fee and platform ship discount
                    const shippingFee = SHIPPING_FEE_DEFAULT;
                    const platformShipDiscount =
                      subtotal >= shippingFreeThreshold
                        ? SHIPPING_FEE_DEFAULT
                        : 0;

                    // Get pre-calculated coin distribution
                    const coinUsedForShop = coinDistribution.get(shopId) ?? 0;

                    // Calculate total amount
                    const totalAmount =
                      subtotal +
                      shippingFee -
                      platformShipDiscount -
                      coinUsedForShop;

                    // Create order
                    const order = Order.create({
                      buyerId: userId,
                      shopId,
                      receiverName: address.recipientName,
                      receiverPhone: address.recipientPhone,
                      shippingAddress: address.addressLine,
                      shippingWardId: address.wardId,
                      shippingDistrictId: address.districtId,
                      shippingProvinceId: address.provinceId,
                      subtotal,
                      shippingFee,
                      platformFee: 0, // TODO: Calculate platform fee
                      platformFeePercent: 0,
                      tierDiscountAmount: 0, // TODO: Apply tier discount
                      tierDiscountPercent: 0,
                      voucherDiscountAmount: 0, // TODO: Apply voucher
                      coinUsed: coinUsedForShop,
                      platformShipDiscount,
                      totalAmount,
                      buyerTierCode: 'bronze', // TODO: Get from buyer profile
                      coinMultiplier: 0.01, // TODO: Get from config
                      paymentMethod: input.paymentMethod,
                      buyerNote: shopNote,
                    });

                    // Create order items
                    const orderItems = items.map((item) =>
                      OrderItem.create({
                        orderId: order.id,
                        productId: item.product.id,
                        variantId: item.variant.id,
                        productName: item.product.name,
                        variantName: item.variant.name,
                        productImageUrl: item.product.thumbnailUrl,
                        unitPrice: item.variant.price,
                        quantity: item.cartItem.quantity,
                      }),
                    );

                    // Save order and items
                    const saveResult = this.orderRepository
                      .saveOrderWithItems(order, orderItems)
                      .andThen((savedOrder) =>
                        okAsync<OrderWithShop, DomainError>({
                          order: savedOrder,
                          shop: items[0].shop,
                        }),
                      );

                    orderCreationResults.push(saveResult);
                  }

                  return ResultAsync.combine(orderCreationResults).map(
                    (orders) => ({ orders, coinUsedTotal }),
                  );
                });
            })
            .map(({ orders: createdOrders, coinUsedTotal }) => ({
              createdOrders,
              selectedItems,
              paymentMethod: input.paymentMethod,
              coinUsedTotal,
            }));
        },
      )
      .andThen(
        ({ createdOrders, selectedItems, paymentMethod, coinUsedTotal }) => {
          // Step 7: Remove purchased items from cart using cart service
          const cartItemIdsToRemove = selectedItems.map(
            (item) => item.cartItem.id,
          );

          const removeFromCart =
            cartItemIdsToRemove.length === 0
              ? okAsync(undefined)
              : this.cartService.removeItems(cartItemIdsToRemove);

          return removeFromCart.map(() => ({
            createdOrders,
            paymentMethod,
            coinUsedTotal,
          }));
        },
      )
      .andThen(({ createdOrders, paymentMethod, coinUsedTotal }) => {
        // Step 8: Process payment based on payment method
        const totalAmount = createdOrders.reduce(
          (sum, o) => sum + o.order.totalAmount,
          0,
        );
        const orderIds = createdOrders.map((o) => o.order.id);

        // For WALLET payment: debit wallet, create escrow, mark paid
        if (paymentMethod === PaymentMethod.WALLET) {
          return this.processWalletPayment(createdOrders, totalAmount).map(
            (result) => ({ ...result, coinUsed: coinUsedTotal }),
          );
        }

        // For VNPAY payment: generate VNPay URL
        if (paymentMethod === PaymentMethod.VNPAY) {
          return this.processVnpayPayment(
            createdOrders,
            totalAmount,
            orderIds,
          ).map((result) => ({ ...result, coinUsed: coinUsedTotal }));
        }

        // For WALLET_VNPAY payment: use wallet first, then VNPay for remainder
        if (paymentMethod === PaymentMethod.WALLET_VNPAY) {
          return this.processWalletVnpayPayment(
            createdOrders,
            totalAmount,
            orderIds,
          ).map((result) => ({ ...result, coinUsed: coinUsedTotal }));
        }

        // For COD payment: auto-confirm orders (no upfront payment required)
        if (paymentMethod === PaymentMethod.COD) {
          return this.processCodPayment(createdOrders).map((result) => ({
            ...result,
            coinUsed: coinUsedTotal,
          }));
        }

        // Default: return orders without payment processing
        return okAsync<CreateOrderResult, DomainError>({
          orders: createdOrders,
          coinUsed: coinUsedTotal,
        });
      });
  }

  /**
   * Process wallet-only payment
   * Debit buyer wallet, create escrow holds, mark orders as paid
   */
  private processWalletPayment(
    createdOrders: OrderWithShop[],
    totalAmount: number,
  ): ResultAsync<CreateOrderResult, DomainError> {
    // Get buyer wallet balance first
    return this.walletService.getMyWallet().andThen((wallet) => {
      // Check if wallet has sufficient balance
      if (wallet.availableBalance < totalAmount) {
        return errAsync(
          createDomainError(ORDER_ERRORS.INSUFFICIENT_WALLET_BALANCE, {
            cause: `Required: ${totalAmount}, Available: ${wallet.availableBalance}`,
          }),
        );
      }

      // Get base platform fee percent
      return this.systemConfigService
        .getPlatformFeePercent()
        .andThen((baseFeePercent) => {
          // Debit wallet for total amount (combines all orders)
          const orderIds = createdOrders.map((o) => o.order.id);
          return this.walletService
            .debitForOrder(orderIds.join(','), totalAmount)
            .andThen(() => {
              // Get badge discount for each shop and create escrow holds
              const escrowCreations = createdOrders.map((orderWithShop) =>
                this.badgeBenefitsService
                  .getEffectivePlatformFeeDiscount(orderWithShop.order.shopId)
                  .andThen((badgeDiscount) => {
                    // Calculate final platform fee percent (base - badge discount, min 0)
                    const platformFeePercent = Math.max(
                      0,
                      baseFeePercent - badgeDiscount,
                    );
                    return this.escrowService.createHold(
                      orderWithShop.order.id,
                      orderWithShop.order.shopId,
                      orderWithShop.order.totalAmount,
                      orderWithShop.order.subtotal,
                      orderWithShop.order.coinUsed,
                      platformFeePercent,
                    );
                  }),
              );

              return ResultAsync.combine(escrowCreations);
            })
            .andThen(() => {
              // Mark all orders as paid and update in DB
              const updateResults = createdOrders.map((orderWithShop) => {
                orderWithShop.order.markAsPaid();
                return this.orderRepository.save(orderWithShop.order);
              });

              return ResultAsync.combine(updateResults);
            })
            .map(() => ({
              orders: createdOrders,
              walletAmountUsed: totalAmount,
            }));
        });
    });
  }

  /**
   * Process VNPay-only payment
   * Create payment transaction and generate VNPay payment URL for total amount
   */
  private processVnpayPayment(
    createdOrders: OrderWithShop[],
    totalAmount: number,
    orderIds: string[],
  ): ResultAsync<CreateOrderResult, DomainError> {
    // Use first order ID as primary reference
    const primaryOrderId = orderIds[0];
    const primaryOrder = createdOrders[0].order;

    // Create payment transaction via PaymentService
    return this.paymentService
      .createOrderPayment(
        primaryOrderId,
        totalAmount,
        '127.0.0.1', // TODO: Get from request context
        primaryOrder.createdAt, // Pass order creation time for timeout validation
      )
      .map((paymentResult) => ({
        orders: createdOrders,
        paymentUrl: paymentResult.paymentUrl,
        txnRef: paymentResult.txnRef,
        vnpayAmount: totalAmount,
      }));
  }

  /**
   * Process wallet + VNPay payment
   * Use wallet balance first, then VNPay for remaining amount
   */
  private processWalletVnpayPayment(
    createdOrders: OrderWithShop[],
    totalAmount: number,
    orderIds: string[],
  ): ResultAsync<CreateOrderResult, DomainError> {
    return this.walletService.getMyWallet().andThen((wallet) => {
      const walletAmount = Math.min(wallet.availableBalance, totalAmount);
      const vnpayAmount = totalAmount - walletAmount;

      // If wallet covers full amount, process as wallet-only
      if (vnpayAmount <= 0) {
        return this.processWalletPayment(createdOrders, totalAmount);
      }

      // Helper function to create VNPay payment after optional wallet debit
      const createVnpayPayment = (): ResultAsync<
        CreateOrderResult,
        DomainError
      > => {
        const primaryOrderId = orderIds[0];
        const primaryOrder = createdOrders[0].order;

        return this.paymentService
          .createOrderPayment(
            primaryOrderId,
            vnpayAmount,
            '127.0.0.1', // TODO: Get from request context
            primaryOrder.createdAt, // Pass order creation time for timeout validation
          )
          .map((paymentResult) => ({
            orders: createdOrders,
            paymentUrl: paymentResult.paymentUrl,
            txnRef: paymentResult.txnRef,
            walletAmountUsed: walletAmount,
            vnpayAmount: vnpayAmount,
          }));
      };

      // Debit wallet for available amount, then create VNPay payment
      if (walletAmount > 0) {
        return this.walletService
          .debitForOrder(orderIds.join(','), walletAmount)
          .andThen(() => createVnpayPayment());
      }

      return createVnpayPayment();
    });
  }

  /**
   * Process COD (Cash on Delivery) payment
   * Auto-confirms orders since no upfront payment is required.
   * Payment will be collected by delivery person.
   */
  private processCodPayment(
    createdOrders: OrderWithShop[],
  ): ResultAsync<CreateOrderResult, DomainError> {
    // For COD, auto-confirm orders so shop can start processing
    const updateResults = createdOrders.map((orderWithShop) => {
      // Confirm the order (moves from PENDING to CONFIRMED)
      const confirmResult = orderWithShop.order.confirm();
      if (confirmResult.isErr()) {
        // Shouldn't happen for newly created orders, but handle gracefully
        return okAsync(orderWithShop);
      }
      return this.orderRepository
        .save(orderWithShop.order)
        .map(() => orderWithShop);
    });

    return ResultAsync.combine(updateResults).map((updatedOrders) => ({
      orders: updatedOrders,
      isCod: true,
    }));
  }

  @WithPosition()
  getMyOrders(
    filters: OrderListFilters,
    pagination: PaginationOptions,
  ): ResultAsync<PaginatedResult<OrderWithShop>, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.orderRepository.findByBuyerId(userId, filters, pagination);
  }

  @WithPosition()
  getMyOrderById(orderId: string): ResultAsync<OrderWithShop, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.orderRepository
      .findByIdForBuyer(orderId, userId)
      .andThen((result) => {
        if (!result) {
          return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
        }
        return okAsync(result);
      });
  }

  /**
   * Verify VNPay payment status and sync order if needed.
   * If VNPay confirms payment was successful but order shows pending,
   * this will create escrow and mark order as paid.
   *
   * @returns { synced: true } if payment was found and order updated
   * @returns { synced: false } if payment not found or not successful
   */
  private verifyAndSyncVnpayPayment(
    order: Order,
  ): ResultAsync<{ synced: boolean }, DomainError> {
    // Only verify for VNPay payment methods with pending payment status
    if (
      ![PaymentMethod.VNPAY, PaymentMethod.WALLET_VNPAY].includes(
        order.paymentMethod,
      )
    ) {
      return okAsync({ synced: false });
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      return okAsync({ synced: false });
    }

    // Find payment transaction for this order
    return this.paymentTransactionRepository
      .findByOrderId(order.id)
      .andThen((transaction) => {
        if (!transaction) {
          return okAsync({ synced: false });
        }

        // Query VNPay to verify payment status
        return this.vnpayService
          .queryTransaction({
            txnRef: transaction.vnpayTxnRef,
            transactionDate: transaction.createdAt,
            ipAddress: '127.0.0.1',
          })
          .andThen((vnpayResult) => {
            if (!vnpayResult.isSuccess) {
              // VNPay says not paid, no sync needed
              return okAsync({ synced: false });
            }

            // VNPay confirms payment was successful, need to sync
            this.logger.log(
              `VNPay confirms payment for order ${order.id}, syncing...`,
              'OrderService',
            );

            // Get platform fee and badge discount to create escrow
            return ResultAsync.combine([
              this.systemConfigService.getPlatformFeePercent(),
              this.badgeBenefitsService.getEffectivePlatformFeeDiscount(
                order.shopId,
              ),
            ]).andThen(([baseFeePercent, badgeDiscount]) => {
              const platformFeePercent = Math.max(
                0,
                baseFeePercent - badgeDiscount,
              );

              // Create escrow hold
              return this.escrowService
                .createHold(
                  order.id,
                  order.shopId,
                  order.totalAmount,
                  order.subtotal,
                  order.coinUsed,
                  platformFeePercent,
                )
                .andThen(() => {
                  // Mark order as paid
                  order.markAsPaid();
                  return this.orderRepository.updateOrder(order);
                })
                .map(() => ({ synced: true }));
            });
          })
          .orElse((error) => {
            // VNPay API error, log and continue without sync
            this.logger.warn(
              `VNPay query failed for order ${order.id}: ${error.message}`,
              'OrderService',
            );
            return okAsync({ synced: false });
          });
      });
  }

  @WithPosition()
  cancelMyOrder(
    orderId: string,
    reason?: string,
  ): ResultAsync<Order, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    // First verify the order belongs to the buyer (without lock)
    return this.orderRepository
      .findByIdForBuyer(orderId, userId)
      .andThen((result) => {
        if (!result) {
          return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
        }

        // Execute cancellation in UoW transaction
        return this.transactionUow.executeInTransaction(() =>
          // Lock the order to prevent race conditions
          this.orderRepository.findByIdWithLock(orderId).andThen((order) => {
            if (!order) {
              return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
            }

            // Re-check if buyer can cancel (status might have changed)
            if (!order.canBuyerCancel()) {
              return errAsync(
                createDomainError(ORDER_ERRORS.BUYER_CANNOT_CANCEL),
              );
            }

            // If VNPay payment is pending, verify with VNPay first
            return this.verifyAndSyncVnpayPayment(order).andThen(
              ({ synced }) => {
                if (synced) {
                  // Payment status changed, inform user to reload
                  return errAsync(
                    createDomainError(
                      ORDER_ERRORS.ORDER_PAYMENT_STATUS_CHANGED,
                    ),
                  );
                }

                // Proceed with cancellation
                const cancelResult = order.cancel(CancelledBy.BUYER, reason);
                if (cancelResult.isErr()) {
                  return errAsync(cancelResult.error);
                }

                // Process refund based on payment status
                return this.processRefundIfNeeded(order, order.buyerId);
              },
            );
          }),
        );
      });
  }

  /**
   * Process refund and stock restoration for a cancelled order.
   * Restores stock to inventory, refunds escrow if order was paid,
   * and always refunds coins if order used coins.
   *
   * Coins are always refunded because:
   * - Buyer can only cancel when shop hasn't confirmed yet
   * - If cancelled after confirmation, it's shop's decision → buyer gets coins back
   */
  private processRefundIfNeeded(
    order: Order,
    buyerId: string,
  ): ResultAsync<Order, DomainError> {
    // Step 1: Restore stock for cancelled order items
    return this.restoreStockForOrder(order).andThen(() => {
      // Step 2: Always refund coins if order used coins
      const coinRefund: ResultAsync<void, DomainError> =
        order.coinUsed > 0
          ? this.buyerCoinWalletRepository
              .creditCoinsRefund(
                buyerId,
                order.coinUsed,
                'order_cancel_refund',
                order.id,
                `Hoàn ${order.coinUsed} xu từ đơn hàng ${order.orderCode}`,
              )
              .map(() => undefined)
          : okAsync(undefined);

      return coinRefund.andThen(() => {
        // Step 3: If order was not paid, just save the cancellation
        if (order.paymentStatus !== PaymentStatus.PAID) {
          return this.orderRepository.updateOrder(order);
        }

        // Step 4: Find and refund escrow holds for this order
        return this.escrowService
          .findByOrderId(order.id)
          .andThen((escrowHolds) => {
            // Filter to only holding escrows (not already released/refunded)
            const holdingEscrows = escrowHolds.filter(
              (escrow) => escrow.status === EscrowStatus.HOLDING,
            );

            if (holdingEscrows.length === 0) {
              // No escrow to refund, just mark as refunded and save
              order.markAsRefunded();
              return this.orderRepository.updateOrder(order);
            }

            // Refund each escrow hold to buyer
            const refundResults = holdingEscrows.map((escrow) =>
              this.escrowService.refundToBuyer(escrow.id, buyerId),
            );

            return ResultAsync.combine(refundResults).andThen(() => {
              // Mark order as refunded and save
              order.markAsRefunded();
              return this.orderRepository.updateOrder(order);
            });
          });
      });
    });
  }

  /**
   * Confirm delivery and complete order.
   * All operations are wrapped in a single UoW transaction:
   * 1. Update order status to COMPLETED
   * 2. Credit coins to buyer (if any earned)
   * 3. Release escrow to shop + platform
   *
   * If any step fails, all operations are rolled back.
   */
  @WithPosition()
  confirmDelivery(orderId: string): ResultAsync<Order, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    // First verify the order belongs to the buyer (without lock)
    return this.orderRepository
      .findByIdForBuyer(orderId, userId)
      .andThen((result) => {
        if (!result) {
          return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
        }

        // Execute completion in UoW transaction with lock to prevent race conditions
        // (e.g., buyer confirms at same time as auto-complete cronjob)
        return this.transactionUow.executeInTransaction(() =>
          // Lock the order to prevent concurrent modifications
          this.orderRepository.findByIdWithLock(orderId).andThen((order) => {
            if (!order) {
              return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
            }

            // Re-check status after acquiring lock (may have changed)
            const completeResult = order.complete();
            if (completeResult.isErr()) {
              return errAsync(
                createDomainError(ORDER_ERRORS.CANNOT_CONFIRM_DELIVERY),
              );
            }

            // Step 1: Update order status to COMPLETED
            return this.orderRepository
              .updateOrder(order)
              .andThen((savedOrder) =>
                // Step 2: Credit coins to buyer (if any earned)
                (savedOrder.coinEarned > 0
                  ? this.buyerService
                      .creditCoinsForOrder(
                        savedOrder.buyerId,
                        savedOrder.coinEarned,
                        savedOrder.id,
                      )
                      .map(() => undefined)
                  : okAsync(undefined)
                ).andThen(() =>
                  // Step 3: Find and release escrow
                  this.escrowService
                    .findByOrderId(savedOrder.id)
                    .andThen((escrowHolds) => {
                      const holdingEscrows = escrowHolds.filter((e) =>
                        e.isHolding(),
                      );

                      if (holdingEscrows.length === 0) {
                        this.logger.warn(
                          `No holding escrows found for order ${savedOrder.id}`,
                          'OrderService',
                        );
                        return okAsync(savedOrder);
                      }

                      // Release each escrow (usually just one per order)
                      // releaseToShop will participate in the outer transaction
                      const releasePromises = holdingEscrows.map((escrow) =>
                        this.escrowService.releaseToShop(escrow.id),
                      );

                      return ResultAsync.combine(releasePromises).map(
                        () => savedOrder,
                      );
                    }),
                ),
              );
          }),
        );
      });
  }

  // ===================== SHOP METHODS =====================

  @WithPosition()
  getShopOrders(
    filters: OrderListFilters,
    pagination: PaginationOptions,
  ): ResultAsync<PaginatedResult<OrderWithBuyer>, DomainError> {
    return this.getShopIdFromService().andThen((shopId) =>
      this.orderRepository.findByShopId(shopId, filters, pagination),
    );
  }

  @WithPosition()
  getShopOrderById(orderId: string): ResultAsync<OrderWithBuyer, DomainError> {
    return this.getShopIdFromService().andThen((shopId) =>
      this.orderRepository
        .findByIdForShop(orderId, shopId)
        .andThen((result) => {
          if (!result) {
            return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
          }
          return okAsync(result);
        }),
    );
  }

  @WithPosition()
  confirmOrder(orderId: string): ResultAsync<Order, DomainError> {
    return this.getShopIdFromService().andThen((shopId) =>
      this.orderRepository
        .findByIdForShop(orderId, shopId)
        .andThen((result) => {
          if (!result) {
            return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
          }

          const { order } = result;
          const confirmResult = order.confirm();
          if (confirmResult.isErr()) {
            return errAsync(confirmResult.error);
          }

          return this.orderRepository.updateOrder(order);
        }),
    );
  }

  @WithPosition()
  shipOrder(orderId: string): ResultAsync<Order, DomainError> {
    return this.getShopIdFromService().andThen((shopId) =>
      this.orderRepository
        .findByIdForShop(orderId, shopId)
        .andThen((result) => {
          if (!result) {
            return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
          }

          const { order } = result;
          const shipResult = order.ship();
          if (shipResult.isErr()) {
            return errAsync(shipResult.error);
          }

          return this.orderRepository.updateOrder(order);
        }),
    );
  }

  @WithPosition()
  cancelShopOrder(
    orderId: string,
    reason?: string,
  ): ResultAsync<Order, DomainError> {
    return this.getShopIdFromService().andThen((shopId) =>
      // First verify the order belongs to the shop (without lock)
      this.orderRepository
        .findByIdForShop(orderId, shopId)
        .andThen((result) => {
          if (!result) {
            return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
          }

          // Execute cancellation in UoW transaction
          return this.transactionUow.executeInTransaction(() =>
            // Lock the order to prevent race conditions
            this.orderRepository.findByIdWithLock(orderId).andThen((order) => {
              if (!order) {
                return errAsync(
                  createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND),
                );
              }

              // Re-check if shop can cancel (status might have changed)
              if (!order.canShopCancel()) {
                return errAsync(
                  createDomainError(ORDER_ERRORS.SHOP_CANNOT_CANCEL),
                );
              }

              // If VNPay payment is pending, verify with VNPay first
              return this.verifyAndSyncVnpayPayment(order).andThen(
                ({ synced }) => {
                  if (synced) {
                    // Payment status changed, inform user to reload
                    return errAsync(
                      createDomainError(
                        ORDER_ERRORS.ORDER_PAYMENT_STATUS_CHANGED,
                      ),
                    );
                  }

                  // Proceed with cancellation
                  const cancelResult = order.cancel(CancelledBy.SHOP, reason);
                  if (cancelResult.isErr()) {
                    return errAsync(cancelResult.error);
                  }

                  // Process refund based on payment status
                  return this.processRefundIfNeeded(order, order.buyerId);
                },
              );
            }),
          );
        }),
    );
  }

  @WithPosition()
  updateShopNote(
    orderId: string,
    note: string | null,
  ): ResultAsync<Order, DomainError> {
    return this.getShopIdFromService().andThen((shopId) =>
      this.orderRepository
        .findByIdForShop(orderId, shopId)
        .andThen((result) => {
          if (!result) {
            return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
          }

          const { order } = result;
          order.setShopNote(note);

          return this.orderRepository.updateOrder(order);
        }),
    );
  }

  // ===================== SYSTEM/CRON METHODS =====================

  /**
   * Auto-complete orders that have been delivered for N days.
   * Each order is processed in its own UoW transaction:
   * 1. Update order status to COMPLETED
   * 2. Credit coins to buyer (if any earned)
   * 3. Release escrow to shop + platform
   *
   * @param autoCompleteDays - Number of days after delivery to auto-complete
   */
  @WithPosition()
  autoCompleteOrders(
    autoCompleteDays: number,
  ): ResultAsync<number, DomainError> {
    return this.orderRepository
      .findOrdersForAutoComplete(autoCompleteDays)
      .andThen((orders) => {
        if (orders.length === 0) {
          return okAsync(0);
        }

        let completedCount = 0;

        // Process each order sequentially to avoid overwhelming the DB
        const processOrder = (order: Order): ResultAsync<boolean, never> => {
          const completeResult = order.complete();
          if (completeResult.isErr()) {
            this.logger.warn(
              `Cannot auto-complete order ${order.id}: ${completeResult.error.message}`,
              'OrderService',
            );
            return okAsync(false);
          }

          // Wrap all operations in a single UoW transaction
          return this.transactionUow
            .executeInTransaction(() =>
              // Step 1: Update order status to COMPLETED
              this.orderRepository.updateOrder(order).andThen((savedOrder) =>
                // Step 2: Credit coins to buyer (if any earned)
                (savedOrder.coinEarned > 0
                  ? this.buyerService
                      .creditCoinsForOrder(
                        savedOrder.buyerId,
                        savedOrder.coinEarned,
                        savedOrder.id,
                      )
                      .map(() => undefined)
                  : okAsync(undefined)
                ).andThen(() =>
                  // Step 3: Find and release escrow
                  this.escrowService
                    .findByOrderId(savedOrder.id)
                    .andThen((escrowHolds) => {
                      const holdingEscrows = escrowHolds.filter((e) =>
                        e.isHolding(),
                      );

                      if (holdingEscrows.length === 0) {
                        return okAsync(savedOrder);
                      }

                      // Release each escrow
                      const releasePromises = holdingEscrows.map((escrow) =>
                        this.escrowService.releaseToShop(escrow.id),
                      );

                      return ResultAsync.combine(releasePromises).map(
                        () => savedOrder,
                      );
                    }),
                ),
              ),
            )
            .map(() => {
              completedCount++;
              return true;
            })
            .orElse((error) => {
              this.logger.error(
                `Failed to auto-complete order ${order.id}: ${error.message}`,
                'OrderService',
              );
              return okAsync(false);
            });
        };

        // Process orders sequentially
        return orders
          .reduce(
            (chain, order) => chain.andThen(() => processOrder(order)),
            okAsync(true),
          )
          .map(() => completedCount);
      });
  }

  // ===================== PAYMENT CALLBACK METHODS =====================

  @WithPosition()
  processVnpayPaymentSuccess(orderId: string): ResultAsync<Order, DomainError> {
    return this.orderRepository.findById(orderId).andThen((order) => {
      if (!order) {
        return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
      }

      // Check if order is still in valid state for payment processing
      if (order.status !== OrderStatus.PENDING) {
        // Order has been cancelled or already confirmed - skip payment processing
        return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_PENDING));
      }

      if (order.paymentStatus === PaymentStatus.PAID) {
        // Order already paid (e.g., processed via IPN) - skip duplicate processing
        return okAsync(order);
      }

      // Get base platform fee and badge discount to calculate final fee percent
      return ResultAsync.combine([
        this.systemConfigService.getPlatformFeePercent(),
        this.badgeBenefitsService.getEffectivePlatformFeeDiscount(order.shopId),
      ]).andThen(([baseFeePercent, badgeDiscount]) => {
        // Calculate final platform fee percent (base - badge discount, min 0)
        const platformFeePercent = Math.max(0, baseFeePercent - badgeDiscount);

        // Create escrow hold for shop with fee calculation data
        return this.escrowService
          .createHold(
            order.id,
            order.shopId,
            order.totalAmount,
            order.subtotal,
            order.coinUsed,
            platformFeePercent,
          )
          .andThen(() => {
            // Mark order as paid
            order.markAsPaid();
            return this.orderRepository.updateOrder(order);
          });
      });
    });
  }

  @WithPosition()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  processVnpayPaymentFailed(_orderId: string): ResultAsync<void, DomainError> {
    // When VNPay payment fails, the order remains in PENDING status with
    // paymentStatus = PENDING. This is intentional because:
    // 1. User can retry payment (generate new VNPay URL)
    // 2. User can cancel the order manually
    // 3. PaymentTimeoutCronjob will auto-cancel unpaid orders after timeout
    //
    // The PaymentTransaction is already marked as FAILED by PaymentService
    // before calling this method, so no additional action is needed here.
    return okAsync(undefined);
  }

  @WithPosition()
  cancelOrderDueToPaymentTimeout(
    orderId: string,
  ): ResultAsync<Order, DomainError> {
    return this.orderRepository.findByIdWithItems(orderId).andThen((order) => {
      if (!order) {
        return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
      }

      // Cancel order with SYSTEM as canceller and reason
      const cancelResult = order.cancel(
        CancelledBy.SYSTEM,
        'Đơn hàng đã bị hủy do quá thời gian thanh toán cho phép.',
      );
      if (cancelResult.isErr()) {
        return errAsync(cancelResult.error);
      }

      // Restore stock for cancelled order items
      return this.restoreStockForOrder(order).andThen(() =>
        this.orderRepository.updateOrder(order),
      );
    });
  }
}
