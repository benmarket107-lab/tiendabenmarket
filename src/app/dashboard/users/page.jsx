'use client';

import { useAuth } from '../../../context/AuthContext';
import UsersManager from '../../../dashboard-views/UsersManager';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Admin')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'Admin') return null;

  return <UsersManager />;
}
