import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class SuspendShopArgumentDto {
  @ApiProperty({
    description: 'Reason for suspending the shop',
    example: 'Violation of platform policies',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  reason: string;
}

export class BanShopArgumentDto {
  @ApiProperty({
    description: 'Reason for banning the shop',
    example: 'Repeated violations and fraudulent activities',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  reason: string;
}
