import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CalendarDays, MapPin, ArrowLeft, Megaphone, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import CommunityFeed from "@/components/CommunityFeed"; 

export const dynamic = 'force-dynamic';

const comunidadesInfo: Record<string, any> = {
  jovenes: { nombre: "Generación Kehunah", descripcion: "Somos una generación llamada a brillar. Un espacio para jóvenes que buscan propósito y comunidad.", fallbackImage: "/Kehunah.webp" },
  caballeros: { nombre: "Hombres de la Realeza", descripcion: "Hombres de fe, llamados a liderar sus hogares y servir a Dios con integridad y valor.", fallbackImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop" },
  damas: { nombre: "Mujeres de Buena Voluntad", descripcion: "Mujeres virtuosas, fuertes y llenas del amor de Dios, creciendo juntas en fe y propósito.", fallbackImage: "/damas.webp" },
  ninos: { nombre: "Niños y Adolescentes", descripcion: "Un espacio diseñado para que los más pequeños y los adolescentes crezcan en el amor de Jesús, descubran su propósito y hagan grandes amigos.", fallbackImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop" },
  parejas: { nombre: "Ministerio de Parejas", descripcion: "Un espacio para fortalecer el matrimonio, crecer juntos en el amor de Dios y edificar hogares conforme a su propósito.", fallbackImage: "/minispareja.webp" },
};

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const info = comunidadesInfo[slug];
  if (!info) notFound();

  // 🪄 MAGIA: Consultamos la imagen a la base de datos
  const { data: dbComunidad } = await supabase
    .from('comunidades')
    .select('imagen_url')
    .eq('slug', slug)
    .single();

  // Si hay una imagen en la base de datos, usamos esa. Si no, usamos la de respaldo (fallback)
  const imagenHero = dbComunidad?.imagen_url || info.fallbackImage;

  // 1. EVENTOS: Trae los de la comunidad y los generales
  const { data: eventos } = await supabase
    .from("eventos")
    .select("*")
    .in("comunidad_slug", [slug, "general"])
    .eq("estado", "proximo")
    .eq("aprobado", true)
    .order("fecha_inicio", { ascending: true });

  // 2. NOTICIAS: Trae SOLO las de esta comunidad específica
  const { data: noticias } = await supabase
    .from("noticias")
    .select("*")
    .eq("comunidad_slug", slug) 
    .order("creado_en", { ascending: false });

  // 3. RECUERDOS: Trae SOLO los de esta comunidad específica
  const { data: recuerdos } = await supabase
    .from("publicaciones")
    .select("*")
    .eq("comunidad_slug", slug)
    .order("creado_en", { ascending: false });

  return (
    <main className="min-h-screen flex flex-col bg-real-black">
      <Navbar />

      {/* HERO DE LA COMUNIDAD */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* 🪄 APLICAMOS LA IMAGEN DINÁMICA AQUÍ */}
          <Image src={imagenHero} alt={info.nombre} fill className="object-cover object-center opacity-40" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-real-black via-real-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-real-black via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-start">
          <Link href="/#comunidades" className="inline-flex items-center bg-black/50 hover:bg-black/80 backdrop-blur-md text-gray-300 hover:text-white px-5 py-2.5 rounded-full mb-6 md:mb-8 transition-all border border-white/10 text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Volver a Comunidades
          </Link>
          <h1 className="font-serif text-4xl md:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl leading-tight">{info.nombre}</h1>
          <p className="text-gray-300 text-base md:text-xl leading-relaxed max-w-2xl border-l-2 border-real-purple pl-4">{info.descripcion}</p>
        </div>
      </section>

      {/* 1. SECCIÓN DE NOTICIAS / PUBLICACIONES */}
      <section className="py-12 md:py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <Megaphone className="text-real-purple" size={28} />
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-white">Publicaciones</h2>
          <div className="h-px flex-grow bg-gradient-to-r from-white/20 to-transparent"></div>
        </div>

        {!noticias || noticias.length === 0 ? (
           <div className="text-center py-10 bg-real-dark rounded-3xl border border-white/5">
             <p className="text-gray-500">No hay publicaciones recientes.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.map((noticia) => (
              <Link href={`/noticias/${noticia.id}`} key={noticia.id} className="group bg-real-dark border border-white/10 rounded-2xl overflow-hidden hover:border-real-purple/50 transition-all flex flex-col hover:-translate-y-1 shadow-lg">
                {noticia.imagen_url && (
                  <div className="w-full h-48 md:h-56 relative overflow-hidden bg-black/50">
                    <img src={noticia.imagen_url} alt={noticia.titulo} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 select-none" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-real-gold bg-real-gold/10 px-2 py-1 rounded-md">
                      {noticia.comunidad_slug === 'general' ? 'General' : 'Comunidad'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(noticia.creado_en).toLocaleDateString('es-ES', { timeZone: 'America/Santo_Domingo', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white mb-2 leading-tight line-clamp-2">{noticia.titulo}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">{noticia.contenido}</p>
                  <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-real-purple text-sm font-semibold group-hover:text-white transition-colors">Leer más →</span>
                    {noticia.pdf_url && <FileText size={16} className="text-real-gold" />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 2. SECCIÓN DE EVENTOS */}
      <section className="py-12 md:py-16 px-6 max-w-7xl mx-auto w-full border-t border-white/5">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-white mb-2">Próximas Actividades</h2>
          <p className="text-gray-400 text-sm md:text-base">Mantente al día con lo que estamos preparando.</p>
        </div>

        {!eventos || eventos.length === 0 ? (
          <div className="text-center py-10 bg-real-dark rounded-3xl border border-white/5">
            <p className="text-gray-500">No hay eventos programados por ahora.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => (
              <div key={evento.id} className="group relative h-[350px] rounded-3xl overflow-hidden border border-white/10 bg-real-dark">
                {evento.cartel_url ? <img src={evento.cartel_url} alt={evento.titulo} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 select-none" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-500">Sin imagen</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 pointer-events-none"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                  <h3 className="font-serif text-xl font-bold text-white mb-2 leading-tight line-clamp-2">{evento.titulo}</h3>
                  <div className="space-y-1 mb-4 text-xs text-gray-300">
                    <div className="flex items-center gap-2"><CalendarDays size={14} className="text-real-purple" /><span>{new Date(evento.fecha_inicio + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span></div>
                    <div className="flex items-center gap-2"><MapPin size={14} className="text-real-purple" /><span>{evento.ubicacion}</span></div>
                  </div>
                  <Link href={`/eventos/${evento.slug}`} className="w-full text-center bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 py-2 rounded-xl font-medium transition-all text-sm">Más Información</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. SECCIÓN DE RECUERDOS */}
      <section className="py-12 md:py-16 px-6 max-w-7xl mx-auto w-full mb-16 border-t border-white/5">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-white">Nuestros Recuerdos</h2>
          <div className="h-px flex-grow bg-gradient-to-r from-white/20 to-transparent"></div>
        </div>
        
        <CommunityFeed publicaciones={recuerdos || []} />
      </section>

      <Footer />
    </main>
  );
}