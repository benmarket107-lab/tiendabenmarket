import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Users, ShoppingBag, DollarSign, TrendingUp, RefreshCw, 
  Flame, Award, Eye, X, MessageCircle, MapPin, Truck, Store, 
  Clock, CheckCircle, Package, AlertCircle, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '../utils/currency';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
  const { users: contextUsers, updatePedidoEstado } = useAppContext();
  const [pedidos, setPedidos] = useState([]);
  const [usersCount, setUsersCount] = useState(contextUsers?.length || 0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [topProductsTimeframe, setTopProductsTimeframe] = useState('all'); // 'today' | '7days' | 'month' | 'all'
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Carga inicial y refresco de datos
  const fetchDashboardData = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // 1. Pedidos (Últimos 300 para estadísticas precisas)
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);

      if (!pedidosError && pedidosData) {
        setPedidos(pedidosData);
      }

      // 2. Conteo de Productos Activos
      const { count: prodCount, error: countError } = await supabase
        .from('productos')
        .select('codigo_producto', { count: 'estimated', head: true })
        .gt('cantidad_disponible', 0);

      if (!countError) {
        setActiveProducts(Number(prodCount) || 0);
      }

      // 3. Productos con Bajo Stock (<= 5)
      const { data: lowStockData, error: lowStockError } = await supabase
        .from('productos')
        .select('codigo_producto,nombre,precio,cantidad_disponible,foto_url,unidad')
        .gt('cantidad_disponible', 0)
        .lte('cantidad_disponible', 5)
        .order('cantidad_disponible', { ascending: true })
        .limit(6);

      if (!lowStockError && lowStockData) {
        setLowStockProducts(
          lowStockData.map(p => ({
            id: p.codigo_producto,
            name: p.nombre,
            price: p.precio,
            stock: p.cantidad_disponible,
            image: p.foto_url || null,
            unit: p.unidad || '',
          }))
        );
      }

      // 4. Conteo de Usuarios
      const { count: uCount } = await supabase
        .from('usuarios')
        .select('id', { count: 'estimated', head: true });

      if (typeof uCount === 'number') {
        setUsersCount(uCount);
      }
    } catch (e) {
      console.error('Error fetching dashboard metrics:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Suscripción Realtime para actualizar pedidos instantáneamente
  useEffect(() => {
    fetchDashboardData();

    const channel = supabase
      .channel('realtime-admin-dashboard-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPedidos(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPedidos(prev => prev.map(p => (p.id === payload.new.id ? payload.new : p)));
            setSelectedPedido(curr => (curr && curr.id === payload.new.id ? payload.new : curr));
          } else if (payload.eventType === 'DELETE') {
            setPedidos(prev => prev.filter(p => p.id !== payload.old.id));
            setSelectedPedido(curr => (curr && curr.id === payload.old.id ? null : curr));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData]);

  // Manejo de cambio de estado de un pedido
  const handleStatusChange = async (pedidoId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: newStatus })
        .eq('id', pedidoId);

      if (error) throw error;

      setPedidos(prev => prev.map(p => (p.id === pedidoId ? { ...p, estado: newStatus } : p)));
      setSelectedPedido(curr => (curr && curr.id === pedidoId ? { ...curr, estado: newStatus } : curr));
      if (updatePedidoEstado) {
        updatePedidoEstado(pedidoId, newStatus);
      }
    } catch (err) {
      console.error('Error actualizando estado del pedido:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Cálculo de Métricas Globales
  const totalSales = useMemo(() => {
    return pedidos.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
  }, [pedidos]);

  const totalOrders = pedidos.length;

  const pendingOrdersCount = useMemo(() => {
    return pedidos.filter(p => p.estado === 'Pendiente').length;
  }, [pedidos]);

  const averageTicket = useMemo(() => {
    return totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  }, [totalSales, totalOrders]);

  // Cálculo del Ranking de Productos Más Vendidos
  const topSellingProducts = useMemo(() => {
    const now = new Date();
    const filteredPedidos = pedidos.filter(p => {
      if (!p.created_at) return true;
      const orderDate = new Date(p.created_at);

      if (topProductsTimeframe === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (topProductsTimeframe === '7days') {
        const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      if (topProductsTimeframe === 'month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true; // 'all'
    });

    const productMap = new Map();

    for (const pedido of filteredPedidos) {
      const items = Array.isArray(pedido.items) ? pedido.items : [];
      for (const item of items) {
        const key = item.id || item.name;
        if (!key) continue;

        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const revenue = price * qty;

        if (productMap.has(key)) {
          const existing = productMap.get(key);
          existing.quantitySold += qty;
          existing.revenue += revenue;
        } else {
          productMap.set(key, {
            id: item.id || key,
            name: item.name || 'Producto sin nombre',
            image: item.image || null,
            unitPrice: price,
            quantitySold: qty,
            revenue: revenue,
          });
        }
      }
    }

    const sorted = Array.from(productMap.values()).sort((a, b) => b.quantitySold - a.quantitySold);
    const maxSold = sorted.length > 0 ? sorted[0].quantitySold : 1;

    return sorted.slice(0, 8).map(p => ({
      ...p,
      percentage: Math.round((p.quantitySold / maxSold) * 100),
    }));
  }, [pedidos, topProductsTimeframe]);

  const statCards = [
    { 
      title: 'Ventas Totales', 
      value: formatCurrency(totalSales), 
      subtitle: `${totalOrders} pedidos registrados`,
      icon: DollarSign, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 border-emerald-200' 
    },
    { 
      title: 'Pedidos Pendientes', 
      value: pendingOrdersCount, 
      subtitle: pendingOrdersCount > 0 ? '⚠️ Requieren atención' : 'Todo al día',
      icon: Clock, 
      color: pendingOrdersCount > 0 ? 'text-amber-600' : 'text-slate-600', 
      bg: pendingOrdersCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200' 
    },
    { 
      title: 'Ticket Promedio', 
      value: formatCurrency(averageTicket), 
      subtitle: 'Promedio por pedido',
      icon: TrendingUp, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 border-blue-200' 
    },
    { 
      title: 'Productos Activos', 
      value: activeProducts, 
      subtitle: `${lowStockProducts.length} con bajo stock`,
      icon: ShoppingBag, 
      color: 'text-primary', 
      bg: 'bg-red-50 border-red-200' 
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Encabezado y Acción de Refresco */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-headline">Dashboard Global</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Métricas en tiempo real, análisis de productos más vendidos y gestión de pedidos.
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar Datos'}
        </button>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            className={`p-6 rounded-3xl bg-white border ${stat.bg} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.title}</span>
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-headline tracking-tight">{stat.value}</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN 1: PRODUCTOS MÁS VENDIDOS (RANKING) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-headline">Top Productos Más Vendidos</h2>
              <p className="text-xs font-medium text-slate-500">Descubre qué artículos tienen mayor demanda</p>
            </div>
          </div>

          {/* Filtro de Tiempo para el Ranking */}
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 self-stretch sm:self-auto overflow-x-auto">
            {[
              { id: 'today', label: 'Hoy' },
              { id: '7days', label: '7 Días' },
              { id: 'month', label: 'Este Mes' },
              { id: 'all', label: 'Histórico' },
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => setTopProductsTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  topProductsTimeframe === tf.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {topSellingProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-sm">No hay ventas registradas en este periodo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topSellingProducts.map((prod, index) => (
              <div 
                key={prod.id} 
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <span className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${
                    index === 0 ? 'bg-amber-400 text-amber-950' : index === 1 ? 'bg-slate-300 text-slate-800' : index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    #{index + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{prod.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-bold text-primary">{prod.quantitySold} unidades</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(prod.revenue)}</span>
                  </div>
                  {/* Barra de progreso de ventas */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${prod.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: ÚLTIMAS VENTAS Y BAJO STOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Tarjeta de Últimas Ventas con Click para ver detalles */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-headline">Últimas Ventas Realizadas</h2>
              <p className="text-xs text-slate-500">Haz clic en un pedido para ver el detalle de productos</p>
            </div>
            <Link 
              href="/dashboard?filter=Todos" 
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {pedidos.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No hay pedidos registrados aún.</div>
            ) : (
              pedidos.slice(0, 6).map(pedido => {
                const itemsCount = Array.isArray(pedido.items) 
                  ? pedido.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
                  : 0;

                const statusStyles = {
                  Pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
                  Preparando: 'bg-blue-100 text-blue-800 border-blue-200',
                  Enviado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                };

                return (
                  <div 
                    key={pedido.id} 
                    onClick={() => setSelectedPedido(pedido)}
                    className="flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer group shadow-none hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-primary flex items-center justify-center font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm">Pedido #{pedido.id.slice(0, 8)}</p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${statusStyles[pedido.estado] || 'bg-slate-100 text-slate-600'}`}>
                            {pedido.estado || 'Pendiente'}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                          {pedido.cliente_nombre} • {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <span className="font-black text-base text-slate-900 block">{formatCurrency(pedido.total)}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{new Date(pedido.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tarjeta de Productos con Bajo Stock */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-headline">Alertas de Bajo Stock</h2>
              <p className="text-xs text-slate-500">Productos que necesitan reposición pronto</p>
            </div>
            <Link href="/dashboard/products" className="text-xs font-bold text-primary hover:underline">
              Gestionar Stock
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                <CheckCircle className="w-10 h-10 text-emerald-500 mb-2 opacity-80" />
                <p className="font-semibold text-sm text-slate-700">¡Excelente!</p>
                <p className="text-xs text-slate-400">Todos los productos cuentan con suficiente inventario.</p>
              </div>
            ) : (
              lowStockProducts.map(product => (
                <div 
                  key={product.id} 
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{product.name}</p>
                      <p className="text-xs font-medium text-slate-400">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${
                    product.stock === 0 ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}>
                    {product.stock === 0 ? 'Agotado' : `${product.stock} disponibles`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MODAL DETALLE EXACTO DEL PEDIDO SELECCIONADO */}
      {selectedPedido && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedPedido(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100"
            onClick={e => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black text-slate-900 font-headline">
                    Pedido #{selectedPedido.id.slice(0, 8)}
                  </h3>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${
                    selectedPedido.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800' :
                    selectedPedido.estado === 'Preparando' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedPedido.estado}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Registrado el {new Date(selectedPedido.created_at).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedPedido(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Datos del Cliente y Envío */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-2 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Información del Cliente</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 font-medium">Cliente:</span>{' '}
                  <span className="font-bold text-slate-900">{selectedPedido.cliente_nombre}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Teléfono:</span>{' '}
                  <a 
                    href={`https://wa.me/${String(selectedPedido.cliente_telefono).replace(/\D/g, '')}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {selectedPedido.cliente_telefono}
                  </a>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-medium">Dirección:</span>{' '}
                  <span className="font-bold text-slate-900">{selectedPedido.cliente_direccion}</span>
                  {selectedPedido.cliente_barrio && <span className="text-slate-500"> ({selectedPedido.cliente_barrio})</span>}
                </div>
                {selectedPedido.cliente_google_maps && (
                  <div className="sm:col-span-2">
                    <a 
                      href={selectedPedido.cliente_google_maps} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Ver ubicación exacta en Google Maps
                    </a>
                  </div>
                )}
                {selectedPedido.cliente_nota && (
                  <div className="sm:col-span-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                    <span className="font-bold">Nota del cliente:</span> {selectedPedido.cliente_nota}
                  </div>
                )}
              </div>
            </div>

            {/* LISTA EXACTA DE PRODUCTOS VENDIDOS */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Productos Comprados ({Array.isArray(selectedPedido.items) ? selectedPedido.items.length : 0})
              </h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {Array.isArray(selectedPedido.items) && selectedPedido.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{formatCurrency(item.price)} x {item.quantity} un.</p>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 text-sm pl-2">
                      {formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen Financiero */}
            <div className="border-t border-slate-100 pt-4 space-y-2 mb-6 text-sm">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedPedido.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Delivery</span>
                <span>{formatCurrency(selectedPedido.delivery)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-100 pt-2">
                <span>Total Cobrado</span>
                <span className="text-xl text-primary">{formatCurrency(selectedPedido.total)}</span>
              </div>
            </div>

            {/* Acciones de Estado Rápidas */}
            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cambiar Estado:</span>
              <div className="flex gap-2 w-full sm:w-auto">
                {['Pendiente', 'Preparando', 'Enviado'].map(estado => (
                  <button
                    key={estado}
                    disabled={isUpdatingStatus || selectedPedido.estado === estado}
                    onClick={() => handleStatusChange(selectedPedido.id, estado)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedPedido.estado === estado
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    } disabled:opacity-50`}
                  >
                    {estado}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
