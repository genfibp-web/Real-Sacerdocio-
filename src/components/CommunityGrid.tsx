"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Comunidad = {
  name: string;
  slug: string;
  time: string;
  fallbackImage: string;
  image?: string; 
};

const defaultComunidades: Comunidad[] = [
  { 
    name: "Generación KEHUNAH", 
    slug: "jovenes", 
    time: "Sábados", 
    fallbackImage: "/Kehunah.webp" 
  },
  { 
    name: "Hombres de la Realeza", 
    slug: "caballeros", 
    time: "Martes / Damas y Caballeros", 
    fallbackImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop" 
  },
  { 
    name: "Mujeres de Buena Voluntad", 
    slug: "damas", 
    time: "Martes / Damas y Caballeros", 
    fallbackImage: "/damas.webp" 
  }, 
  { 
    name: "Niños y Adolescentes", 
    slug: "ninos", 
    time: "Los Niños son el Futuro de la Sociedad", 
    fallbackImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop" 
  }, 
  { 
    name: "Ministerio de Parejas", 
    slug: "parejas", 
    time: "La Familia es la Base de la Sociedad", 
    fallbackImage: "/minispareja.webp" 
  },
];

export default function CommunityGrid() {
  const [comunidadesData, setComunidadesData] = useState<Comunidad[]>(
    defaultComunidades.map(c => ({ ...c, image: c.fallbackImage }))
  );

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase.from('comunidades').select('slug, imagen_url');
      
      if (data && data.length > 0) {
        const updated = defaultComunidades.map(comp => {
          const dbItem = data.find(db => db.slug === comp.slug);
          return {
            ...comp,
            image: dbItem?.imagen_url || comp.fallbackImage
          };
        });
        setComunidadesData(updated);
      }
    };
    fetchImages();
  }, []);

  return (
    <section id="comunidades" className="py-12 md:py-24 px-4 md:px-6 bg-real-dark border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-3 md:mb-4 text-white">Nuestras Comunidades</h2>
          <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-real-purple to-real-blue mx-auto mb-4 md:mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-lg">Encuentra tu lugar, crece en fe y comparte en comunidad.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6">
          {comunidadesData.map((comunidad) => (
            <Link 
              key={comunidad.slug} 
              href={`/comunidades/${comunidad.slug}`} 
              // 🛠️ CAMBIO 1: aspect-[3/4] en lugar de h-72 para mantener la proporción de afiche vertical
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-black"
            >
              {/* Fondo borroso para rellenar los bordes */}
              <Image 
                src={comunidad.image || comunidad.fallbackImage} 
                alt="" 
                fill 
                className="object-cover blur-xl opacity-30 scale-110" 
                aria-hidden="true"
              />
              
              {/* Imagen principal con object-contain para que no se corte */}
              <Image 
                src={comunidad.image || comunidad.fallbackImage} 
                alt={comunidad.name} 
                fill 
                // 🛠️ CAMBIO 2: object-contain para que el afiche se vea completo
                className="object-contain transition-transform duration-700 group-hover:scale-105" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-20 pointer-events-none"></div>
              
              <div className="absolute bottom-0 left-0 p-3 md:p-5 w-full z-30">
                <h3 className="font-serif text-lg md:text-xl font-bold text-white mb-1 leading-tight drop-shadow-lg">
                  {comunidad.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-300 text-[10px] md:text-sm font-medium drop-shadow-md line-clamp-1">{comunidad.time}</p>
                  <div className="bg-white/20 backdrop-blur-sm p-1 md:p-1.5 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 md:translate-x-4 group-hover:translate-x-0">
                    <ChevronRight size={14} className="text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}