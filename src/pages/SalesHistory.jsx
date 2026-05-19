import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { formatCurrency } from '../utils/currency';
import { 
  Package, Clock, Truck, Play, Check, ExternalLink, 
  MessageCircle, Search, Bell, Volume2, VolumeX, Eye, X, MapPin
} from 'lucide-react';

export default function SalesHistory() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos'); // 'Todos' | 'Pendiente' | 'Preparando' | 'Enviado'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('cashier_sound_muted') === 'true';
  });

  // Sound Notification Function using Web Audio API
  const playAlert = () => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Ring sound
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(293.66, audioCtx.currentTime); // D4
      osc2.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15); // A4

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.45);
      osc2.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  };

  // Fetch initial orders
  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setPedidos(data);
      } else if (error) {
        console.error('Error fetching orders:', error);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('realtime-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPedidos(prev => [payload.new, ...prev]);
          if (payload.new.estado === 'Pendiente') {
            playAlert();
          }
        } else if (payload.eventType === 'UPDATE') {
          setPedidos(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
          // Update selected modal details if open
          setSelectedPedido(current => current && current.id === payload.new.id ? payload.new : current);
        } else if (payload.eventType === 'DELETE') {
          setPedidos(prev => prev.filter(p => p.id !== payload.old.id));
          setSelectedPedido(current => current && current.id === payload.old.id ? null : current);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem('cashier_sound_muted', String(newValue));
      return newValue;
    });
  };

  const handleStatusChange = async (id, nuevoEstado, pedidoInfo) => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', id)
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setPedidos(prev => prev.map(p => p.id === id ? data[0] : p));
        
        // If transitioning to "Enviado", trigger WhatsApp notification to the customer
        if (nuevoEstado === 'Enviado') {
          sendCustomerWhatsAppNotification(pedidoInfo || data[0]);
        }
      }
    } catch (e) {
      console.error("Error updating status:", e);
      alert("No se pudo actualizar el estado del pedido.");
    }
  };

  const formatPhoneForWhatsApp = (phone) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('595')) {
      return clean;
    }
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }
    return '595' + clean;
  };

  const sendCustomerWhatsAppNotification = (pedido) => {
    const message = `¡Hola ${pedido.cliente_nombre}! Tu pedido de BenMarket ya está en camino. 🚴💨\n¡Muchas gracias por tu compra!`;
    const encoded = encodeURIComponent(message);
    const cleanPhone = formatPhoneForWhatsApp(pedido.cliente_telefono);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Filtering & Searching logic
  const filteredPedidos = pedidos.filter(pedido => {
    const matchesFilter = filter === 'Todos' || pedido.estado === filter;
    const matchesSearch = 
      pedido.cliente_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pedido.cliente_telefono.includes(searchQuery) ||
      (pedido.cliente_barrio && pedido.cliente_barrio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pedido.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Helper counts
  const countByStatus = (status) => pedidos.filter(p => p.estado === status).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Historial de Ventas Web</h1>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Tiempo Real</span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Monitorea, prepara y despacha los pedidos recibidos en línea.</p>
        </div>

        {/* Audio Mute Button */}
        <button
          onClick={toggleMute}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
            isMuted 
              ? 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600' 
              : 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10'
          }`}
          title={isMuted ? "Desbloquear alertas sonoras" : "Silenciar alertas sonoras"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isMuted ? "Alertas Silenciadas" : "Alertas Activas"}</span>
        </button>
      </div>

      {/* Navigation tabs + Search */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200/85 shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {['Todos', 'Pendiente', 'Preparando', 'Enviado'].map(status => {
            const isActive = filter === status;
            const count = status === 'Todos' ? pedidos.length : countByStatus(status);
            
            // Badge color classes
            const badgeColors = {
              Todos: 'bg-slate-100 text-slate-700',
              Pendiente: 'bg-amber-100 text-amber-800',
              Preparando: 'bg-blue-100 text-blue-800',
              Enviado: 'bg-emerald-100 text-emerald-800'
            };

            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isActive 
                    ? 'bg-primary text-on-primary shadow-md' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{status === 'Todos' ? 'Todos los Pedidos' : status}</span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : badgeColors[status]}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex-grow lg:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, tel o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main Table card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></span>
            Cargando pedidos...
          </div>
        ) : filteredPedidos.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">No se encontraron pedidos</p>
            <p className="text-sm text-slate-400 mt-1">No hay registros que coincidan con la búsqueda o el filtro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-4 pl-6">ID Pedido</th>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Dirección</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 pr-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPedidos.map(pedido => {
                  
                  // Row styling if Pending
                  const isPending = pedido.estado === 'Pendiente';
                  
                  return (
                    <tr 
                      key={pedido.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isPending ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="p-4 pl-6 font-mono text-[11px] font-semibold text-slate-900">
                        #{pedido.id.substring(0, 8)}...
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(pedido.created_at).toLocaleString('es-PY', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{pedido.cliente_nombre}</div>
                        <div className="text-xs text-slate-500">{pedido.cliente_telefono}</div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-xs text-slate-500" title={`${pedido.cliente_direccion}, Barrio: ${pedido.cliente_barrio || 'N/A'}`}>
                        {pedido.cliente_direccion}
                        {pedido.cliente_barrio && <span className="block text-[10px] text-slate-400 font-semibold">Barrio: {pedido.cliente_barrio}</span>}
                      </td>
                      <td className="p-4 text-right font-black text-slate-900">
                        {formatCurrency(Number(pedido.total))}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          pedido.estado === 'Pendiente' 
                            ? 'bg-amber-100 text-amber-800'
                            : pedido.estado === 'Preparando'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            pedido.estado === 'Pendiente'
                              ? 'bg-amber-500 animate-pulse'
                              : pedido.estado === 'Preparando'
                              ? 'bg-blue-500'
                              : 'bg-emerald-500'
                          }`}></span>
                          {pedido.estado}
                        </span>
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          {/* Detalle */}
                          <button
                            onClick={() => setSelectedPedido(pedido)}
                            className="bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 p-2 rounded-xl transition-all"
                            title="Ver Detalle del Pedido"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Flujo de Cambios de Estado */}
                          {pedido.estado === 'Pendiente' && (
                            <button
                              onClick={() => handleStatusChange(pedido.id, 'Preparando', pedido)}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1 shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" /> Preparar
                            </button>
                          )}

                          {pedido.estado === 'Preparando' && (
                            <button
                              onClick={() => handleStatusChange(pedido.id, 'Enviado', pedido)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1 shadow-sm shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                              <Truck className="w-3.5 h-3.5" /> Enviar
                            </button>
                          )}

                          {pedido.estado === 'Enviado' && (
                            <button
                              onClick={() => sendCustomerWhatsAppNotification(pedido)}
                              className="bg-white border border-[#25D366]/30 text-[#128C7E] hover:bg-[#25D366]/5 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1 transition-all"
                              title="Reenviar Notificación de WhatsApp al Cliente"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> Mensaje
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPedido && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-headline font-bold text-lg text-slate-900">Detalle del Pedido</h3>
                <span className="font-mono text-xs text-slate-400 block mt-0.5">ID: {selectedPedido.id}</span>
              </div>
              <button
                onClick={() => setSelectedPedido(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Cliente & Entrega Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Datos del Cliente</span>
                  <p className="font-bold text-slate-900">{selectedPedido.cliente_nombre}</p>
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    {selectedPedido.cliente_telefono}
                  </p>
                  {selectedPedido.cliente_nota && (
                    <div className="mt-3 text-xs bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-100">
                      <span className="font-bold block">Nota del cliente:</span>
                      {selectedPedido.cliente_nota}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Información de Entrega</span>
                    <p className="text-sm font-semibold text-slate-800 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        {selectedPedido.cliente_direccion}
                        {selectedPedido.cliente_barrio && <span className="block text-xs font-normal text-slate-500">Barrio: {selectedPedido.cliente_barrio}</span>}
                      </span>
                    </p>
                  </div>
                  {selectedPedido.cliente_google_maps && (
                    <a
                      href={selectedPedido.cliente_google_maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs py-2 px-3 rounded-xl transition-all border border-blue-100"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Ver en Google Maps
                    </a>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">Artículos del Pedido</span>
                <div className="space-y-3">
                  {selectedPedido.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center bg-white">
                        <img 
                          src={item.image || 'https://placehold.co/100x100/f8fafc/94a3b8?text=Sin+Imagen'} 
                          alt={item.name}
                          className="w-full h-full object-contain p-1 mix-blend-multiply"
                        />
                      </div>

                      {/* Name / Price / Code */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                        <span className="font-mono text-[10px] text-slate-400 block mt-0.5">Cód: {item.id}</span>
                        <div className="text-xs text-slate-500 mt-1 flex justify-between items-center">
                          <span>{formatCurrency(Number(item.price))} x {item.quantity}</span>
                          <span className="font-bold text-slate-800">{formatCurrency(Number(item.price) * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(Number(selectedPedido.subtotal))}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Costo de Delivery</span>
                  <span>{formatCurrency(Number(selectedPedido.delivery))}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-950 pt-2 border-t border-slate-200">
                  <span>Total Pedido</span>
                  <span className="text-lg font-black text-benmarket-600">{formatCurrency(Number(selectedPedido.total))}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              {/* Acciones Rápidas */}
              {selectedPedido.estado === 'Pendiente' && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedPedido.id, 'Preparando', selectedPedido);
                    setSelectedPedido(null);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" /> Iniciar Preparación
                </button>
              )}

              {selectedPedido.estado === 'Preparando' && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedPedido.id, 'Enviado', selectedPedido);
                    setSelectedPedido(null);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10 active:scale-95 transition-all"
                >
                  <Truck className="w-4 h-4" /> Despachar / Enviar pedido
                </button>
              )}

              <button
                onClick={() => setSelectedPedido(null)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm py-2.5 px-4 rounded-xl transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}