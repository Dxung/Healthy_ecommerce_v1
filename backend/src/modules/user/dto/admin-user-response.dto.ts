import type { AdminUserInfo } from '../admin-user.service.interface';
import type { UserStatus } from '../enums/user-status.enum';

export class AdminUserResponseDto {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string;
  status: UserStatus;
  createdAt: string;

  constructor(user: AdminUserInfo) {
    this.id = user.id;
    this.username = user.username;
    this.fullName = user.fullName;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.avatarUrl = user.avatarUrl;
    this.status = user.status;
    this.createdAt = user.createdAt.toISOString();
  }

  static fromList(users: AdminUserInfo[]): AdminUserResponseDto[] {
    return users.map((user) => new AdminUserResponseDto(user));
  }
}

export class AdminUserListResponseDto {
  data: AdminUserResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(
    data: AdminUserInfo[],
    pagination: { page: number; limit: number; total: number; totalPages: number },
  ) {
    this.data = AdminUserResponseDto.fromList(data);
    this.pagination = pagination;
  }
}
