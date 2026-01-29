import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Shop } from '../models/shop.model';
import type { ShopStatus } from 'src/database/typeorm/entities/shop/enums/shop-status.enum';
import type { PaginatedResult } from 'src/shared/types/pagination.type';

export class AdminShopResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  logoUrl: string | null;

  @ApiPropertyOptional()
  coverUrl: string | null;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  addressLine: string;

  @ApiProperty()
  wardId: string;

  @ApiProperty()
  districtId: string;

  @ApiProperty()
  provinceId: string;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  totalRatings: number;

  @ApiProperty()
  totalProducts: number;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  orderSuccessRate: number;

  @ApiProperty()
  responseTimeHours: number;

  @ApiProperty()
  returnRate: number;

  @ApiProperty({ enum: ['active', 'inactive', 'suspended', 'banned'] })
  status: ShopStatus;

  @ApiProperty()
  isRefundDebt: boolean;

  @ApiProperty()
  isAdminSuspended: boolean;

  @ApiPropertyOptional()
  statusReason: string | null;

  @ApiPropertyOptional()
  statusChangedAt: string | null;

  @ApiPropertyOptional()
  statusChangedBy: string | null;

  @ApiProperty()
  badges: string[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  constructor(shop: Shop) {
    this.id = shop.id;
    this.name = shop.name;
    this.slug = shop.slug;
    this.logoUrl = shop.logoUrl;
    this.coverUrl = shop.coverUrl;
    this.phone = shop.phone;
    this.email = shop.email;
    this.addressLine = shop.addressLine;
    this.wardId = shop.wardId;
    this.districtId = shop.districtId;
    this.provinceId = shop.provinceId;
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
    this.statusReason = shop.statusReason;
    this.statusChangedAt = shop.statusChangedAt?.toISOString() ?? null;
    this.statusChangedBy = shop.statusChangedBy;
    this.badges = shop.getActiveBadges().map((b) => b.badgeCode);
    this.createdAt = shop.createdAt.toISOString();
    this.updatedAt = shop.updatedAt.toISOString();
  }

  static fromList(shops: Shop[]): AdminShopResponseDto[] {
    return shops.map((shop) => new AdminShopResponseDto(shop));
  }
}

export class AdminShopListResponseDto {
  @ApiProperty({ type: [AdminShopResponseDto] })
  items: AdminShopResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  constructor(result: PaginatedResult<Shop>) {
    this.items = AdminShopResponseDto.fromList(result.items);
    this.total = result.total;
    this.page = result.page;
    this.limit = result.limit;
    this.totalPages = result.totalPages;
  }
}
