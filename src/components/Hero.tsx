import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import FeaturedEventSlider from "./FeaturedEventSlider";

export default function Hero() {
  return (
    <section className="relative h-[100dvh] flex flex-col justify-center pt-20">
      
      {/* Fondo */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/fondo_grande.webp"
          alt="Altar Real Sacerdocio" 
          fill 
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-real-black via-real-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-real-black via-transparent to-transparent"></div>
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex-grow flex items-center mt-10">
        <div className="max-w-2xl text-left">
          
          <p className="text-real-gold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 font-semibold">
            Bienvenido a casa
          </p>
          
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-2xl leading-tight">
            REAL <br /> SACERDOCIO
          </h1>
          
          <div className="border-l-2 border-real-purple pl-5 mb-10">
            <p className="text-gray-200 text-base md:text-xl leading-relaxed italic">
              «Mas vosotros sois linaje escogido, real sacerdocio, nación santa, pueblo adquirido por Dios, para que anunciéis las virtudes de aquel que os llamó de las tinieblas a su luz admirable».
            </p>
            <p className="text-real-gold font-semibold text-sm mt-3 uppercase tracking-wider">
              — 1 Pedro 2:9
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="#comunidades"
              className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 w-full sm:w-auto"
            >
              Conoce la Iglesia
            </Link>
            
            {/* BOTÓN CORREGIDO A LA RUTA PÚBLICA */}
            <Link 
              href="/predicas"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg backdrop-blur-md transition-all transform hover:scale-105 w-full sm:w-auto"
            >
              Ver Prédicas
              <Play size={18} fill="white" />
            </Link>
          </div>
        </div>
      </div>

      {/* Slider Dinámico de Eventos */}
      <FeaturedEventSlider />
      
    </section>
  );
}