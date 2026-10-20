"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FeaturedEventSlider() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchEventos = async () => {
      const { data } = await supabase
        .from("eventos")
        .select("*")
        .eq("estado", "proximo")
        .eq("aprobado", true)
        .eq("destacado", true) // <-- FILTRO VITAL: Solo los destacados
        .order("fecha_inicio", { ascending: true })
        .limit(3);

      if (data && data.length > 0) setEventos(data);
    };
    fetchEventos();
  }, []);

  useEffect(() => {
    if (eventos.length <= 1) return; 

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % eventos.length);
    }, 3000); 

    return () => clearInterval(interval);
  }, [eventos]);

  // Si no hay eventos destacados, no muestra nada en el banner
  if (eventos.length === 0) return null; 

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-12 mt-auto">
      <div className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-w-4xl relative">
        
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {eventos.map((evento) => (
            <div 
              key={evento.id} 
              className="w-full flex-shrink-0 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="bg-real-purple/20 p-3 rounded-xl hidden md:block">
                  <CalendarDays className="text-real-purple" size={28} />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-real-gold text-xs font-bold uppercase tracking-wider mb-1">
                    Próximo Gran Evento
                  </p>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-white line-clamp-1">
                    {evento.titulo}
                  </h3>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-400 mt-1">
                    <span>{new Date(evento.fecha_inicio).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}</span>
                    <span>•</span>
                    <span>{evento.ubicacion}</span>
                  </div>
                </div>
              </div>
              
              <Link
                href={`/eventos/${evento.slug}`}
                className="whitespace-nowrap bg-gradient-to-r from-real-purple to-real-blue hover:from-real-blue hover:to-real-purple text-white px-6 py-3 rounded-full font-medium transition-all w-full md:w-auto text-center flex items-center justify-center gap-2"
              >
                Quiero Participar
                <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        {eventos.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            {eventos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "bg-real-purple w-6" : "bg-white/30 w-1.5 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}