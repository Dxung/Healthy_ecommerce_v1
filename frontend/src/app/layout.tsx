import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Toaster } from "sonner";
import { ClientAuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { cookies } from "next/headers";
import type { UserProfileResponse } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HealthyFood - Healthy Ecommerce",
  description: "Healthy food e-commerce application",
};

async function getServerUser(): Promise<UserProfileResponse | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('sessionToken')?.value;

    if (!sessionToken) return null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
      headers: {
        Cookie: `sessionToken=${sessionToken}`,
      },
      cache: 'no-store', // Critical: prevents stale data
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getServerUser();

  return (
    <html lang="vi">
      <body className={inter.className}>
        <ClientAuthProvider initialUser={initialUser}>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              {children}
            </div>
            <Toaster position="top-center" richColors />
          </CartProvider>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
