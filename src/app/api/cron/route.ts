import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: Request) {
  try {
    // 1. Seguridad: Verificamos que Vercel sea quien hace la petición
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Obtenemos la fecha de HOY (YYYY-MM-DD)
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' });

    // 3. Buscamos eventos que sean HOY y estén aprobados
    const { data: eventosHoy } = await supabaseAdmin
      .from('eventos')
      .select('titulo, slug, hora, fecha_inicio')
      .eq('fecha_inicio', hoy)
      .eq('aprobado', true);

    if (!eventosHoy || eventosHoy.length === 0) {
      return NextResponse.json({ success: true, message: "No hay eventos para hoy." });
    }

    // 4. Traemos todos los dispositivos suscritos
    const { data: subscriptions } = await supabaseAdmin.from('push_subscriptions').select('*');
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: "No hay dispositivos registrados." });
    }

    let totalEnviados = 0;

    // 5. Enviamos la notificación por cada evento que haya hoy
    for (const evento of eventosHoy) {
      const payload = JSON.stringify({
        title: "¡Hoy es el gran día!",
        body: `No olvides nuestro evento: ${evento.titulo} a las ${evento.hora}. ¡Te esperamos!`,
        url: `/eventos/${evento.slug}`
      });

      const promesas = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          }, payload);
          totalEnviados++;
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
          }
        }
      });

      await Promise.allSettled(promesas);
    }

    return NextResponse.json({ success: true, eventos: eventosHoy.length, enviados: totalEnviados });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}