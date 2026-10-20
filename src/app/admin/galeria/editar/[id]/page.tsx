"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { convertToWebP } from "@/lib/imageUtils";
import { Upload, Loader2, ArrowLeft, Image as ImageIcon, X, CheckCircle, AlertTriangle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditarRecuerdo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<string>("lider");
  
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [comunidadSlug, setComunidadSlug] = useState("");
  
  const [portadaActual, setPortadaActual] = useState("");
  const [fotosActuales, setFotosActuales] = useState<string[]>([]);
  
  const [nuevaPortada, setNuevaPortada] = useState<File | null>(null);
  const [previewNuevaPortada, setPreviewNuevaPortada] = useState<string | null>(null);
  const [nuevasFotos, setNuevasFotos] = useState<FileList | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', session.user.id).single();
        if (perfil) setUserRole(perfil.rol);
      }

      const { data } = await supabase.from('publicaciones').select('*').eq('id', id).single();
      if (data) {
        setTitulo(data.titulo);
        setDescripcion(data.descripcion || "");
        setComunidadSlug(data.comunidad_slug);
        setPortadaActual(data.portada_url);
        setFotosActuales(data.fotos || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const removeFotoActual = (indexToRemove: number) => {
    setFotosActuales(fotosActuales.filter((_, index) => index !== indexToRemove));
  };

  const handleNuevaPortada = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNuevaPortada(e.target.files[0]);
      setPreviewNuevaPortada(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalPortada = portadaActual;
      let finalFotos = [...fotosActuales];

      if (nuevaPortada) {
        if (portadaActual) {
          const oldFileName = portadaActual.split('/').pop();
          if (oldFileName) await supabase.storage.from('recuerdos').remove([oldFileName]);
        }
        
        const portadaWebP = await convertToWebP(nuevaPortada);
        const portadaName = `portada-${Date.now()}.webp`;
        await supabase.storage.from('recuerdos').upload(portadaName, portadaWebP);
        const { data: { publicUrl } } = supabase.storage.from('recuerdos').getPublicUrl(portadaName);
        finalPortada = publicUrl;
      }

      const { data: pubOriginal } = await supabase.from('publicaciones').select('fotos').eq('id', id).single();
      if (pubOriginal && pubOriginal.fotos) {
        const fotosBorradas = pubOriginal.fotos.filter((foto: string) => !fotosActuales.includes(foto));
        for (const url of fotosBorradas) {
          const fileName = url.split('/').pop();
          if (fileName) await supabase.storage.from('recuerdos').remove([fileName]);
        }
      }

      if (nuevasFotos && nuevasFotos.length > 0) {
        for (let i = 0; i < nuevasFotos.length; i++) {
          const fileWebP = await convertToWebP(nuevasFotos[i]);
          const fileName = `foto-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
          await supabase.storage.from('recuerdos').upload(fileName, fileWebP);
          const { data: { publicUrl } } = supabase.storage.from('recuerdos').getPublicUrl(fileName);
          finalFotos.push(publicUrl);
        }
      }

      const { error } = await supabase.from('publicaciones').update({
        titulo,
        descripcion,
        comunidad_slug: comunidadSlug,
        portada_url: finalPortada,
        fotos: finalFotos
      }).eq('id', id);

      if (error) throw new Error(error.message);

      setFeedback({ type: 'success', message: "Recuerdo actualizado exitosamente." });
      setTimeout(() => { router.push("/admin/galeria"); }, 1500);

    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error: " + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-real-purple" size={40}/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      <div>
        <Link href="/admin/galeria" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Volver a Recuerdos
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Editar Recuerdo</h1>
        <p className="text-gray-400">Modifica la información o agrega más fotos a este álbum.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Título del Álbum</label>
          <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Descripción</label>
          <textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple resize-none"></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Comunidad</label>
          <select value={comunidadSlug} onChange={(e) => setComunidadSlug(e.target.value)} disabled={userRole !== 'admin'} className={`w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl appearance-none ${userRole !== 'admin' ? 'opacity-50' : ''}`}>
            <option value="jovenes">Jóvenes</option>
            <option value="caballeros">Caballeros</option>
            <option value="damas">Damas</option>
            <option value="ninos">Niños</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
          <label className="text-sm font-medium text-gray-300 block">Portada del Álbum</label>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-40 h-40 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
               <img src={previewNuevaPortada || portadaActual} alt="Portada" className="w-full h-full object-cover" />
            </div>
            <div>
              <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 w-fit">
                <Upload size={16} /> Cambiar Portada
                <input type="file" accept="image/*" onChange={handleNuevaPortada} className="hidden" />
              </label>
              <p className="text-xs text-gray-500 mt-2">Si no seleccionas nada, se mantendrá la actual.</p>
            </div>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300">Galería de Fotos ({fotosActuales.length} actuales)</label>
            <label className="cursor-pointer bg-real-purple/20 hover:bg-real-purple/40 border border-real-purple/30 px-4 py-2 rounded-lg text-sm font-medium text-real-purple flex items-center gap-2">
              <Upload size={16} /> Agregar más fotos
              <input type="file" accept="image/*" multiple onChange={(e) => setNuevasFotos(e.target.files)} className="hidden" />
            </label>
          </div>

          {fotosActuales.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
              {fotosActuales.map((foto, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                  <img src={foto} alt={`Foto ${index}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeFotoActual(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar foto"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {nuevasFotos && nuevasFotos.length > 0 && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
              <CheckCircle size={16} /> {nuevasFotos.length} foto(s) nueva(s) lista(s) para subir al guardar.
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-end items-center gap-4">
          <Link href="/admin/galeria" className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancelar</Link>
          <button type="submit" disabled={saving} className="bg-real-purple hover:bg-real-blue text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={20} /> : "Guardar Cambios"}
          </button>
        </div>
      </form>

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setFeedback(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${feedback.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {feedback.type === 'success' ? <CheckCircle size={32} className="text-green-500" /> : <AlertTriangle size={32} className="text-red-500" />}
              </div>
              <p className="text-gray-400 mb-6">{feedback.message}</p>
              <button onClick={() => setFeedback(null)} className="w-full bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-medium transition-colors">Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}