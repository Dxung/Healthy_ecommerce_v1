import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import type { ICartService } from './cart.service.interface';
import { CART_SERVICE } from './tokens/cart.token';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { CartErrorHttpMapper } from './errors/cart-errors-http.mapper';
import {
  AddToCartArgumentDto,
  UpdateCartItemArgumentDto,
  RemoveCartItemsArgumentDto,
  CartResponseDto,
  CartPreviewResponseDto,
  CheckoutPreparationResponseDto,
  AddToCartResponseDto,
} from './dto';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(
    @Inject(CART_SERVICE)
    private readonly cartService: ICartService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get full cart with items grouped by shop' })
  getMyCart(): Promise<CartResponseDto> {
    return this.cartService.getMyCart().match(
      ({ cartId, itemsWithDetails }) =>
        new CartResponseDto(cartId, itemsWithDetails),
      (error) => {
        throw CartErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('preview')
  @ApiOperation({
    summary: 'Get cart preview (5 newest items for header dropdown)',
  })
  getCartPreview(): Promise<CartPreviewResponseDto> {
    return this.cartService.getCartPreview().match(
      ({ recentItems, totalItems, totalQuantity }) =>
        new CartPreviewResponseDto(recentItems, totalItems, totalQuantity),
      (error) => {
        throw CartErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add item to cart. Use selectItem=true for "Buy Now" feature.',
  })
  addToCart(@Body() dto: AddToCartArgumentDto): Promise<AddToCartResponseDto> {
    return this.cartService
      .addToCart(dto.variantId, dto.quantity, dto.selectItem)
      .match(
        ({ cartItemId }) => new AddToCartResponseDto(cartItemId),
        (error) => {
          throw CartErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Patch('items/:cartItemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItemQuantity(
    @Param('cartItemId', ParseUUIDPipe) cartItemId: string,
    @Body() dto: UpdateCartItemArgumentDto,
  ): Promise<void> {
    return this.cartService.updateItemQuantity(cartItemId, dto.quantity).match(
      () => undefined,
      (error) => {
        throw CartErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete('items/:cartItemId')
  @ApiOperation({ summary: 'Remove single item from cart' })
  removeItem(
    @Param('cartItemId', ParseUUIDPipe) cartItemId: string,
  ): Promise<void> {
    return this.cartService.removeItem(cartItemId).match(
      () => undefined,
      (error) => {
        throw CartErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete('items')
  @ApiOperation({ summary: 'Remove multiple items from cart' })
  removeItems(@Body() dto: RemoveCartItemsArgumentDto): Promise<void> {
    return this.cartService.removeItems(dto.cartItemIds).match(
      () => undefined,
      (error) => {
        throw CartErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete('inactive-items')
  @ApiOperation({
    summary: 'Remove inactive items (deleted/hidden/out-of-stock)',
  })
  removeInactiveItems(): Promise<{ removedCount: number }> {
    return this.cartService.removeInactiveItems().match(
      (result) => result,
      (error) => {
        throw CartErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch('items/:cartItemId/toggle-selection')
  @ApiOperation({ summary: 'Toggle single item selection' })
  toggleItemSelection(
    @Param('cartItemId', ParseUUIDPipe) cartItemId: string,
  ): Promise<void> {
    return this.cartService.toggleItemSelection(cartItemId).match(
      () => undefined,
      (error) => {
        throw CartErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post('select-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select all items in cart' })
  selectAllItems(): Promise<void> {
    return this.cartService.selectAllItems().match(
      () => undefined,
      (error) => {
        throw CartErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post('deselect-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deselect all items in cart' })
  deselectAllItems(): Promise<void> {
    return this.cartService.deselectAllItems().match(
      () => undefined,
      (error) => {
        throw CartErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post('select-shop/:shopId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select all items from a specific shop' })
  selectShopItems(
    @Param('shopId', ParseUUIDPipe) shopId: string,
  ): Promise<void> {
    return this.cartService.selectShopItems(shopId).match(
      () => undefined,
      (error) => {
        throw CartErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post('deselect-shop/:shopId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deselect all items from a specific shop' })
  deselectShopItems(
    @Param('shopId', ParseUUIDPipe) shopId: string,
  ): Promise<void> {
    return this.cartService.deselectShopItems(shopId).match(
      () => undefined,
      (error) => {
        throw CartErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('checkout-preview')
  @ApiOperation({ summary: 'Get selected items for checkout preview' })
  prepareCheckout(): Promise<CheckoutPreparationResponseDto> {
    return this.cartService.prepareCheckout().match(
      ({ selectedItems, hasInactiveItems }) =>
        new CheckoutPreparationResponseDto(selectedItems, hasInactiveItems),
      (error) => {
        throw CartErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}
