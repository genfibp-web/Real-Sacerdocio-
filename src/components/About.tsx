import Image from "next/image";

export default function About() {
  return (
    // Redujimos el padding vertical de py-24 a py-12 en móvil
    <section className="py-12 md:py-24 px-6 max-w-7xl mx-auto w-full relative z-10">
      {/* Redujimos el espacio entre imagen y texto de gap-16 a gap-8 en móvil */}
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
        
        {/* La imagen ahora es más baja en móvil (h-64 en vez de h-400) */}
        <div className="w-full md:w-1/2 relative h-64 md:h-[400px] rounded-3xl overflow-hidden border border-white/10">
          <Image 
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1000&auto=format&fit=crop" 
            alt="Comunidad Real Sacerdocio" 
            fill 
            className="object-cover"
          />
        </div>
        
        <div className="w-full md:w-1/2">
          <p className="text-real-purple font-semibold tracking-wider text-xs md:text-sm mb-2 uppercase">Bienvenido a casa</p>
          
          {/* Título un poco más pequeño en móvil */}
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-white leading-tight">
            Más que una iglesia, una familia.
          </h2>
          
          {/* Texto más pequeño y con menos margen inferior */}
          <p className="text-gray-400 mb-4 md:mb-6 leading-relaxed text-sm md:text-lg">
            En Real Sacerdocio creemos en el poder de la comunidad. Somos un lugar donde puedes ser tú mismo, encontrar sanidad, crecer en tu fe y descubrir el propósito que Dios tiene para tu vida.
          </p>
          
          <button className="text-white border-b-2 border-real-purple pb-1 font-medium text-sm md:text-base hover:text-real-purple transition-colors">
            Conoce nuestra historia
          </button>
        </div>
      </div>
    </section>
  );
}