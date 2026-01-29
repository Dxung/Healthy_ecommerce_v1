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
import { ORDER_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { CART_SERVICE } from '../cart/tokens/cart.token';
import { USER_SERVICE } from '../user/tokens/user.token';
import { SHOP_SERVICE } from '../shop/tokens/shop.token';
import { BUYER_SERVICE } from '../buyer/tokens/buyer.token';
import {
  WALLET_SERVICE,
  ESCROW_SERVICE,
  PAYMENT_SERVICE,
} from '../payment/tokens/payment.token';
import { Order } from './models/order.model';
import { OrderItem } from './models/order-item.model';
import { ORDER_AUTO_COMPLETE_DAYS } from './constants/order.constants';
import { CancelledBy } from 'src/database/typeorm/entities/order/enums/cancelled-by.enum';
import { PaymentMethod } from 'src/database/typeorm/entities/order/enums/payment-method.enum';
import { PaymentStatus } from 'src/database/typeorm/entities/order/enums/payment-status.enum';
import { EscrowStatus } from 'src/database/typeorm/entities/payment/enums/escrow-status.enum';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { ORDER_ERRORS } from './errors/order.errors';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

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
      .andThen(({ selectedItems, address }) => {
        // Step 3: Group items by shop
        const shopGroups = new Map<string, CartItemWithDetails[]>();
        for (const item of selectedItems) {
          const existing = shopGroups.get(item.shop.id);
          if (existing) {
            existing.push(item);
          } else {
            shopGroups.set(item.shop.id, [item]);
          }
        }

        // Step 4: Create orders for each shop
        const shopNoteMap = new Map(
          (input.shopNotes ?? []).map((n) => [n.shopId, n.note]),
        );

        const orderCreationResults: ResultAsync<OrderWithShop, DomainError>[] =
          [];

        for (const [shopId, items] of shopGroups) {
          const shopNote = shopNoteMap.get(shopId) ?? null;
          const subtotal = items.reduce(
            (sum, item) => sum + item.variant.price * item.cartItem.quantity,
            0,
          );

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
            shippingFee: 0, // TODO: Calculate shipping fee
            platformFee: 0, // TODO: Calculate platform fee
            platformFeePercent: 0,
            tierDiscountAmount: 0, // TODO: Apply tier discount
            tierDiscountPercent: 0,
            voucherDiscountAmount: 0, // TODO: Apply voucher
            coinUsed: 0, // TODO: Apply coin usage
            totalAmount: subtotal, // Simplified for now
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
          (createdOrders) => ({
            createdOrders,
            selectedItems,
            paymentMethod: input.paymentMethod,
          }),
        );
      })
      .andThen(({ createdOrders, selectedItems, paymentMethod }) => {
        // Step 5: Remove purchased items from cart using cart service
        const cartItemIdsToRemove = selectedItems.map(
          (item) => item.cartItem.id,
        );

        const removeFromCart =
          cartItemIdsToRemove.length === 0
            ? okAsync(undefined)
            : this.cartService.removeItems(cartItemIdsToRemove);

        return removeFromCart.map(() => ({ createdOrders, paymentMethod }));
      })
      .andThen(({ createdOrders, paymentMethod }) => {
        // Step 6: Process payment based on payment method
        const totalAmount = createdOrders.reduce(
          (sum, o) => sum + o.order.totalAmount,
          0,
        );
        const orderIds = createdOrders.map((o) => o.order.id);

        // For WALLET payment: debit wallet, create escrow, mark paid
        if (paymentMethod === PaymentMethod.WALLET) {
          return this.processWalletPayment(createdOrders, totalAmount);
        }

        // For VNPAY payment: generate VNPay URL
        if (paymentMethod === PaymentMethod.VNPAY) {
          return this.processVnpayPayment(createdOrders, totalAmount, orderIds);
        }

        // For WALLET_VNPAY payment: use wallet first, then VNPay for remainder
        if (paymentMethod === PaymentMethod.WALLET_VNPAY) {
          return this.processWalletVnpayPayment(
            createdOrders,
            totalAmount,
            orderIds,
          );
        }

        // For COD payment: auto-confirm orders (no upfront payment required)
        if (paymentMethod === PaymentMethod.COD) {
          return this.processCodPayment(createdOrders);
        }

        // Default: return orders without payment processing
        return okAsync<CreateOrderResult, DomainError>({
          orders: createdOrders,
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

      // Debit wallet for total amount (combines all orders)
      const orderIds = createdOrders.map((o) => o.order.id);
      return this.walletService
        .debitForOrder(orderIds.join(','), totalAmount)
        .andThen(() => {
          // Create escrow holds for each order
          const escrowCreations = createdOrders.map((orderWithShop) =>
            this.escrowService.createHold(
              orderWithShop.order.id,
              orderWithShop.order.shopId,
              orderWithShop.order.totalAmount,
            ),
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

    // Create payment transaction via PaymentService
    return this.paymentService
      .createOrderPayment(
        primaryOrderId,
        totalAmount,
        '127.0.0.1', // TODO: Get from request context
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

        return this.paymentService
          .createOrderPayment(
            primaryOrderId,
            vnpayAmount,
            '127.0.0.1', // TODO: Get from request context
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
      return this.orderRepository.save(orderWithShop.order).map(() => orderWithShop);
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

    return this.orderRepository
      .findByIdForBuyer(orderId, userId)
      .andThen((result) => {
        if (!result) {
          return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
        }

        const { order } = result;
        if (!order.canBuyerCancel()) {
          return errAsync(createDomainError(ORDER_ERRORS.BUYER_CANNOT_CANCEL));
        }

        const cancelResult = order.cancel(CancelledBy.BUYER, reason);
        if (cancelResult.isErr()) {
          return errAsync(cancelResult.error);
        }

        // Process refund if order was paid
        return this.processRefundIfNeeded(order, order.buyerId);
      });
  }

  /**
   * Process refund for a cancelled order if it was paid
   * Finds escrow holds and refunds them to buyer wallet
   */
  private processRefundIfNeeded(
    order: Order,
    buyerId: string,
  ): ResultAsync<Order, DomainError> {
    // If order was not paid, just save the cancellation
    if (order.paymentStatus !== PaymentStatus.PAID) {
      return this.orderRepository.updateOrder(order);
    }

    // Find escrow holds for this order
    return this.escrowService.findByOrderId(order.id).andThen((escrowHolds) => {
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
  }

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

    return this.orderRepository
      .findByIdForBuyer(orderId, userId)
      .andThen((result) => {
        if (!result) {
          return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
        }

        const { order } = result;
        const completeResult = order.complete();
        if (completeResult.isErr()) {
          return errAsync(
            createDomainError(ORDER_ERRORS.CANNOT_CONFIRM_DELIVERY),
          );
        }

        // Save the order first
        return this.orderRepository.updateOrder(order).andThen((savedOrder) => {
          // Credit coins to buyer if any coins were earned
          if (savedOrder.coinEarned > 0) {
            return this.buyerService
              .creditCoinsForOrder(
                savedOrder.buyerId,
                savedOrder.coinEarned,
                savedOrder.id,
              )
              .map(() => savedOrder);
          }
          return okAsync(savedOrder);
        });
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
  markDelivered(orderId: string): ResultAsync<Order, DomainError> {
    return this.getShopIdFromService().andThen((shopId) =>
      this.orderRepository
        .findByIdForShop(orderId, shopId)
        .andThen((result) => {
          if (!result) {
            return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
          }

          const { order } = result;
          const deliverResult = order.deliver();
          if (deliverResult.isErr()) {
            return errAsync(deliverResult.error);
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
      this.orderRepository
        .findByIdForShop(orderId, shopId)
        .andThen((result) => {
          if (!result) {
            return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
          }

          const { order } = result;
          if (!order.canShopCancel()) {
            return errAsync(createDomainError(ORDER_ERRORS.SHOP_CANNOT_CANCEL));
          }

          const cancelResult = order.cancel(CancelledBy.SHOP, reason);
          if (cancelResult.isErr()) {
            return errAsync(cancelResult.error);
          }

          // Process refund if order was paid
          return this.processRefundIfNeeded(order, order.buyerId);
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

  @WithPosition()
  autoCompleteOrders(): ResultAsync<number, DomainError> {
    return this.orderRepository
      .findOrdersForAutoComplete(ORDER_AUTO_COMPLETE_DAYS)
      .andThen((orders) => {
        if (orders.length === 0) {
          return okAsync(0);
        }

        const updateResults = orders.map((order) => {
          const completeResult = order.complete();
          if (completeResult.isErr()) {
            return okAsync(false);
          }
          // Save order and credit coins
          return this.orderRepository.updateOrder(order).andThen((savedOrder) => {
            if (savedOrder.coinEarned > 0) {
              return this.buyerService
                .creditCoinsForOrder(
                  savedOrder.buyerId,
                  savedOrder.coinEarned,
                  savedOrder.id,
                )
                .map(() => true);
            }
            return okAsync(true);
          });
        });

        return ResultAsync.combine(updateResults).map(
          (results) => results.filter((r) => r).length,
        );
      });
  }

  @WithPosition()
  processMissedRefunds(): ResultAsync<number, DomainError> {
    // Find cancelled orders that still have PAID payment status
    return this.orderRepository
      .findCancelledOrdersNeedingRefund()
      .andThen((orders) => {
        if (orders.length === 0) {
          return okAsync(0);
        }

        // Process refund for each order
        const refundResults = orders.map((order) =>
          this.processRefundIfNeeded(order, order.buyerId).map(() => true),
        );

        return ResultAsync.combine(refundResults).map(
          (results) => results.filter((r) => r).length,
        );
      });
  }

  // ===================== PAYMENT CALLBACK METHODS =====================

  @WithPosition()
  processVnpayPaymentSuccess(orderId: string): ResultAsync<Order, DomainError> {
    return this.orderRepository.findById(orderId).andThen((order) => {
      if (!order) {
        return errAsync(createDomainError(ORDER_ERRORS.ORDER_NOT_FOUND));
      }

      // Create escrow hold for shop
      return this.escrowService
        .createHold(order.id, order.shopId, order.totalAmount)
        .andThen(() => {
          // Mark order as paid
          order.markAsPaid();
          return this.orderRepository.updateOrder(order);
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
}
