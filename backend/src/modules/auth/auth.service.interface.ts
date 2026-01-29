import type { ResultAsync } from 'neverthrow';
import type { IVerifyOtpResponse } from './dto/interfaces/verify-otp-response.interface';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { DeviceInfo } from 'src/common/interfaces/device-infos.interface';

export interface IAuthService {
  /**
   * Verifies the OTP token for a buyer.
   * @param token - The OTP token to verify.
   * @returns ResultAsync containing IVerifyOtpResponse type object on success or AuthErrorType on failure.
   */
  verifyBuyerOtpToken(
    token: string,
  ): ResultAsync<IVerifyOtpResponse, DomainError>;

  /**
   * Registers a buyer using their phone number.
   * @param token - The token created after OTP verification and sent from BE to FE.
   * @param username - Desired username for the new buyer.
   * @param password - Desired password for the new buyer.
   * @param deviceInfo - Device information extracted from the request.
   * @return ResultAsync that resolves to an object containing the sessionToken on success or DomainError on failure.
   */
  registerBuyerWithPhone(
    token: string,
    username: string,
    password: string,
    deviceInfo: DeviceInfo,
  ): ResultAsync<{ sessionToken: string }, DomainError>;

  /**
   * Authenticates a user using login ID (username/email/phone) and password.
   * @param loginId - The login identifier (can be username, email, or phone number).
   * @param password - The user's password.
   * @param deviceInfo - Device information extracted from the request.
   * @return ResultAsync that resolves to an object containing the sessionToken on success or DomainError on failure.
   */
  loginWithPassword(
    loginId: string,
    password: string,
    deviceInfo: DeviceInfo,
  ): ResultAsync<{ sessionToken: string }, DomainError>;

  /**
   * Verifies Firebase OTP token for password reset and creates internal token.
   * Flow:
   * 1. Verify Firebase token and extract phone number
   * 2. Find user by phone number (must exist)
   * 3. Create internal password-reset token
   * @param firebaseToken - The Firebase ID token from OTP verification.
   * @return ResultAsync that resolves to { token: string } on success or DomainError on failure.
   */
  verifyPasswordResetOtp(
    firebaseToken: string,
  ): ResultAsync<{ token: string }, DomainError>;

  /**
   * Resets user password using internal password-reset token.
   * Flow:
   * 1. Verify internal token and extract phone number
   * 2. Find user by phone number
   * 3. In transaction: Update password and delete all user sessions
   * @param token - The internal password-reset token from verifyPasswordResetOtp.
   * @param newPassword - The new password (will be hashed before storing).
   * @return ResultAsync that resolves to void on success or DomainError on failure.
   */
  resetPasswordWithOtp(
    token: string,
    newPassword: string,
  ): ResultAsync<void, DomainError>;

  /**
   * Logs out the current user by deleting their current session.
   * Requires AuthGuard to set sessionId in ALS.
   * @return ResultAsync that resolves to void on success or DomainError on failure.
   */
  logout(): ResultAsync<void, DomainError>;

  /**
   * Changes the current user's password.
   * Verifies current password before updating to new password.
   * Requires AuthGuard to set userId in ALS.
   * @param currentPassword - The current password for verification.
   * @param newPassword - The new password to set (will be hashed before storing).
   * @return ResultAsync that resolves to void on success or DomainError on failure.
   */
  changePassword(
    currentPassword: string,
    newPassword: string,
  ): ResultAsync<void, DomainError>;

  /**
   * Gets the password last updated timestamp for the current authenticated user.
   * Requires AuthGuard to set userId in ALS.
   * @return ResultAsync that resolves to the Date when password was last updated, null if not found, or DomainError on failure.
   */
  getPasswordUpdatedAt(): ResultAsync<Date | null, DomainError>;
}
