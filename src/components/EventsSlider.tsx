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
    if (eventos.length <= 2) return; 

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = sliderRef.current;
        const maxScroll = scrollWidth - clientWidth;

        if (scrollLeft >= maxScroll - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderRef.current.scrollBy({ left: 380, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [eventos]);

  const scrollManual = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
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
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {eventos.map((evento) => (
              <div 
                key={evento.id} 
                className="min-w-[85vw] md:min-w-[380px] snap-start group relative h-[450px] rounded-3xl overflow-hidden border border-white/10 bg-real-dark"
              >
                {evento.cartel_url ? (
                  <img 
                    src={evento.cartel_url} 
                    alt={evento.titulo} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-black/50">Sin imagen</div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 pointer-events-none"></div>
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                  <div className="mb-3">
                    <span className="bg-real-purple/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {evento.comunidad_slug}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white mb-3 leading-tight line-clamp-2">
                    {evento.titulo}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <CalendarDays size={16} className="text-real-gold" />
                      {/* AQUÍ ESTÁ EL ARREGLO DE LA ZONA HORARIA */}
                      <span>{new Date(evento.fecha_inicio + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <MapPin size={16} className="text-real-gold" />
                      <span>{evento.ubicacion}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/eventos/${evento.slug}`}
                    className="w-full text-center bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 py-3 rounded-xl font-medium transition-all"
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