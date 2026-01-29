import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for verify password reset OTP endpoint.
 * Returns internal token for the next step of password reset.
 */
export class VerifyPasswordResetOtpResponseDto {
  /**
   * Internal token for password reset.
   * This token is used in the next step to actually reset the password.
   */
  @ApiProperty({
    description:
      'Internal token for password reset. Use this token with the password-reset endpoint.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  token: string;

  constructor(data: { token: string }) {
    this.token = data.token;
  }
}
