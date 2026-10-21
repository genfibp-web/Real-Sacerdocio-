"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function EventsSlider() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEventos = async () => {
      const { data } = await supabase
        .from('eventos')
        .select('*')
        .eq('estado', 'proximo')
        .eq('aprobado', true)
        .order('fecha_inicio', { ascending: true });

      if (data) setEventos(data);
      setLoading(false);
    };
    fetchEventos();
  }, []);

  useEffect(() => {
    if (eventos.length <= 1) return; 

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = sliderRef.current;
        const maxScroll = scrollWidth - clientWidth;

        if (scrollLeft >= maxScroll - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Ajustamos el scroll a 320px para coincidir con el nuevo ancho
          sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [eventos]);

  const scrollManual = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-real-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-12 bg-real-purple"></div>
              <p className="text-real-purple font-semibold tracking-wider text-sm uppercase">Calendario</p>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">Próximos Eventos</h2>
          </div>
          
          <div className="hidden md:flex gap-3 mt-6 md:mt-0">
            <button onClick={() => scrollManual('left')} className="p-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-white">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => scrollManual('right')} className="p-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-white">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-real-purple" size={40} /></div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-10 bg-real-dark rounded-2xl border border-white/5">
            <p className="text-gray-400">No hay eventos programados por el momento.</p>
          </div>
        ) : (
          <div 
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 items-start"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {eventos.map((evento) => (
              <div 
                key={evento.id} 
                // Reducimos el ancho de 85vw a 75vw en móvil, y de 340px a 300px en PC
                className="min-w-[75vw] sm:min-w-[300px] md:min-w-[320px] snap-start group flex flex-col rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-real-dark hover:border-real-purple/30 transition-all duration-300"
              >
                {/* 1. SECCIÓN DE LA IMAGEN */}
                <div className="relative w-full overflow-hidden bg-black/50 flex-shrink-0">
                  {evento.cartel_url ? (
                    <img 
                      src={evento.cartel_url} 
                      alt={evento.titulo} 
                      className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-[180px] flex items-center justify-center text-gray-500">Sin imagen</div>
                  )}
                </div>

                {/* 2. SECCIÓN DE TEXTO (Más compacta) */}
                <div className="flex flex-col flex-grow p-4 md:p-5 justify-between bg-real-dark w-full">
                  <div>
                    <div className="mb-2">
                      <span className="bg-real-purple/20 text-real-purple border border-real-purple/30 text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {evento.comunidad_slug}
                      </span>
                    </div>
                    
                    <h3 className="font-serif text-lg md:text-xl font-bold text-white mb-2 leading-tight line-clamp-2">
                      {evento.titulo}
                    </h3>
                    
                    <div className="space-y-1 mb-3 text-[11px] md:text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={12} className="text-real-gold" />
                        <span>{new Date(evento.fecha_inicio + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-real-gold" />
                        <span className="line-clamp-1">{evento.ubicacion}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/eventos/${evento.slug}`}
                    className="w-full text-center bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 py-2 rounded-lg md:rounded-xl font-medium transition-all text-xs md:text-sm mt-auto"
                  >
                    Más Información
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}