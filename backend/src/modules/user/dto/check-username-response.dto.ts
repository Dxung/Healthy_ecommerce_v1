/**
 * DTO for username availability check response
 */
export class CheckUsernameResponseDto {
  /**
   * Indicates whether the username is available for registration
   */
  available: boolean;

  constructor(available: boolean) {
    this.available = available;
  }
}
