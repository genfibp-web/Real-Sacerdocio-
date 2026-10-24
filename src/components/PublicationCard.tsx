"use client";

import { useState, useEffect, useRef } from "react";
import { BadgeCheck, FileText, ChevronLeft, ChevronRight, X, Share2 } from "lucide-react"; // <-- Agregado Share2
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const COMUNIDADES_CON_PAGINA = ["jovenes", "caballeros", "damas", "ninos", "parejas"];

export default function PublicationCard({ noticia }: { noticia: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); 
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const [comunidad, setComunidad] = useState({
    nombre: "Real Sacerdocio",
    avatar_url: "/logo_Rs.png",
    slug: "general"
  });

  const imagenes = noticia.imagenes_urls && noticia.imagenes_urls.length > 0 
    ? noticia.imagenes_urls 
    : (noticia.imagen_url ? [noticia.imagen_url] : []);

  useEffect(() => {
    const fetchComunidad = async () => {
      if (!noticia.comunidad_slug || noticia.comunidad_slug === 'general') {
        const { data: config } = await supabase.from('configuracion').select('valor').eq('clave', 'general_avatar').single();
        setComunidad({ nombre: "Real Sacerdocio", avatar_url: config?.valor || "/logo_Rs.png", slug: "general" });
        return;
      }
      const { data } = await supabase.from('comunidades').select('nombre, avatar_url, imagen_url, slug').eq('slug', noticia.comunidad_slug).single();
      if (data) {
        setComunidad({
          nombre: data.nombre,
          avatar_url: data.avatar_url || data.imagen_url || "/logo_Rs.png", 
          slug: data.slug
        });
      }
    };
    fetchComunidad();
  }, [noticia.comunidad_slug]);

  const hasPage = COMUNIDADES_CON_PAGINA.includes(comunidad.slug);
  const profileLink = hasPage ? `/comunidades/${comunidad.slug}` : undefined;

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -carouselRef.current.clientWidth, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: carouselRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  // 🆕 FUNCIÓN PARA COMPARTIR
  const handleShare = async () => {
    // Tomamos los primeros 100 caracteres de la descripción para no hacerlo tan largo
    const descripcionCorta = noticia.contenido.substring(0, 100) + (noticia.contenido.length > 100 ? "..." : "");
    
    const shareData = {
      title: `📢 ${noticia.titulo}`,
      text: `${noticia.titulo}\n\n"${descripcionCorta}"\n\nLee la publicación completa en Real Sacerdocio:`,
      url: "https://real-sacerdocio.vercel.app/feed" // URL de tu web
    };

    try {
      if (navigator.share) {
        // Abre el menú nativo del teléfono (WhatsApp, Instagram, etc.)
        await navigator.share(shareData);
      } else {
        // Plan B: Si el navegador no soporta compartir (ej. PC), copia al portapapeles
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
        alert("¡Texto copiado! Ya puedes pegarlo en WhatsApp o donde quieras.");
      }
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  return (
    <>
      <article className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden mb-4 shadow-md hover:border-white/20 transition-all">
        
        {/* CABECERA */}
        <div className="p-3 md:p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2 md:gap-3">
            <Link href={profileLink || "#"} className={hasPage ? "cursor-pointer" : "cursor-default"}>
              <img src={comunidad.avatar_url} alt={comunidad.nombre} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-white/20 bg-black" />
            </Link>
            <div>
              <div className="flex items-center gap-1">
                <Link href={profileLink || "#"} className={`font-bold text-xs md:text-sm ${!hasPage ? 'text-real-gold' : 'text-white hover:text-real-purple transition-colors'} ${!hasPage ? 'cursor-default' : 'cursor-pointer'}`}>
                  {comunidad.nombre}
                </Link>
                <BadgeCheck size={14} className="text-blue-500 fill-blue-500/20" />
              </div>
              <p className="text-[9px] md:text-[10px] text-gray-500">
                {new Date(noticia.creado_en).toLocaleDateString('es-ES', { timeZone: 'America/Santo_Domingo', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          {noticia.pdf_url && <FileText size={16} className="text-real-gold" />}
        </div>

        {/* CONTENIDO */}
        <div className="px-3 md:px-4 pb-3">
          <h2 className="font-serif text-base md:text-lg font-bold text-white mb-2 leading-snug">{noticia.titulo}</h2>
          <p className={`text-gray-300 text-sm leading-relaxed whitespace-pre-line ${isExpanded ? '' : 'line-clamp-3'}`}>{noticia.contenido}</p>
          
          <div className="flex items-center justify-between mt-2">
            {noticia.contenido.length > 150 ? (
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-real-purple font-semibold text-sm hover:text-real-blue transition-colors">
                {isExpanded ? "Ver menos" : "Ver más..."}
              </button>
            ) : <div></div>}

            {/* 🆕 BOTÓN DE COMPARTIR */}
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
            >
              <Share2 size={14} /> Compartir
            </button>
          </div>
        </div>

        {/* 🪄 CARRUSEL DE IMÁGENES */}
        {imagenes.length > 0 && (
          <div className="relative w-full group mt-2">
            
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide bg-black/20"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {imagenes.map((img: string, index: number) => (
                <div key={index} className="w-full flex-shrink-0 snap-center relative">
                  <img 
                    src={img} 
                    alt={`Imagen ${index + 1}`} 
                    className="w-full h-auto cursor-zoom-in" 
                    onClick={() => setSelectedImage(img)} 
                  />
                </div>
              ))}
            </div>

            {/* Flechas de navegación */}
            {imagenes.length > 1 && (
              <>
                <button onClick={scrollLeft} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10 hidden md:flex">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={scrollRight} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10 hidden md:flex">
                  <ChevronRight size={20} />
                </button>
                
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md z-10 pointer-events-none">
                  {imagenes.length} fotos
                </div>
              </>
            )}
          </div>
        )}
      </article>

      {/* 🔍 MODAL AUTO-AJUSTABLE DE IMAGEN */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-2 md:p-8 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X size={28} />
          </button>
          
          <img 
            src={selectedImage} 
            alt="Vista completa" 
            className="w-full h-full object-contain animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
}