import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import FeaturedEventSlider from "@/components/FeaturedEventSlider"; // <-- Lo importamos aquí
import CommunityGrid from "@/components/CommunityGrid";
import EventsSlider from "@/components/EventsSlider";
import Sermon from "@/components/Sermon";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col overflow-hidden bg-real-black">
      <Navbar />
      <Hero />
      <About />
      
      {/* SECCIÓN DE EVENTO DESTACADO (Movido aquí) */}
      <section className="py-12 bg-real-black relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center mb-8">
          <h2 className="font-serif text-3xl font-bold text-white mb-2">No te lo pierdas</h2>
          <div className="w-16 h-1 bg-real-purple mx-auto"></div>
        </div>
        <FeaturedEventSlider />
      </section>

      <CommunityGrid />
      <EventsSlider />
      <Sermon />
      <Footer />
    </main>
  );
}