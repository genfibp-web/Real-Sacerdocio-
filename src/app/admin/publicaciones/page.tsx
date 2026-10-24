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

  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    comunidad_slug: "general",
  });
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Obtener usuario
    const { data: { session } } = await supabase.auth.getSession();
    let currentUser = null;
    
    if (session) {
      const { data: perfil } = await supabase.from('perfiles').select('rol, comunidad_slug').eq('id', session.user.id).single();
      currentUser = perfil;
      setUser(perfil);
      
      // Si es líder, inicializamos el form con su comunidad
      if (perfil?.rol === 'lider') {
        setFormData(prev => ({ ...prev, comunidad_slug: perfil.comunidad_slug }));
      }
    }

    // 2. Traer publicaciones (Filtradas si es líder)
    let query = supabase.from('noticias').select('*').order('creado_en', { ascending: false });
    if (currentUser?.rol === 'lider') {
      query = query.eq('comunidad_slug', currentUser.comunidad_slug);
    }
    const { data: pubs } = await query;
    if (pubs) setPublicaciones(pubs);

    // 3. Traer comunidades dinámicamente
    const { data: coms } = await supabase.from('comunidades').select('slug, nombre').order('nombre');
    if (coms) setComunidadesList(coms);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      let imagen_url = "";

      if (imagen) {
        const webpFile = await convertToWebP(imagen);
        const fileName = `pub-${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, webpFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(fileName);
        imagen_url = publicUrl;
      }

      // 🔒 REGLA DE ORO: Si es líder, forzamos su ministerio
      const slugFinal = user?.rol === 'lider' ? user.comunidad_slug : formData.comunidad_slug;

      const { error: dbError } = await supabase.from('noticias').insert([{
        titulo: formData.titulo,
        contenido: formData.contenido,
        comunidad_slug: slugFinal,
        imagen_url: imagen_url || null,
      }]);

      if (dbError) throw dbError;

      // Enviar notificación
      try {
        const comunidadSeleccionada = comunidadesList.find(c => c.slug === slugFinal);
        const nombreComunidad = slugFinal === 'general' ? 'Real Sacerdocio' : (comunidadSeleccionada?.nombre || slugFinal);

        await fetch('/api/notificaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `✅ ${nombreComunidad}`,
            body: `Nueva publicación: ${formData.titulo}`,
            url: `/feed`
          })
        });
      } catch (notifError) {
        console.error("Falló notificación", notifError);
      }

      setFeedback({ type: 'success', message: "Publicación creada exitosamente." });
      setShowForm(false);
      setFormData({ titulo: "", contenido: "", comunidad_slug: user?.rol === 'lider' ? user.comunidad_slug : "general" });
      setImagen(null);
      setPreview(null);
      fetchData();
    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error: " + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta publicación?")) return;
    await supabase.from('noticias').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Publicaciones</h1>
          <p className="text-gray-400">
            {user?.rol === 'lider' ? `Administra las noticias de tu ministerio.` : 'Administra las noticias y avisos de la iglesia.'}
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-real-purple hover:bg-real-blue text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
        >
          <Plus size={18} /> {showForm ? "Cancelar" : "Nueva Publicación"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-white mb-4">Crear Publicación</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Título</label>
              <input type="text" required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-real-purple" placeholder="Ej: Reunión de líderes" />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Contenido</label>
              <textarea required rows={4} value={formData.contenido} onChange={(e) => setFormData({...formData, contenido: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-real-purple" placeholder="Escribe el mensaje..." />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Comunidad / Ministerio</label>
              <select 
                value={formData.comunidad_slug} 
                onChange={(e) => setFormData({...formData, comunidad_slug: e.target.value})} 
                disabled={user?.rol === 'lider'}
                className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-real-purple appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {user?.rol === 'admin' && <option value="general">General (Toda la iglesia)</option>}
                {comunidadesList.map((comunidad) => (
                  <option key={comunidad.slug} value={comunidad.slug}>{comunidad.nombre}</option>
                ))}
              </select>
              {user?.rol === 'lider' && <p className="text-[10px] text-gray-500 mt-1">Solo puedes publicar para tu ministerio asignado.</p>}
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Imagen (Opcional)</label>
              <div className="flex items-center gap-4">
                {preview && <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />}
                <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-white font-medium">
                  <Upload size={18} /> Subir Imagen
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="mt-6 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={20} /> : "Publicar"}
          </button>
        </form>
      )}

      <div className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h3 className="font-bold text-white">Historial de Publicaciones</h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando...</div>
        ) : publicaciones.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No hay publicaciones.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {publicaciones.map((pub) => (
              <div key={pub.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-real-purple/10 text-real-purple rounded-full flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{pub.titulo}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {pub.comunidad_slug} • {new Date(pub.creado_en).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link href={`/admin/publicaciones/editar/${pub.id}`} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Editar publicación">
                    <Edit size={18} />
                  </Link>
                  <button onClick={() => handleDelete(pub.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar publicación">
                    <Trash2 size={18} />
                  </button>
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