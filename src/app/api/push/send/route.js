// src/app/api/push/send/route.js
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:soporte@benmarket.com.py';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'Claves VAPID no configuradas en el servidor' },
        { status: 500 }
      );
    }

    const { eventType, pedido } = await req.json();

    if (!eventType || !pedido) {
      return NextResponse.json(
        { error: 'eventType y pedido son requeridos' },
        { status: 400 }
      );
    }

    let targetSubscriptions = [];
    let notificationPayload = {};

    const formattedTotal = Number(pedido.total || 0).toLocaleString('es-PY');

    if (eventType === 'NEW_ORDER') {
      // 1. Notificar a todo el staff (Admin y Cajero)
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .or('role.ilike.Admin,role.ilike.Cajero');

      if (error) {
        console.error('Error obteniendo suscripciones de staff:', error);
      } else {
        targetSubscriptions = data || [];
        console.log(`[PUSH] Dispositivos de staff encontrados para NEW_ORDER: ${targetSubscriptions.length}`);
      }

      notificationPayload = {
        title: '🛍️ ¡Nuevo Pedido Pendiente!',
        body: `Cliente: ${pedido.cliente_nombre || 'Cliente'} - Total: Gs. ${formattedTotal}`,
        icon: '/icon-192.png',
        url: '/dashboard',
        tag: `nuevo-pedido-${pedido.id || Date.now()}`,
      };
    } else if (eventType === 'STATUS_UPDATED') {
      // 2. Notificar al Cliente que realizó el pedido
      if (pedido.user_id) {
        const { data, error } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', pedido.user_id);

        if (error) {
          console.error('Error obteniendo suscripción del cliente:', error);
        } else {
          targetSubscriptions = data || [];
        }
      }

      const estado = pedido.estado || 'Actualizado';
      let title = `📦 Estado de tu Pedido: ${estado}`;
      let body = `Tu compra por Gs. ${formattedTotal} ahora está "${estado}".`;

      if (estado === 'Preparando') {
        title = '👨‍🍳 Tu pedido se está preparando';
        body = 'Estamos seleccionando y empaquetando tus productos con cuidado.';
      } else if (estado === 'Enviado') {
        title = '🛵 ¡Tu pedido va en camino!';
        body = 'El delivery ya salió rumbo a tu dirección.';
      } else if (estado === 'Entregado') {
        title = '✅ ¡Pedido entregado!';
        body = '¡Gracias por comprar en Benmarket Express! Que lo disfrutes.';
      }

      notificationPayload = {
        title,
        body,
        icon: '/icon-192.png',
        url: '/orders',
        tag: `pedido-estado-${pedido.id || Date.now()}`,
      };
    } else {
      return NextResponse.json(
        { error: `Tipo de evento no reconocido: ${eventType}` },
        { status: 400 }
      );
    }

    if (!targetSubscriptions.length) {
      return NextResponse.json({
        success: true,
        message: 'No hay dispositivos suscritos para este evento',
        sentCount: 0,
      });
    }

    const payloadString = JSON.stringify(notificationPayload);
    const deadSubscriptionIds = [];
    let sentCount = 0;

    // Despacho concurrente con web-push
    const sendPromises = targetSubscriptions.map(async (sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushConfig, payloadString);
        sentCount++;
      } catch (err) {
        // Códigos 404 y 410 indican que el usuario canceló el permiso o desinstaló la app
        if (err.statusCode === 410 || err.statusCode === 404) {
          deadSubscriptionIds.push(sub.id);
        } else {
          console.warn(`Error enviando push a ${sub.id}:`, err.message);
        }
      }
    });

    await Promise.all(sendPromises);

    // Limpieza de suscripciones inactivas/muertas
    if (deadSubscriptionIds.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', deadSubscriptionIds);
    }

    return NextResponse.json({
      success: true,
      sentCount,
      removedCount: deadSubscriptionIds.length,
    });
  } catch (err) {
    console.error('Error general en /api/push/send:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
