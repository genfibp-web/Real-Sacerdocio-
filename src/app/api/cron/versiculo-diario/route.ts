import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// 1. LISTA DE RESPALDO AMPLIADA (30 versículos diferentes)
const versiculosRespaldo = [
  { cita: "Filipenses 4:13", texto: "Todo lo puedo en Cristo que me fortalece.", mensaje: "No importa cuán grande sea el desafío que enfrentas hoy, no estás solo. Dios te da la fuerza para superar cualquier obstáculo." },
  { cita: "Salmos 23:1", texto: "Jehová es mi pastor; nada me faltará.", mensaje: "Descansa en la promesa de que Dios cuida de ti. Él conoce tus necesidades y proveerá en el momento perfecto." },
  { cita: "Isaías 41:10", texto: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.", mensaje: "El miedo no tiene poder sobre ti. Dios está a tu lado, sosteniéndote con su mano derecha." },
  { cita: "Proverbios 3:5-6", texto: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.", mensaje: "La paz verdadera llega cuando confiamos en que Dios tiene un plan mejor para nosotros." },
  { cita: "Jeremías 29:11", texto: "Porque yo sé los pensamientos que tengo acerca de vosotros, pensamientos de paz, y no de mal.", mensaje: "Tu futuro está en las manos de un Dios que te ama. Él tiene planes de prosperidad y esperanza." },
  { cita: "Mateo 11:28", texto: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.", mensaje: "Si hoy te sientes agotado, Dios te invita a dejar tus cargas en sus pies." },
  { cita: "Salmos 46:1", texto: "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.", mensaje: "Cuando sientas que todo se derrumba, recuerda que Dios es tu refugio seguro." },
  { cita: "Josué 1:9", texto: "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo.", mensaje: "La valentía no es la ausencia de miedo, sino saber que Dios camina contigo." },
  { cita: "Salmos 91:1", texto: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.", mensaje: "Busca la presencia de Dios en medio de tu rutina. En Su refugio encontrarás protección." },
  { cita: "Romanos 8:28", texto: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.", mensaje: "Incluso en las pruebas, Dios está tejiendo algo bueno para tu vida." },
  { cita: "Gálatas 5:22", texto: "Mas el fruto del Espíritu es amor, gozo, paz, paciencia, benignidad, bondad, fe.", mensaje: "Permite que el Espíritu Santo moldee tu carácter hoy. Que tu forma de tratar a los demás refleje el amor de Dios." },
  { cita: "Salmos 37:4", texto: "Deléitate asimismo en Jehová, y él te concederá las peticiones de tu corazón.", mensaje: "Cuando pones tu alegría en Dios, tus deseos comienzan a alinearse con Su voluntad." },
  { cita: "Mateo 6:33", texto: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", mensaje: "Pon a Dios en primer lugar en tus decisiones de hoy. Confía en que Él suplirá cada una de tus necesidades." },
  { cita: "1 Corintios 13:4", texto: "El amor es sufrido, es benigno; el amor no tiene envidia, el amor no es jactancioso, no se envanece.", mensaje: "El verdadero amor se demuestra en las acciones diarias. Pide a Dios que te ayude a amar con paciencia." },
  { cita: "Salmos 121:1-2", texto: "Alzaré mis ojos a los montes; ¿De dónde vendrá mi socorro? Mi socorro viene de Jehová.", mensaje: "No busques ayuda en las circunstancias, búscala en el Creador. Él es tu ayuda constante." },
  { cita: "Efesios 2:8", texto: "Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios.", mensaje: "La salvación es un regalo de amor. No se trata de lo que hacemos, sino de lo que Jesús hizo por nosotros." },
  { cita: "Santiago 1:2-3", texto: "Tened por sumo gozo cuando os halléis en diversas pruebas, sabiendo que la prueba de vuestra fe produce paciencia.", mensaje: "Las pruebas no son para destruirte, sino para fortalecer tu fe y formar tu carácter." },
  { cita: "1 Pedro 5:7", texto: "Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.", mensaje: "No cargues con preocupaciones que no te corresponden. Dios se preocupa por ti y quiere que descanses en Él." },
  { cita: "Salmos 34:18", texto: "Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu.", mensaje: "Si hoy sientes el corazón roto, recuerda que Dios está más cerca de ti que nunca. Él sana las heridas." },
  { cita: "Isaías 40:31", texto: "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.", mensaje: "La espera en Dios no es tiempo perdido; es tiempo de renovación. Confía en Sus tiempos perfectos." },
  { cita: "Juan 14:6", texto: "Jesús le dijo: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.", mensaje: "Jesús es la respuesta a la búsqueda más profunda del ser humano. En Él encontramos propósito y dirección." },
  { cita: "Hebreos 11:1", texto: "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.", mensaje: "La fe no es creer ciegamente, es confiar plenamente en Aquel que prometió y no miente." },
  { cita: "Salmos 119:105", texto: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.", mensaje: "La Palabra de Dios es la guía más segura. Léela hoy y deja que ilumine tus decisiones." },
  { cita: "Romanos 12:2", texto: "No os conforméis a este siglo, sino transformaos por medio de la renovación de vuestro entendimiento.", mensaje: "No dejes que el mundo dicte tus valores. Deja que Dios renueve tu mente para que vivas Su voluntad." },
  { cita: "2 Timoteo 1:7", texto: "Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.", mensaje: "Dios te ha equipado con poder, amor y control propio. No permitas que el temor te paralice." },
  { cita: "Colosenses 3:23", texto: "Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres.", mensaje: "Trabaja con excelencia y alegría hoy. Hazlo para agradar a Dios, no solo para buscar la aprobación humana." },
  { cita: "Salmos 27:1", texto: "Jehová es mi luz y mi salvación; ¿de quién temeré? Jehová es la fortaleza de mi vida; ¿de quién he de atemorizarme?", mensaje: "Si Dios está de tu lado, no hay nada que pueda derrotarte. Camina hoy con la cabeza en alto." },
  { cita: "Mateo 5:16", texto: "Así alumbre vuestra luz delante de los hombres, para que vean vuestras buenas obras.", mensaje: "Tu forma de actuar es el mayor testimonio. Que tus acciones de hoy reflejen el amor de Cristo a los demás." },
  { cita: "Juan 3:16", texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito.", mensaje: "El amor de Dios no tiene límites ni condiciones. Él te amó primero y entregó lo más valioso por ti." },
  { cita: "Salmos 139:14", texto: "Te alabaré; porque formidables, maravillosas son tus obras; Estoy maravillado.", mensaje: "Fuiste creado con propósito y amor. No te compares, valora el diseño único que Dios hizo en ti." }
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
      
      // 🛠️ FIX DE IA: Usamos gemini-1.5-flash (el modelo real de Google)
      const respuestaIA = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            contents: [{ parts: [{ text: prompt }] }], 
            // Subimos la temperatura a 0.9 para que la IA sea mucho más creativa y no se repita
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
      
      console.log("✅ Versículo generado por la IA con éxito:", versiculoGenerado.cita);

    } catch (error) {
      console.error("❌ La IA falló. Usando lista de respaldo. Motivo:", error);
      
      // Lógica de respaldo mejorada: Busca uno que NO esté en el historial
      const respaldosDisponibles = versiculosRespaldo.filter(v => !citasRecientes.includes(v.cita));
      const listaParaElegir = respaldosDisponibles.length > 0 ? respaldosDisponibles : versiculosRespaldo;
      const indiceAleatorio = Math.floor(Math.random() * listaParaElegir.length);
      versiculoGenerado = listaParaElegir[indiceAleatorio];
    }

    // 3. Guardar en base de datos (Upsert previene duplicados)
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}