import { ApiProperty } from '@nestjs/swagger';
import { Province } from '../models/province.model';

export class ProvinceResponseDto {
  @ApiProperty({
    description: 'Province ID',
    example: '01',
  })
  id: string;

  @ApiProperty({
    description: 'Province name in Vietnamese',
    example: 'Hà Nội',
  })
  name: string;

  @ApiProperty({
    description: 'Province name in English (without diacritics)',
    example: 'Ha Noi',
    nullable: true,
  })
  nameEn: string | null;

  @ApiProperty({
    description: 'Type of administrative division',
    example: 'thanh-pho',
    nullable: true,
  })
  type: string | null;

  @ApiProperty({
    description: 'Full province name with type',
    example: 'Thành phố Hà Nội',
    nullable: true,
  })
  nameWithType: string | null;

  constructor(province: Province) {
    this.id = province.id;
    this.name = province.name;
    this.nameEn = province.nameEn;
    this.type = province.type;
    this.nameWithType = province.nameWithType;
  }
}
