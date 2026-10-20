import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Play, Calendar, User, ArrowLeft, Video } from "lucide-react";

export const dynamic = 'force-dynamic';

const getYouTubeThumbnail = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
  }
  return null;
};

export default async function PredicasPage() {
  const { data: predicas } = await supabase
    .from("predicas")
    .select("*")
    .order("fecha", { ascending: false });

  const ultimaPredica = predicas && predicas.length > 0 ? predicas[0] : null;
  const anterioresPredicas = predicas && predicas.length > 1 ? predicas.slice(1) : [];

  const ultimaThumbnail = ultimaPredica ? getYouTubeThumbnail(ultimaPredica.video_url) : null;

  return (
    <main className="min-h-screen flex flex-col bg-real-black">
      <Navbar />

      {/* HERO DE LA PÁGINA */}
      <section className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto w-full text-center">
        <Link href="/" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm text-gray-300 hover:text-white px-5 py-2.5 rounded-full mb-8 transition-all text-sm font-medium group">
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </Link>
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
          Prédicas
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Escucha y revive los mensajes de la Palabra de Dios compartidos en nuestra iglesia.
        </p>
      </section>

      {/* ÚLTIMA PRÉDICA (Destacada Tipo Cine) */}
      {ultimaPredica && (
        <section className="px-6 max-w-7xl mx-auto w-full mb-24">
          <div className="relative bg-real-dark border border-white/10 rounded-[2rem] overflow-hidden flex flex-col lg:flex-row shadow-[0_0_50px_rgba(76,29,149,0.15)]">
            
            <div className="w-full lg:w-3/5 relative aspect-video">
              <a href={ultimaPredica.video_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 group cursor-pointer flex items-center justify-center overflow-hidden">
                {ultimaThumbnail ? (
                  <img src={ultimaThumbnail} alt={ultimaPredica.titulo} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-real-dark to-black"></div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
                <div className="relative z-10 w-24 h-24 bg-real-purple/90 hover:bg-real-blue rounded-full flex items-center justify-center transition-all transform group-hover:scale-110 shadow-[0_0_50px_rgba(76,29,149,0.8)] border border-white/20 backdrop-blur-md">
                  <Play size={40} className="text-white ml-2" fill="white" />
                </div>
              </a>
            </div>

            <div className="w-full lg:w-2/5 p-8 md:p-12 flex flex-col justify-center relative bg-gradient-to-l from-black/50 to-transparent">
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-real-gold text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Último Mensaje
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {ultimaPredica.titulo}
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed text-lg line-clamp-3">
                {ultimaPredica.descripcion || "Acompáñanos a revivir este poderoso mensaje de la palabra de Dios."}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-10">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                  <User size={18} className="text-real-gold" />
                  <span>{ultimaPredica.predicador || "Predicador Invitado"}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                  <Calendar size={18} className="text-real-gold" />
                  <span>{new Date(ultimaPredica.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              <a href={ultimaPredica.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 w-full md:w-fit shadow-lg">
                <Video size={22} className="text-red-600" />
                Ver en YouTube
              </a>
            </div>
          </div>
        </section>
      )}

      {/* PRÉDICAS ANTERIORES */}
      <section className="px-6 max-w-7xl mx-auto w-full flex-grow pb-24">
        {anterioresPredicas.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-10">
              <h3 className="font-serif text-3xl font-bold text-white">Mensajes Anteriores</h3>
              <div className="h-px flex-grow bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {anterioresPredicas.map((predica) => {
                const thumb = getYouTubeThumbnail(predica.video_url);
                return (
                  <a key={predica.id} href={predica.video_url} target="_blank" rel="noopener noreferrer" className="bg-real-dark border border-white/5 rounded-2xl overflow-hidden hover:border-real-purple/50 transition-all duration-300 group flex flex-col h-full hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(76,29,149,0.2)]">
                    <div className="relative aspect-video w-full overflow-hidden">
                      {thumb ? (
                        <img src={thumb} alt={predica.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-black/50 flex items-center justify-center"><Video size={40} className="text-gray-600" /></div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-14 h-14 bg-real-purple rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                          <Play size={24} className="text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar size={14} className="text-real-purple" />
                        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                          {new Date(predica.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="font-serif text-xl font-bold text-white mb-2 leading-tight group-hover:text-real-gold transition-colors line-clamp-2">{predica.titulo}</h4>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{predica.descripcion || "Mensaje de la Palabra de Dios."}</p>
                      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                        <User size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-400 font-medium">{predica.predicador}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </>
        )}

        {(!predicas || predicas.length === 0) && (
          <div className="text-center py-24 bg-real-dark rounded-3xl border border-white/5 flex flex-col items-center">
            <Video size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">Aún no hay prédicas subidas.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}