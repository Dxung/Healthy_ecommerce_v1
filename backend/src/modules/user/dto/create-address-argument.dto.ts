import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class CreateAddressArgumentDto {
  @ApiProperty({
    description: 'Recipient name',
    example: 'Nguyễn Văn A',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  recipientName: string;

  @ApiProperty({
    description: 'Recipient phone number (Vietnamese format: +84xxxxxxxxx)',
    example: '+84912345678',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+84\d{9}$/, {
    message: 'Chỉ hỗ trợ số điện thoại Việt Nam (+84xxxxxxxxx)',
  })
  recipientPhone: string;

  @ApiProperty({
    description: 'Province ID',
    example: '01',
  })
  @IsNotEmpty()
  @IsString()
  provinceId: string;

  @ApiProperty({
    description: 'District ID',
    example: '001',
  })
  @IsNotEmpty()
  @IsString()
  districtId: string;

  @ApiProperty({
    description: 'Ward ID',
    example: '00001',
  })
  @IsNotEmpty()
  @IsString()
  wardId: string;

  @ApiProperty({
    description: 'Detailed address line',
    example: '123 Đường ABC',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  addressLine: string;

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
    default: 'HOME',
    example: 'HOME',
  })
  @IsOptional()
  @IsEnum(['HOME', 'OFFICE'], {
    message: 'Label must be HOME or OFFICE',
  })
  label?: string;

  @ApiPropertyOptional({
    description:
      'Set as default address. If this is the first address, will be forced to true.',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
