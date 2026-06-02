'use client';

import { useAuth } from '../../../context/AuthContext';
import BannersManager from '../../../dashboard-views/BannersManager';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BannersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !['Admin', 'Cajero'].includes(user.role))) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || !['Admin', 'Cajero'].includes(user.role)) return null;

  return <BannersManager />;
}
