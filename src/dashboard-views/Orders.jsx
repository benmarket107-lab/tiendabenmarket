import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { Package, Truck, Store, ChevronDown, ChevronUp, Clock, SearchX, Trash2 } from 'lucide-react';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const toggleExpanded = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/orders', { replace: true });
      return;
    }

    let cancelled = false;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .eq('user_id', user.id)
          .or('oculto_por_cliente.eq.false,oculto_por_cliente.is.null')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        if (!cancelled) setOrders(data || []);
      } catch (e) {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();

    const channel = supabase
      .channel(`realtime-user-pedidos-${user.id}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'pedidos', 
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          const row = payload.new || payload.old;
          if (!row) return;

          if (payload.eventType === 'INSERT') {
            if (!payload.new.oculto_por_cliente) {
              setOrders(prev => [payload.new, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.oculto_por_cliente) {
              // Si lo acaban de ocultar, lo removemos de la lista
              setOrders(prev => prev.filter(p => p.id !== payload.new.id));
            } else {
              setOrders(prev => prev.map(p => (p.id === payload.new.id ? payload.new : p)));
            }
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(p => p.id !== payload.old.id));
            setExpandedIds(prev => {
              const next = new Set(prev);
              next.delete(payload.old.id);
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const statusMeta = useMemo(() => {
    return {
      Pendiente: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-800' },
      Preparando: { label: 'Preparando', cls: 'bg-blue-100 text-blue-800' },
      Enviado: { label: 'Enviado', cls: 'bg-emerald-100 text-emerald-800' }
    };
  }, []);

  const formatStatusLabel = (pedido) => {
    if (pedido.estado !== 'Enviado') return statusMeta[pedido.estado]?.label || pedido.estado;
    if (pedido.cliente_direccion === 'Retiro en Tienda') return 'Listo para retiro';
    return 'Enviado';
  };

  const statusClassName = (pedido) => {
    const base = statusMeta[pedido.estado]?.cls || 'bg-slate-100 text-slate-700';
    return `inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black ${base}`;
  };

  const handleHideOrder = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de que quieres eliminar este pedido de tu historial?')) return;
    
    // Optimizacion optimista: lo ocultamos del UI de inmediato
    setOrders(prev => prev.filter(p => p.id !== id));
    
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ oculto_por_cliente: true })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error al ocultar pedido:', err);
      alert(`Hubo un error al eliminar el pedido del historial: ${err.message || err.details || 'Error desconocido'}`);
      // Revertimos el estado optimista si falla
      setOrders(prev => [...prev]); // trigger re-render
    }
  };

  if (!user) return null;

  return (
    <div className="w-full bg-surface min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mb-20 md:mb-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-3xl sm:text-5xl font-black text-on-surface tracking-tight">Mis Pedidos</h1>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Tiempo Real</span>
            </div>
            <p className="text-on-surface-variant text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Seguí el estado de tu compra desde que la recibimos hasta que esté lista para entrega o retiro.
            </p>
          </div>
          <Link to="/" className="hidden sm:inline-flex bg-primary text-on-primary px-5 py-3 rounded-xl font-bold hover:bg-primary-container transition-colors">
            Seguir comprando
          </Link>
        </div>

        {loading ? (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm p-10 flex items-center justify-center gap-3 text-on-surface-variant font-bold">
            <span className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></span>
            Cargando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary mb-4">
              <SearchX className="w-8 h-8" />
            </div>
            <p className="font-headline text-xl font-black text-on-surface">Todavía no tenés pedidos</p>
            <p className="text-on-surface-variant text-sm mt-2 max-w-md mx-auto">
              Cuando realices una compra, vas a poder ver el estado acá.
            </p>
            <Link to="/" className="inline-flex mt-6 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary-container transition-colors">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((pedido) => {
              const isExpanded = expandedIds.has(pedido.id);
              const created = pedido.created_at ? new Date(pedido.created_at) : null;
              const createdLabel = created ? created.toLocaleString() : '-';
              const items = Array.isArray(pedido.items) ? pedido.items : [];
              const isPickup = pedido.cliente_direccion === 'Retiro en Tienda';

              return (
                <div key={pedido.id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleExpanded(pedido.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        <span className="font-mono text-[11px] font-black text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-lg">
                          #{String(pedido.id).slice(0, 8)}
                        </span>
                        <span className={statusClassName(pedido)}>
                          {pedido.estado === 'Enviado' ? (isPickup ? <Store className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />) : <Clock className="w-3.5 h-3.5" />}
                          {formatStatusLabel(pedido)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-on-surface-variant font-medium">
                        <span className="inline-flex items-center gap-2">
                          <Package className="w-4 h-4 text-primary" />
                          {items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)} artículos
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          {createdLabel}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total</div>
                        <div className="text-lg sm:text-xl font-black text-on-surface">{formatCurrency(Number(pedido.total) || 0)}</div>
                      </div>
                      <div className="text-on-surface-variant">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                          <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Entrega</div>
                          <div className="text-sm font-bold text-on-surface">
                            {isPickup ? 'Retiro en tienda' : 'Delivery'}
                          </div>
                          <div className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                            {pedido.cliente_direccion}
                            {pedido.cliente_barrio ? <span className="block">Barrio: {pedido.cliente_barrio}</span> : null}
                          </div>
                          {pedido.cliente_google_maps ? (
                            <a
                              href={pedido.cliente_google_maps}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex mt-3 text-sm font-bold text-primary hover:underline"
                            >
                              Ver ubicación en Google Maps
                            </a>
                          ) : null}
                        </div>

                        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                          <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Resumen</div>
                          <div className="flex justify-between text-sm text-on-surface-variant font-medium">
                            <span>Subtotal</span>
                            <span>{formatCurrency(Number(pedido.subtotal) || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-on-surface-variant font-medium mt-1">
                            <span>Delivery</span>
                            <span>{formatCurrency(Number(pedido.delivery) || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-black text-on-surface mt-3 pt-3 border-t border-outline-variant/30">
                            <span>Total</span>
                            <span>{formatCurrency(Number(pedido.total) || 0)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                        <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Productos</div>
                        <div className="space-y-3">
                          {items.map((it) => (
                            <div key={`${pedido.id}-${it.id}`} className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-bold text-on-surface text-sm line-clamp-1">{it.name}</div>
                                <div className="text-xs text-on-surface-variant font-medium">
                                  {Number(it.quantity) || 0} × {formatCurrency(Number(it.price) || 0)}
                                </div>
                              </div>
                              <div className="font-black text-on-surface text-sm shrink-0">
                                {formatCurrency((Number(it.price) || 0) * (Number(it.quantity) || 0))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {pedido.estado === 'Enviado' && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={(e) => handleHideOrder(e, pedido.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar del historial
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="sm:hidden mt-8">
          <Link to="/" className="w-full inline-flex justify-center bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary-container transition-colors">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}

