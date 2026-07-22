'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, User, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { useState, useRef, useEffect } from 'react';
import { formatCurrency } from '../utils/currency';

export default function BottomNavigation() {
  const { cart, addToCart } = useCart();
  const { user } = useAuth();
  const { globalSearchQuery, setGlobalSearchQuery, fetchProductsPage } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const location = { pathname };
  const navigate = (path) => router.push(path);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    
    const fetchResults = async () => {
      if (!globalSearchQuery || globalSearchQuery.trim() === '') {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      try {
        const { items } = await fetchProductsPage({
          page: 1,
          pageSize: 15,
          searchQuery: globalSearchQuery
        });
        if (!cancelled) {
          setSearchResults(items);
        }
      } catch (err) {
        console.error("Error searching products in bottom nav", err);
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [globalSearchQuery, fetchProductsPage]);

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
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden flex justify-around items-center h-16 px-2 safe-bottom"
        style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
      >
        {/* Inicio */}
        <Link 
          href="/" 
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
          href="/cart" 
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
          href={getAccountLink()} 
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
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">
                    {isSearching ? 'Buscando...' : `Productos encontrados (${searchResults.length})`}
                  </p>
                  <button
                    onClick={handleSearchClose}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Ver en pantalla completa
                  </button>
                </div>
                {isSearching ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Buscando resultados...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Ningún producto coincide con "{globalSearchQuery}"
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {searchResults.map((p) => {
                      const isInCart = cart.some(item => item.id === p.id);
                      return (
                        <div key={p.id} className="flex items-center gap-3 p-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                          <div 
                            onClick={() => {
                              handleSearchClose();
                              navigate(`/product/${p.id}`);
                            }}
                            className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-50 flex items-center justify-center p-0.5 cursor-pointer"
                          >
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          
                          <div 
                            onClick={() => {
                              handleSearchClose();
                              navigate(`/product/${p.id}`);
                            }}
                            className="flex-grow min-w-0 cursor-pointer"
                          >
                            <p className="text-[9px] text-primary font-bold uppercase tracking-wider">{p.category}</p>
                            <h4 className="font-bold text-xs text-slate-800 line-clamp-1 leading-tight">{p.name}</h4>
                            <p className="font-extrabold text-sm text-primary tracking-tight mt-0.5">{formatCurrency(p.price)}</p>
                          </div>
                          
                          <button
                            onClick={() => {
                              if (p.stock > 0) {
                                addToCart(p, 1);
                              }
                            }}
                            disabled={p.stock === 0}
                            className={`p-2 rounded-xl transition-all active:scale-95 shrink-0 ${
                              p.stock === 0
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : isInCart
                                  ? 'bg-green-500 text-white'
                                  : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                            }`}
                          >
                            {isInCart ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <ShoppingCart className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
