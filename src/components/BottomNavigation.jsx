import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { useState, useRef, useEffect } from 'react';

export default function BottomNavigation() {
  const { cart } = useCart();
  const { user } = useAuth();
  const { globalSearchQuery, setGlobalSearchQuery } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isHome = location.pathname === '/';
  const isCart = location.pathname === '/cart';
  const isAccount = location.pathname.startsWith('/dashboard') || location.pathname === '/login';

  // Enfocar el input cuando se abre el overlay de búsqueda
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 150);
    }
  }, [isSearchOpen]);

  const handleSearchTabClick = () => {
    if (isHome) {
      // Si ya está en la portada, abrimos el buscador directamente
      setIsSearchOpen(true);
    } else {
      // Si está en otra página, navegamos a la portada y abrimos el buscador
      navigate('/');
      setTimeout(() => setIsSearchOpen(true), 300);
    }
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  const getAccountLink = () => {
    if (!user) return '/login';
    return '/dashboard';
  };

  return (
    <>
      {/* Bottom Nav Bar Container */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden flex justify-around items-center h-16 px-2 safe-bottom">
        {/* Inicio */}
        <Link 
          to="/" 
          onClick={handleSearchClose}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 ${
            isHome && !isSearchOpen ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-5.5 h-5.5" strokeWidth={isHome && !isSearchOpen ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Inicio</span>
        </Link>

        {/* Buscar */}
        <button 
          onClick={handleSearchTabClick}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 ${
            isSearchOpen ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Search className="w-5.5 h-5.5" strokeWidth={isSearchOpen ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Buscar</span>
        </button>

        {/* Carrito */}
        <Link 
          to="/cart" 
          onClick={handleSearchClose}
          className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all active:scale-95 ${
            isCart ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5.5 h-5.5" strokeWidth={isCart ? 2.5 : 2} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-primary text-white text-[9px] font-black rounded-full h-4.5 min-w-4.5 px-1.5 flex items-center justify-center border border-white animate-pulse shadow-sm shadow-primary/30">
                {totalItems > 99 ? '99' : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">Carrito</span>
        </Link>

        {/* Mi Cuenta */}
        <Link 
          to={getAccountLink()} 
          onClick={handleSearchClose}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 ${
            isAccount ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-5.5 h-5.5" strokeWidth={isAccount ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Cuenta</span>
        </Link>
      </div>

      {/* Full Screen Search Overlay for Mobile */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col md:hidden animate-in fade-in slide-in-from-bottom duration-200">
          {/* Header del buscador */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Buscar en BenMarket..."
                className="w-full bg-slate-50 border-0 rounded-2xl py-3 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 font-semibold focus:ring-2 focus:ring-primary/20 outline-none text-base transition-all"
              />
              {globalSearchQuery && (
                <button 
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-200 text-slate-600 p-1 rounded-full text-xs hover:bg-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button 
              onClick={handleSearchClose}
              className="text-slate-600 font-bold text-sm px-2 py-1 active:scale-95 transition-transform"
            >
              Cancelar
            </button>
          </div>

          {/* Resultados rápidos de búsqueda o sugerencias */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            {globalSearchQuery.trim() === '' ? (
              <div className="text-center py-12 text-slate-400">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-500">¿Qué estás buscando hoy?</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">Escribe el nombre de un producto para comenzar a filtrar al instante.</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <button
                  onClick={handleSearchClose}
                  className="bg-primary text-on-primary font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-primary/25 active:scale-95 transition-all inline-flex items-center gap-2"
                >
                  Ver resultados
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
