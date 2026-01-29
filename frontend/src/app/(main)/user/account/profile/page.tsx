'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AccountSidebar } from '@/components/user/AccountSidebar';
import { ProfileForm } from '@/components/user/ProfileForm';
import { AvatarSection } from '@/components/user/AvatarSection';

export default function ProfilePage() {
  const { user, refetch } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (!user.username) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-6 px-4">
          <div className="flex gap-4">
            <AccountSidebar />
            <div className="flex-1 bg-white rounded-lg shadow-sm flex items-center justify-center" style={{ minHeight: '600px' }}>
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Đang tải...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Centered Content Container - Same as Header */}
      <div className="container mx-auto py-6 px-4">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <AccountSidebar />

          {/* Combined Center + Right Card */}
          <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex">
              {/* Form Fields Section (60-65%) */}
              <div className="flex-1 w-[65%]">
                <ProfileForm profile={user} onUpdate={refetch} />
              </div>

              {/* Avatar Section (35-40%) */}
              <div className="w-[35%] border-l border-gray-200 px-6 py-6">
                <AvatarSection
                  avatarUrl={user.avatarUrl}
                  username={user.username}
                  onAvatarUpdate={refetch}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
