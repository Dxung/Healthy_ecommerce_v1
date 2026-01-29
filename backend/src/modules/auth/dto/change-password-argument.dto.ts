import {
  IsString,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { ValidationErrorCodes } from 'src/shared/const/validation-error-codes.const';

/**
 * DTO for changing user password
 * Requires current password for verification and new strong password
 */
export class ChangePasswordArgumentDto {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
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
  newPassword: string;
}
