import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for avatar operations (upload/delete)
 * Returns the avatar URL after successful operation
 */
export class AvatarResponseDto {
  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://res.cloudinary.com/demo/image/upload/avatars/user123.jpg',
  })
  avatarUrl: string;

  constructor(avatarUrl: string) {
    this.avatarUrl = avatarUrl;
  }
}
