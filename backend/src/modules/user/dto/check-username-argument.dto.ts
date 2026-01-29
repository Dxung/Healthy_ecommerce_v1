import { IsString, Matches, MinLength, MaxLength } from 'class-validator';

/**
 * DTO for checking username availability
 */
export class CheckUsernameArgumentDto {
  /**
   * Username to check for availability
   * Must be 6-30 characters long and contain only alphanumeric characters and underscores
   */
  @IsString({ message: 'Username must be a string' })
  @MinLength(6, { message: 'Username must be at least 6 characters long' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  @Matches(/^[a-zA-Z0-9_]{6,30}$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;
}
