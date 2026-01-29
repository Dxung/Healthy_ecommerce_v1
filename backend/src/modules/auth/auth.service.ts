import { Inject, Injectable } from '@nestjs/common';
import { USER_AUTH_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { USER_SERVICE } from '../user/tokens/user.token';
import { SESSION_SERVICE } from '../session/tokens/session.token';
import { UOW_TOKEN } from 'src/shared/unitOfWork/tokens/uow.token';
import {
  EXTERNAL_TOKEN_VERIFICATION_SERVICE,
  INTERNAL_TOKEN_VERIFICATION_SERVICE,
  PASSWORD_RESET_TOKEN_SERVICE,
} from '../verification/tokens/verification.token';
import { AUTHORIZATION_SERVICE } from '../authorization/tokens/authorization.token';
import type { IUserService } from '../user/user.service.interface';
import type { ISessionService } from '../session/session.service.interface';
import type { IUserAuthRepository } from './repository/user-auth.repository.interface';
import type { IInternalTokenVerificationService } from '../verification/internal-token-verification/interfaces/internal-token-verification.interface';
import type { IUow } from 'src/shared/unitOfWork/interfaces/uow.interface';
import type { IAuthorizationService } from '../authorization/authorization.service.interface';
import { IAuthService } from './auth.service.interface';
import { IVerifyOtpResponse } from './dto/interfaces/verify-otp-response.interface';
import type { IExternalTokenVerificationService } from '../verification/external-token-verification/interfaces/external-token-verification.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { okAsync, ResultAsync, errAsync } from 'neverthrow';
import { encode, compare } from 'src/common/utils/pass-encode.util';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { UserAuth } from './models/user-auth.model';
import { DeviceInfo } from 'src/common/interfaces/device-infos.interface';
import { detectLoginIdType } from 'src/common/utils/login-id-detector.util';
import { LoginIdType } from './enums/user_auth.enum';
import { AUTH_ERRORS } from './errors/auth.errors';
import { User } from '../user/models/user.model';
import { AsyncLocalStorage } from 'async_hooks';
import type { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { SESSION_ERRORS } from '../session/errors/session.errors';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USER_AUTH_REPOSITORY)
    private readonly userAuthRepository: IUserAuthRepository,
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
    @Inject(SESSION_SERVICE)
    private readonly sessionService: ISessionService,
    @Inject(EXTERNAL_TOKEN_VERIFICATION_SERVICE)
    private readonly externalTokenVerificationService: IExternalTokenVerificationService,
    @Inject(INTERNAL_TOKEN_VERIFICATION_SERVICE)
    private readonly internalTokenVerificationService: IInternalTokenVerificationService,
    @Inject(PASSWORD_RESET_TOKEN_SERVICE)
    private readonly passwordResetTokenService: IInternalTokenVerificationService,
    @Inject(AUTHORIZATION_SERVICE)
    private readonly authorizationService: IAuthorizationService,
    @Inject(UOW_TOKEN)
    private readonly transactionUow: IUow,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  /**
   * Verifies a buyer's OTP token.
   * @param token - The OTP token to verify.
   * @returns ResultAsync containing IVerifyOtpResponse type object on success or AuthErrorType on failure.
   */
  @WithPosition()
  verifyBuyerOtpToken(
    token: string,
  ): ResultAsync<IVerifyOtpResponse, DomainError> {
    return this.externalTokenVerificationService
      .verifyTokenForPhone(token)
      .andThen(({ phone }) => {
        return this.userService
          .findUserUsingPhoneNumber(phone)
          .map((userModel) => ({ userModel, phone }));
      })
      .andThen(({ userModel, phone }) => {
        if (userModel) {
          return okAsync<IVerifyOtpResponse, never>({
            existed: true,
            username: userModel.username,
            phoneNumber: phone,
            avatarUrl: userModel.avatarUrl,
          });
        }

        return this.internalTokenVerificationService
          .createTokenWithPhone(phone)
          .map((tokenResult) => ({
            existed: false,
            token: tokenResult.token,
          }));
      });
  }

  /**
   * Registers a buyer using their phone number.
   * @param token - The token created after OTP verification and sent from BE to FE.
   * @param username- Desired username for the new buyer.
   * @param password- Desired password for the new buyer.
   * @return ResultAsync that resolves to an object containing the sessionToken on success or AuthErrorType on failure.
   */

  @WithPosition()
  registerBuyerWithPhone(
    token: string,
    username: string,
    password: string,
    deviceInfo: DeviceInfo,
  ): ResultAsync<{ sessionToken: string }, DomainError> {
    //context như sau:
    //Người dùng điền các thông tin muốn tạo tài khoản mới vào (gồm username, password) - Yêu cầu khi đăng ký với phone number và gửi kèm token đã tạo với "verifyBuyerOtpToken" ở trên
    //1. Lấy token, sử dụng internalTokenVerificationService để verify và lấy phone number từ token
    //1.1 Nếu quá trình lấy token có lỗi (err) -> trả về err
    //1.2 Nếu token hợp lệ, lấy được phone number -> tiếp tục bước 2
    //2. Bắt đầu transaction để: tạo user mới với user module, tạo userAuth với userAuth module, gán role buyer, tạo session mới với session module
    //2.1 Nếu trong quá trình tạo có lỗi (err) -> transaction tự rollback + trả về err
    //2.2 Nếu tất cả các bước tạo đều thành công -> transaction commit + trả về sessionToken mới tạo
    return (
      this.internalTokenVerificationService
        //Đầu tiên thì verify token để lấy phone number
        //nếu verify thất bại thì trả vể errAsync -> bỏ qua các andThen phía sau
        .verifyTokenForPhone(token)

        //nếu verify thành công, lấy được phone number thì tiến hành transaction
        //transaction này sẽ trả về { sessionToken: string } sau khi xong nếu không có lỗi gì xảy ra
        //nếu có bất kỳ lỗi nào, transaction sẽ tự rollback và trả về errAsync cần thiết
        .andThen(({ phone }) =>
          this.transactionUow.executeInTransaction(() =>
            this.userService
              .createNewUserByPhone(phone, username)
              .andThen((createdUser) => {
                return ResultAsync.fromPromise(encode(password), (error) =>
                  createDomainError(SHARED_ERRORS.ENCODE_ERROR, {
                    cause: error,
                  }),
                )
                  .andThen((hashedPassword) => {
                    const newUserAuth = UserAuth.createNewUserAuthByPhone(
                      createdUser.id,
                      hashedPassword,
                    );
                    return this.userAuthRepository.createNewAuthForUser(
                      newUserAuth,
                    );
                  })
                  .map(() => createdUser);
              })
              .andThen((createdUser) =>
                // Assign 'buyer' role to the newly created user (system assignment)
                this.authorizationService
                  .assignRoleToUser(createdUser.id, 'buyer', null)
                  .map(() => createdUser),
              )
              .andThen((createdUser) =>
                this.sessionService.createNewSession(
                  createdUser.id,
                  deviceInfo,
                ),
              )
              .map((createdSession) => {
                return { sessionToken: createdSession.sessionToken };
              }),
          ),
        )
    );
  }

  /**
   * Authenticates a user using login ID (username/email/phone) and password.
   * @param loginId - The login identifier (can be username, email, or phone number).
   * @param password - The user's password.
   * @param deviceInfo - Device information extracted from the request.
   * @return ResultAsync that resolves to an object containing the sessionToken on success or DomainError on failure.
   */
  @WithPosition()
  loginWithPassword(
    loginId: string,
    password: string,
    deviceInfo: DeviceInfo,
  ): ResultAsync<{ sessionToken: string }, DomainError> {
    // Step 1: Detect loginId type (username/email/phone)
    const loginIdType = detectLoginIdType(loginId);

    // Step 2: Find user based on loginId type
    let findUserResult: ResultAsync<User | null, DomainError>;

    switch (loginIdType) {
      case LoginIdType.USERNAME:
        findUserResult = this.userService.findUserByUsername(loginId);
        break;
      case LoginIdType.EMAIL:
        findUserResult = this.userService.findUserByEmail(loginId);
        break;
      case LoginIdType.PHONE:
        findUserResult = this.userService.findUserUsingPhoneNumber(loginId);
        break;
      default:
        return errAsync(
          createDomainError(AUTH_ERRORS.PROVIDER_NOT_CORRECT, {
            cause: AUTH_ERRORS.PROVIDER_NOT_CORRECT.message,
          }),
        );
    }

    return findUserResult.andThen((user) => {
      // Step 3: If user not found, return error
      if (!user) {
        return errAsync(
          createDomainError(AUTH_ERRORS.PROVIDER_NOT_CORRECT, {
            cause: AUTH_ERRORS.PROVIDER_NOT_CORRECT.message,
          }),
        );
      }

      // Step 4: Get hashed password from auth repository
      return this.userAuthRepository
        .getHashedPassword(user.id)
        .andThen((hashedPassword) => {
          // Step 5: If no hashed password found or empty, return error
          if (!hashedPassword || hashedPassword.trim() === '') {
            return errAsync(
              createDomainError(AUTH_ERRORS.PROVIDER_NOT_CORRECT, {
                cause: AUTH_ERRORS.PROVIDER_NOT_CORRECT.message,
              }),
            );
          }

          // Step 6: Compare provided password with hashed password
          return ResultAsync.fromPromise(
            compare(password, hashedPassword),
            (error) =>
              createDomainError(SHARED_ERRORS.SYSTEM_ERROR, { cause: error }),
          ).andThen((isPasswordValid) => {
            // Step 7: If password doesn't match, return error
            if (!isPasswordValid) {
              return errAsync(
                createDomainError(AUTH_ERRORS.PROVIDER_NOT_CORRECT, {
                  cause: AUTH_ERRORS.PROVIDER_NOT_CORRECT.message,
                }),
              );
            }

            // Step 8: Password is valid, find or create session
            return this.sessionService
              .findOrCreateSession(user.id, deviceInfo)
              .map((session) => {
                // Step 9: Return sessionToken
                return { sessionToken: session.sessionToken };
              });
          });
        });
    });
  }

  /**
   * Verifies Firebase OTP token for password reset and creates internal token.
   * Flow:
   * 1. Verify Firebase token and extract phone number
   * 2. Find user by phone number (must exist)
   * 3. Create internal password-reset token
   * @param firebaseToken - The Firebase ID token from OTP verification.
   * @return ResultAsync that resolves to { token: string } on success or DomainError on failure.
   */
  @WithPosition()
  verifyPasswordResetOtp(
    firebaseToken: string,
  ): ResultAsync<{ token: string }, DomainError> {
    // Step 1: Verify Firebase token and extract phone number
    return this.externalTokenVerificationService
      .verifyTokenForPhone(firebaseToken)
      .andThen(({ phone }) => {
        // Step 2: Find user by phone number
        return this.userService
          .findUserUsingPhoneNumber(phone)
          .andThen((user) => {
            // Step 3: If user not found, return error (phone must be registered)
            if (!user) {
              return errAsync(
                createDomainError(AUTH_ERRORS.PHONE_NOT_REGISTERED, {
                  cause: AUTH_ERRORS.PHONE_NOT_REGISTERED.message,
                }),
              );
            }

            // Step 4: Create internal password-reset token
            return this.passwordResetTokenService.createTokenWithPhone(phone);
          });
      });
  }

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
  @WithPosition()
  resetPasswordWithOtp(
    token: string,
    newPassword: string,
  ): ResultAsync<void, DomainError> {
    // Step 1: Verify internal token and extract phone number
    return this.passwordResetTokenService
      .verifyTokenForPhone(token)
      .andThen(({ phone }) => {
        // Step 2: Find user by phone number
        return this.userService
          .findUserUsingPhoneNumber(phone)
          .andThen((user) => {
            // Step 3: If user not found, return error
            if (!user) {
              return errAsync(
                createDomainError(AUTH_ERRORS.PHONE_NOT_REGISTERED, {
                  cause: AUTH_ERRORS.PHONE_NOT_REGISTERED.message,
                }),
              );
            }

            // Step 4: Hash the new password
            return ResultAsync.fromPromise(encode(newPassword), (error) =>
              createDomainError(SHARED_ERRORS.ENCODE_ERROR, { cause: error }),
            ).andThen((hashedPassword) => {
              // Step 5: Execute in transaction: Update password and delete all sessions
              return this.transactionUow.executeInTransaction(() =>
                this.userAuthRepository
                  .changePassword(user.id, hashedPassword)
                  .andThen(() => {
                    // Step 6: Delete all sessions for this user (logout from all devices)
                    return this.sessionService
                      .deleteAllUserSessions(user.id)
                      .map(() => undefined);
                  }),
              );
            });
          });
      });
  }

  /**
   * Logs out the current user by deleting their current session.
   * Flow:
   * 1. Get sessionId from ALS (set by AuthGuard)
   * 2. Validate sessionId exists
   * 3. Delete the session (SessionService validates ownership)
   * @return ResultAsync that resolves to void on success or DomainError on failure.
   */
  @WithPosition()
  logout(): ResultAsync<void, DomainError> {
    // Step 1: Get sessionId from ALS (set by AuthGuard)
    const store = this.als.getStore();
    const sessionId = store?.sessionId;

    // Step 2: If no sessionId in ALS, return error (shouldn't happen if AuthGuard is used)
    if (!sessionId) {
      return errAsync(
        createDomainError(SESSION_ERRORS.INVALID_SESSION, {
          cause: SESSION_ERRORS.INVALID_SESSION.message,
        }),
      );
    }

    // Step 3: Delete the session (SessionService validates ownership via ALS userId)
    return this.sessionService.deleteSelectedSession(sessionId);
  }

  /**
   * Changes the current user's password.
   * Flow:
   * 1. Get userId from ALS (set by AuthGuard)
   * 2. Fetch current hashed password from repository
   * 3. Verify current password matches
   * 4. Hash new password
   * 5. Update password in repository
   * @param currentPassword - The current password for verification.
   * @param newPassword - The new password to set (will be hashed before storing).
   * @return ResultAsync that resolves to void on success or DomainError on failure.
   */
  @WithPosition()
  changePassword(
    currentPassword: string,
    newPassword: string,
  ): ResultAsync<void, DomainError> {
    // Step 1: Get userId from ALS (set by AuthGuard)
    const store = this.als.getStore();
    const userId = store?.userId;

    // Step 2: If no userId in ALS, return error (shouldn't happen if AuthGuard is used)
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    // Step 3: Get current hashed password from repository
    return this.userAuthRepository
      .getHashedPassword(userId)
      .andThen((hashedPassword) => {
        // Step 4: If no hashed password found or empty, return error
        if (!hashedPassword || hashedPassword.trim() === '') {
          return errAsync(
            createDomainError(AUTH_ERRORS.PROVIDER_NOT_CORRECT, {
              cause: AUTH_ERRORS.PROVIDER_NOT_CORRECT.message,
            }),
          );
        }

        // Step 5: Compare provided current password with hashed password
        return ResultAsync.fromPromise(
          compare(currentPassword, hashedPassword),
          (error) =>
            createDomainError(SHARED_ERRORS.SYSTEM_ERROR, { cause: error }),
        ).andThen((isPasswordValid) => {
          // Step 6: If current password doesn't match, return error
          if (!isPasswordValid) {
            return errAsync(
              createDomainError(AUTH_ERRORS.PASSWORD_INCORRECT, {
                cause: AUTH_ERRORS.PASSWORD_INCORRECT.message,
              }),
            );
          }

          // Step 7: Hash the new password
          return ResultAsync.fromPromise(encode(newPassword), (error) =>
            createDomainError(SHARED_ERRORS.ENCODE_ERROR, { cause: error }),
          ).andThen((newHashedPassword) => {
            // Step 8: Update password in repository
            return this.userAuthRepository
              .changePassword(userId, newHashedPassword)
              .map(() => undefined);
          });
        });
      });
  }

  /**
   * Gets the password last updated timestamp for the current authenticated user.
   * Requires AuthGuard to set userId in ALS.
   * @return ResultAsync that resolves to the Date when password was last updated, null if not found, or DomainError on failure.
   */
  @WithPosition()
  getPasswordUpdatedAt(): ResultAsync<Date | null, DomainError> {
    // Get userId from ALS (set by AuthGuard)
    const store = this.als.getStore();
    const userId = store?.userId;

    // If no userId in ALS, return error (shouldn't happen with AuthGuard)
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.ALS_STORE_NOT_FOUND, {
          cause: SHARED_ERRORS.ALS_STORE_NOT_FOUND.message,
        }),
      );
    }

    return this.userAuthRepository.getPasswordUpdatedAt(userId);
  }
}
