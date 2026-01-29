/**
 * Response DTO for current authenticated user information
 */
export class CurrentUserResponseDto {
  username: string;
  avatarUrl: string;

  constructor(username: string, avatarUrl: string) {
    this.username = username;
    this.avatarUrl = avatarUrl;
  }
}
