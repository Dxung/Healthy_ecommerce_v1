/**
 * Response interface for verifying OTP.
 * @param existed - Indicates if the user already exists.
 * @param username - (Optional) The username of the user if they exist.
 * @param phoneNumber - (Optional) The phone number of the user if they exist.
 * @param avatarUrl - (Optional) The avatar URL of the user if they exist.
 * @param token - (Optional) A token associated with the verification process.
 */
export interface IVerifyOtpResponse {
  existed: boolean;
  username?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  token?: string;
}
