import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { title, body, url } = await req.json();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Traemos TODAS las suscripciones de la base de datos
  const { data: subscriptions, error } = await supabaseAdmin.from('push_subscriptions').select('*');
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subscriptions || subscriptions.length === 0) return NextResponse.json({ error: 'No hay dispositivos registrados' }, { status: 400 });

  const payload = JSON.stringify({ title, body, url });
  let enviados = 0;
  let fallidos = 0;

  // 2. Enviamos a todos en paralelo
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        }, payload);
        enviados++;
      } catch (err: any) {
        fallidos++;
        // Si el dispositivo ya no existe (410 Gone), lo borramos de la base de datos
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    })
  );

  return NextResponse.json({ success: true, enviados, fallidos, total: subscriptions.length });
}