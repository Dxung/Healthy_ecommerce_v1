export class AddToCartResponseDto {
  cartItemId: string;

  constructor(cartItemId: string) {
    this.cartItemId = cartItemId;
  }
}
