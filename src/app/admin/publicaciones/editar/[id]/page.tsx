"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { convertToWebP } from "@/lib/imageUtils";
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle, X, FileText, Upload, Image as ImageIcon, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditarPublicacion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<string>("lider");

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [comunidadSlug, setComunidadSlug] = useState("");
  
  const [imagenActual, setImagenActual] = useState<string | null>(null);
  const [pdfActual, setPdfActual] = useState<string | null>(null);

  const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);
  const [nuevoPdf, setNuevoPdf] = useState<File | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
        if (perfil) setUserRole(perfil.rol);
      }

      // Aquí buscamos la publicación por el ID de la URL
      const { data, error } = await supabase.from('noticias').select('*').eq('id', id).single();
      
      if (data) {
        setTitulo(data.titulo);
        setContenido(data.contenido);
        setComunidadSlug(data.comunidad_slug);
        setImagenActual(data.imagen_url);
        setPdfActual(data.pdf_url);
      } else {
        console.error("No se encontró la publicación", error);
        setFeedback({ type: 'error', message: "No se encontró la publicación en la base de datos." });
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNuevaImagen(e.target.files[0]);
      setPreviewImagen(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImagenUrl = imagenActual;
      let finalPdfUrl = pdfActual;

      if (nuevaImagen) {
        if (imagenActual) {
          const oldFileName = imagenActual.split('/').pop();
          if (oldFileName) await supabase.storage.from('fotos').remove([oldFileName]);
        }

        let fileFinal = nuevaImagen;
        try { fileFinal = await convertToWebP(nuevaImagen); } catch (e) { console.warn("Usando original"); }

        const fileName = `noticia-${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, fileFinal);
        if (uploadError) throw new Error(uploadError.message);

        const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(fileName);
        finalImagenUrl = publicUrl;
      }

      if (nuevoPdf) {
        if (pdfActual) {
          const oldPdfName = pdfActual.split('/').pop();
          if (oldPdfName) await supabase.storage.from('recuerdos').remove([oldPdfName]);
        }

        const pdfName = `documento-${Date.now()}.pdf`;
        const { error: uploadPdfError } = await supabase.storage.from('recuerdos').upload(pdfName, nuevoPdf);
        if (uploadPdfError) throw new Error(uploadPdfError.message);

        const { data: { publicUrl } } = supabase.storage.from('recuerdos').getPublicUrl(pdfName);
        finalPdfUrl = publicUrl;
      }

      const { error } = await supabase.from('noticias').update({
        titulo,
        contenido,
        comunidad_slug: comunidadSlug,
        imagen_url: finalImagenUrl,
        pdf_url: finalPdfUrl
      }).eq('id', id);

      if (error) throw new Error(error.message);

      setFeedback({ type: 'success', message: "Publicación actualizada exitosamente." });
      setTimeout(() => { router.push("/admin/publicaciones"); }, 1500);

    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-real-purple" size={40}/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      <div>
        <Link href="/admin/publicaciones" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Volver a la lista
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Editar Publicación</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Título</label>
          <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Contenido</label>
          <textarea required rows={5} value={contenido} onChange={(e) => setContenido(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple resize-none"></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Comunidad</label>
          <select value={comunidadSlug} onChange={(e) => setComunidadSlug(e.target.value)} disabled={userRole !== 'admin'} className={`w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl appearance-none ${userRole !== 'admin' ? 'opacity-50' : ''}`}>
            <option value="jovenes">Jóvenes</option>
            <option value="caballeros">Caballeros</option>
            <option value="damas">Damas</option>
            <option value="ninos">Niños</option>
            <option value="parejas">Parejas</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
          <label className="text-sm font-medium text-gray-300 block">Imagen Adjunta</label>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-40 h-40 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-black flex items-center justify-center">
               {previewImagen ? (
                 <img src={previewImagen} alt="Preview" className="w-full h-full object-cover" />
               ) : imagenActual ? (
                 <img src={imagenActual} alt="Actual" className="w-full h-full object-cover" />
               ) : (
                 <ImageIcon size={32} className="text-gray-600" />
               )}
            </div>
            <div>
              <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 w-fit">
                <Upload size={16} /> Reemplazar Imagen
                <input type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
              </label>
              <p className="text-xs text-gray-500 mt-2">Si no seleccionas nada, se mantiene la actual.</p>
            </div>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
          <label className="text-sm font-medium text-gray-300 block">Documento PDF</label>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {pdfActual && (
              <a href={pdfActual} target="_blank" rel="noopener noreferrer" className="text-real-purple text-sm flex items-center gap-1 hover:text-white transition-colors bg-real-purple/10 px-3 py-2 rounded-lg">
                <FileText size={16} /> Ver PDF actual
              </a>
            )}
            <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 w-fit">
              <Upload size={16} /> {pdfActual ? "Reemplazar PDF" : "Subir PDF"}
              <input type="file" accept="application/pdf" onChange={(e) => setNuevoPdf(e.target.files ? e.target.files[0] : null)} className="hidden" />
            </label>
            {nuevoPdf && <span className="text-xs text-green-400">{nuevoPdf.name}</span>}
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
          <Link href="/admin/publicaciones" className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancelar</Link>
          <button type="submit" disabled={saving} className="bg-real-purple hover:bg-real-blue text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20}/> Guardar Cambios</>}
          </button>
        </div>
      </form>

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setFeedback(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${feedback.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {feedback.type === 'success' ? <CheckCircle size={32} className="text-green-500" /> : <AlertTriangle size={32} className="text-red-500" />}
              </div>
              <p className="text-gray-300 mb-6">{feedback.message}</p>
              <button onClick={() => setFeedback(null)} className="w-full bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl">Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}