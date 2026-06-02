'use client';

import { useAuth } from '../../../context/AuthContext';
import ValidarArqueos from '../../../dashboard-views/ValidarArqueos';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ValidationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Tesoreria')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'Tesoreria') return null;

  return <ValidarArqueos />;
}
