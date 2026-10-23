import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DailyVerseCard from "@/components/DailyVerseCard"; // <-- 1. IMPORTAMOS EL COMPONENTE
import About from "@/components/About";
import FeaturedEventSlider from "@/components/FeaturedEventSlider";
import CommunityGrid from "@/components/CommunityGrid";
import EventsSlider from "@/components/EventsSlider";
import Sermon from "@/components/Sermon";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Play } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col overflow-hidden bg-real-black">
      <Navbar />
      <Hero />
      
      {/* 2. COLOCAMOS LA TARJETA DEL VERSÍCULO AQUÍ */}
      <DailyVerseCard /> 

      <About />
      
      {/* SECCIÓN DE EVENTO DESTACADO */}
      <section className="py-12 bg-real-black relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center mb-8">
          <h2 className="font-serif text-3xl font-bold text-white mb-2">No te lo pierdas</h2>
          <div className="w-16 h-1 bg-real-purple mx-auto"></div>
        </div>
        <FeaturedEventSlider />
      </section>

      <CommunityGrid />

      {/* NUEVO BOTÓN DE PRÉDICAS */}
      <section className="py-16 md:py-20 bg-real-black relative flex flex-col items-center justify-center border-b border-white/5">
        <div className="text-center mb-6">
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">¿Te perdiste el mensaje?</h3>
          <p className="text-gray-400 text-sm md:text-base">Escucha y revive las prédicas de nuestra iglesia.</p>
        </div>
        <Link 
          href="/predicas"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-real-purple to-real-blue hover:from-real-blue hover:to-real-purple text-white px-8 py-4 md:px-10 md:py-5 rounded-full font-bold text-base md:text-lg transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(76,29,149,0.4)]"
        >
          Ver todas las Prédicas
          <Play size={20} fill="white" />
        </Link>
      </section>

      <EventsSlider />
      <Sermon />
      <Footer />
    </main>
  );
}