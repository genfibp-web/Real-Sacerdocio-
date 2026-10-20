import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import FeaturedEventSlider from "./FeaturedEventSlider";

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-between pt-24 pb-8 overflow-hidden">
      
      {/* FONDO OPTIMIZADO */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/fondo_grande.webp"
          alt="Altar Real Sacerdocio" 
          fill 
          className="object-cover object-[60%_center] md:object-center" // En móvil enfoca un poco a la derecha para dejar espacio al texto
          priority
        />
        
        {/* Degradado para Móvil: Oscurece mucho la parte inferior donde va el texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-real-black via-real-black/80 to-black/30 md:hidden"></div>
        
        {/* Degradado para PC: Oscurece fuertemente la izquierda (donde va el texto) y deja ver el altar a la derecha */}
        <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-real-black via-real-black/80 to-transparent"></div>
        
        {/* Degradado sutil general para unificar */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 flex-grow flex items-center mt-10">
        
        {/* Texto alineado a la izquierda, con ancho máximo para que no se estire demasiado en pantallas gigantes */}
        <div className="w-full md:w-3/5 lg:w-1/2 text-left">
          
          <p className="text-real-gold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 font-semibold drop-shadow-md">
            Bienvenido a casa
          </p>
          
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white drop-shadow-2xl leading-[1.1]">
            REAL <br /> SACERDOCIO
          </h1>
          
          {/* Cita bíblica con fondo sutil para mejorar contraste en móviles */}
          <div className="border-l-2 border-real-purple pl-4 md:pl-6 mb-10 bg-black/30 md:bg-transparent p-4 md:p-0 rounded-r-xl backdrop-blur-sm md:backdrop-blur-none">
            <p className="text-gray-200 text-sm sm:text-base md:text-xl leading-relaxed italic drop-shadow-lg">
              «Mas vosotros sois linaje escogido, real sacerdocio, nación santa, pueblo adquirido por Dios, para que anunciéis las virtudes de aquel que os llamó de las tinieblas a su luz admirable».
            </p>
            <p className="text-real-gold font-semibold text-xs md:text-sm mt-3 uppercase tracking-wider">
              — 1 Pedro 2:9
            </p>
          </div>

          {/* Botones (Full width en móvil para fácil toque) */}
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

      {/* SLIDER DE EVENTO (Abajo) */}
      <FeaturedEventSlider />
      
    </section>
  );
}