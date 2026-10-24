"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle, X, Upload } from "lucide-react";
import Link from "next/link";
import { convertToWebP } from "@/lib/imageUtils";

export default function EditarPublicacion() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [comunidadesList, setComunidadesList] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    comunidad_slug: "general",
    imagen_url: "",
  });
  
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Obtener perfil del usuario
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: perfil } = await supabase.from('perfiles').select('rol, comunidad_slug').eq('id', session.user.id).single();
        setUser(perfil);
      }

      // 2. Cargar comunidades
      const { data: coms } = await supabase.from('comunidades').select('slug, nombre').order('nombre');
      if (coms) setComunidadesList(coms);

      // 3. Cargar la publicación actual
      if (params.id) {
        const { data: pub } = await supabase.from('noticias').select('*').eq('id', params.id).single();
        if (pub) {
          setFormData({
            titulo: pub.titulo,
            contenido: pub.contenido,
            comunidad_slug: pub.comunidad_slug,
            imagen_url: pub.imagen_url || "",
          });
          if (pub.imagen_url) setPreview(pub.imagen_url);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagen(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImageUrl = formData.imagen_url;

      if (imagen) {
        const webpFile = await convertToWebP(imagen);
        const fileName = `pub-${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, webpFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      // 🔒 REGLA DE ORO: Si es líder, forzamos su ministerio
      const slugFinal = user?.rol === 'lider' ? user.comunidad_slug : formData.comunidad_slug;

      const { error: dbError } = await supabase.from('noticias').update({
        titulo: formData.titulo,
        contenido: formData.contenido,
        comunidad_slug: slugFinal,
        imagen_url: finalImageUrl,
      }).eq('id', params.id);

      if (dbError) throw dbError;

      setFeedback({ type: 'success', message: "Publicación actualizada correctamente." });
      setTimeout(() => { router.push("/admin/publicaciones"); }, 2000);

    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error al guardar: " + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white p-8">Cargando publicación...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <Link href="/admin/publicaciones" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Volver a la lista
      </Link>

      <div>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Editar Publicación</h1>
        <p className="text-gray-400">Modifica los detalles de esta noticia o aviso.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1">Título</label>
          <input type="text" required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple outline-none" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1">Contenido</label>
          <textarea required rows={6} value={formData.contenido} onChange={(e) => setFormData({...formData, contenido: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple outline-none" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1">Comunidad / Ministerio</label>
          <select 
            value={formData.comunidad_slug} 
            onChange={(e) => setFormData({...formData, comunidad_slug: e.target.value})} 
            disabled={user?.rol === 'lider'}
            className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {user?.rol === 'admin' && <option value="general">General (Toda la iglesia)</option>}
            {comunidadesList.map((comunidad) => (
              <option key={comunidad.slug} value={comunidad.slug}>{comunidad.nombre}</option>
            ))}
          </select>
          {user?.rol === 'lider' && <p className="text-[10px] text-gray-500 mt-1">Como líder, no puedes mover esta publicación a otro ministerio.</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1">Imagen (Opcional)</label>
          <div className="flex items-center gap-4">
            {preview && <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-white/10" />}
            <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-xl flex items-center gap-2 text-white font-medium">
              <Upload size={18} /> Cambiar Imagen
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button type="submit" disabled={saving} className="bg-real-purple hover:bg-real-blue text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={20} /> : "Guardar Cambios"}
          </button>
        </div>
      </form>

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setFeedback(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <button onClick={() => setFeedback(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
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