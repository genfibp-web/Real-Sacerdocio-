"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { convertToWebP } from "@/lib/imageUtils";
import { Upload, Loader2, Image as ImageIcon, Heart, Trash2, Plus, ArrowLeft, CheckCircle, AlertTriangle, X, Edit } from "lucide-react";
import Link from "next/link";

export default function GaleriaAdmin() {
  const [loading, setLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("lider");
  const [comunidadSlug, setComunidadSlug] = useState("");

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [portada, setPortada] = useState<File | null>(null);
  const [previewPortada, setPreviewPortada] = useState<string | null>(null);
  const [fotos, setFotos] = useState<FileList | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [postToDelete, setPostToDelete] = useState<any | null>(null);

  const fetchUserAndPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: perfil } = await supabase.from('perfiles').select('rol, comunidad_slug').eq('id', user.id).single();
      if (perfil) {
        setUserRole(perfil.rol);
        const currentSlug = perfil.rol === 'admin' ? 'jovenes' : perfil.comunidad_slug;
        setComunidadSlug(currentSlug);

        let query = supabase.from('publicaciones').select('*').order('creado_en', { ascending: false });
        if (perfil.rol !== 'admin') {
          query = query.eq('comunidad_slug', perfil.comunidad_slug);
        }
        const { data } = await query;
        if (data) setPublicaciones(data);
      }
    }
  };

  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPortada(e.target.files[0]);
      setPreviewPortada(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portada) return setFeedback({ type: 'error', message: "Debes subir una portada." });
    setLoading(true);
    setIsConverting(true);

    try {
      let portadaFinal = portada;
      try {
        portadaFinal = await convertToWebP(portada);
      } catch (e) {
        console.warn("No se pudo convertir la portada a WebP, usando original.", e);
      }

      const portadaExt = portadaFinal.name.split('.').pop()?.toLowerCase() || "jpg";
      const portadaName = `portada-${Date.now()}-${Math.random().toString(36).substring(7)}.${portadaExt}`;
      
      const { error: uploadPortadaError } = await supabase.storage.from('recuerdos').upload(portadaName, portadaFinal);
      if (uploadPortadaError) throw new Error("Error al subir portada: " + uploadPortadaError.message);
      
      const { data: { publicUrl: urlPortada } } = supabase.storage.from('recuerdos').getPublicUrl(portadaName);

      const urlsFotos: string[] = [];
      if (fotos && fotos.length > 0) {
        for (let i = 0; i < fotos.length; i++) {
          const file = fotos[i];
          let fileFinal = file;
          
          try {
            fileFinal = await convertToWebP(file);
          } catch (e) {
            console.warn(`No se pudo convertir la foto ${i+1}, usando original.`);
          }

          const fileExt = fileFinal.name.split('.').pop()?.toLowerCase() || "jpg";
          const fileName = `foto-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadFotoError } = await supabase.storage.from('recuerdos').upload(fileName, fileFinal);
          if (uploadFotoError) throw new Error("Error al subir foto: " + uploadFotoError.message);
          
          const { data: { publicUrl } } = supabase.storage.from('recuerdos').getPublicUrl(fileName);
          urlsFotos.push(publicUrl);
        }
      }
      setIsConverting(false);

      const { error } = await supabase.from('publicaciones').insert([{
        comunidad_slug: comunidadSlug,
        titulo,
        descripcion,
        portada_url: urlPortada,
        fotos: urlsFotos,
        likes: 0
      }]);

      if (error) throw new Error("Error en base de datos: " + error.message);

      setFeedback({ type: 'success', message: "¡Publicación creada exitosamente!" });
      setTitulo("");
      setDescripcion("");
      setPortada(null);
      setPreviewPortada(null);
      setFotos(null);
      fetchUserAndPosts();

    } catch (error: any) {
      console.error("Error completo:", error);
      const mensajeError = error?.message || "Ocurrió un fallo al subir las fotos. Verifica tu conexión a internet sea estable.";
      setFeedback({ type: 'error', message: mensajeError });
    } finally {
      setLoading(false);
      setIsConverting(false);
    }
  };

  const openDeleteModal = (post: any) => setPostToDelete(post);

  const confirmDelete = async () => {
    if (!postToDelete) return;
    
    const { id, portada_url, fotos } = postToDelete;
    const fileNamesToDelete = [];
    if (portada_url) fileNamesToDelete.push(portada_url.split('/').pop());
    if (fotos && fotos.length > 0) {
      fotos.forEach((url: string) => fileNamesToDelete.push(url.split('/').pop()));
    }
    
    if (fileNamesToDelete.length > 0) {
      await supabase.storage.from('recuerdos').remove(fileNamesToDelete);
    }

    await supabase.from('publicaciones').delete().eq('id', id);
    setPostToDelete(null); 
    setFeedback({ type: 'success', message: "Publicación eliminada." });
    fetchUserAndPosts();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <div>
        <Link href="/admin/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Volver al Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Feed de Comunidad</h1>
        <p className="text-gray-400">Crea publicaciones con portadas y galerías de fotos para tu comunidad.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 rounded-2xl p-6 space-y-4 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-4">Nueva Publicación</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Comunidad</label>
              <select value={comunidadSlug} onChange={(e) => setComunidadSlug(e.target.value)} disabled={userRole !== 'admin'} className={`w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm ${userRole !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <option value="jovenes">Jóvenes</option>
                <option value="caballeros">Caballeros</option>
                <option value="damas">Damas</option>
                <option value="ninos">Niños</option>
                <option value="general">General</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Título</label>
              <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm" placeholder="Ej: Retiro 2026" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Descripción</label>
              <textarea rows={3} required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm resize-none" placeholder="Resumen del evento..."></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Portada (Obligatoria)</label>
              <input type="file" accept="image/*" required onChange={handlePortadaChange} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-real-purple/20 file:text-real-purple hover:file:bg-real-purple/30 w-full" />
              {previewPortada && <img src={previewPortada} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2" />}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Galería de Fotos (Múltiples)</label>
              <input type="file" accept="image/*" multiple onChange={(e) => setFotos(e.target.files)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/5 file:text-white hover:file:bg-white/10 w-full" />
            </div>

            <button type="submit" disabled={loading || isConverting} className="w-full bg-real-purple hover:bg-real-blue text-white py-2 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50">
              {loading || isConverting ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18}/> Publicar en el Feed</>}
            </button>
            {isConverting && <p className="text-xs text-center text-real-gold mt-2 animate-pulse">Optimizando imágenes a WebP...</p>}
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Publicaciones Recientes</h3>
          {publicaciones.length === 0 ? (
            <div className="bg-real-dark border border-white/5 rounded-2xl p-10 text-center text-gray-500">
              Aún no hay publicaciones en esta comunidad.
            </div>
          ) : (
            publicaciones.map((pub) => (
              <div key={pub.id} className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-48 group">
                <div className="w-full md:w-1/3 h-48 md:h-full relative bg-black/50">
                  {pub.portada_url ? (
                    <img src={pub.portada_url} alt={pub.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500"><ImageIcon size={32} /></div>
                  )}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-real-gold bg-real-gold/10 px-2 py-1 rounded-md mb-2 inline-block">
                        {pub.comunidad_slug}
                      </span>
                      <span className="text-xs text-gray-500">
  {new Date(pub.creado_en).toLocaleDateString('es-ES', { 
    timeZone: 'America/Santo_Domingo', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })}
</span>
                    </div>
                    <h4 className="text-lg font-bold text-white leading-tight mb-1">{pub.titulo}</h4>
                    <p className="text-sm text-gray-400 line-clamp-2">{pub.descripcion}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Heart size={16} className="text-red-500" fill="currentColor" /> {pub.likes} Likes
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md flex items-center gap-1">
                        <ImageIcon size={12} /> {pub.fotos?.length || 0} fotos
                      </span>
                      
                      {/* NUEVO BOTÓN DE EDITAR */}
                      <Link href={`/admin/galeria/editar/${pub.id}`} className="p-1.5 bg-white/5 text-gray-300 hover:bg-white/10 rounded-md transition-colors" title="Editar recuerdo">
                        <Edit size={16} />
                      </Link>

                      <button onClick={() => openDeleteModal(pub)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors" title="Eliminar recuerdo">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* MODAL DE FEEDBACK */}
      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setFeedback(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setFeedback(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${feedback.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {feedback.type === 'success' ? <CheckCircle size={32} className="text-green-500" /> : <AlertTriangle size={32} className="text-red-500" />}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feedback.type === 'success' ? '¡Excelente!' : 'Ha ocurrido un error'}</h3>
              <p className="text-gray-400 mb-6">{feedback.message}</p>
              <button onClick={() => setFeedback(null)} className="w-full bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-medium transition-colors">Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ELIMINACIÓN */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setPostToDelete(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setPostToDelete(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6"><AlertTriangle size={32} className="text-red-500" /></div>
              <h3 className="text-2xl font-bold text-white mb-2">¿Eliminar publicación?</h3>
              <p className="text-gray-400 mb-8">Estás a punto de eliminar <strong className="text-white">"{postToDelete.titulo}"</strong>.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setPostToDelete(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors">Sí, eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}