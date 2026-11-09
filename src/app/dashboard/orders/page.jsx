'use client';

import { useAuth } from '../../../context/AuthContext';
import SalesHistory from '../../../dashboard-views/SalesHistory';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrdersManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !['Admin', 'Cajero'].includes(user.role))) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || !['Admin', 'Cajero'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <SalesHistory />;
}
