"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { ShopInfoStep } from "@/components/shop/register/ShopInfoStep";
import { ShopRegistrationSuccessStep } from "@/components/shop/register/ShopRegistrationSuccessStep";
import type { ShopInfoResponse } from "@/lib/api";

type Step = "info" | "success";

export default function ShopRegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [shopResult, setShopResult] = useState<ShopInfoResponse | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push("/login?redirect=/shop/register");
    }
  }, [user, router]);

  // Handle successful registration
  const handleSuccess = (shop: ShopInfoResponse) => {
    setShopResult(shop);
    setCurrentStep("success");
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
              onSuccess={handleSuccess}
              userPhone={user?.phoneNumber || null}
            />
          )}

          {currentStep === "success" && shopResult && (
            <ShopRegistrationSuccessStep shop={shopResult} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
