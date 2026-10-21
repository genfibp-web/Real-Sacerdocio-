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
    time: "Domingos", 
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop" 
  },
  // 👇 NUEVO MINISTERIO
  { 
    name: "Ministerio de Parejas", 
    slug: "parejas", 
    time: "Viernes", 
    image: "/minispareja.webp" 
  },
];

export default function CommunityGrid() {
  return (
    <section id="comunidades" className="py-24 px-6 bg-real-dark border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">Nuestras Comunidades</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-real-purple to-real-blue mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Encuentra tu lugar, crece en fe y comparte en comunidad.</p>
        </div>

        {/* Ajustamos a 3 columnas en lg y 5 en xl para que se vean bien las 5 tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {comunidades.map((comunidad) => (
            <Link 
              key={comunidad.slug} 
              href={`/comunidades/${comunidad.slug}`} 
              className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-black"
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
              
              <div className="absolute bottom-0 left-0 p-6 w-full z-30">
                <h3 className="font-serif text-2xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
                  {comunidad.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-300 text-sm font-medium drop-shadow-md">{comunidad.time}</p>
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <ChevronRight size={18} className="text-white" />
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