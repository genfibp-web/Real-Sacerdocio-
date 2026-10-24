"use client";

import { useState, useEffect } from "react";
import { BadgeCheck, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Paleta de colores para asignar a las comunidades automáticamente
const colores = [
  "text-real-gold", "text-blue-400", "text-pink-400", 
  "text-green-400", "text-purple-400", "text-orange-400", 
  "text-teal-400", "text-red-400"
];

export default function PublicationCard({ noticia }: { noticia: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comunidad, setComunidad] = useState({ nombre: "Real Sacerdocio", color: "text-real-gold" });

  useEffect(() => {
    const fetchComunidad = async () => {
      if (!noticia.comunidad_slug || noticia.comunidad_slug === 'general') return;

      // Buscamos el nombre real en la base de datos
      const { data } = await supabase
        .from('comunidades')
        .select('nombre')
        .eq('slug', noticia.comunidad_slug)
        .single();

      if (data) {
        // Asignamos un color basado en el texto (para que siempre sea el mismo color)
        const colorIndex = data.nombre.length % colores.length;
        setComunidad({ nombre: data.nombre, color: colores[colorIndex] });
      }
    };
    fetchComunidad();
  }, [noticia.comunidad_slug]);

  return (
    <article className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden mb-4 shadow-md hover:border-white/20 transition-all">
      
      {/* CABECERA */}
      <div className="p-3 md:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm md:text-lg ${comunidad.color}`}>
            {comunidad.nombre.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className={`font-bold text-xs md:text-sm ${comunidad.color}`}>{comunidad.nombre}</p>
              <BadgeCheck size={14} className="text-blue-500 fill-blue-500/20" />
            </div>
            <p className="text-[9px] md:text-[10px] text-gray-500">
              {new Date(noticia.creado_en).toLocaleDateString('es-ES', { timeZone: 'America/Santo_Domingo', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        {noticia.pdf_url && <FileText size={16} className="text-real-gold" />}
      </div>

      {/* TEXTO DE LA PUBLICACIÓN */}
      <div className="px-3 md:px-4 pb-3">
        <h2 className="font-serif text-base md:text-lg font-bold text-white mb-2 leading-snug">{noticia.titulo}</h2>
        
        <p className={`text-gray-300 text-sm leading-relaxed whitespace-pre-line ${isExpanded ? '' : 'line-clamp-3'}`}>
          {noticia.contenido}
        </p>
        
        {noticia.contenido.length > 150 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-real-purple font-semibold text-sm mt-2 hover:text-real-blue transition-colors"
          >
            {isExpanded ? "Ver menos" : "Ver más..."}
          </button>
        )}
      </div>

      {/* IMAGEN */}
      {noticia.imagen_url && (
        <div className="w-full bg-black/50">
          <img 
            src={noticia.imagen_url} 
            alt={noticia.titulo} 
            className="w-full h-auto object-cover" 
          />
        </div>
      )}
    </article>
  );
}