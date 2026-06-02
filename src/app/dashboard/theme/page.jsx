'use client';

import { useAuth } from '../../../context/AuthContext';
import ThemeManager from '../../../dashboard-views/ThemeManager';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ThemePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Admin')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'Admin') return null;

  return <ThemeManager />;
}
