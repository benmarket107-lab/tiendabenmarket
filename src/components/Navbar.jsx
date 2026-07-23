'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, LogOut, Store, ShieldCheck, Calculator, Wallet, UserCircle, Search, User, Heart, Menu, X, Home, Bell, Volume2, VolumeX, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import { useFavorites } from '../context/FavoritesContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { globalSearchQuery, setGlobalSearchQuery } = useAppContext();
  const { count: favoritesCount } = useFavorites();
  const router = useRouter();
  const pathname = usePathname();
  const location = { pathname };
  const navigate = (path) => router.push(path);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [pendingToast, setPendingToast] = useState(null);
  const [isSoundMuted, setIsSoundMuted] = useState(() => {
    return localStorage.getItem('staff_order_sound_muted') === 'true';
  });
  const dropdownRef = useRef(null);
  const audioRef = useRef({ ctx: null, unlocked: false });

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setGlobalSearchQuery(query);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const ensureAudioUnlocked = async () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;

      if (!audioRef.current.ctx) {
        audioRef.current.ctx = new AudioContextClass();
      }
      if (audioRef.current.ctx.state === 'suspended') {
        await audioRef.current.ctx.resume();
      }
      audioRef.current.unlocked = audioRef.current.ctx.state === 'running';
      return audioRef.current.unlocked;
    } catch (e) {
      return false;
    }
  };

  const playNotificationSound = async () => {
    if (isSoundMuted) return;
    const ok = await ensureAudioUnlocked();
    if (!ok) return;

    const ctx = audioRef.current.ctx;
    const now = ctx.currentTime;

    const tone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    };

    tone(880, now + 0.0, 0.12);
    tone(1175, now + 0.16, 0.14);
  };

  useEffect(() => {
    if (!user || !['Admin', 'Cajero'].includes(user.role)) return;

    const unlock = () => {
      ensureAudioUnlocked();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [user]);

  useEffect(() => {
    if (!user || !['Admin', 'Cajero'].includes(user.role)) {
      setPendingOrdersCount(0);
      setPendingToast(null);
      return;
    }

    let toastTimer = null;

    const showToast = (pedido) => {
      setPendingToast({
        id: pedido?.id || null,
        created_at: pedido?.created_at || null,
      });
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => setPendingToast(null), 6000);
    };

    const fetchPendingCount = async () => {
      const { count, error } = await supabase
        .from('pedidos')
        .select('id', { count: 'estimated', head: true })
        .eq('estado', 'Pendiente');
      if (!error) setPendingOrdersCount(Number(count) || 0);
    };

    // Carga inicial del conteo de pendientes
    fetchPendingCount();

    // Refresco periódico cada 30s para mantener el contador exacto (ej: cuando el cajero
    // confirma un pedido, el contador de la Navbar baja sin depender del WebSocket)
    const countInterval = setInterval(fetchPendingCount, 30000);

    // Suscripción ligera: solo INSERT para sonido y toast de nuevos pedidos.
    // SalesHistory maneja UPDATE/DELETE de forma independiente, evitando procesamiento doble.
    const channel = supabase
      .channel(`navbar-alerts-${user.id || user.role}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        (payload) => {
          if (payload.new?.estado === 'Pendiente') {
            setPendingOrdersCount((prev) => prev + 1);
            showToast(payload.new);
            playNotificationSound();
            if (Notification?.permission === 'granted') {
              try {
                new Notification('Nuevo pedido pendiente', {
                  body: `Pedido #${payload.new?.id || ''} requiere atención.`,
                });
              } catch (e) {}
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (toastTimer) clearTimeout(toastTimer);
      clearInterval(countInterval);
      supabase.removeChannel(channel);
    };
  }, [user]);

  const toggleSound = () => {
    setIsSoundMuted(prev => {
      const next = !prev;
      localStorage.setItem('staff_order_sound_muted', String(next));
      return next;
    });
  };

  const getRoleIcon = () => {
    if (!user) return null;
    switch(user.role) {
      case 'Admin': return <ShieldCheck className="w-5 h-5 text-benmarket-100" />;
      case 'Cajero': return <Calculator className="w-5 h-5 text-benmarket-100" />;
      case 'Tesoreria': return <Wallet className="w-5 h-5 text-benmarket-100" />;
      default: return <UserCircle className="w-5 h-5 text-benmarket-100" />;
    }
  };

  return (
      <nav className="fixed top-0 w-full z-50 bg-[rgb(47,47,47)] backdrop-blur-xl border-b border-white/10 shadow-sm">
        {pendingToast && user && ['Admin', 'Cajero'].includes(user.role) && (
          <div className="bg-amber-500/15 border-b border-amber-500/25">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-100 text-sm font-semibold">
                <Bell className="w-4 h-4" />
                <span>
                  Nuevo pedido pendiente{pendingToast.id ? ` • #${pendingToast.id}` : ''}.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/dashboard?filter=Pendiente')}
                  className="text-xs font-bold bg-amber-400 text-amber-950 hover:bg-amber-300 px-3 py-1 rounded-lg transition-colors"
                >
                  Ver pedidos
                </button>
                <button
                  onClick={() => setPendingToast(null)}
                  className="p-1.5 text-amber-100/80 hover:text-amber-100 hover:bg-amber-500/20 rounded-lg transition-colors"
                  aria-label="Cerrar aviso"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 sm:h-28 items-center gap-2 sm:gap-6">
            <Link href="/" className="flex items-center group shrink-0">
                <img 
                  src="/logo.webp" 
                alt="Logo Benmarket" 
                className="h-12 sm:h-24 w-auto sm:w-[280px] object-contain object-left group-hover:scale-105 transition-transform"
              />
            </Link>

            {/* Buscador Integrado en el Header (Solo visible en Desktop) */}
            {(!user || user.role === 'Cliente') && (
              <div className="hidden md:flex flex-1 max-w-xl relative group mx-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors z-10">
                  <Search className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <input 
                  className="w-full bg-white border border-slate-200 py-2.5 pl-11 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 text-slate-800 shadow-sm text-base font-medium outline-none" 
                  placeholder="Buscar productos" 
                  type="text"
                  value={globalSearchQuery}
                  onChange={handleSearchChange}
                  aria-label="Buscar productos"
                />
              </div>
            )}
            
            {/* Iconos Desktop */}
            <div className="hidden md:flex items-center gap-6 shrink-0">
            {user && user.role === 'Cliente' ? (
              <>
                <Link href="/orders" className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all group text-white flex items-center justify-center" title="Mis pedidos">
                  <Package className="w-6 h-6 transition-transform group-hover:scale-110" />
                </Link>
                <Link href="/favorites" className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all group text-white flex items-center justify-center" title="Mis Favoritos">
                  <Heart className="w-6 h-6 transition-transform group-hover:scale-110" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center shadow-lg border-2 border-black">
                      {favoritesCount > 99 ? '99+' : favoritesCount}
                    </span>
                  )}
                </Link>
                <Link href="/cart" className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all group text-white flex items-center justify-center" title="Carrito">
                  <ShoppingCart className="w-6 h-6 transition-transform group-hover:scale-110" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-black">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </Link>

                <div className="flex items-center gap-5 border-l border-white/20 pl-6 ml-2">
                  <div className="flex items-center gap-3 bg-white/5 py-1.5 px-3 rounded-full border border-white/10">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-primary" />
                    ) : (
                      getRoleIcon()
                    )}
                    <div className="hidden sm:flex flex-col pr-2">
                      <span className="text-sm font-bold leading-tight text-white">{user.name}</span>
                      <span className="text-[10px] text-white/70 font-mono font-bold uppercase tracking-wider leading-none">{user.role}</span>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="p-2.5 hover:bg-error hover:text-white text-white/70 rounded-xl transition-colors group" title="Cerrar sesión">
                    <LogOut className="w-5 h-5 group-hover:text-white" />
                  </button>
                </div>
              </>
            ) : user ? (
              <div className="flex items-center gap-5 border-l border-white/20 pl-6 ml-2">
                <div className="flex items-center gap-3 bg-white/5 py-1.5 px-3 rounded-full border border-white/10">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-primary" />
                  ) : (
                    getRoleIcon()
                  )}
                  <div className="hidden sm:flex flex-col pr-2">
                    <span className="text-sm font-bold leading-tight text-white">{user.name}</span>
                    <span className="text-[10px] text-white/70 font-mono font-bold uppercase tracking-wider leading-none">{user.role}</span>
                  </div>
                </div>
                
                {user.role !== 'Cliente' && (
                  <div className="flex items-center gap-3">
                    {['Admin', 'Cajero'].includes(user.role) && (
                      <>
                        <button
                          onClick={toggleSound}
                          className={`p-2.5 rounded-xl transition-all group flex items-center justify-center ${
                            isSoundMuted ? 'text-white/60 hover:bg-white/10' : 'text-emerald-200 hover:bg-white/10'
                          }`}
                          title={isSoundMuted ? 'Activar sonido de pedidos' : 'Silenciar sonido de pedidos'}
                          aria-label={isSoundMuted ? 'Activar sonido de pedidos' : 'Silenciar sonido de pedidos'}
                        >
                          {isSoundMuted ? (
                            <VolumeX className="w-5 h-5 transition-transform group-hover:scale-110" />
                          ) : (
                            <Volume2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                          )}
                        </button>
                        <button
                          onClick={() => navigate('/dashboard?filter=Pendiente')}
                          className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all group text-white flex items-center justify-center"
                          title="Pedidos pendientes"
                          aria-label="Pedidos pendientes"
                        >
                          <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
                          {pendingOrdersCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 text-[10px] font-black rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center shadow-lg border-2 border-black">
                              {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                            </span>
                          )}
                        </button>
                      </>
                    )}
                    <Link href="/dashboard" className="text-sm font-semibold bg-primary text-white hover:bg-primary-container px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                      Dashboard
                    </Link>
                  </div>
                )}
                
                <button onClick={handleLogout} className="p-2.5 hover:bg-error hover:text-white text-white/70 rounded-xl transition-colors group" title="Cerrar sesión">
                  <LogOut className="w-5 h-5 group-hover:text-white" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-center p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all shadow-sm group"
                    aria-label="Menú de usuario"
                  >
                    <User className="w-6 h-6 transition-transform group-hover:scale-110" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link 
                        href="/login" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link 
                        href="/register" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                      >
                        Registrarme
                      </Link>
                    </div>
                  )}
                </div>

                <Link href="/favorites" className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all group text-white flex items-center justify-center" title="Mis Favoritos">
                  <Heart className="w-6 h-6 transition-transform group-hover:scale-110" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center shadow-lg border-2 border-black">
                      {favoritesCount > 99 ? '99+' : favoritesCount}
                    </span>
                  )}
                </Link>
                
                <Link href="/cart" className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all group text-white flex items-center justify-center" title="Carrito">
                  <ShoppingCart className="w-6 h-6 transition-transform group-hover:scale-110" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-black">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>

          {/* Botón de Menú Hamburguesa (Mobile) */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/cart" className="relative p-2 hover:bg-white/10 rounded-xl transition-all text-white flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-black">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
              aria-label={isMobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            >
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Menú Desplegable (Mobile) */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-in slide-in-from-top-4 fade-in duration-200">
            {(!user || user.role === 'Cliente') && (
              <div className="mb-4 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <input 
                  className="w-full bg-white border border-slate-200 py-3 pl-11 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 text-slate-800 shadow-sm text-base font-medium outline-none" 
                  placeholder="Buscar productos" 
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => {
                    handleSearchChange(e);
                  }}
                  aria-label="Buscar productos"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              {(!user || user.role === 'Cliente') && (
                <Link 
                  href="/favorites" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-white hover:bg-white/10 p-3 rounded-xl transition-colors font-medium"
                >
                  <Heart className="w-5 h-5" />
                  Mis Favoritos
                </Link>
              )}

              {user && user.role === 'Cliente' && (
                <Link
                  href="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-white hover:bg-white/10 p-3 rounded-xl transition-colors font-medium"
                >
                  <Package className="w-5 h-5" />
                  Mis Pedidos
                </Link>
              )}

              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 mb-2">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary" />
                    ) : (
                      getRoleIcon()
                    )}
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm leading-tight">{user.name}</span>
                      <span className="text-primary text-xs font-bold uppercase tracking-wider">{user.role}</span>
                    </div>
                  </div>
                  
                  {user.role !== 'Cliente' && (
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 bg-primary text-white p-3 rounded-xl font-bold hover:bg-primary-container transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}

                  {['Admin', 'Cajero'].includes(user.role) && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/dashboard?filter=Pendiente');
                      }}
                      className="flex items-center justify-between gap-3 text-white hover:bg-white/10 p-3 rounded-xl transition-colors font-bold"
                    >
                      <span className="flex items-center gap-3">
                        <Bell className="w-5 h-5" />
                        Pedidos pendientes
                      </span>
                      {pendingOrdersCount > 0 && (
                        <span className="bg-amber-400 text-amber-950 text-[10px] font-black rounded-full min-w-6 h-6 px-2 flex items-center justify-center">
                          {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                        </span>
                      )}
                    </button>
                  )}

                  {['Admin', 'Cajero'].includes(user.role) && (
                    <button
                      onClick={() => {
                        toggleSound();
                        ensureAudioUnlocked();
                      }}
                      className="flex items-center justify-between gap-3 text-white hover:bg-white/10 p-3 rounded-xl transition-colors font-bold"
                    >
                      <span className="flex items-center gap-3">
                        {isSoundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        Sonido de pedidos
                      </span>
                      <span className={`text-[10px] font-black rounded-full px-2 py-1 ${
                        isSoundMuted ? 'bg-slate-200 text-slate-800' : 'bg-emerald-400 text-emerald-950'
                      }`}>
                        {isSoundMuted ? 'OFF' : 'ON'}
                      </span>
                    </button>
                  )}
                  
                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                    className="flex items-center gap-3 text-error hover:bg-error/10 p-3 rounded-xl transition-colors font-bold mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex justify-center items-center bg-white/10 text-white p-3 rounded-xl font-bold hover:bg-white/20 transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex justify-center items-center bg-primary text-white p-3 rounded-xl font-bold hover:bg-primary-container transition-colors"
                  >
                    Registrarme
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
