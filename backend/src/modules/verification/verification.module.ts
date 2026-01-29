import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  EXTERNAL_TOKEN_VERIFICATION_SERVICE,
  INTERNAL_TOKEN_VERIFICATION_SERVICE,
  SHOP_REGISTRATION_TOKEN_SERVICE,
  PASSWORD_RESET_TOKEN_SERVICE,
} from './tokens/verification.token';
import { FIREBASE_APP } from './external-token-verification/firebase-otp-verification/firebase-otp-verification.token';
import { getFirebaseOTPConfig } from './external-token-verification/firebase-otp-verification/configs/firebase.config';
import * as firebaseAdmin from 'firebase-admin';
import { FirebaseOtpVerificationService } from './external-token-verification/firebase-otp-verification/firebase-otp-verification.service';
import { RegistrationVerificationService } from './internal-token-verification/in-memory-token-verification/in-memory-verification.service';
import { ShopRegistrationTokenService } from './internal-token-verification/shop-registration-token/shop-registration-token.service';
import { PasswordResetTokenService } from './internal-token-verification/password-reset-token/password-reset-token.service';

/**
 * Verification Module
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FIREBASE_APP,
      useFactory: (configService: ConfigService) => {
        const config = getFirebaseOTPConfig(configService);
        if (firebaseAdmin.apps.length === 0) {
          return firebaseAdmin.initializeApp(config);
        }
        return firebaseAdmin.app();
      },
      inject: [ConfigService],
    },
    {
      provide: EXTERNAL_TOKEN_VERIFICATION_SERVICE,
      useClass: FirebaseOtpVerificationService,
    },
    {
      provide: INTERNAL_TOKEN_VERIFICATION_SERVICE,
      useClass: RegistrationVerificationService,
    },
    {
      provide: SHOP_REGISTRATION_TOKEN_SERVICE,
      useClass: ShopRegistrationTokenService,
    },
    {
      provide: PASSWORD_RESET_TOKEN_SERVICE,
      useClass: PasswordResetTokenService,
    },
  ],
  exports: [
    EXTERNAL_TOKEN_VERIFICATION_SERVICE,
    INTERNAL_TOKEN_VERIFICATION_SERVICE,
    SHOP_REGISTRATION_TOKEN_SERVICE,
    PASSWORD_RESET_TOKEN_SERVICE,
  ],
})
export class VerificationModule {}
