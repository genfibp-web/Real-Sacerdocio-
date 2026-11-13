import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const versiculosRespaldo = [
  { cita: "Filipenses 4:13", texto: "Todo lo puedo en Cristo que me fortalece.", mensaje: "No importa cuán grande sea el desafío que enfrentas hoy, no estás solo. Dios te da la fuerza para superar cualquier obstáculo." },
  // ... (puedes dejar el resto de la lista de respaldo como estaba)
];

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' });

    // 1. Verificar si el versículo de hoy ya existe
    const { data: existente } = await supabaseAdmin
      .from('versiculos_diarios')
      .select('id')
      .eq('fecha', hoy)
      .limit(1);
      
    if (existente && existente.length > 0) {
      return NextResponse.json({ success: true, message: "El versículo de hoy ya existe." });
    }

    // 2. Traer los últimos 30 para evitar repeticiones
    const { data: historial } = await supabaseAdmin
      .from('versiculos_diarios')
      .select('cita')
      .order('fecha', { ascending: false })
      .limit(30);

    const citasRecientes = historial?.map(v => v.cita).join(', ') || '';

    let versiculoGenerado;
    
    try {
      const prompt = `Genera el versículo bíblico para el día de hoy. 
      IMPORTANTE: NO REPITAS ninguno de estos versículos que ya se usaron recientemente: [${citasRecientes}]. 
      Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto extra) con estas claves exactas: {"cita": "Libro Capítulo:Versículo", "texto": "El texto bíblico completo (en español)", "mensaje": "Una reflexión profunda y alentadora de 2 párrafos aplicable a la vida diaria."}`;
      
      const respuestaIA = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            contents: [{ parts: [{ text: prompt }] }], 
            generationConfig: { responseMimeType: "application/json", temperature: 0.9 } 
        })
      });
      
      if (!respuestaIA.ok) {
        const err = await respuestaIA.json();
        throw new Error(`Google API Error: ${JSON.stringify(err)}`);
      }
      
      const dataIA = await respuestaIA.json();
      versiculoGenerado = JSON.parse(dataIA.candidates[0].content.parts[0].text);

      if (citasRecientes.includes(versiculoGenerado.cita)) {
        throw new Error("La IA repitió un versículo reciente");
      }
      
    } catch (error: any) {
      // 🚨 MODO DIAGNÓSTICO ACTIVADO: Si falla, devolvemos el error a la terminal y NO usamos respaldo
      return NextResponse.json({ 
        error: "FALLO DE IA", 
        motivo: error.message || error.toString() 
      }, { status: 500 });
    }

    await supabaseAdmin.from('versiculos_diarios').upsert(
      [{ fecha: hoy, cita: versiculoGenerado.cita, texto: versiculoGenerado.texto, mensaje: versiculoGenerado.mensaje }],
      { onConflict: 'fecha', ignoreDuplicates: true }
    );

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

    const fechaLimite = new Date(); fechaLimite.setDate(fechaLimite.getDate() - 30);
    await supabaseAdmin.from('versiculos_diarios').delete().lt('fecha', fechaLimite.toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' }));

    return NextResponse.json({ success: true, versiculo: versiculoGenerado.cita });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}