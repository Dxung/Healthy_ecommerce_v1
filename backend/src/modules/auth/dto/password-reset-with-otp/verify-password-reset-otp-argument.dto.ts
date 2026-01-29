import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data transfer object for verifying OTP during password reset flow.
 * This is Step 1: User sends Firebase token to verify phone ownership.
 */
export class VerifyPasswordResetOtpArgumentDto {
  /**
   * Firebase ID token obtained after OTP verification.
   * This token is used to verify phone number ownership.
   */
  @ApiProperty({
    description:
      'Firebase ID token obtained after OTP verification. Used to verify phone number ownership.',
    required: true,
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFkYzBmMTc...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
