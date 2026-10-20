"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Sermon() {
  const [predica, setPredica] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUltimaPredica = async () => {
      const { data } = await supabase
        .from('predicas')
        .select('*')
        .order('fecha', { ascending: false })
        .limit(1)
        .single();

      if (data) setPredica(data);
      setLoading(false);
    };
    fetchUltimaPredica();
  }, []);

  if (loading) return <div className="py-24 bg-real-dark flex justify-center"><Loader2 className="animate-spin text-real-purple" size={40} /></div>;
  
  if (!predica) return null; // Si no hay prédicas, no muestra la sección

  return (
    <section className="py-24 bg-real-dark relative">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-1/2 relative aspect-video rounded-3xl overflow-hidden group cursor-pointer border border-white/10 shadow-2xl">
           <Image src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=1000&auto=format&fit=crop" alt={predica.titulo} fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
           <a href={predica.video_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20">
                <Play size={32} className="text-white ml-1" fill="white"/>
              </div>
           </a>
        </div>
        <div className="w-full md:w-1/2">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-12 bg-real-gold"></div>
            <p className="text-real-gold font-semibold tracking-wider text-sm uppercase">Último Mensaje</p>
          </div>
          <h3 className="font-serif text-3xl md:text-5xl font-bold mb-2 text-white leading-tight">{predica.titulo}</h3>
          <p className="text-gray-400 text-sm mb-6 uppercase tracking-wider">{predica.predicador} | {new Date(predica.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="text-gray-400 mb-8 leading-relaxed text-lg">
            {predica.descripcion || "Acompáñanos a revivir este poderoso mensaje de la palabra de Dios."}
          </p>
          <a href={predica.video_url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-white font-medium hover:text-real-gold transition-colors">
            Ver este sermón
            <ChevronRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}