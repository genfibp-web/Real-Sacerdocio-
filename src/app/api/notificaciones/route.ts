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

  const { data: subscriptions } = await supabaseAdmin.from('push_subscriptions').select('*');
  if (!subscriptions) return NextResponse.json({ error: 'No hay dispositivos' }, { status: 400 });

  const payload = JSON.stringify({ title, body, url });

  const sendPromises = subscriptions.map((sub) =>
    webpush.sendNotification({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth }
    }, payload).catch(err => console.error("Error enviando a:", sub.endpoint, err))
  );

  await Promise.all(sendPromises);
  return NextResponse.json({ success: true, count: subscriptions.length });
}