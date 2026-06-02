import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import logoImg from '../images/logo_new.webp';
import useSEO from '../utils/useSEO';

export default function Bienvenida() {
  useSEO({
    title: '¡Te damos la bienvenida!',
    noindex: true,
  });

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-slate-100 to-slate-50 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-benmarket-400/20 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-benmarket-600/10 blur-3xl"></div>

      <div className="max-w-md w-full space-y-8 relative z-10 text-center">
        <div className="mx-auto mb-6 flex justify-center">
          <img src={logoImg} alt="Logo Benmarket" className="h-20 w-auto object-contain drop-shadow-md" />
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ¡Cuenta Activada! 🎉
            </h1>
            <p className="text-benmarket-600 font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Te damos la bienvenida a BenMarket
            </p>
          </div>
          
          <p className="text-slate-600 leading-relaxed text-sm">
            Tu registro se completó con éxito. Ya puedes explorar la tienda, armar tu carrito para las compras del mes y gestionar tus pagos de la manera más práctica.
          </p>

          <Link 
            to="/"
            className="btn-primary w-full block py-3.5 text-lg font-bold shadow-lg shadow-benmarket-200/50 hover:shadow-benmarket-300/50 hover:-translate-y-0.5 transition-all text-center"
          >
            Comenzar a Comprar
          </Link>
        </div>
      </div>
    </div>
  );
}
