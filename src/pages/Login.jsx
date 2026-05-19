import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Store, LogIn, UserCircle, Calculator, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';
import { users as mockUsers } from '../data/mock';
import logoImg from '../images/logo.png';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testUsers, setTestUsers] = useState([]);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchTestUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .in('email', [
            'cliente@benmarket.com',
            'cajero@benmarket.com',
            'tesoreria@benmarket.com',
            'admin@benmarket.com',
            'invitado@benmarket.com'
          ])
          .order('name', { ascending: true });
        
        if (!error && data && data.length > 0) {
          const usersWithPass = data.map(u => ({
            ...u,
            password: 'benmarket123'
          }));
          setTestUsers(usersWithPass);
        } else {
          setTestUsers(mockUsers.map(u => ({ ...u, password: 'benmarket123' })));
        }
      } catch (err) {
        setTestUsers(mockUsers.map(u => ({ ...u, password: 'benmarket123' })));
      }
    };
    fetchTestUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (success) {
        const redirect = searchParams.get('redirect');
        if (redirect) {
          navigate(redirect);
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Credenciales inválidas o error de conexión. Intenta de nuevo.');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Error al iniciar sesión con Google: ' + err.message);
    }
  };

  const handleFastLogin = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setTimeout(() => {
      const form = document.getElementById('login-form');
      if (form) form.requestSubmit();
    }, 100);
  };

  const roleIcons = {
    Cliente: UserCircle,
    Cajero: Calculator,
    Tesoreria: Wallet,
    Admin: ShieldCheck
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sección Izquierda: Formulario de Login */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-8 flex justify-center">
              <img src={logoImg} alt="Logo Benmarket" className="h-16 sm:h-20 w-auto object-contain drop-shadow-md" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Iniciar Sesión</h2>
            <p className="mt-2 text-sm text-slate-600">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="font-bold text-benmarket-600 hover:text-benmarket-700 transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
          
          <form id="login-form" className="mt-8 space-y-6 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm font-medium animate-pulse">
                {error}
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  className="input-field bg-slate-50 focus:bg-white transition-colors"
                  placeholder="ejemplo@benmarket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  required
                  className="input-field bg-slate-50 focus:bg-white transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-3">
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2 py-3.5 text-lg font-bold shadow-lg shadow-benmarket-200/50 hover:shadow-benmarket-300/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <LogIn className="w-5 h-5" /> {loading ? 'Ingresando...' : 'Ingresar'}
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="absolute bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">o continuar con</span>
              </div>

              {/* Botón de Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center gap-3 py-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-sm font-bold text-slate-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.99 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.87 3a6.972 6.972 0 0 1 6.63-5.46z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46a5.532 5.532 0 0 1-2.4 3.63v3.01h3.87c2.27-2.09 3.56-5.17 3.56-8.74z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.37 14.49A6.93 6.93 0 0 1 5 12c0-.87.15-1.72.43-2.52L1.5 6.47A11.97 11.97 0 0 0 0 12c0 2.01.5 3.91 1.4 5.6l3.97-3.11z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.87-3.01c-1.07.72-2.45 1.15-4.09 1.15-3.14 0-5.8-2.11-6.75-4.96l-3.87 3A11.94 11.94 0 0 0 12 23z"
                  />
                </svg>
                Google
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sección Derecha: Atajos de Prueba */}
      <div className="flex-1 bg-benmarket-900 text-white flex flex-col justify-center py-12 px-4 sm:px-12 lg:px-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="max-w-md mx-auto w-full relative z-10">
          <div className="mb-8 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2 text-white">Perfiles de Prueba 🧪</h3>
            <p className="text-benmarket-200">Haz clic en cualquier perfil para iniciar sesión automáticamente. Se registrarán automáticamente en la base de datos si no existen.</p>
          </div>

          <div className="grid gap-4">
            {(testUsers.length > 0 ? testUsers.slice(0, 4) : mockUsers.slice(0, 4)).map((testUser) => {
              const Icon = roleIcons[testUser.role] || UserCircle;
              return (
                <button
                  key={testUser.id}
                  type="button"
                  onClick={() => handleFastLogin(testUser.email, testUser.password)}
                  disabled={loading}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-benmarket-800/80 border border-benmarket-700 hover:bg-white hover:border-white transition-all text-left shadow-sm hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none"
                >
                  <div className="relative">
                    <img src={testUser.avatar} alt={testUser.name} className="w-14 h-14 rounded-full object-cover border-2 border-benmarket-500 group-hover:border-benmarket-600 transition-colors" />
                    <div className="absolute -bottom-1 -right-1 bg-benmarket-900 group-hover:bg-white p-1 rounded-full text-benmarket-300 group-hover:text-benmarket-600 transition-colors shadow-sm">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-white group-hover:text-slate-900 transition-colors">{testUser.name}</p>
                    <p className="text-sm text-benmarket-300 group-hover:text-slate-500 font-mono transition-colors">{testUser.email}</p>
                  </div>
                  <div className="hidden sm:block">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-benmarket-900 text-benmarket-200 group-hover:bg-benmarket-100 group-hover:text-benmarket-700 transition-colors border border-benmarket-700 group-hover:border-benmarket-200 shadow-inner">
                      Rol: {testUser.role}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}