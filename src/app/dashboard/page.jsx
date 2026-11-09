'use client';

import { useAuth } from '../../context/AuthContext';
import AdminDashboard from '../../dashboard-views/AdminDashboard';
import SalesHistory from '../../dashboard-views/SalesHistory';
import TesoreriaDashboard from '../../dashboard-views/TesoreriaDashboard';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && (!user || user.role === 'Cliente')) {
      router.replace('/');
    } else if (!loading && user?.role === 'Admin' && searchParams?.get('filter')) {
      router.replace(`/dashboard/orders?${searchParams.toString()}`);
    }
  }, [user, loading, router, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  switch (user.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Cajero':
      return <SalesHistory />;
    case 'Tesoreria':
      return <TesoreriaDashboard />;
    default:
      return null;
  }
}
