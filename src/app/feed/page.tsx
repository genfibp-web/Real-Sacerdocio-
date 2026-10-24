import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommunityFeed from "@/components/CommunityFeed";
import PublicationCard from "@/components/PublicationCard";
import { ArrowLeft, Megaphone } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function GeneralFeedPage() {
  // Trae TODAS las publicaciones de la iglesia (sin filtros)
  const { data: noticias } = await supabase
    .from("noticias")
    .select("*")
    .order("creado_en", { ascending: false });

  const { data: recuerdos } = await supabase
    .from("publicaciones")
    .select("*")
    .order("creado_en", { ascending: false });

  return (
    <main className="min-h-screen flex flex-col bg-real-black">
      <Navbar />

      <section className="relative pt-24 pb-6 px-6 max-w-3xl mx-auto w-full text-center">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft size={16} className="mr-2" /> Volver al inicio
        </Link>
        <div className="flex justify-center mb-2">
          <Megaphone className="text-real-purple" size={28} />
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          Feed General
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
          Todas las noticias y avisos de la iglesia y sus ministerios.
        </p>
      </section>

      <section className="py-6 px-6 max-w-3xl mx-auto w-full flex-grow">
        {!noticias || noticias.length === 0 ? (
          <div className="text-center py-12 bg-real-dark rounded-2xl border border-white/5 mb-8">
            <p className="text-gray-500">No hay publicaciones por el momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {noticias.map((noticia) => (
              <PublicationCard key={noticia.id} noticia={noticia} />
            ))}
          </div>
        )}
      </section>

      {recuerdos && recuerdos.length > 0 && (
        <section className="py-8 px-6 max-w-7xl mx-auto w-full mb-16 border-t border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">Galería General</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-white/20 to-transparent"></div>
          </div>
          <CommunityFeed publicaciones={recuerdos} />
        </section>
      )}

      <Footer />
    </main>
  );
}