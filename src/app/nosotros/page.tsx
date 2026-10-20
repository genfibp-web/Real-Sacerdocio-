import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PastorsSection from "@/components/PastorsSection"; // <-- Importamos a los pastores
import { ArrowLeft, Target, Eye, Heart, Shield, Users, BookOpen } from "lucide-react";

export default function NosotrosPage() {
  return (
    <main className="min-h-screen flex flex-col bg-real-black">
      <Navbar />

      {/* HERO DE LA PÁGINA */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto w-full text-center">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm text-gray-300 hover:text-white px-5 py-2.5 rounded-full mb-8 transition-all text-sm font-medium group"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </Link>
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
          Nosotros
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Conoce más sobre nuestra identidad, nuestra familia y el propósito que nos mueve.
        </p>
      </section>

      {/* SECCIÓN: NUESTRA IDENTIDAD (Cita 1 Pedro 2:9) */}
      <section className="px-6 max-w-5xl mx-auto w-full mb-24 text-center">
        <div className="bg-real-dark border border-real-purple/30 rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-[0_0_50px_rgba(76,29,149,0.1)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-real-purple to-transparent"></div>
          <BookOpen size={48} className="text-real-purple mx-auto mb-8 opacity-80" />
          <blockquote className="font-serif text-2xl md:text-4xl text-white leading-relaxed italic mb-6">
            «Mas vosotros sois linaje escogido, real sacerdocio, nación santa, pueblo adquirido por Dios, para que anunciéis las virtudes de aquel que os llamó de las tinieblas a su luz admirable».
          </blockquote>
          <p className="text-real-gold font-bold tracking-widest uppercase text-sm">
            — 1 Pedro 2:9
          </p>
        </div>
      </section>

      {/* SECCIÓN: QUIÉNES SOMOS (Imagen y Texto) */}
      <section className="px-6 max-w-7xl mx-auto w-full mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden border border-white/10">
            <Image 
              src="/fondo_grande.webp" 
              alt="Real Sacerdocio" 
              fill 
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-12 bg-real-purple"></div>
              <p className="text-real-purple font-semibold tracking-wider text-sm uppercase">Nuestra Familia</p>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Más que una iglesia, un lugar de encuentro.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              En <strong className="text-white">Real Sacerdocio</strong> creemos firmemente que cada persona tiene un propósito divino. Somos una comunidad apasionada por la presencia de Dios, donde buscamos restaurar corazones, formar discípulos y levantar líderes que impacten su entorno.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              No somos un edificio, somos una familia. Un espacio donde puedes ser tú mismo, crecer en tu fe y descubrir el plan perfecto que Dios diseñó para tu vida.
            </p>
          </div>
        </div>
      </section>

      {/* AQUÍ AGREGAMOS A LOS PASTORES */}
      <PastorsSection />

      {/* SECCIÓN: MISIÓN Y VISIÓN */}
      <section className="px-6 max-w-7xl mx-auto w-full mb-24 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Misión */}
          <div className="bg-real-dark border border-white/5 rounded-3xl p-8 md:p-10 hover:border-real-purple/30 transition-colors group">
            <div className="w-16 h-16 bg-real-purple/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target size={32} className="text-real-purple" />
            </div>
            <h3 className="font-serif text-3xl font-bold text-white mb-4">Nuestra Misión</h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              Glorificar a Dios llevando el mensaje de salvación a cada rincón, guiando a las personas a una relación íntima con Cristo y ayudándoles a desarrollar su potencial espiritual a través de la comunidad y el servicio.
            </p>
          </div>

          {/* Visión */}
          <div className="bg-real-dark border border-white/5 rounded-3xl p-8 md:p-10 hover:border-real-blue/30 transition-colors group">
            <div className="w-16 h-16 bg-real-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Eye size={32} className="text-real-blue" />
            </div>
            <h3 className="font-serif text-3xl font-bold text-white mb-4">Nuestra Visión</h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              Ser una iglesia relevante y transformadora, reconocida por su amor genuino, su excelencia en la adoración y por ser un faro de esperanza que impacta nuestra ciudad y nación con los valores del Reino de Dios.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN: VALORES */}
      <section className="px-6 max-w-7xl mx-auto w-full mb-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Nuestros Valores</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-real-purple to-real-blue mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Heart, title: "Amor Genuino", desc: "Amamos a Dios y a las personas sin condiciones." },
            { icon: Shield, title: "Fe Sólida", desc: "Creemos en el poder de la oración y la Palabra." },
            { icon: Users, title: "Comunidad", desc: "Caminamos juntos, apoyándonos y creciendo." },
            { icon: BookOpen, title: "Excelencia", desc: "Damos lo mejor de nosotros para la gloria de Dios." }
          ].map((valor, idx) => (
            <div key={idx} className="bg-real-dark border border-white/5 rounded-2xl p-6 text-center hover:bg-white/5 transition-colors group">
              <div className="w-14 h-14 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:text-real-gold transition-colors">
                <valor.icon size={24} />
              </div>
              <h4 className="text-white font-bold mb-2">{valor.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{valor.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}