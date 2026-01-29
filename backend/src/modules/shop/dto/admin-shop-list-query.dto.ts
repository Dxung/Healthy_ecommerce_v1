import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ShopStatus } from 'src/database/typeorm/entities/shop/enums/shop-status.enum';

export class AdminShopListQueryDto {
  @ApiPropertyOptional({
    enum: ShopStatus,
    description: 'Filter by shop status',
  })
  @IsOptional()
  @IsEnum(ShopStatus)
  status?: ShopStatus;

  @ApiPropertyOptional({
    description: 'Search by shop name or slug',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by admin suspension status',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isAdminSuspended?: boolean;

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
