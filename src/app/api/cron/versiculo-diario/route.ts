import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Función para hacer una pausa (esperar antes de reintentar)
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

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

    let versiculoGenerado = null;
    let intentosMaximos = 5; 
    let errorFinal = null;

    // 🚀 SISTEMA DE REINTENTOS CON GROQ (Llama 3.3)
    for (let intento = 1; intento <= intentosMaximos; intento++) {
      try {
        console.log(`⏳ Intento ${intento} de generar versículo con Groq IA...`);
        
        const prompt = `Genera el versículo bíblico para el día de hoy. 
        IMPORTANTE: NO REPITAS ninguno de estos versículos que ya se usaron recientemente: [${citasRecientes}]. 
        Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto extra) con estas claves exactas: {"cita": "Libro Capítulo:Versículo", "texto": "El texto bíblico completo (en español)", "mensaje": "Una reflexión profunda y alentadora de 2 párrafos aplicable a la vida diaria."}`;
        
        const respuestaIA = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile", // Modelo ultrarrápido y potente
            messages: [{ role: "user", content: prompt }],
            temperature: 0.9,
            response_format: { type: "json_object" } // Fuerza la respuesta en JSON
          })
        });
        
        if (!respuestaIA.ok) {
          throw new Error(`Groq API Error (Código ${respuestaIA.status}): ${JSON.stringify(await respuestaIA.json())}`);
        }
        
        const dataIA = await respuestaIA.json();
        const textoGenerado = dataIA.choices[0].message.content;
        versiculoGenerado = JSON.parse(textoGenerado);

        if (citasRecientes.includes(versiculoGenerado.cita)) {
          throw new Error(`La IA generó un versículo repetido (${versiculoGenerado.cita}). Reintentando...`);
        }
        
        console.log(`✅ ¡ÉXITO! Versículo generado en el intento ${intento}:`, versiculoGenerado.cita);
        break; // Si funciona, salimos del bucle

      } catch (error: any) {
        console.error(`❌ Intento ${intento} fallido:`, error.message);
        errorFinal = error.message;

        if (intento === intentosMaximos) {
          throw new Error(`FALLO TOTAL TRAS ${intentosMaximos} INTENTOS. Último error: ${errorFinal}`);
        } else {
          await delay(3000); // Esperar 3 segundos antes de reintentar
        }
      }
    }

    if (!versiculoGenerado) {
      throw new Error("No se pudo generar el versículo por razones desconocidas.");
    }

    // 3. Guardar en base de datos (Solo llega aquí si la IA fue exitosa)
    await supabaseAdmin.from('versiculos_diarios').upsert(
      [{ fecha: hoy, cita: versiculoGenerado.cita, texto: versiculoGenerado.texto, mensaje: versiculoGenerado.mensaje }],
      { onConflict: 'fecha', ignoreDuplicates: true }
    );

    // 4. Enviar notificación push
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

    // 5. Limpieza
    const fechaLimite = new Date(); fechaLimite.setDate(fechaLimite.getDate() - 30);
    await supabaseAdmin.from('versiculos_diarios').delete().lt('fecha', fechaLimite.toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' }));

    return NextResponse.json({ success: true, versiculo: versiculoGenerado.cita });
  } catch (error: any) {
    return NextResponse.json({ error: "ERROR CRÍTICO", motivo: error.message }, { status: 500 });
  }
}