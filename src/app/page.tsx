import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import CommunityGrid from "@/components/CommunityGrid";
import EventsSlider from "@/components/EventsSlider";
import Sermon from "@/components/Sermon";
import Footer from "@/components/Footer";
import PastorsSection from "@/components/PastorsSection";
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col overflow-hidden bg-real-black">
      <Navbar />
      <Hero />
      <About />
      <CommunityGrid />
      <EventsSlider />
      <Sermon />
      <Footer />
    </main>
  );
}