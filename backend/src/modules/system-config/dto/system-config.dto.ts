import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsString, IsOptional } from 'class-validator';
import type { ConfigEntry } from '../system-config.service.interface';

export class SystemConfigResponseDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  updatedAt: Date;

  constructor(config: ConfigEntry) {
    this.key = config.key;
    this.value = config.value;
    this.description = config.description;
    this.updatedAt = config.updatedAt;
  }

  static fromList(configs: ConfigEntry[]): SystemConfigResponseDto[] {
    return configs.map((c) => new SystemConfigResponseDto(c));
  }
}

export class UpdateConfigArgumentDto {
  @ApiProperty({ description: 'Configuration value' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Configuration description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class PlatformFeeResponseDto {
  @ApiProperty({ description: 'Platform fee percentage (0-100)' })
  platformFeePercent: number;

  constructor(percent: number) {
    this.platformFeePercent = percent;
  }
}

export class UpdatePlatformFeeArgumentDto {
  @ApiProperty({
    description: 'Platform fee percentage (0-100)',
    minimum: 0,
    maximum: 100,
    example: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  platformFeePercent: number;
}
