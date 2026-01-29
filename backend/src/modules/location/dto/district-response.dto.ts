import { ApiProperty } from '@nestjs/swagger';
import { District } from '../models/district.model';

export class DistrictResponseDto {
  @ApiProperty({
    description: 'District ID',
    example: '001',
  })
  id: string;

  @ApiProperty({
    description: 'Province ID this district belongs to',
    example: '01',
  })
  provinceId: string;

  @ApiProperty({
    description: 'District name in Vietnamese',
    example: 'Ba Đình',
  })
  name: string;

  @ApiProperty({
    description: 'District name in English (without diacritics)',
    example: 'Ba Dinh',
    nullable: true,
  })
  nameEn: string | null;

  @ApiProperty({
    description: 'Type of administrative division',
    example: 'quan',
    nullable: true,
  })
  type: string | null;

  @ApiProperty({
    description: 'Full district name with type',
    example: 'Quận Ba Đình',
    nullable: true,
  })
  nameWithType: string | null;

  constructor(district: District) {
    this.id = district.id;
    this.provinceId = district.provinceId;
    this.name = district.name;
    this.nameEn = district.nameEn;
    this.type = district.type;
    this.nameWithType = district.nameWithType;
  }
}
