import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const comunidades = [
  { 
    name: "Generación KEHUNAH", 
    slug: "jovenes", 
    time: "Sábados", 
    image: "/Kehunah.webp" 
  },
  { 
    name: "Hombres de la Realeza", 
    slug: "caballeros", 
    time: "Martes / Damas y Caballeros", 
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop" 
  },
  { 
    name: "Mujeres de Buena Voluntad", 
    slug: "damas", 
    time: "Martes / Damas y Caballeros", 
    image: "/damas.webp" 
  }, 
  { 
    name: "Niños y Adolescentes", 
    slug: "ninos", 
    time: "Los Niños son el Futuro de la Sociedad", 
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop" 
  },
  { 
    name: "Ministerio de Parejas", 
    slug: "parejas", 
    time: "La Familia es la Base de la Sociedad", 
    image: "/minispareja.webp" 
  },
];

export default function CommunityGrid() {
  return (
    // Redujimos el padding vertical de py-24 a py-12 en móvil y los laterales de px-6 a px-4
    <section id="comunidades" className="py-12 md:py-24 px-4 md:px-6 bg-real-dark border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Redujimos el margen inferior de mb-16 a mb-8 en móvil */}
        <div className="text-center mb-8 md:mb-16">
          {/* Título un poco más pequeño en móvil */}
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-3 md:mb-4 text-white">Nuestras Comunidades</h2>
          <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-real-purple to-real-blue mx-auto mb-4 md:mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-lg">Encuentra tu lugar, crece en fe y comparte en comunidad.</p>
        </div>

        {/* Redujimos el gap (espacio entre tarjetas) de gap-6 a gap-4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          {comunidades.map((comunidad) => (
            <Link 
              key={comunidad.slug} 
              href={`/comunidades/${comunidad.slug}`} 
              // Redujimos la altura de la tarjeta de h-96 a h-72 en móvil y h-80 en PC
              className="group relative h-72 md:h-80 rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-black"
            >
              <Image 
                src={comunidad.image} 
                alt="" 
                fill 
                className="object-cover blur-xl opacity-30 scale-110" 
                aria-hidden="true"
              />
              
              <Image 
                src={comunidad.image} 
                alt={comunidad.name} 
                fill 
                className="object-cover object-center transition-transform duration-700 group-hover:scale-110" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-20 pointer-events-none"></div>
              
              {/* Redujimos el padding interno del texto de p-6 a p-4 */}
              <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full z-30">
                {/* Título de la tarjeta más pequeño en móvil */}
                <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-1 md:mb-2 leading-tight drop-shadow-lg">
                  {comunidad.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-300 text-xs md:text-sm font-medium drop-shadow-md line-clamp-1">{comunidad.time}</p>
                  <div className="bg-white/20 backdrop-blur-sm p-1.5 md:p-2 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 md:translate-x-4 group-hover:translate-x-0">
                    <ChevronRight size={16} className="text-white" />
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