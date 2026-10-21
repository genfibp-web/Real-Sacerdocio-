import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommunityFeed from "@/components/CommunityFeed";
import { ArrowLeft, Megaphone, FileText } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function GeneralFeedPage() {
  const { data: noticias } = await supabase
    .from("noticias")
    .select("*")
    .eq("comunidad_slug", "general")
    .order("creado_en", { ascending: false });

  const { data: recuerdos } = await supabase
    .from("publicaciones")
    .select("*")
    .eq("comunidad_slug", "general")
    .order("creado_en", { ascending: false });

  return (
    <main className="min-h-screen flex flex-col bg-real-black">
      <Navbar />

      {/* ENCABEZADO */}
      <section className="relative pt-24 pb-6 px-6 max-w-7xl mx-auto w-full text-center">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft size={16} className="mr-2" /> Volver al inicio
        </Link>
        <div className="flex justify-center mb-2">
          <Megaphone className="text-real-purple" size={28} />
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          Avisos Generales
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
          Noticias, anuncios y comunicados importantes de toda la iglesia.
        </p>
      </section>

      {/* SECCIÓN DE AVISOS */}
      <section className="py-6 px-6 max-w-7xl mx-auto w-full flex-grow">
        {!noticias || noticias.length === 0 ? (
          <div className="text-center py-12 bg-real-dark rounded-2xl border border-white/5 mb-8">
            <p className="text-gray-500">No hay avisos generales por el momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {noticias.map((noticia) => (
              <Link href={`/noticias/${noticia.id}`} key={noticia.id} className="group bg-real-dark border border-white/10 rounded-2xl overflow-hidden hover:border-real-purple/50 transition-all flex flex-col hover:-translate-y-1 shadow-md">
                {noticia.imagen_url && (
                  // Redujimos la altura de la imagen de h-44 a h-32
                  <div className="w-full h-32 relative overflow-hidden bg-black/50">
                    <img src={noticia.imagen_url} alt={noticia.titulo} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 select-none" />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-real-gold bg-real-gold/10 px-2 py-0.5 rounded">General</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(noticia.creado_en).toLocaleDateString('es-ES', { timeZone: 'America/Santo_Domingo', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {/* Título más pequeño */}
                  <h3 className="font-serif text-base font-bold text-white mb-1.5 leading-tight line-clamp-2">{noticia.titulo}</h3>
                  {/* Descripción limitada a 2 líneas */}
                  <p className="text-gray-400 text-xs line-clamp-2 mb-3 flex-grow">{noticia.contenido}</p>
                  
                  <div className="mt-auto pt-2 border-t border-white/5 flex justify-between items-center">
                    <span className="text-real-purple text-xs font-semibold group-hover:text-white transition-colors">Leer más →</span>
                    {noticia.pdf_url && <FileText size={14} className="text-real-gold" />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN DE GALERÍAS GENERALES */}
      {recuerdos && recuerdos.length > 0 && (
        <section className="py-8 px-6 max-w-7xl mx-auto w-full mb-16 border-t border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">Galería General</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-white/20 to-transparent"></div>
          </div>
          <CommunityFeed publicaciones={recuerdos} />
        </section>
      )}

      <Footer />
    </main>
  );
}