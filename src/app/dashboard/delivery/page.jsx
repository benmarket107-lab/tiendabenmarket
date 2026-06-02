'use client';

import { useAuth } from '../../../context/AuthContext';
import DeliveryManager from '../../../dashboard-views/DeliveryManager';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeliveryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !['Admin', 'Cajero'].includes(user.role))) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || !['Admin', 'Cajero'].includes(user.role)) return null;

  return <DeliveryManager />;
}
