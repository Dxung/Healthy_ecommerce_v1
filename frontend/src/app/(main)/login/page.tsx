"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient, type ApiError } from "@/lib/api";
import { formatValidationErrors } from "@/lib/validation-messages";
import { isValidPhone, formatPhoneForDisplay, normalizePhone } from "@/lib/phoneUtils";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touchedLoginId, setTouchedLoginId] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLoginIdEmpty = loginId.trim() === "";
  const isPasswordEmpty = password.trim() === "";
  const isFormValid = !isLoginIdEmpty && !isPasswordEmpty;

  // Auto-format phone numbers for display
  const displayLoginId = isValidPhone(loginId)
    ? formatPhoneForDisplay(loginId)
    : loginId;

  const handleLoginIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLoginId(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Normalize phone number to +84 format if it's a phone number
      const normalizedLoginId = normalizePhone(loginId) || loginId;

      // Step 1: Login (sets sessionToken cookie)
      await apiClient.login({ loginId: normalizedLoginId, password });

      // Step 2: Fetch user data and update client state
      await refetch();

      // Step 3: Redirect to home page
      router.push("/");

      // Step 4: Sync with server state
      router.refresh();
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.statusCode === 401) {
        setError("Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại");
      } else if (apiError.statusCode === 400 && apiError.validationErrors) {
        // Format validation errors in Vietnamese
        const formattedError = formatValidationErrors(apiError.validationErrors);
        setError(formattedError);
      } else {
        setError(apiError.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-8 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Đăng nhập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login ID Input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Email/Số điện thoại/Tên đăng nhập"
                  value={displayLoginId}
                  onChange={handleLoginIdChange}
                  onBlur={() => setTouchedLoginId(true)}
                  className={
                    touchedLoginId && isLoginIdEmpty
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
              </div>
              {touchedLoginId && isLoginIdEmpty && (
                <p className="text-sm text-destructive">
                  Vui lòng điền vào mục này.
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouchedPassword(true)}
                  className={
                    touchedPassword && isPasswordEmpty
                      ? "border-destructive focus-visible:ring-destructive pr-10"
                      : "pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {touchedPassword && isPasswordEmpty && (
                <p className="text-sm text-destructive">
                  Vui lòng điền vào mục này.
                </p>
              )}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Quên mật khẩu
              </Link>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">hoặc</span>
              </div>
            </div>

            {/* Google Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                // Placeholder for OAuth later
                console.log("Google login clicked");
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            {/* Register Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Bạn mới biết đến HealthyFood?{" "}
              </span>
              <Link
                href="/buyer/signup"
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
