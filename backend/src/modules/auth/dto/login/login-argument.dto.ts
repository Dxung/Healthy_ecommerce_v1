import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { ValidationErrorCodes } from 'src/shared/const/validation-error-codes.const';

/**
 * DTO for login arguments.
 */
export class LoginArgumentDto {
  @ApiProperty({
    description:
      'Login identifier - can be username, email, or phone number (+84...)',
    required: true,
    example: 'buyer_username123',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255, {
    message: ValidationErrorCodes.LOGIN_ID_TOO_LONG,
  })
  loginId: string;

  @ApiProperty({
    description: 'The password for authentication',
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
  password: string;
}
