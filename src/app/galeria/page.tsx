import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Camera, ArrowLeft, Download, ChevronDown, Image as ImageIcon } from "lucide-react";

// Para que los cambios se vean al instante
export const dynamic = 'force-dynamic';

export default async function GaleriaPage() {
  // 1. Traemos las publicaciones (álbumes)
  const { data: publicaciones } = await supabase
    .from("publicaciones")
    .select("*")
    .order("creado_en", { ascending: false });

  return (
    <main className="min-h-screen flex flex-col bg-real-black">
      <Navbar />

      {/* HERO DE LA GALERÍA */}
      <section className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto w-full text-center">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Volver al inicio
        </Link>
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
          Galería de Recuerdos
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Explora nuestros álbumes de actividades. Haz clic en cada evento para desplegar las fotos y descargar tus favoritas.
        </p>
      </section>

      {/* CATÁLOGO DESPLEGABLE DE ÁLBUMES */}
      <section className="pb-24 px-6 max-w-6xl mx-auto w-full flex-grow space-y-6">
        {!publicaciones || publicaciones.length === 0 ? (
          <div className="text-center py-20 bg-real-dark rounded-3xl border border-white/5 flex flex-col items-center">
            <Camera size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-500 text-lg">Aún no hay fotos en la galería.</p>
          </div>
        ) : (
          publicaciones.map((pub) => {
            // Juntamos la portada y las fotos en un solo arreglo
            const fotosDelAlbum = [];
            if (pub.portada_url) fotosDelAlbum.push(pub.portada_url);
            if (pub.fotos && pub.fotos.length > 0) fotosDelAlbum.push(...pub.fotos);

            return (
              // El contenedor del acordeón
              <details 
                key={pub.id} 
                className="group bg-real-dark border border-white/10 rounded-3xl overflow-hidden transition-all duration-300 open:border-real-purple/50 open:shadow-[0_10px_40px_rgba(76,29,149,0.15)]"
              >
                {/* El encabezado clicable que abre/cierra */}
                <summary className="flex flex-col md:flex-row md:items-center justify-between p-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Imagen en miniatura de la portada en el encabezado */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden hidden sm:block flex-shrink-0 border border-white/10">
                      {pub.portada_url ? (
                        <img src={pub.portada_url} alt={pub.titulo} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black"><ImageIcon size={24} className="text-gray-600"/></div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-real-gold text-[10px] font-bold uppercase tracking-wider bg-real-gold/10 px-2 py-0.5 rounded">
                          {pub.comunidad_slug}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(pub.creado_en).toLocaleDateString()}</span>
                      </div>
                      <h2 className="font-serif text-2xl font-bold text-white leading-tight">
                        {pub.titulo}
                      </h2>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-1 pr-4">{pub.descripcion}</p>
                    </div>
                  </div>

                  {/* Icono de flecha y contador de fotos */}
                  <div className="flex items-center gap-4 mt-4 md:mt-0 self-end md:self-center">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-300 bg-white/5 px-3 py-1.5 rounded-full">
                      <ImageIcon size={14} /> {fotosDelAlbum.length} fotos
                    </span>
                    <div className="w-8 h-8 rounded-full bg-real-purple/20 flex items-center justify-center group-open:rotate-180 transition-transform duration-300">
                      <ChevronDown size={20} className="text-real-purple" />
                    </div>
                  </div>
                </summary>

                {/* Contenido desplegable: El Mosaico de Fotos */}
                <div className="px-6 pb-6 pt-2 border-t border-white/5">
                  <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4 mt-4">
                    {fotosDelAlbum.map((fotoUrl, index) => (
                      <div 
                        key={index} 
                        className="relative group/img rounded-2xl overflow-hidden break-inside-avoid border border-white/5 bg-black"
                      >
                        <img 
                          src={fotoUrl} 
                          alt={`${pub.titulo} - Foto ${index + 1}`} 
                          className="w-full h-auto object-cover transition-transform duration-700 group-hover/img:scale-105"
                          loading="lazy"
                        />
                        
                        {/* Overlay de descarga al pasar el mouse */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                          <span className="text-white text-[10px] font-bold bg-black/60 px-2 py-1 rounded-md backdrop-blur-md self-end border border-white/10">
                            {index === 0 ? "Portada" : `Foto ${index}`}
                          </span>
                          
                          <a 
                            href={fotoUrl} 
                            download={`${pub.titulo}-Foto-${index}.webp`}
                            className="bg-real-purple hover:bg-real-blue text-white p-2.5 rounded-xl w-fit transition-all self-end shadow-lg transform translate-y-2 group-hover/img:translate-y-0"
                            title="Descargar imagen"
                          >
                            <Download size={20} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            );
          })
        )}
      </section>

      <Footer />
    </main>
  );
}