'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { formatCurrency } from '../utils/currency';
import {
  cleanPhoneForWhatsApp,
  formatDisplayPhone,
  generatePersonalizedMessage,
  DEFAULT_PROMO_TEMPLATES,
  fetchConsolidatedClients,
  saveClientRecord,
  deleteClientRecord,
  exportClientsToCSV,
} from '../utils/clientsHelper';
import {
  Users, Search, X, MessageCircle, Mail, Phone, Copy, Check,
  Send, Sparkles, Download, Plus, Edit, Trash2, RefreshCw,
  ExternalLink, Filter, CheckCircle2, ChevronDown, ChevronUp,
  Tag, ShoppingBag, Clock, HelpCircle, AlertCircle
} from 'lucide-react';

export default function ClientesModal({ isOpen, onClose }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos'); // 'todos' | 'whatsapp' | 'email' | 'frecuentes'
  const [sortBy, setSortBy] = useState('pedidos'); // 'pedidos' | 'recientes' | 'nombre'

  // Mensaje promocional activo y plantillas
  const [promoMessage, setPromoMessage] = useState(DEFAULT_PROMO_TEMPLATES[0].text);
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_PROMO_TEMPLATES[0].id);
  const [isPromoEditorExpanded, setIsPromoEditorExpanded] = useState(true);

  // Estados de notificación y copiado
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Selección múltiple
  const [selectedClientIds, setSelectedClientIds] = useState(new Set());

  // Sub-modal para Agregar / Editar Cliente
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSavingClient, setIsSavingClient] = useState(false);

  // Carga de datos de clientes
  const loadClients = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await fetchConsolidatedClients(supabase);
      setClients(data);
    } catch (err) {
      console.error('Error cargando clientes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadClients();
      // Bloquear scroll de fondo
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSelectedClientIds(new Set());
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, loadClients]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isEditModalOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEditModalOpen, onClose]);

  // Mostrar mensaje de feedback temporal
  const showToast = (msg, duration = 3000) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  };

  // Copiar texto genérico al portapapeles
  const handleCopy = (text, id, feedbackText = 'Copiado al portapapeles') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(feedbackText);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Estadísticas globales de clientes
  const stats = useMemo(() => {
    const total = clients.length;
    const withWhatsApp = clients.filter(c => Boolean(c.whatsapp || c.telefono)).length;
    const withEmail = clients.filter(c => Boolean(c.email && c.email.includes('@'))).length;
    const frecuentes = clients.filter(c => (c.pedidosCount || 0) >= 2 || (c.totalGastado || 0) >= 100000).length;
    return { total, withWhatsApp, withEmail, frecuentes };
  }, [clients]);

  // Filtrado y ordenamiento
  const filteredClients = useMemo(() => {
    return clients
      .filter(client => {
        // Filtro por pestañas
        if (activeFilter === 'whatsapp' && !(client.whatsapp || client.telefono)) return false;
        if (activeFilter === 'email' && !(client.email && client.email.includes('@'))) return false;
        if (activeFilter === 'frecuentes' && !((client.pedidosCount || 0) >= 2 || (client.totalGastado || 0) >= 100000)) return false;

        // Búsqueda de texto
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const matchName = client.nombre?.toLowerCase().includes(q);
        const matchPhone = (client.telefono || client.whatsapp || '').includes(q);
        const matchEmail = client.email?.toLowerCase().includes(q);
        const matchNotes = client.notas?.toLowerCase().includes(q);
        const matchOrigin = client.origen?.toLowerCase().includes(q);

        return matchName || matchPhone || matchEmail || matchNotes || matchOrigin;
      })
      .sort((a, b) => {
        if (sortBy === 'pedidos') {
          return (b.pedidosCount || 0) - (a.pedidosCount || 0);
        }
        if (sortBy === 'recientes') {
          const dateA = a.ultimoPedido || a.createdAt || 0;
          const dateB = b.ultimoPedido || b.createdAt || 0;
          return new Date(dateB) - new Date(dateA);
        }
        if (sortBy === 'nombre') {
          return (a.nombre || '').localeCompare(b.nombre || '');
        }
        return 0;
      });
  }, [clients, activeFilter, searchQuery, sortBy]);

  // Selección múltiple
  const handleToggleSelectAll = () => {
    if (selectedClientIds.size === filteredClients.length) {
      setSelectedClientIds(new Set());
    } else {
      setSelectedClientIds(new Set(filteredClients.map(c => c.id)));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedClientIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Enviar mensaje promocional individual por WhatsApp
  const handleSendWhatsAppPromo = (client) => {
    const rawPhone = client.whatsapp || client.telefono;
    if (!rawPhone) {
      alert('Este cliente no posee número de teléfono registrado.');
      return;
    }
    const cleanPhone = cleanPhoneForWhatsApp(rawPhone);
    const personalizedText = generatePersonalizedMessage(promoMessage, client);
    const encoded = encodeURIComponent(personalizedText);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Enviar email individual
  const handleSendEmailPromo = (client) => {
    if (!client.email) {
      alert('Este cliente no posee correo electrónico registrado.');
      return;
    }
    const personalizedText = generatePersonalizedMessage(promoMessage, client);
    const subject = encodeURIComponent('Promociones y Novedades Especiales - BenMarket');
    const body = encodeURIComponent(personalizedText);
    window.open(`mailto:${client.email}?subject=${subject}&body=${body}`, '_blank');
  };

  // Acciones en lote: Copiar todos los correos para Newsletter BCC
  const handleCopyAllEmails = (onlySelected = false) => {
    const pool = onlySelected
      ? clients.filter(c => selectedClientIds.has(c.id))
      : filteredClients;

    const emails = pool
      .map(c => c.email?.trim())
      .filter(e => e && e.includes('@'));

    const uniqueEmails = Array.from(new Set(emails));

    if (uniqueEmails.length === 0) {
      alert('No se encontraron correos electrónicos válidos en la lista.');
      return;
    }

    const emailString = uniqueEmails.join(', ');
    handleCopy(emailString, 'batch_emails', `¡${uniqueEmails.length} correos copiados! Pegalos en CCO (BCC) en tu correo.`);
  };

  // Acciones en lote: Copiar todos los teléfonos para lista de difusión WhatsApp
  const handleCopyAllPhones = (onlySelected = false) => {
    const pool = onlySelected
      ? clients.filter(c => selectedClientIds.has(c.id))
      : filteredClients;

    const phones = pool
      .map(c => cleanPhoneForWhatsApp(c.whatsapp || c.telefono))
      .filter(Boolean);

    const uniquePhones = Array.from(new Set(phones));

    if (uniquePhones.length === 0) {
      alert('No se encontraron números de teléfono válidos en la lista.');
      return;
    }

    const phoneString = uniquePhones.join(', ');
    handleCopy(phoneString, 'batch_phones', `¡${uniquePhones.length} teléfonos copiados para difusión WhatsApp!`);
  };

  // Iniciar cliente de correo masivo con CCO
  const handleOpenBulkEmailClient = () => {
    const emails = filteredClients
      .map(c => c.email?.trim())
      .filter(e => e && e.includes('@'));
    const uniqueEmails = Array.from(new Set(emails));

    if (uniqueEmails.length === 0) {
      alert('No hay correos en la selección para enviar.');
      return;
    }

    const sampleText = generatePersonalizedMessage(promoMessage, { nombre: 'Estimado Cliente' });
    const bcc = encodeURIComponent(uniqueEmails.join(','));
    const subject = encodeURIComponent('Novedades y Ofertas Especiales - BenMarket');
    const body = encodeURIComponent(sampleText);
    window.open(`mailto:?bcc=${bcc}&subject=${subject}&body=${body}`, '_blank');
  };

  // Guardar nuevo o editar cliente
  const handleOpenEditModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormName(client.nombre || '');
      setFormPhone(client.telefono || client.whatsapp || '');
      setFormEmail(client.email || '');
      setFormNotes(client.notas || '');
    } else {
      setEditingClient(null);
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormNotes('');
    }
    setIsEditModalOpen(true);
  };

  const handleSaveClientSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Por favor ingrese el nombre del cliente.');
      return;
    }

    setIsSavingClient(true);
    try {
      await saveClientRecord(supabase, {
        id: editingClient?.id,
        nombre: formName,
        telefono: formPhone,
        email: formEmail,
        notas: formNotes,
        origen: editingClient?.origen || 'Manual / Caja',
        pedidosCount: editingClient?.pedidosCount || 0,
        totalGastado: editingClient?.totalGastado || 0,
      });

      showToast(editingClient ? 'Cliente actualizado exitosamente' : 'Nuevo cliente registrado exitosamente');
      setIsEditModalOpen(false);
      await loadClients(true);
    } catch (err) {
      alert('Error guardando cliente: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsSavingClient(false);
    }
  };

  const handleDeleteClient = async (client) => {
    if (window.confirm(`¿Estás seguro de eliminar el registro de "${client.nombre}"?`)) {
      try {
        await deleteClientRecord(supabase, client.id);
        showToast('Cliente eliminado');
        await loadClients(true);
      } catch (err) {
        alert('Error al eliminar cliente: ' + err.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Toast flotante de confirmación */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[60] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Tarjeta Contenedora Principal */}
      <div className="bg-white w-full max-w-6xl max-h-[94vh] rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* ENCABEZADO DEL MODAL */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-headline tracking-tight">
                  Clientes & Promociones
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Marketing & Difusión
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Base consolidada de clientes para difusiones directas de WhatsApp y envíos masivos de Newsletter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => loadClients(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors disabled:opacity-50"
              title="Refrescar lista"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => exportClientsToCSV(filteredClients)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-colors"
              title="Exportar base de clientes a archivo CSV / Excel"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition-colors"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BARRA DE MÉTRICAS RÁPIDAS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50/80 border-b border-slate-200 divide-x divide-slate-200/60 text-xs">
          <div className="p-3 sm:px-6 py-2.5 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Total Clientes:</span>
            <span className="font-extrabold text-slate-900 text-sm">{stats.total}</span>
          </div>
          <div className="p-3 sm:px-6 py-2.5 flex items-center justify-between">
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Con WhatsApp:
            </span>
            <span className="font-extrabold text-emerald-700 text-sm">{stats.withWhatsApp}</span>
          </div>
          <div className="p-3 sm:px-6 py-2.5 flex items-center justify-between">
            <span className="text-blue-700 font-medium flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Con Email:
            </span>
            <span className="font-extrabold text-blue-700 text-sm">{stats.withEmail}</span>
          </div>
          <div className="p-3 sm:px-6 py-2.5 flex items-center justify-between">
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" /> Compradores:
            </span>
            <span className="font-extrabold text-amber-700 text-sm">{stats.frecuentes}</span>
          </div>
        </div>

        {/* CUERPO DEL MODAL (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/40">

          {/* SECCIÓN 1: CENTRO DE PROMOCIÓN / NEWSLETTER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div 
              className="p-4 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white flex items-center justify-between cursor-pointer border-b border-slate-100"
              onClick={() => setIsPromoEditorExpanded(!isPromoEditorExpanded)}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Editor de Campaña / Promoción Actual
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      Personalizable con 1 Click
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Este texto se enviará personalizado con el nombre del cliente al presionar el botón de WhatsApp o Email.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                  {isPromoEditorExpanded ? 'Ocultar editor' : 'Editar mensaje'}
                </span>
                {isPromoEditorExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>

            {isPromoEditorExpanded && (
              <div className="p-4 sm:p-5 space-y-4">
                
                {/* Selector de Plantillas Rápidas */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">
                    Seleccionar Plantilla Rápida:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DEFAULT_PROMO_TEMPLATES.map(tpl => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(tpl.id);
                          setPromoMessage(tpl.text);
                        }}
                        className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                          selectedTemplateId === tpl.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm'
                            : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold truncate">{tpl.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">{tpl.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Área de Edición del Mensaje + Vista Previa */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Editor */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700">Contenido del Mensaje:</span>
                      {/* Botones de inserción de etiquetas */}
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-slate-400 mr-1 hidden sm:inline">Insertar:</span>
                        <button
                          type="button"
                          onClick={() => setPromoMessage(prev => prev + ' {nombre}')}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded font-mono font-semibold"
                          title="Inserta el primer nombre del cliente"
                        >
                          + &#123;nombre&#125;
                        </button>
                        <button
                          type="button"
                          onClick={() => setPromoMessage(prev => prev + ' {link}')}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded font-mono font-semibold"
                          title="Inserta el enlace a la tienda"
                        >
                          + &#123;link&#125;
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={5}
                      value={promoMessage}
                      onChange={(e) => setPromoMessage(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
                      placeholder="Escribí aquí tu mensaje promocional..."
                    />
                  </div>

                  {/* Vista Previa Estilo WhatsApp */}
                  <div className="space-y-2 flex flex-col">
                    <span className="text-xs font-bold text-slate-700">
                      Vista previa al cliente (Ejemplo: &quot;María&quot;):
                    </span>
                    <div className="flex-1 bg-[#efeae2] p-3.5 rounded-2xl border border-slate-200 relative overflow-hidden flex flex-col justify-end min-h-[140px]">
                      <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[95%] text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                        {generatePersonalizedMessage(promoMessage, { nombre: 'María González' })}
                        <div className="text-[10px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1 font-sans">
                          11:42 <span className="text-emerald-600 font-bold">✓✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones Masivas / Botones para Newsletter */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyAllEmails(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all border border-blue-200/80 active:scale-95"
                      title="Copia todos los correos electrónicos separados por coma para pegar en CCO / BCC"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Todos los Correos (BCC Newsletter)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenBulkEmailClient}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 active:scale-95"
                      title="Abre tu cliente de correo (Gmail/Outlook) con los destinatarios en copia oculta"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Abrir Correo Masivo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyAllPhones(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all border border-emerald-200/80 active:scale-95"
                      title="Copia los teléfonos limpios para crear una lista de difusión en WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Copiar Teléfonos (Difusión)</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500 italic">
                    💡 Tip: Usá CCO en tu correo para no mostrar los correos de otros clientes.
                  </span>
                </div>

              </div>
            )}
          </div>

          {/* SECCIÓN 2: BARRA DE BÚSQUEDA, FILTROS Y BOTÓN NUEVO CLIENTE */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
            
            {/* Filtros por Categoría */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'todos', label: 'Todos', count: clients.length },
                { id: 'whatsapp', label: 'Con WhatsApp', count: stats.withWhatsApp },
                { id: 'email', label: 'Con Email', count: stats.withEmail },
                { id: 'frecuentes', label: 'Frecuentes', count: stats.frecuentes },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Búsqueda, Orden y Agregar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar nombre, tel o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700 focus:outline-none"
              >
                <option value="pedidos">Más Pedidos</option>
                <option value="recientes">Más Recientes</option>
                <option value="nombre">Nombre A-Z</option>
              </select>

              <button
                type="button"
                onClick={() => handleOpenEditModal(null)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Cliente</span>
              </button>
            </div>
          </div>

          {/* BARRA FLOTANTE DE ACCIÓN PARA SELECCIÓN MÚLTIPLE */}
          {selectedClientIds.size > 0 && (
            <div className="bg-slate-900 text-white p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-xs font-semibold pl-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{selectedClientIds.size} cliente(s) seleccionado(s)</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleCopyAllEmails(true)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Correos</span>
                </button>
                <button
                  onClick={() => handleCopyAllPhones(true)}
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Copiar Teléfonos</span>
                </button>
                <button
                  onClick={() => setSelectedClientIds(new Set())}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold transition"
                >
                  Desmarcar
                </button>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: TABLA DE CLIENTES */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-16 text-center text-slate-500">
                <span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></span>
                <p className="font-semibold text-sm">Cargando base de clientes...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-16 text-center text-slate-500 space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-base">No se encontraron clientes</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No hay registros que coincidan con la búsqueda o filtro seleccionado. Podés registrar un cliente con el botón &quot;Nuevo Cliente&quot;.
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-emerald-600 hover:underline inline-block mt-2"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="p-4 pl-5 w-10">
                        <input
                          type="checkbox"
                          checked={selectedClientIds.size === filteredClients.length && filteredClients.length > 0}
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">WhatsApp / Teléfono</th>
                      <th className="p-4">Correo Electrónico</th>
                      <th className="p-4 text-center">Compras</th>
                      <th className="p-4 text-right pr-6">Acciones de Envío</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClients.map((client) => {
                      const isSelected = selectedClientIds.has(client.id);
                      const hasPhone = Boolean(client.whatsapp || client.telefono);
                      const hasEmail = Boolean(client.email && client.email.includes('@'));
                      const initials = (client.nombre || 'C')
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();

                      return (
                        <tr
                          key={client.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-4 pl-5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(client.id)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>

                          {/* Datos del Cliente */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-xs shrink-0 border border-slate-200 shadow-sm">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                  <span>{client.nombre}</span>
                                  {client.isManual && (
                                    <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-1.5 py-0.2 rounded border border-amber-200">
                                      Manual
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                  <span className="truncate max-w-[150px]">{client.origen}</span>
                                  {client.notas && (
                                    <>
                                      <span>•</span>
                                      <span className="text-slate-500 italic truncate max-w-[200px]" title={client.notas}>
                                        {client.notas}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* WhatsApp / Teléfono */}
                          <td className="p-4">
                            {hasPhone ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-slate-800">
                                  {formatDisplayPhone(client.whatsapp || client.telefono)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(client.whatsapp || client.telefono, `phone_${client.id}`, 'Teléfono copiado')}
                                  className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition"
                                  title="Copiar teléfono"
                                >
                                  {copiedId === `phone_${client.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Sin teléfono</span>
                            )}
                          </td>

                          {/* Correo Electrónico */}
                          <td className="p-4">
                            {hasEmail ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-700 truncate max-w-[200px]">
                                  {client.email}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(client.email, `email_${client.id}`, 'Correo copiado')}
                                  className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition shrink-0"
                                  title="Copiar correo"
                                >
                                  {copiedId === `email_${client.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Sin correo</span>
                            )}
                          </td>

                          {/* Estadísticas de Pedidos */}
                          <td className="p-4 text-center">
                            {client.pedidosCount > 0 ? (
                              <div>
                                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  {client.pedidosCount} {client.pedidosCount === 1 ? 'pedido' : 'pedidos'}
                                </span>
                                <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                  {formatCurrency(client.totalGastado)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Sin compras</span>
                            )}
                          </td>

                          {/* Acciones de Envío de Promoción */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* Botón WhatsApp */}
                              <button
                                type="button"
                                onClick={() => handleSendWhatsAppPromo(client)}
                                disabled={!hasPhone}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                  hasPhone
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                }`}
                                title={hasPhone ? 'Enviar mensaje promocional por WhatsApp' : 'No tiene WhatsApp'}
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>

                              {/* Botón Email */}
                              <button
                                type="button"
                                onClick={() => handleSendEmailPromo(client)}
                                disabled={!hasEmail}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  hasEmail
                                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 active:scale-95'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                }`}
                                title={hasEmail ? 'Enviar promoción por correo electrónico' : 'No tiene correo'}
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Email</span>
                              </button>

                              {/* Botón Editar */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(client)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                                title="Editar datos del cliente"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Botón Eliminar (si es manual) */}
                              {client.isManual && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClient(client)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                                  title="Eliminar cliente manual"
                                >
                                  <Trash2 className="w-4 h-4" />
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

        </div>

        {/* PIE DEL MODAL */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Mostrando {filteredClients.length} de {clients.length} clientes.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>

      {/* SUB-MODAL: AGREGAR O EDITAR CLIENTE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 overflow-hidden">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900 font-headline">
                {editingClient ? 'Editar Datos del Cliente' : 'Agregar Nuevo Cliente'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Benítez"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número de WhatsApp / Teléfono
                </label>
                <input
                  type="text"
                  placeholder="Ej: 0981 123 456 ó +595981123456"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Acepta números locales (098X...) o internacionales (+595 / +55...).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico (para Newsletter)
                </label>
                <input
                  type="email"
                  placeholder="Ej: cliente@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas u Observaciones (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Cliente frecuente de carnicería, prefiere promociones de fin de semana..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingClient}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingClient ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cliente</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
