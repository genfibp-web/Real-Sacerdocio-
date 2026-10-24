"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Loader2, Plus, Trash2, CheckCircle, AlertTriangle, X, Upload, Edit } from "lucide-react";
import { convertToWebP } from "@/lib/imageUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPublicaciones() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [comunidadesList, setComunidadesList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({ titulo: "", contenido: "", comunidad_slug: "general" });
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // 🛠️ FIX: Un solo useEffect que corre al montar la página (sin dependencias)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Obtener usuario
        const { data: { session } } = await supabase.auth.getSession();
        let currentUser = null;
        
        if (session) {
          const { data: perfil } = await supabase.from('perfiles').select('rol, comunidad_slug').eq('id', session.user.id).single();
          currentUser = perfil;
          setUser(perfil);
          if (perfil?.rol === 'lider') {
            setFormData(prev => ({ ...prev, comunidad_slug: perfil.comunidad_slug }));
          }
        }

        // 2. Traer comunidades
        const { data: coms } = await supabase.from('comunidades').select('slug, nombre').order('nombre');
        if (coms) setComunidadesList(coms);

        // 3. Traer publicaciones filtradas por rol
        let query = supabase.from('noticias').select('*').order('creado_en', { ascending: false });
        if (currentUser?.rol === 'lider') {
          query = query.eq('comunidad_slug', currentUser.comunidad_slug);
        }
        
        const { data: pubs } = await query;
        if (pubs) setPublicaciones(pubs);

      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // <-- Array vacío para que solo se ejecute una vez

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImagenes(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of imagenes) {
        const webpFile = await convertToWebP(file);
        const fileName = `pub-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, webpFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }

      const slugFinal = user?.rol === 'lider' ? user.comunidad_slug : formData.comunidad_slug;

      const { error: dbError } = await supabase.from('noticias').insert([{
        titulo: formData.titulo,
        contenido: formData.contenido,
        comunidad_slug: slugFinal,
        imagenes_urls: uploadedUrls,
        imagen_url: uploadedUrls[0] || null,
      }]);

      if (dbError) throw dbError;

      // Notificación
      try {
        const comunidadSeleccionada = comunidadesList.find(c => c.slug === slugFinal);
        const nombreComunidad = slugFinal === 'general' ? 'Real Sacerdocio' : (comunidadSeleccionada?.nombre || slugFinal);

        await fetch('/api/notificaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: `✅ ${nombreComunidad}`, body: `Nueva publicación: ${formData.titulo}`, url: `/feed` })
        });
      } catch (notifError) { console.error("Falló notificación", notifError); }

      setFeedback({ type: 'success', message: "Publicación creada exitosamente." });
      setShowForm(false);
      setFormData({ titulo: "", contenido: "", comunidad_slug: user?.rol === 'lider' ? user.comunidad_slug : "general" });
      setImagenes([]);
      setPreviews([]);
      
      // Recargar solo las publicaciones, sin tocar el usuario
      let query = supabase.from('noticias').select('*').order('creado_en', { ascending: false });
      if (user?.rol === 'lider') query = query.eq('comunidad_slug', user.comunidad_slug);
      const { data: pubs } = await query;
      if (pubs) setPublicaciones(pubs);

    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error: " + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta publicación?")) return;
    await supabase.from('noticias').delete().eq('id', id);
    
    let query = supabase.from('noticias').select('*').order('creado_en', { ascending: false });
    if (user?.rol === 'lider') query = query.eq('comunidad_slug', user.comunidad_slug);
    const { data: pubs } = await query;
    if (pubs) setPublicaciones(pubs);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Publicaciones</h1>
          <p className="text-gray-400">{user?.rol === 'lider' ? `Administra las noticias de tu ministerio.` : 'Administra las noticias y avisos de la iglesia.'}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-real-purple hover:bg-real-blue text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors w-full md:w-auto justify-center">
          <Plus size={18} /> {showForm ? "Cancelar" : "Nueva Publicación"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-white mb-4">Crear Publicación</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Título</label>
              <input type="text" required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-real-purple" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Contenido</label>
              <textarea required rows={4} value={formData.contenido} onChange={(e) => setFormData({...formData, contenido: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-real-purple" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Comunidad / Ministerio</label>
              <select value={formData.comunidad_slug} onChange={(e) => setFormData({...formData, comunidad_slug: e.target.value})} disabled={user?.rol === 'lider'} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none disabled:opacity-50">
                {user?.rol === 'admin' && <option value="general">General (Toda la iglesia)</option>}
                {comunidadesList.map((comunidad) => <option key={comunidad.slug} value={comunidad.slug}>{comunidad.nombre}</option>)}
              </select>
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Imágenes (Puedes subir varias)</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {previews.map((preview, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                    <img src={preview} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full"><X size={12}/></button>
                  </div>
                ))}
                <label className="cursor-pointer w-20 h-20 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-gray-400 transition-colors">
                  <Upload size={20} />
                  <span className="text-[10px] mt-1">Añadir</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="mt-6 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={20} /> : "Publicar"}
          </button>
        </form>
      )}

      <div className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5"><h3 className="font-bold text-white">Historial de Publicaciones</h3></div>
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={20} /> Cargando...
          </div>
        ) : publicaciones.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No hay publicaciones.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {publicaciones.map((pub) => (
              <div key={pub.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-real-purple/10 text-real-purple rounded-full flex items-center justify-center shrink-0"><FileText size={20} /></div>
                  <div>
                    <p className="font-medium text-white">{pub.titulo}</p>
                    <p className="text-xs text-gray-500 capitalize">{pub.comunidad_slug} • {new Date(pub.creado_en).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/publicaciones/editar/${pub.id}`} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit size={18} /></Link>
                  <button onClick={() => handleDelete(pub.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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