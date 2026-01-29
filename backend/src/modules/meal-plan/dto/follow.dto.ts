import { ApiProperty } from '@nestjs/swagger';
import { UserFollowInfo } from '../repository/user-follow.repository.interface';

export class UserFollowResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ nullable: true })
  displayName: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty()
  presetCount: number;

  @ApiProperty({ description: 'Is current user following this user' })
  isFollowing: boolean;

  constructor(info: UserFollowInfo, isFollowing: boolean = false) {
    this.userId = info.userId;
    this.displayName = info.displayName;
    this.avatarUrl = info.avatarUrl;
    this.presetCount = info.presetCount;
    this.isFollowing = isFollowing;
  }
}

export class FollowStatsResponseDto {
  @ApiProperty()
  followerCount: number;

  @ApiProperty()
  followingCount: number;
}
