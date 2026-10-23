"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

export default function DailyVerseCard() {
  const [versiculo, setVersiculo] = useState<any>(null);

  useEffect(() => {
    const fetchHoy = async () => {
      const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' });
      const { data } = await supabase
        .from('versiculos_diarios')
        .select('*')
        .eq('fecha', hoy)
        .single();
      
      if (data) setVersiculo(data);
    };
    fetchHoy();
  }, []);

  if (!versiculo) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 -mt-10 relative z-20">
      <div className="bg-real-dark/90 backdrop-blur-md border border-real-gold/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        
        <div className="p-4 bg-real-gold/10 rounded-2xl text-real-gold shrink-0">
          <BookOpen size={32} />
        </div>

        <div className="flex-grow text-center md:text-left">
          <p className="text-xs text-real-gold font-bold uppercase tracking-wider mb-1">Versículo del Día</p>
          <h3 className="font-serif text-xl font-bold text-white mb-2">{versiculo.cita}</h3>
          <p className="text-gray-400 text-sm line-clamp-2 italic">"{versiculo.texto}"</p>
        </div>

        <Link 
          href={`/versiculo/${versiculo.fecha}`}
          className="bg-white/10 hover:bg-white text-white hover:text-black px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          Ver más <ArrowRight size={18} />
        </Link>

      </div>
    </div>
  );
}