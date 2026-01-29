'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmationResult } from 'firebase/auth';
import { Card, CardContent } from '@/components/ui/card';
import { PhoneInputStep } from '@/components/auth/PhoneInputStep';
import { OtpVerifyStep } from '@/components/auth/OtpVerifyStep';
import { RegisterStep } from '@/components/auth/RegisterStep';
import { PhoneExistsStep } from '@/components/auth/PhoneExistsStep';

type Step = 'phone' | 'otp' | 'register' | 'phoneExists';

interface ExistingUserInfo {
  username: string;
  phoneNumber: string;
  avatarUrl?: string;
}

export default function BuyerSignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  const [existingUserInfo, setExistingUserInfo] = useState<ExistingUserInfo | null>(null);

  const handlePhoneSuccess = (result: ConfirmationResult, phone: string) => {
    setConfirmationResult(result);
    setPhoneNumber(phone);
    setCurrentStep('otp');
  };

  const handleOtpSuccess = (token: string) => {
    setRegistrationToken(token);
    setCurrentStep('register');
  };

  const handlePhoneExists = (username: string, phoneNumber: string, avatarUrl?: string) => {
    setExistingUserInfo({ username, phoneNumber, avatarUrl });
    setCurrentStep('phoneExists');
  };

  const handleBackToPhone = () => {
    setCurrentStep('phone');
    setConfirmationResult(null);
    setPhoneNumber('');
    setRegistrationToken('');
    setExistingUserInfo(null);
  };

  const handleGetBackAccount = (phone: string) => {
    // Redirect to forgot-password page with phone number pre-filled
    router.push(`/forgot-password?phone=${encodeURIComponent(phone)}`);
  };

  return (
    <div className="flex items-center justify-center px-4 py-8 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {currentStep === 'phone' && <PhoneInputStep onSuccess={handlePhoneSuccess} />}

          {currentStep === 'otp' && confirmationResult && (
            <OtpVerifyStep
              confirmationResult={confirmationResult}
              phoneNumber={phoneNumber}
              onBack={handleBackToPhone}
              onSuccess={handleOtpSuccess}
              onPhoneExists={handlePhoneExists}
            />
          )}

          {currentStep === 'register' && registrationToken && (
            <RegisterStep registrationToken={registrationToken} />
          )}

          {currentStep === 'phoneExists' && existingUserInfo && (
            <PhoneExistsStep
              username={existingUserInfo.username}
              phoneNumber={existingUserInfo.phoneNumber}
              avatarUrl={existingUserInfo.avatarUrl}
              onGetBackAccount={handleGetBackAccount}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
