import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, CalendarDays, FileText } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function NoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: noticia } = await supabase
    .from("noticias")
    .select("*")
    .eq("id", id)
    .single();

  if (!noticia) notFound();

  const fecha = new Date(noticia.creado_en).toLocaleDateString('es-ES', { 
    timeZone: 'America/Santo_Domingo', 
    day: 'numeric', month: 'long', year: 'numeric' 
  });

  return (
    <main className="min-h-screen flex flex-col bg-real-black">
      <Navbar />

      {/* Hero con Imagen de Fondo (Protegida) */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end justify-center pb-12 pt-24">
        <div className="absolute inset-0 z-0">
          {noticia.imagen_url ? (
            <img 
              src={noticia.imagen_url} 
              alt={noticia.titulo} 
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 pointer-events-none select-none" 
            />
          ) : (
            <div className="w-full h-full bg-real-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-real-black via-real-black/60 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
          <Link href="/#comunidades" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Volver a Comunidades
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-real-purple text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {noticia.comunidad_slug}
            </span>
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <CalendarDays size={14} /> {fecha}
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            {noticia.titulo}
          </h1>
        </div>
      </section>

      {/* Contenido */}
      <section className="relative z-10 py-16 px-6 max-w-4xl mx-auto w-full flex-grow">
        <div className="bg-real-dark border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          
          <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line mb-8">
            {noticia.contenido}
          </p>

          {noticia.pdf_url && (
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Documento Adjunto</h3>
              <a 
                href={noticia.pdf_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-real-purple hover:bg-real-blue text-white px-8 py-4 rounded-xl font-semibold transition-all w-full md:w-auto shadow-lg"
              >
                <FileText size={20} /> Ver Documento (PDF)
              </a>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </main>
  );
}