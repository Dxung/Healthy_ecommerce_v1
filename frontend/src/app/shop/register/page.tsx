"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { ShopInfoStep } from "@/components/shop/register/ShopInfoStep";
import { ShopDocumentsStep } from "@/components/shop/register/ShopDocumentsStep";
import { ShopRegistrationSuccessStep } from "@/components/shop/register/ShopRegistrationSuccessStep";
import type { ShopRegistrationStatusResponse } from "@/lib/api";

type Step = "info" | "documents" | "success";

export default function ShopRegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("info");

  // Data passed between steps
  const [registrationToken, setRegistrationToken] = useState<string>("");
  const [shopName, setShopName] = useState<string>("");
  const [registrationResult, setRegistrationResult] = useState<ShopRegistrationStatusResponse | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push("/login?redirect=/shop/register");
    }
  }, [user, router]);

  // Handle successful Phase 1 (shop info + OTP verified)
  const handleInfoSuccess = (token: string, name: string) => {
    setRegistrationToken(token);
    setShopName(name);
    setCurrentStep("documents");
  };

  // Handle successful Phase 2 (documents submitted)
  const handleDocumentsSuccess = (result: ShopRegistrationStatusResponse) => {
    setRegistrationResult(result);
    setCurrentStep("success");
  };

  // Handle going back to info step
  const handleBackToInfo = () => {
    setCurrentStep("info");
    setRegistrationToken("");
  };

  // Don't render until we confirm user is authenticated
  if (user === null) {
    return null;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          {currentStep === "info" && (
            <ShopInfoStep
              onSuccess={handleInfoSuccess}
              userPhone={user?.phoneNumber || null}
            />
          )}

          {currentStep === "documents" && (
            <ShopDocumentsStep
              token={registrationToken}
              shopName={shopName}
              onSuccess={handleDocumentsSuccess}
              onBack={handleBackToInfo}
            />
          )}

          {currentStep === "success" && registrationResult && (
            <ShopRegistrationSuccessStep registration={registrationResult} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
