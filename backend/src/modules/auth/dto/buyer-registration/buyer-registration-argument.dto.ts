import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
} from 'class-validator';
import { ValidationErrorCodes } from 'src/shared/const/validation-error-codes.const';

/**
 * DTO for buyer registration arguments.
 */
export class BuyerRegistrationArgumentDto {
  @ApiProperty({
    description:
      'Token that client got from BE Service. Used for completing registration process',
    required: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'The username chosen by the buyer for registration',
    required: true,
    example: 'buyer_username123',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.{6,30}$)[a-zA-Z0-9_]+$/, {
    message: ValidationErrorCodes.USERNAME_INVALID,
  })
  @MaxLength(30, {
    message: ValidationErrorCodes.USERNAME_TOO_LONG,
  })
  username: string;

  @ApiProperty({
    description: 'The password chosen by the buyer for registration',
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
