import { ApiProperty } from '@nestjs/swagger';
import { IVerifyOtpResponse } from '../interfaces/verify-otp-response.interface';

/**
 * Data Transfer Object (DTO) used for returning the result of OTP token verification.
 */
export class VerifyOtpTokenResponseDto implements IVerifyOtpResponse {
  @ApiProperty({
    description:
      'If the user associated with the OTP token exists in the system or not',
    required: true,
    example: true,
  })
  existed: boolean;

  @ApiProperty({
    description:
      '[If existed] Username of the user associated with the OTP token',
    required: false,
    example: 'Michael Jackson',
  })
  username?: string;

  @ApiProperty({
    description:
      '[If existed] Phone number of the user associated with the OTP token',
    required: false,
    example: '+1234567890',
  })
  phoneNumber?: string;

  @ApiProperty({
    description:
      '[If existed] Avatar URL of the user associated with the OTP token',
    required: false,
    example: 'https://example.com/avatar.jpg',
  })
  avatarUrl?: string;

  @ApiProperty({
    description:
      '[If not existed] Token to be used for further registration process',
    required: false,
  })
  token?: string;

  constructor(
    data: Partial<VerifyOtpTokenResponseDto> &
      Pick<VerifyOtpTokenResponseDto, 'existed'>,
  ) {
    Object.assign(this, data);
  }
}
