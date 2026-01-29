'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();

  // Check if user has admin or super_admin role
  const isAdmin = user?.roles?.some(role => role === 'admin' || role === 'super_admin') ?? false;

  useEffect(() => {
    if (isAdmin) {
      router.replace('/admin/accounts/users');
    }
  }, [isAdmin, router]);

  // Show nothing while redirecting admin users
  if (isAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
