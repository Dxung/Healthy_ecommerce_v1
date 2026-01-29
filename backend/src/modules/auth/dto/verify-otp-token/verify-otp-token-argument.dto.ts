import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) used for verifying a token.
 */
export class VerifyOtpTokenArgumentDto {
  @ApiProperty({
    description:
      'Token FE got from third party service and send to BE for verification',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
