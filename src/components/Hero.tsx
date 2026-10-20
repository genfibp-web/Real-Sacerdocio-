import Image from "next/image";
import Link from "next/link";
import { Play, ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[100dvh] flex flex-col justify-center pt-20 overflow-hidden">
      
      {/* FONDO OPTIMIZADO */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/fondo_grande.webp"
          alt="Altar Real Sacerdocio" 
          fill 
          className="object-cover object-[60%_center] md:object-center"
          priority
        />
        {/* Degradados para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-real-black via-real-black/70 to-black/30 md:hidden"></div>
        <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-real-black via-real-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 flex-grow flex flex-col justify-center mt-10">
        <div className="w-full md:w-3/5 lg:w-1/2 text-left">
          
          <p className="text-real-gold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 font-semibold drop-shadow-md">
            Bienvenido a casa
          </p>
          
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white drop-shadow-2xl leading-[1.1]">
            REAL <br /> SACERDOCIO
          </h1>
          
          {/* Cita bíblica */}
          <div className="border-l-2 border-real-purple pl-4 md:pl-6 mb-10 bg-black/30 md:bg-transparent p-4 md:p-0 rounded-r-xl backdrop-blur-sm md:backdrop-blur-none">
            <p className="text-gray-200 text-sm sm:text-base md:text-xl leading-relaxed italic drop-shadow-lg">
              «Mas vosotros sois linaje escogido, real sacerdocio, nación santa, pueblo adquirido por Dios, para que anunciéis las virtudes de aquel que os llamó de las tinieblas a su luz admirable».
            </p>
            <p className="text-real-gold font-semibold text-xs md:text-sm mt-3 uppercase tracking-wider">
              — 1 Pedro 2:9
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <Link 
              href="#comunidades"
              className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full font-bold text-base md:text-lg transition-all transform hover:scale-105 w-full sm:w-auto shadow-xl"
            >
              Conoce la Iglesia
            </Link>
            <Link 
              href="/predicas"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-full font-bold text-base md:text-lg backdrop-blur-md transition-all transform hover:scale-105 w-full sm:w-auto shadow-lg"
            >
              Ver Prédicas
              <Play size={18} fill="white" />
            </Link>
          </div>
        </div>
      </div>

      {/* Flecha animada hacia abajo */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce cursor-pointer">
        <span className="text-gray-400 text-xs uppercase tracking-widest font-medium">Desliza</span>
        <ChevronDown size={24} className="text-real-gold" />
      </div>
      
    </section>
  );
}