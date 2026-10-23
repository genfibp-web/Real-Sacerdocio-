import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' });

    const { data: subscriptions } = await supabaseAdmin.from('push_subscriptions').select('*');
    if (!subscriptions || subscriptions.length === 0) return NextResponse.json({ success: true, message: "No hay dispositivos." });

    let enviados = 0;

    // 🔔 SOLO BUSCAR Y ENVIAR EVENTOS
    const { data: eventosHoy } = await supabaseAdmin.from('eventos').select('*').eq('fecha_inicio', hoy).eq('aprobado', true);
    if (eventosHoy && eventosHoy.length > 0) {
      for (const evento of eventosHoy) {
        const payload = JSON.stringify({
          title: "📢 ¡Evento HOY!",
          body: `No olvides: ${evento.titulo} a las ${evento.hora}. ¡Te esperamos!`,
          url: `/eventos/${evento.slug}`
        });
        await Promise.allSettled(subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
            enviados++;
          } catch (err: any) { if (err.statusCode === 410 || err.statusCode === 404) await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id); }
        }));
      }
    }

    return NextResponse.json({ success: true, enviados });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}