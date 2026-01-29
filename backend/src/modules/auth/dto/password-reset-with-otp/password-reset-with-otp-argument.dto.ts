import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { ValidationErrorCodes } from 'src/shared/const/validation-error-codes.const';

/**
 * Data transfer object for password reset with OTP verification.
 * Used when user wants to reset password using internal token from verify-otp step.
 */
export class PasswordResetWithOtpArgumentDto {
  /**
   * Internal token obtained from the verify-password-reset-otp endpoint.
   * This token is created after Firebase OTP verification succeeds.
   */
  @ApiProperty({
    description:
      'Internal token obtained from verify-password-reset-otp endpoint. Used to complete password reset.',
    required: true,
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  /**
   * New password for the user account.
   * Must meet security requirements:
   * - At least 8 characters
   * - Contains uppercase letter
   * - Contains lowercase letter
   * - Contains digit
   * - Contains special character
   */
  @ApiProperty({
    description:
      'New password for the user account. Must contain at least 8 characters, including uppercase, lowercase, digit, and special character.',
    required: true,
    example: 'Str0ngP@ssw0rd!',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message: ValidationErrorCodes.PASSWORD_TOO_WEAK,
    },
  )
  @MaxLength(128, {
    message: ValidationErrorCodes.PASSWORD_TOO_LONG,
  })
  newPassword: string;
}
