import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareButton from "@/components/ShareButton";
import { CalendarDays, MapPin, Clock, ArrowLeft, MessageCircle, Navigation } from "lucide-react";
import { notFound } from "next/navigation";

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const buscarPorId = isUUID(slug);
  
  const { data: evento } = await supabase
    .from("eventos")
    .select("titulo, descripcion, cartel_url")
    .eq(buscarPorId ? "id" : "slug", slug)
    .maybeSingle(); 

  if (!evento) return { title: "Evento no encontrado" };

  return {
    title: `${evento.titulo} | Real Sacerdocio`,
    description: evento.descripcion,
    openGraph: {
      title: evento.titulo,
      description: evento.descripcion,
      images: evento.cartel_url ? [evento.cartel_url] : [],
    },
  };
}

export default async function EventoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const buscarPorId = isUUID(slug);

  const { data: evento } = await supabase
    .from("eventos")
    .select("*")
    .eq(buscarPorId ? "id" : "slug", slug)
    .maybeSingle();

  if (!evento) {
    notFound();
  }

  const fecha = new Date(evento.fecha_inicio + 'T12:00:00').toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const coordenadasIglesia = "18.44795697205258,-69.01268224147996";
  const esIglesia = evento.ubicacion === "Iglesia Real Sacerdocio";
  
  const googleMapsUrl = esIglesia 
    ? `https://www.google.com/maps/search/?api=1&query=${coordenadasIglesia}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.ubicacion)}`;
    
  const whatsappNumber = "8296512185"; 
  const whatsappMessage = encodeURIComponent(`Hola, vi el evento "${evento.titulo}" en la web de la Iglesia y quiero más información para asistir.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen flex flex-col bg-real-black">
      <Navbar />

      <section className="relative h-[60vh] min-h-[500px] flex items-end justify-center pb-12 pt-24 overflow-hidden">
        
        {/* FONDO CON ANIMACIÓN DE RESPIRACIÓN */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {evento.cartel_url ? (
             // Usamos <img> en lugar de <Image> para evitar el error de configuración
             <img 
               src={evento.cartel_url} 
               alt={evento.titulo} 
               className="absolute inset-0 w-full h-full object-cover object-center"
             />
          ) : (
            <div className="w-full h-full bg-real-dark" />
          )}
          
          <div className="absolute inset-0 bg-black animate-overlay-pulse pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-real-black via-real-black/80 to-transparent pointer-events-none"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Volver al inicio
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-real-purple text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {evento.comunidad_slug}
            </span>
            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-green-500/30">
              {evento.estado === 'proximo' ? 'Próximamente' : 'Finalizado'}
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            {evento.titulo}
          </h1>
        </div>
      </section>

      <section className="relative z-10 py-16 px-6 max-w-6xl mx-auto w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Acerca de este evento</h2>
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                {evento.descripcion}
              </p>
            </div>
            
            <div className="bg-real-dark border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">¿Te gustaría asistir?</h3>
                <p className="text-gray-400 text-sm">Escríbenos y con gusto te daremos más detalles.</p>
              </div>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20b858] text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap w-full md:w-auto justify-center"
              >
                <MessageCircle size={20} />
                Contactar por WhatsApp
              </a>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-real-dark border border-white/10 rounded-3xl p-8 sticky top-28 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Información del Evento</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-real-purple/20 p-3 rounded-xl">
                    <CalendarDays className="text-real-purple" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Fecha</p>
                    <p className="text-white font-medium capitalize">{fecha}</p>
                    {evento.fecha_fin && (
                       <p className="text-gray-500 text-sm mt-1">
                         Hasta el {new Date(evento.fecha_fin + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                       </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-real-purple/20 p-3 rounded-xl">
                    <Clock className="text-real-purple" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Hora</p>
                    <p className="text-white font-medium">{evento.hora}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-real-purple/20 p-3 rounded-xl">
                    <MapPin className="text-real-purple" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Ubicación</p>
                    <p className="text-white font-medium mb-2">{evento.ubicacion}</p>
                    <a 
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-real-purple hover:text-white text-sm font-medium transition-colors"
                    >
                      <Navigation size={14} /> Cómo llegar
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                <ShareButton titulo={evento.titulo} />
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}