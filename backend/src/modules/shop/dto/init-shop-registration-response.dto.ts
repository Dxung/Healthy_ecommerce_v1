import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for Phase 1 of shop registration
 * Returns the internal token to use in Phase 2
 */
export class InitShopRegistrationResponseDto {
  @ApiProperty({
    description: 'Internal registration token for completing Phase 2',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  token: string;

  @ApiProperty({
    description: 'Message indicating successful initialization',
    example: 'Xác thực thành công. Vui lòng hoàn tất đăng ký trong 30 phút.',
  })
  message: string;

  constructor(token: string) {
    this.token = token;
    this.message = 'Xác thực thành công. Vui lòng hoàn tất đăng ký trong 30 phút.';
  }
}
