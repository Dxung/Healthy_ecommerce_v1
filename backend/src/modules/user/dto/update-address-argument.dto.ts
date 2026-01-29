import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  Matches,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class UpdateAddressArgumentDto {
  @ApiPropertyOptional({
    description: 'Recipient name',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  recipientName?: string;

  @ApiPropertyOptional({
    description: 'Recipient phone number (Vietnamese format: +84xxxxxxxxx)',
    example: '+84912345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+84\d{9}$/, {
    message: 'Chỉ hỗ trợ số điện thoại Việt Nam (+84xxxxxxxxx)',
  })
  recipientPhone?: string;

  @ApiPropertyOptional({
    description: 'Province ID',
    example: '01',
  })
  @IsOptional()
  @IsString()
  provinceId?: string;

  @ApiPropertyOptional({
    description: 'District ID',
    example: '001',
  })
  @IsOptional()
  @IsString()
  districtId?: string;

  @ApiPropertyOptional({
    description: 'Ward ID',
    example: '00001',
  })
  @IsOptional()
  @IsString()
  wardId?: string;

  @ApiPropertyOptional({
    description: 'Detailed address line',
    example: '123 Đường ABC',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine?: string;

  @ApiPropertyOptional({
    description: 'Latitude for location pin',
    example: 21.0285,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude for location pin',
    example: 105.8542,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Address label',
    enum: ['HOME', 'OFFICE'],
    example: 'HOME',
  })
  @IsOptional()
  @IsEnum(['HOME', 'OFFICE'], {
    message: 'Label must be HOME or OFFICE',
  })
  label?: string;

  @ApiPropertyOptional({
    description: 'Set as default address',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
