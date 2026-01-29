import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserAddress } from '../models/user-address.model';

export class AddressResponseDto {
  @ApiProperty({
    description: 'Address ID',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Address label',
    example: 'HOME',
  })
  label: string;

  @ApiProperty({
    description: 'Recipient name',
    example: 'Nguyễn Văn A',
  })
  recipientName: string;

  @ApiProperty({
    description: 'Recipient phone number',
    example: '+84912345678',
  })
  recipientPhone: string;

  @ApiProperty({
    description: 'Detailed address line',
    example: '123 Đường ABC',
  })
  addressLine: string;

  @ApiProperty({
    description: 'Ward ID',
    example: '00001',
  })
  wardId: string;

  @ApiProperty({
    description: 'District ID',
    example: '001',
  })
  districtId: string;

  @ApiProperty({
    description: 'Province ID',
    example: '01',
  })
  provinceId: string;

  @ApiProperty({
    description: 'Ward name with type',
    example: 'Phường Phúc Xá',
  })
  wardName: string;

  @ApiProperty({
    description: 'District name with type',
    example: 'Quận Ba Đình',
  })
  districtName: string;

  @ApiProperty({
    description: 'Province name with type',
    example: 'Thành phố Hà Nội',
  })
  provinceName: string;

  @ApiProperty({
    description: 'Full formatted address',
    example: '123 Đường ABC, Phường Phúc Xá, Quận Ba Đình, Thành phố Hà Nội',
  })
  fullAddress: string;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 21.0285,
    nullable: true,
  })
  latitude: number | null;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: 105.8542,
    nullable: true,
  })
  longitude: number | null;

  @ApiProperty({
    description: 'Is this the default address',
    example: true,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Created timestamp',
    example: '2026-01-11T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated timestamp',
    example: '2026-01-11T10:00:00.000Z',
  })
  updatedAt: Date;

  constructor(
    address: UserAddress,
    locationNames: {
      wardName: string;
      districtName: string;
      provinceName: string;
    },
  ) {
    this.id = address.id;
    this.label = address.label;
    this.recipientName = address.recipientName;
    this.recipientPhone = address.recipientPhone;
    this.addressLine = address.addressLine;
    this.wardId = address.wardId;
    this.districtId = address.districtId;
    this.provinceId = address.provinceId;
    this.wardName = locationNames.wardName;
    this.districtName = locationNames.districtName;
    this.provinceName = locationNames.provinceName;
    this.fullAddress = `${address.addressLine}, ${locationNames.wardName}, ${locationNames.districtName}, ${locationNames.provinceName}`;
    this.latitude = address.latitude;
    this.longitude = address.longitude;
    this.isDefault = address.isDefault;
    this.createdAt = address.createdAt;
    this.updatedAt = address.updatedAt;
  }
}
