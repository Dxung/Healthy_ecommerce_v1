import { ORMCart } from '../entities/cart/orm.cart.entity';
import { ORMCartItem } from '../entities/cart/orm.cart-item.entity';
import { Cart } from 'src/modules/cart/models/cart.model';
import { CartItem } from 'src/modules/cart/models/cart-item.model';

/**
 * Mapper for converting between ORM entities and domain models for Cart
 */
export class ORMCartMapper {
  /**
   * Convert ORM Cart entity to Cart domain model
   */
  static toDomain(ormCart: ORMCart): Cart {
    const items = ormCart.items
      ? ormCart.items.map((item) => ORMCartMapper.cartItemToDomain(item))
      : [];

    return new Cart(
      ormCart.id,
      ormCart.userId,
      ormCart.selectedAddressId,
      ormCart.note,
      ormCart.createdAt,
      ormCart.updatedAt,
      items,
    );
  }

  /**
   * Convert Cart domain model to ORM entity
   */
  static toOrm(domainCart: Cart): ORMCart {
    const ormCart = new ORMCart();
    ormCart.id = domainCart.id;
    ormCart.userId = domainCart.userId;
    ormCart.selectedAddressId = domainCart.selectedAddressId;
    ormCart.note = domainCart.note;
    ormCart.createdAt = domainCart.createdAt;
    ormCart.updatedAt = domainCart.updatedAt;
    return ormCart;
  }

  /**
   * Convert ORM CartItem entity to CartItem domain model
   */
  static cartItemToDomain(ormCartItem: ORMCartItem): CartItem {
    return new CartItem(
      ormCartItem.id,
      ormCartItem.cartId,
      ormCartItem.shopId,
      ormCartItem.productId,
      ormCartItem.variantId,
      ormCartItem.quantity,
      Number(ormCartItem.priceAtAdded),
      ormCartItem.isSelected,
      ormCartItem.createdAt,
      ormCartItem.updatedAt,
    );
  }

  /**
   * Convert CartItem domain model to ORM entity
   */
  static cartItemToOrm(domainCartItem: CartItem): ORMCartItem {
    const ormCartItem = new ORMCartItem();
    ormCartItem.id = domainCartItem.id;
    ormCartItem.cartId = domainCartItem.cartId;
    ormCartItem.shopId = domainCartItem.shopId;
    ormCartItem.productId = domainCartItem.productId;
    ormCartItem.variantId = domainCartItem.variantId;
    ormCartItem.quantity = domainCartItem.quantity;
    ormCartItem.priceAtAdded = domainCartItem.priceAtAdded;
    ormCartItem.isSelected = domainCartItem.isSelected;
    ormCartItem.createdAt = domainCartItem.createdAt;
    ormCartItem.updatedAt = domainCartItem.updatedAt;
    return ormCartItem;
  }

  /**
   * Convert array of ORM CartItem entities to array of domain models
   */
  static cartItemsToDomainList(ormCartItems: ORMCartItem[]): CartItem[] {
    return ormCartItems.map((item) => ORMCartMapper.cartItemToDomain(item));
  }
}
