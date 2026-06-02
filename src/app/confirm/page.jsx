'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabaseClient';
import { Loader2 } from 'lucide-react';
import useSEO from '../../utils/useSEO';

export default function ConfirmPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useSEO({
    title: 'Confirmando tu cuenta',
    noindex: true,
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/bienvenida');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        router.push('/bienvenida');
      }
    });

    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setError('No pudimos verificar tu sesión. El enlace podría haber expirado o ser inválido.');
        }
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 text-center border border-slate-100 space-y-6">
        {!error ? (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900">Verificando tu cuenta</h2>
            <p className="text-slate-600">Por favor, espera un momento mientras confirmamos tu registro en BenMarket...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">!</div>
            <h2 className="text-2xl font-bold text-slate-900">Error de verificación</h2>
            <p className="text-slate-600">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="btn-primary w-full py-3 font-bold"
            >
              Ir a Iniciar Sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
}
