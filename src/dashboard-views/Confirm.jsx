import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';
import useSEO from '../utils/useSEO';

export default function Confirm() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useSEO({
    title: 'Confirmando tu cuenta',
    noindex: true,
  });

  useEffect(() => {
    // Escuchar el estado de autenticación de Supabase.
    // Cuando el usuario hace clic en el enlace del correo y es redirigido a esta ruta,
    // el cliente de Supabase procesa los parámetros del hash (#access_token=...) automáticamente.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/bienvenida');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        navigate('/bienvenida');
      }
    });

    // Timeout de seguridad de 5 segundos en caso de error
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
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 text-center border border-slate-100 space-y-6">
        {!error ? (
          <>
            <Loader2 className="w-12 h-12 text-benmarket-600 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900">Verificando tu cuenta</h2>
            <p className="text-slate-600">Por favor, espera un momento mientras confirmamos tu registro en BenMarket...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">!</div>
            <h2 className="text-2xl font-bold text-slate-900">Error de verificación</h2>
            <p className="text-slate-600">{error}</p>
            <button
              onClick={() => navigate('/login')}
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
