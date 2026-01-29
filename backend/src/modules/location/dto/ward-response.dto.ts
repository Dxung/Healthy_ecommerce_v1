import { ApiProperty } from '@nestjs/swagger';
import { Ward } from '../models/ward.model';

export class WardResponseDto {
  @ApiProperty({
    description: 'Ward ID',
    example: '00001',
  })
  id: string;

  @ApiProperty({
    description: 'District ID this ward belongs to',
    example: '001',
  })
  districtId: string;

  @ApiProperty({
    description: 'Ward name in Vietnamese',
    example: 'Phúc Xá',
  })
  name: string;

  @ApiProperty({
    description: 'Ward name in English (without diacritics)',
    example: 'Phuc Xa',
    nullable: true,
  })
  nameEn: string | null;

  @ApiProperty({
    description: 'Type of administrative division',
    example: 'phuong',
    nullable: true,
  })
  type: string | null;

  @ApiProperty({
    description: 'Full ward name with type',
    example: 'Phường Phúc Xá',
    nullable: true,
  })
  nameWithType: string | null;

  constructor(ward: Ward) {
    this.id = ward.id;
    this.districtId = ward.districtId;
    this.name = ward.name;
    this.nameEn = ward.nameEn;
    this.type = ward.type;
    this.nameWithType = ward.nameWithType;
  }
}
