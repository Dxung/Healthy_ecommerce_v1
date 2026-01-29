import { ConfigService } from '@nestjs/config';
import * as firebaseAdmin from 'firebase-admin';

/**
 * Creates and returns Firebase OTP configuration using environment variables.
 * @param config - The ConfigService instance to retrieve environment variables.
 * @returns Firebase OTP configuration object.
 */
export const getFirebaseOTPConfig = (config: ConfigService) => {
  const projectId = config.get<string>('FIREBASE_PROJECT_ID');
  const clientEmail = config.get<string>('FIREBASE_CLIENT_EMAIL');
  const privateKey = config.get<string>('FIREBASE_PRIVATE_KEY');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase configuration environment variables');
  }

  return {
    credential: firebaseAdmin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  };
};
