import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const registered = await register(email, password, nombre, apellido, celular);
      if (registered) {
        setSuccess('¡Registro exitoso! Por favor inicia sesión con tus nuevas credenciales.');
        setNombre('');
        setApellido('');
        setCelular('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError('Ocurrió un problema durante el registro. Intente de nuevo.');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión o el correo ya está registrado.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Error al registrar con Google: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-slate-100 to-slate-50 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-benmarket-400/20 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-benmarket-600/10 blur-3xl"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo_new.webp" alt="Logo Benmarket" className="h-20 w-auto object-contain drop-shadow-md" />
            </Link>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Crear Cuenta</h2>
          <p className="mt-2 text-sm text-slate-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-bold text-benmarket-600 hover:text-benmarket-700 transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-5 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm font-medium">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg text-sm font-medium">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  className="input-field bg-slate-50 focus:bg-white transition-colors"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido</label>
                <input
                  type="text"
                  required
                  className="input-field bg-slate-50 focus:bg-white transition-colors"
                  placeholder="Tu apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Celular</label>
              <input
                type="tel"
                required
                className="input-field bg-slate-50 focus:bg-white transition-colors"
                placeholder="Ej: 0981 123 456"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                className="input-field bg-slate-50 focus:bg-white transition-colors"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field bg-slate-50 focus:bg-white transition-colors pr-10"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar Contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="input-field bg-slate-50 focus:bg-white transition-colors pr-10"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-2 py-3.5 text-lg font-bold shadow-lg shadow-benmarket-200/50 hover:shadow-benmarket-300/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <UserPlus className="w-5 h-5" /> {loading ? 'Registrando...' : 'Registrarse'}
            </button>

            <div className="relative flex items-center justify-center my-4 hidden">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="absolute bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">o registrarse con</span>
            </div>

            {/* Botón de Google - Oculto temporalmente */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full justify-center items-center gap-3 py-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-sm font-bold text-slate-700 hidden"
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
  );
}
