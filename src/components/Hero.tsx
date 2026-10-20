import Image from "next/image";
import Link from "next/link";
import { Play, ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[100dvh] flex flex-col pt-20 overflow-hidden">
      
      {/* FONDO CON MEJOR ENCUADRE PARA MÓVIL */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/fondo_grande.webp"
          alt="Altar Real Sacerdocio" 
          fill 
          // En móvil, subimos un poco la imagen (object-top) para que el texto de la pared se vea más abajo.
          // En PC, la dejamos centrada.
          className="object-cover object-[50%_30%] md:object-center" 
          priority
        />
        
        {/* Degradados: Más oscuro arriba para que resalte el texto de la web, y más claro abajo para ver el altar */}
        <div className="absolute inset-0 bg-gradient-to-b from-real-black via-real-black/60 to-transparent md:hidden"></div>
        <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-real-black via-real-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* CONTENIDO PRINCIPAL (Móvil: Empujado hacia arriba / PC: Centrado a la izquierda) */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 flex-grow flex flex-col justify-start md:justify-center mt-8 md:mt-0">
        
        <div className="w-full md:w-3/5 lg:w-1/2 text-left">
          
          <p className="text-real-gold tracking-[0.3em] uppercase text-[10px] md:text-sm mb-2 md:mb-4 font-semibold drop-shadow-md">
            Bienvenido a casa
          </p>
          
          {/* Tamaño de letra ajustado para que no ocupe toda la pantalla en móvil */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6 text-white drop-shadow-2xl leading-[1.1]">
            REAL <br /> SACERDOCIO
          </h1>
          
          {/* Cita bíblica con un fondo sutil para que resalte sobre la pared */}
          <div className="border-l-2 border-real-purple pl-3 md:pl-6 mb-6 md:mb-10 bg-black/40 md:bg-transparent p-3 md:p-0 rounded-r-xl backdrop-blur-sm md:backdrop-blur-none">
            <p className="text-gray-200 text-xs sm:text-base md:text-xl leading-relaxed italic drop-shadow-lg">
              «Mas vosotros sois linaje escogido, real sacerdocio, nación santa, pueblo adquirido por Dios, para que anunciéis las virtudes de aquel que os llamó de las tinieblas a su luz admirable».
            </p>
            <p className="text-real-gold font-semibold text-[10px] md:text-sm mt-2 uppercase tracking-wider">
              — 1 Pedro 2:9
            </p>
          </div>

          {/* Botones (Un poco más compactos en móvil) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full">
            <Link 
              href="#comunidades"
              className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-lg transition-all transform hover:scale-105 w-full sm:w-auto shadow-xl"
            >
              Conoce la Iglesia
            </Link>
            <Link 
              href="/predicas"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-lg backdrop-blur-md transition-all transform hover:scale-105 w-full sm:w-auto shadow-lg"
            >
              Ver Prédicas
              <Play size={16} fill="white" className="md:w-[18px] md:h-[18px]" />
            </Link>
          </div>
        </div>
      </div>

      {/* FLECHA ANIMADA (Centrada perfectamente) */}
      <div className="relative w-full flex flex-col items-center justify-center pb-6 md:pb-8 z-10 animate-bounce cursor-pointer">
        <span className="text-gray-400 text-[10px] md:text-xs uppercase tracking-widest font-medium mb-1">Desliza</span>
        <ChevronDown size={20} className="text-real-gold md:w-6 md:h-6" />
      </div>
      
    </section>
  );
}