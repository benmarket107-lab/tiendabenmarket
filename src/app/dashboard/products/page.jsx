'use client';

import { useAuth } from '../../../context/AuthContext';
import ProductsManager from '../../../dashboard-views/ProductsManager';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !['Admin', 'Cajero'].includes(user.role))) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || !['Admin', 'Cajero'].includes(user.role)) return null;

  return <ProductsManager />;
}
