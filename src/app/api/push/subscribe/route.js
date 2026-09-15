// src/app/api/push/subscribe/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Usar service_role key si existe para saltar RLS, o fallback a anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const body = await req.json();
    const { subscription, userId, role = 'Cliente', userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Datos de suscripción incompletos' },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: 'Claves de cifrado p256dh o auth faltantes' },
        { status: 400 }
      );
    }

    // Upsert de la suscripción en la tabla push_subscriptions
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          endpoint,
          p256dh,
          auth,
          user_id: userId || null,
          role: role || 'Cliente',
          user_agent: userAgent || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      )
      .select();

    if (error) {
      console.error('Error al guardar suscripción push en Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error inesperado en /api/push/subscribe:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint requerido' }, { status: 400 });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
