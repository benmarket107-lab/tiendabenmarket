/**
 * Utilidades para la gestión de clientes, formateo de WhatsApp,
 * generación de mensajes promocionales y exportación de datos.
 */

/**
 * Normaliza cualquier número de teléfono a formato WhatsApp internacional.
 * Compatible con números de Paraguay (595), Brasil (55), Argentina (54), etc.
 */
export const cleanPhoneForWhatsApp = (phone) => {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';

  // Si ya tiene el código de país de Paraguay (595)
  if (digits.startsWith('595')) {
    return digits;
  }

  // Si empieza con 0 (ej: 0981123456 -> 595981123456)
  if (digits.startsWith('0')) {
    return '595' + digits.substring(1);
  }

  // Si tiene 9 dígitos típicos de Paraguay sin el 0 (ej: 981123456 -> 595981123456)
  if (digits.length === 9 && ['9', '8', '7', '6', '5'].includes(digits[0])) {
    return '595' + digits;
  }

  // Si empieza con código internacional de Brasil o Argentina
  if (digits.length >= 10 && (digits.startsWith('55') || digits.startsWith('54'))) {
    return digits;
  }

  // Fallback si tiene 8 o 9 dígitos: asumir Paraguay
  if (digits.length <= 9) {
    return '595' + digits;
  }

  return digits;
};

/**
 * Formatea un número telefónico para mostrarlo de forma elegante en la interfaz.
 */
export const formatDisplayPhone = (phone) => {
  if (!phone) return '';
  const wa = cleanPhoneForWhatsApp(phone);
  if (wa.startsWith('595') && wa.length >= 11) {
    // Formato: +595 981 123456
    return `+595 ${wa.substring(3, 6)} ${wa.substring(6)}`;
  }
  if (wa.startsWith('55') && wa.length >= 12) {
    // Brasil: +55 (45) 99999-9999
    return `+55 ${wa.substring(2, 4)} ${wa.substring(4)}`;
  }
  return phone;
};

/**
 * Genera el mensaje promocional reemplazando las etiquetas dinámicas:
 * {nombre}, {nombre_completo}, {tienda}, {link}
 */
export const generatePersonalizedMessage = (template, client) => {
  if (!template) return '';
  const fullName = client?.nombre?.trim() || 'Cliente';
  const firstName = fullName.split(' ')[0] || 'Cliente';
  const storeName = 'BenMarket';
  const storeLink = typeof window !== 'undefined' ? window.location.origin : 'https://benmarket.com';

  return template
    .replace(/{nombre}/gi, firstName)
    .replace(/{nombre_completo}/gi, fullName)
    .replace(/{tienda}/gi, storeName)
    .replace(/{link}/gi, storeLink);
};

/**
 * Plantillas predefinidas de alto impacto para promociones y newsletters.
 */
export const DEFAULT_PROMO_TEMPLATES = [
  {
    id: 'ofertas_semana',
    title: '🏷️ Ofertas de la Semana',
    badge: 'Popular',
    text: `¡Hola {nombre}! 👋 En *BenMarket* tenemos súper ofertas preparadas para vos esta semana 🛒✨

🔥 Descuentos especiales en artículos seleccionados.
🛵 Envíos rápidos en el día directo a tu puerta en Ciudad del Este.

👉 Hacé tu pedido fácil acá: {link}
¡Te esperamos!`,
  },
  {
    id: 'nuevos_ingresos',
    title: '🆕 Nuevos Ingresos',
    badge: 'Novedades',
    text: `¡Hola {nombre}! 🌟 Llegaron productos nuevos a *BenMarket* que te van a encantar.

🛒 Productos frescos, calidad garantizada y los mejores precios para tu hogar.
🛵 Comprá online sin moverte de casa.

👉 Descubrí todo lo nuevo aquí: {link}`,
  },
  {
    id: 'delivery_gratis',
    title: '🛵 Promo Delivery',
    badge: 'Envíos',
    text: `¡Hola {nombre}! 🛵 Hoy tenemos envíos especiales en *BenMarket* para que no salgas de casa.

📦 Armá tu carrito online y recibilo en tiempo récord.
👉 Hacé tu pedido ahora: {link}`,
  },
  {
    id: 'agradecimiento_cupon',
    title: '🎁 Descuento Exclusivo',
    badge: 'Fidelidad',
    text: `¡Hola {nombre}! 🎁 Gracias por ser un cliente especial de *BenMarket*.

Queremos regalarte promociones exclusivas en tu próxima compra online.
👉 Ingresá a la tienda y aprovechá hoy mismo: {link}`,
  },
];

