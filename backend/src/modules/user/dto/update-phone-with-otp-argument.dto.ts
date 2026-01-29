import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for updating user phone number with Firebase OTP verification
 * Requires Firebase token obtained after OTP verification
 */
export class UpdatePhoneWithOtpArgumentDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
