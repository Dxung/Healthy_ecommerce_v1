'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { apiClient, UserProfileResponse } from '@/lib/api';

interface AuthContextType {
  user: UserProfileResponse | null;
  setUser: (user: UserProfileResponse | null) => void;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ClientAuthProvider({
  initialUser,
  children,
}: {
  initialUser: UserProfileResponse | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<UserProfileResponse | null>(initialUser);

  const refetch = useCallback(async () => {
    try {
      const userData = await apiClient.getUserProfile();
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within ClientAuthProvider');
  }
  return context;
}
