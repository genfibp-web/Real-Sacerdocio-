import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    // 1. Seguridad
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' });

    // 2. Verificar si ya existe el versículo de hoy (para no duplicar)
    const { data: existente } = await supabaseAdmin
      .from('versiculos_diarios')
      .select('id')
      .eq('fecha', hoy)
      .maybeSingle();

    if (existente) {
      return NextResponse.json({ success: true, message: "El versículo de hoy ya existe." });
    }

    // 3. Pedirle a la IA (Gemini) que genere el versículo y la reflexión
    const prompt = `Genera el versículo bíblico para el día de hoy. 
    Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto extra) con estas claves exactas:
    {
      "cita": "Libro Capítulo:Versículo",
      "texto": "El texto bíblico completo (en español)",
      "mensaje": "Una reflexión profunda y alentadora de 2 párrafos aplicable a la vida diaria."
    }`;

    const respuestaIA = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    // 🛡️ ESCUDO: Verificamos si Google respondió con error (clave inválida, sin cuota, etc.)
    if (!respuestaIA.ok) {
      const errorData = await respuestaIA.json();
      throw new Error(`Error de Google API: ${errorData.error?.message || 'Error desconocido'}`);
    }

    const dataIA = await respuestaIA.json();
    
    if (!dataIA.candidates || !dataIA.candidates[0]?.content?.parts[0]?.text) {
      throw new Error("La IA no devolvió un formato válido.");
    }

    const textoGenerado = dataIA.candidates[0].content.parts[0].text;
    const versiculoGenerado = JSON.parse(textoGenerado);

    // 4. Guardar en Supabase
    const { error: dbError } = await supabaseAdmin.from('versiculos_diarios').insert([{
      fecha: hoy,
      cita: versiculoGenerado.cita,
      texto: versiculoGenerado.texto,
      mensaje: versiculoGenerado.mensaje
    }]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, versiculo: versiculoGenerado.cita });
    
  } catch (error: any) {
    console.error("Error en Cron Job:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}