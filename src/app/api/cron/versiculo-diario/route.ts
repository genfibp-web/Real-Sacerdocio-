import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const versiculosRespaldo = [
  { cita: "Filipenses 4:13", texto: "Todo lo puedo en Cristo que me fortalece.", mensaje: "No importa cuán grande sea el desafío que enfrentas hoy, no estás solo. Dios te da la fuerza para superar cualquier obstáculo. Confía en Él." },
  { cita: "Salmos 23:1", texto: "Jehová es mi pastor; nada me faltará.", mensaje: "Descansa en la promesa de que Dios cuida de ti. Él conoce tus necesidades y proveerá para ti en el momento perfecto." },
  { cita: "Isaías 41:10", texto: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.", mensaje: "El miedo no tiene poder sobre ti. Dios está a tu lado, sosteniéndote con su mano derecha. Avanza con valentía hoy." },
  { cita: "Proverbios 3:5-6", texto: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.", mensaje: "A veces queremos tener el control de todo, pero la paz verdadera llega cuando confiamos en que Dios tiene un plan mejor para nosotros." },
  { cita: "Jeremías 29:11", texto: "Porque yo sé los pensamientos que tengo acerca de vosotros, pensamientos de paz, y no de mal.", mensaje: "Tu futuro está en las manos de un Dios que te ama. Él tiene planes de prosperidad y esperanza para tu vida." },
  { cita: "Mateo 11:28", texto: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.", mensaje: "Si hoy te sientes agotado, Dios te invita a dejar tus cargas en sus pies. En Él encontrarás descanso para tu alma." },
  { cita: "Salmos 46:1", texto: "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.", mensaje: "Cuando sientas que todo se derrumba, recuerda que Dios es tu refugio seguro. Corre hacia Él y encontrarás paz." },
];

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' });

    const { data: existente } = await supabaseAdmin.from('versiculos_diarios').select('id').eq('fecha', hoy).maybeSingle();
    if (existente) return NextResponse.json({ success: true, message: "El versículo de hoy ya existe." });

    let versiculoGenerado;
    try {
      const prompt = `Genera el versículo bíblico para el día de hoy. Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto extra) con estas claves exactas: {"cita": "Libro Capítulo:Versículo", "texto": "El texto bíblico completo (en español)", "mensaje": "Una reflexión profunda y alentadora de 2 párrafos aplicable a la vida diaria."}`;
      const respuestaIA = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
      });
      if (!respuestaIA.ok) throw new Error("Google API falló");
      const dataIA = await respuestaIA.json();
      versiculoGenerado = JSON.parse(dataIA.candidates[0].content.parts[0].text);
    } catch (error) {
      const indiceAleatorio = Math.floor(Math.random() * versiculosRespaldo.length);
      versiculoGenerado = versiculosRespaldo[indiceAleatorio];
    }

    await supabaseAdmin.from('versiculos_diarios').insert([{ fecha: hoy, cita: versiculoGenerado.cita, texto: versiculoGenerado.texto, mensaje: versiculoGenerado.mensaje }]);

    // 🔔 ENVIAR NOTIFICACIÓN DEL VERSÍCULO AQUÍ MISMO
    const { data: subscriptions } = await supabaseAdmin.from('push_subscriptions').select('*');
    if (subscriptions && subscriptions.length > 0) {
      const payload = JSON.stringify({
        title: "📖 Versículo del Día",
        body: `${versiculoGenerado.cita}: "${versiculoGenerado.texto.substring(0, 50)}..." Toca para leer la reflexión.`,
        url: `/versiculo/${hoy}`
      });
      await Promise.allSettled(subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
        } catch (err: any) { if (err.statusCode === 410 || err.statusCode === 404) await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id); }
      }));
    }

    // 🧹 Limpieza de versículos viejos
    const fechaLimite = new Date(); fechaLimite.setDate(fechaLimite.getDate() - 30);
    await supabaseAdmin.from('versiculos_diarios').delete().lt('fecha', fechaLimite.toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' }));

    return NextResponse.json({ success: true, versiculo: versiculoGenerado.cita });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}