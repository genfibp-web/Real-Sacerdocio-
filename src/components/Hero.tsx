import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Rss } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[100dvh] flex flex-col pt-20 overflow-hidden">
      
      {/* FONDO CON ANIMACIÓN DE RESPIRACIÓN */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* La imagen se queda con brillo completo */}
        <Image 
          src="/fondo_grande.webp"
          alt="Altar Real Sacerdocio" 
          fill 
          className="object-cover object-[50%_30%] md:object-center" 
          priority
        />
        
        {/* 1. CAPA DE OSCURIDAD ANIMADA (Esta es la que respira) */}
        <div className="absolute inset-0 bg-black animate-overlay-pulse pointer-events-none"></div>

        {/* 2. DEGRADADOS ESTÁTICOS (Solo para que el texto se lea bien, más suaves ahora) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 md:hidden pointer-events-none"></div>
        <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-real-black/90 via-real-black/40 to-transparent pointer-events-none"></div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 flex-grow flex flex-col justify-between mt-8 md:mt-0 pb-16 md:pb-24">
        
        {/* Bloque de Texto */}
        <div className="w-full md:w-3/5 lg:w-1/2 text-left mt-10 md:mt-20">
          <p className="text-real-gold tracking-[0.3em] uppercase text-[10px] md:text-sm mb-2 md:mb-4 font-semibold drop-shadow-md">
            Bienvenido a casa
          </p>
          
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6 text-white drop-shadow-2xl leading-[1.1]">
            REAL <br /> SACERDOCIO
          </h1>
          
          <div className="border-l-2 border-real-purple pl-3 md:pl-6 mb-6 md:mb-10 bg-black/40 md:bg-transparent p-3 md:p-0 rounded-r-xl backdrop-blur-sm md:backdrop-blur-none">
            <p className="text-gray-200 text-xs sm:text-base md:text-xl leading-relaxed italic drop-shadow-lg">
              «Mas vosotros sois linaje escogido, real sacerdocio, nación santa, pueblo adquirido por Dios, para que anunciéis las virtudes de aquel que os llamó de las tinieblas a su luz admirable».
            </p>
            <p className="text-real-gold font-semibold text-[10px] md:text-sm mt-2 uppercase tracking-wider">
              — 1 Pedro 2:9
            </p>
          </div>
        </div>

        {/* Botones en la parte inferior */}
        <div className="w-full flex flex-col sm:flex-row items-center md:items-start gap-3 md:gap-4 mt-auto">
          <Link 
            href="#comunidades"
            className="inline-flex items-center justify-center bg-white text-black hover:bg-gray-200 px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-base transition-all transform hover:scale-105 shadow-xl w-auto"
          >
            Conoce la Iglesia
          </Link>
          <Link 
            href="/feed"
            className="inline-flex items-center justify-center gap-2 bg-real-purple hover:bg-real-blue text-white border border-real-purple/50 px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-base transition-all transform hover:scale-105 shadow-lg w-auto"
          >
            Ir al Feed
            <Rss size={16} fill="white" className="md:w-[18px] md:h-[18px]" />
          </Link>
        </div>
      </div>

      {/* Flecha animada */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce cursor-pointer">
        <span className="text-gray-400 text-[9px] md:text-xs uppercase tracking-widest font-medium">Desliza</span>
        <ChevronDown size={16} className="text-real-gold md:w-5 md:h-5" />
      </div>
      
    </section>
  );
}