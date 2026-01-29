import { Inject, Injectable } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { FIREBASE_APP } from './firebase-otp-verification.token';
import type { IExternalTokenVerificationService } from '../interfaces/external-token-verification.interface';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { AUTH_ERRORS } from 'src/modules/auth/errors/auth.errors';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';

/**
 * Service responsible for checking Firebase Token provided by the client after phone otp verification between client and Firebase.
 * Because of this createOTP function is not needed.
 */
@Injectable()
export class FirebaseOtpVerificationService
  implements IExternalTokenVerificationService
{
  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseApp: firebaseAdmin.app.App,
  ) {}

  /**
   * Verifies the Firebase OTP token and extracts the phone number.
   * @param token - The Firebase OTP token to verify.
   * @returns A ResultAsync containing the phone number if verification is successful, or an AuthErrorType if it fails. In case of success, but no phone number found, returns error.
   */
  @WithPosition()
  verifyTokenForPhone(
    token: string,
  ): ResultAsync<{ phone: string }, DomainError> {
    return ResultAsync.fromPromise(
      this.firebaseApp.auth().verifyIdToken(token),
      (error) => this.mapFirebaseErrorToAuthError(error),
    ).andThen((decodedIdToken) => {
      if (!decodedIdToken.phone_number) {
        return errAsync(
          createDomainError(AUTH_ERRORS.INVALID_OTP_TOKEN, {
            cause: 'No phone number found in decoded token',
          }),
        );
      }
      return okAsync({ phone: decodedIdToken.phone_number.trim() });
    });
  }
  /**
   * Maps Firebase errors to AuthErrorType.
   * @param firebaseError The error object from Firebase.
   * @returns Corresponding AuthErrorType.
   */
  private mapFirebaseErrorToAuthError(firebaseError: any): DomainError {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const code = firebaseError?.code;

    switch (code) {
      case 'auth/id-token-expired':
      case 'auth/session-cookie-expired':
        return createDomainError(AUTH_ERRORS.OTP_TOKEN_EXPIRED, {
          cause: firebaseError,
        });
      case 'auth/user-disabled':
        return createDomainError(AUTH_ERRORS.ACCOUNT_DISABLED, {
          cause: firebaseError,
        });

      case 'auth/id-token-revoked':
      case 'auth/invalid-id-token':
      case 'auth/argument-error':
      case 'auth/session-cookie-revoked':
      case 'auth/user-not-found':
      case 'auth/invalid-uid':
        return createDomainError(AUTH_ERRORS.INVALID_OTP_TOKEN, {
          cause: firebaseError,
        });
      case 'auth/internal-error':
      case 'auth/too-many-requests':
      case 'ETIMEDOUT':
      case 'ECONNREFUSED':
      case 'ESOCKETTIMEDOUT':
        return createDomainError(AUTH_ERRORS.OTP_VERIFICATION_UNAVAILABLE, {
          cause: firebaseError,
        });
      default:
        return createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: firebaseError,
        });
    }
  }
}
