import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import { notFound } from "next/navigation";

export default async function VersiculoPage({ params }: { params: Promise<{ fecha: string }> }) {
  const { fecha } = await params;

  const { data: versiculo } = await supabase
    .from("versiculos_diarios")
    .select("*")
    .eq("fecha", fecha)
    .maybeSingle();

  if (!versiculo) notFound();

  return (
    <main className="min-h-screen bg-real-black text-white pt-24 pb-12 px-6 flex items-center justify-center">
      <div className="max-w-3xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} /> Volver al inicio
        </Link>

        <div className="bg-real-dark border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-real-purple to-real-gold"></div>
          
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-real-gold/10 rounded-full text-real-gold">
              <BookOpen size={40} />
            </div>
          </div>

          <p className="text-center text-gray-400 uppercase tracking-widest text-sm mb-4 font-bold">
            Versículo del Día
          </p>
          
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-center text-white mb-6 leading-tight">
            {versiculo.cita}
          </h1>

          <blockquote className="text-xl md:text-2xl text-center text-real-purple italic mb-10 leading-relaxed">
            "{versiculo.texto}"
          </blockquote>

          <div className="bg-black/30 p-6 md:p-8 rounded-2xl border border-white/5">
            <h3 className="text-real-gold font-bold text-lg mb-3 flex items-center gap-2">
              Reflexión
            </h3>
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">
              {versiculo.mensaje}
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <ShareButton titulo={`Versículo del día: ${versiculo.cita}`} />
          </div>
        </div>
      </div>
    </main>
  );
}