const LOCAL_STORAGE_KEY = 'benmarket_manual_clients';

/**
 * Obtiene los clientes manuales guardados localmente como respaldo.
 */
export const getLocalManualClients = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Guarda los clientes manuales localmente.
 */
export const setLocalManualClients = (clients) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Error guardando clientes locales:', e);
  }
};

/**
 * Consulta la base de datos Supabase y consolida:
 * 1. Tabla de pedidos (todos los que compraron con nombre y whatsapp)
 * 2. Tabla de usuarios (cuentas registradas con email y nombre)
 * 3. Tabla de clientes (registros manuales o de promociones)
 * 4. Respaldo local de clientes manuales
 */
export const fetchConsolidatedClients = async (supabase) => {
  try {
    // 1. Obtener pedidos recientes
    const { data: pedidosData, error: pedidosErr } = await supabase
      .from('pedidos')
      .select('id, cliente_nombre, cliente_telefono, user_id, created_at, total')
      .order('created_at', { ascending: false });

    if (pedidosErr) {
      console.warn('Error al leer pedidos para clientes:', pedidosErr.message);
    }

    // 2. Obtener usuarios registrados
    const { data: usuariosData, error: usuariosErr } = await supabase
      .from('usuarios')
      .select('*')
      .order('name', { ascending: true });

    if (usuariosErr) {
      console.warn('Error al leer usuarios para clientes:', usuariosErr.message);
    }

    // 3. Intentar obtener clientes de la tabla clientes (si ya fue creada)
    let dbClientes = [];
    try {
      const { data: cData, error: cErr } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!cErr && Array.isArray(cData)) {
        dbClientes = cData;
      }
    } catch (_) {
      // Si la tabla no existe en la base de datos, ignorar sin romper
    }

    // 4. Clientes locales
    const localClientes = getLocalManualClients();

    // Map para consolidar y deduplicar
    const clientsMap = new Map();

    // Normalizador de clave única
    const getNormalizedKey = (item) => {
      const phoneDigits = item.telefono ? cleanPhoneForWhatsApp(item.telefono) : '';
      const email = item.email ? item.email.trim().toLowerCase() : '';
      const userId = item.user_id || item.userId || (item.id && String(item.id).length > 20 ? item.id : '');

      if (userId && !userId.startsWith('ped-') && !userId.startsWith('man-')) {
        return `user_${userId}`;
      }
      if (email && email.includes('@')) {
        return `email_${email}`;
      }
      if (phoneDigits && phoneDigits.length >= 7) {
        return `phone_${phoneDigits}`;
      }
      if (item.nombre) {
        return `name_${item.nombre.trim().toLowerCase()}`;
      }
      return `id_${item.id || Math.random()}`;
    };

    // A) Procesar usuarios registrados
    (usuariosData || []).forEach(u => {
      const clientObj = {
        id: u.id,
        userId: u.id,
        nombre: u.name || 'Usuario',
        email: u.email || '',
        telefono: u.telefono || '',
        whatsapp: u.telefono ? cleanPhoneForWhatsApp(u.telefono) : '',
        role: u.role || 'Cliente',
        origen: u.role === 'Cliente' ? 'Usuario Registrado' : `Personal (${u.role})`,
        pedidosCount: 0,
        totalGastado: 0,
        ultimoPedido: null,
        notas: '',
        createdAt: u.created_at || new Date().toISOString(),
      };
      const key = getNormalizedKey(clientObj);
      clientsMap.set(key, clientObj);
    });

    // B) Procesar pedidos
    (pedidosData || []).forEach(p => {
      const pPhone = cleanPhoneForWhatsApp(p.cliente_telefono);
      const pTotal = Number(p.total) || 0;
      const pDate = p.created_at;

      // Buscar si ya existe por user_id, teléfono o nombre
      let foundKey = null;
      if (p.user_id && clientsMap.has(`user_${p.user_id}`)) {
        foundKey = `user_${p.user_id}`;
      } else if (pPhone && clientsMap.has(`phone_${pPhone}`)) {
        foundKey = `phone_${pPhone}`;
      } else if (p.cliente_nombre && clientsMap.has(`name_${p.cliente_nombre.trim().toLowerCase()}`)) {
        foundKey = `name_${p.cliente_nombre.trim().toLowerCase()}`;
      }

      if (foundKey) {
        const existing = clientsMap.get(foundKey);
        existing.pedidosCount = (existing.pedidosCount || 0) + 1;
        existing.totalGastado = (existing.totalGastado || 0) + pTotal;
        if (!existing.telefono && p.cliente_telefono) {
          existing.telefono = p.cliente_telefono;
          existing.whatsapp = pPhone;
        }
        if (!existing.ultimoPedido || new Date(pDate) > new Date(existing.ultimoPedido)) {
          existing.ultimoPedido = pDate;
        }
      } else {
        // Nuevo cliente a partir de pedido
        const newClient = {
          id: `ped-${p.id}`,
          userId: p.user_id || null,
          nombre: p.cliente_nombre || 'Cliente Web',
          email: '',
          telefono: p.cliente_telefono || '',
          whatsapp: pPhone,
          role: 'Cliente',
          origen: 'Comprador Web',
          pedidosCount: 1,
          totalGastado: pTotal,
          ultimoPedido: pDate,
          notas: '',
          createdAt: pDate,
        };
        const key = getNormalizedKey(newClient);
        clientsMap.set(key, newClient);
      }
    });

    // C) Procesar clientes de base de datos manuales y locales
    const combinedManuals = [...dbClientes, ...localClientes];
    combinedManuals.forEach(m => {
      const mPhone = cleanPhoneForWhatsApp(m.telefono);
      const mEmail = m.email ? m.email.trim().toLowerCase() : '';

      let foundKey = null;
      if (mEmail && clientsMap.has(`email_${mEmail}`)) {
        foundKey = `email_${mEmail}`;
      } else if (mPhone && clientsMap.has(`phone_${mPhone}`)) {
        foundKey = `phone_${mPhone}`;
      } else if (m.nombre && clientsMap.has(`name_${m.nombre.trim().toLowerCase()}`)) {
        foundKey = `name_${m.nombre.trim().toLowerCase()}`;
      }

      if (foundKey) {
        const existing = clientsMap.get(foundKey);
        if (!existing.telefono && m.telefono) {
          existing.telefono = m.telefono;
          existing.whatsapp = mPhone;
        }
        if (!existing.email && m.email) {
          existing.email = m.email;
        }
        if (m.notas) {
          existing.notas = (existing.notas ? existing.notas + ' | ' : '') + m.notas;
        }
      } else {
        const manualClient = {
          id: m.id || `man-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          userId: null,
          nombre: m.nombre || 'Cliente',
          email: m.email || '',
          telefono: m.telefono || '',
          whatsapp: mPhone,
          role: 'Cliente',
          origen: m.origen || 'Manual / Caja',
          pedidosCount: Number(m.pedidosCount) || 0,
          totalGastado: Number(m.totalGastado) || 0,
          ultimoPedido: m.ultimoPedido || null,
          notas: m.notas || '',
          createdAt: m.created_at || m.createdAt || new Date().toISOString(),
          isManual: true,
        };
        const key = getNormalizedKey(manualClient);
        clientsMap.set(key, manualClient);
      }
    });

    // Convertir a array y ordenar por mayor cantidad de pedidos o más recientes
    const result = Array.from(clientsMap.values()).sort((a, b) => {
      if ((b.pedidosCount || 0) !== (a.pedidosCount || 0)) {
        return (b.pedidosCount || 0) - (a.pedidosCount || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  } catch (err) {
    console.error('Error en fetchConsolidatedClients:', err);
    return [];
  }
};

/**
 * Guarda o actualiza un cliente.
 * Intenta en Supabase ('clientes') y además asegura persistencia local.
 */
export const saveClientRecord = async (supabase, clientData) => {
  const cleanPhone = cleanPhoneForWhatsApp(clientData.telefono);
  const record = {
    nombre: clientData.nombre?.trim(),
    telefono: clientData.telefono?.trim() || null,
    email: clientData.email?.trim() || null,
    origen: clientData.origen || 'Caja / Manual',
    notas: clientData.notas?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  // 1. Guardar en Supabase si es posible
  let savedInDb = false;
  try {
    if (clientData.id && !clientData.id.startsWith('ped-') && !clientData.id.startsWith('man-') && !clientData.id.startsWith('user_')) {
      const { data, error } = await supabase
        .from('clientes')
        .update(record)
        .eq('id', clientData.id)
        .select()
        .maybeSingle();
      if (!error && data) savedInDb = true;
    } else {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{ ...record, created_at: new Date().toISOString() }])
        .select()
        .maybeSingle();
      if (!error && data) savedInDb = true;
    }
  } catch (_) {
    // Si la tabla no está creada, no arrojar error fatal
  }

  // 2. Persistir siempre en localStorage para que el cajero/admin lo vea de inmediato
  const locals = getLocalManualClients();
  const existingIdx = locals.findIndex(l => 
    (clientData.id && l.id === clientData.id) ||
    (cleanPhone && cleanPhoneForWhatsApp(l.telefono) === cleanPhone) ||
    (record.email && l.email?.toLowerCase() === record.email.toLowerCase())
  );

  const localItem = {
    ...record,
    id: clientData.id || `man-${Date.now()}`,
    whatsapp: cleanPhone,
    createdAt: clientData.createdAt || new Date().toISOString(),
    pedidosCount: clientData.pedidosCount || 0,
    totalGastado: clientData.totalGastado || 0,
    isManual: true,
  };

  if (existingIdx >= 0) {
    locals[existingIdx] = { ...locals[existingIdx], ...localItem };
  } else {
    locals.unshift(localItem);
  }
  setLocalManualClients(locals);

  return localItem;
};

/**
 * Elimina un cliente manual de la lista.
 */
export const deleteClientRecord = async (supabase, clientId) => {
  try {
    if (supabase && clientId && !clientId.startsWith('ped-') && !clientId.startsWith('man-') && !clientId.startsWith('user_')) {
      await supabase.from('clientes').delete().eq('id', clientId);
    }
  } catch (_) {}

  const locals = getLocalManualClients();
  const filtered = locals.filter(l => l.id !== clientId);
  setLocalManualClients(filtered);
  return true;
};

/**
 * Exporta el listado de clientes a un archivo CSV estructurado.
 */
export const exportClientsToCSV = (clients, filename = 'clientes_benmarket.csv') => {
  if (!clients || clients.length === 0) {
    alert('No hay clientes para exportar.');
    return;
  }

  const headers = [
    'Nombre',
    'WhatsApp / Teléfono',
    'WhatsApp Limpio (Internacional)',
    'Correo Electrónico',
    'Tipo / Origen',
    'Cantidad de Pedidos',
    'Total Gastado (Gs)',
    'Último Pedido',
    'Notas',
  ];

  const rows = clients.map(c => [
    `"${(c.nombre || '').replace(/"/g, '""')}"`,
    `"${(c.telefono || '').replace(/"/g, '""')}"`,
    `"${c.whatsapp || ''}"`,
    `"${(c.email || '').replace(/"/g, '""')}"`,
    `"${(c.origen || '').replace(/"/g, '""')}"`,
    c.pedidosCount || 0,
    c.totalGastado || 0,
    `"${c.ultimoPedido ? new Date(c.ultimoPedido).toLocaleDateString('es-PY') : ''}"`,
    `"${(c.notas || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
