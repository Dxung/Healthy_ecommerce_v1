import { ShopStatus } from 'src/database/typeorm/entities/shop/enums/shop-status.enum';
import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import { Shop } from '../models/shop.model';

/**
 * Response DTO for shop information.
 * Used for GET /shop/my-shop endpoint.
 */
export class ShopInfoResponseDto {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly phone: string;
  readonly email: string;
  readonly addressLine: string;
  readonly wardId: string;
  readonly districtId: string;
  readonly provinceId: string;
  readonly logoUrl: string | null;
  readonly coverUrl: string | null;
  readonly averageRating: number;
  readonly totalRatings: number;
  readonly totalProducts: number;
  readonly totalOrders: number;
  readonly orderSuccessRate: number;
  readonly responseTimeHours: number;
  readonly returnRate: number;
  readonly status: ShopStatus;
  readonly isRefundDebt: boolean;
  readonly isAdminSuspended: boolean;
  readonly badges: ShopBadgeCode[];
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(shop: Shop) {
    this.id = shop.id;
    this.name = shop.name;
    this.slug = shop.slug;
    this.phone = shop.phone;
    this.email = shop.email;
    this.addressLine = shop.addressLine;
    this.wardId = shop.wardId;
    this.districtId = shop.districtId;
    this.provinceId = shop.provinceId;
    this.logoUrl = shop.logoUrl;
    this.coverUrl = shop.coverUrl;
    this.averageRating = shop.averageRating;
    this.totalRatings = shop.totalRatings;
    this.totalProducts = shop.totalProducts;
    this.totalOrders = shop.totalOrders;
    this.orderSuccessRate = shop.orderSuccessRate;
    this.responseTimeHours = shop.responseTimeHours;
    this.returnRate = shop.returnRate;
    this.status = shop.status;
    this.isRefundDebt = shop.isRefundDebt;
    this.isAdminSuspended = shop.isAdminSuspended;
    this.badges = shop
      .getActiveBadges()
      .map((badge) => badge.badgeCode);
    this.createdAt = shop.createdAt.toISOString();
    this.updatedAt = shop.updatedAt.toISOString();
  }
}
