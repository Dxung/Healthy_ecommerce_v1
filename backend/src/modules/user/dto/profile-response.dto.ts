import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../enums/gender.enum';
import { User } from '../models/user.model';
import {
  maskEmail,
  maskPhoneNumber,
} from 'src/common/utils/mask-sensitive-info.util';

/**
 * Response DTO for user profile information
 * Contains comprehensive user profile data with masked sensitive information
 */
export class ProfileResponseDto {
  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  username: string;

  @ApiPropertyOptional({
    description: 'Full name',
    example: 'John Doe',
    nullable: true,
  })
  fullName: string | null;

  @ApiPropertyOptional({
    description: 'Masked email address',
    example: 'jo*******@gmail.com',
    nullable: true,
  })
  email: string | null;

  @ApiPropertyOptional({
    description: 'Masked phone number',
    example: '+84*******88',
    nullable: true,
  })
  phoneNumber: string | null;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatarUrl: string;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-01-15T00:00:00.000Z',
    nullable: true,
  })
  dateOfBirth: Date | null;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
    nullable: true,
  })
  gender: Gender | null;

  @ApiPropertyOptional({
    description: 'Timestamp when date of birth was set',
    example: '2024-01-15T10:30:00.000Z',
    nullable: true,
  })
  dateOfBirthChangedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Timestamp when gender was set',
    example: '2024-01-15T10:30:00.000Z',
    nullable: true,
  })
  genderChangedAt: Date | null;

  @ApiPropertyOptional({
    description: 'User roles',
    example: ['buyer', 'shop'],
    type: [String],
  })
  roles?: string[];

  constructor(user: User, roles?: string[]) {
    this.username = user.username;
    this.fullName = user.fullName;
    this.email = maskEmail(user.email);
    this.phoneNumber = maskPhoneNumber(user.phoneNumber);
    this.avatarUrl = user.avatarUrl;
    this.dateOfBirth = user.dateOfBirth;
    this.gender = user.gender;
    this.dateOfBirthChangedAt = user.dateOfBirthChangedAt;
    this.genderChangedAt = user.genderChangedAt;
    this.roles = roles;
  }
}
