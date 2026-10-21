"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { convertToWebP } from "@/lib/imageUtils";
import { Plus, Loader2, ArrowLeft, Image as ImageIcon, CheckCircle, AlertTriangle, X, Trash2, FileText } from "lucide-react";
import Link from "next/link";

export default function PublicacionesAdmin() {
  const [loading, setLoading] = useState(false);
  const [noticias, setNoticias] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("lider");
  const [comunidadSlug, setComunidadSlug] = useState("");

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [noticiaToDelete, setNoticiaToDelete] = useState<any | null>(null);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: perfil } = await supabase.from('perfiles').select('rol, comunidad_slug').eq('id', user.id).single();
      if (perfil) {
        setUserRole(perfil.rol);
        const currentSlug = perfil.rol === 'admin' ? 'jovenes' : perfil.comunidad_slug;
        setComunidadSlug(currentSlug);

        let query = supabase.from('noticias').select('*').order('creado_en', { ascending: false });
        if (perfil.rol !== 'admin') query = query.eq('comunidad_slug', perfil.comunidad_slug);
        
        const { data } = await query;
        if (data) setNoticias(data);
      }
    }
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
    setLoading(true);

    try {
      let imagen_url = null;
      let pdf_url = null;

      // 1. Subir Imagen (si existe)
      if (imagen) {
        let fileFinal = imagen;
        try { fileFinal = await convertToWebP(imagen); } catch (e) { console.warn("Usando original"); }
        
        const fileName = `noticia-${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, fileFinal);
        if (uploadError) throw new Error(uploadError.message);
        
        const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(fileName);
        imagen_url = publicUrl;
      }

      // 2. Subir PDF (si existe)
      if (pdfFile) {
        const pdfName = `documento-${Date.now()}.pdf`;
        const { error: uploadPdfError } = await supabase.storage.from('recuerdos').upload(pdfName, pdfFile);
        if (uploadPdfError) throw new Error(uploadPdfError.message);
        
        const { data: { publicUrl } } = supabase.storage.from('recuerdos').getPublicUrl(pdfName);
        pdf_url = publicUrl;
      }

      // 3. Guardar en base de datos
      const { error } = await supabase.from('noticias').insert([{
        comunidad_slug: comunidadSlug,
        titulo,
        contenido,
        imagen_url,
        pdf_url
      }]);

      if (error) throw new Error(error.message);

      setFeedback({ type: 'success', message: "¡Publicación creada exitosamente!" });
      setTitulo("");
      setContenido("");
      setImagen(null);
      setPreview(null);
      setPdfFile(null);
      fetchData();

    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message || "Error al subir la publicación" });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!noticiaToDelete) return;
    if (noticiaToDelete.imagen_url) {
      const fileName = noticiaToDelete.imagen_url.split('/').pop();
      if (fileName) await supabase.storage.from('fotos').remove([fileName]);
    }
    if (noticiaToDelete.pdf_url) {
      const pdfName = noticiaToDelete.pdf_url.split('/').pop();
      if (pdfName) await supabase.storage.from('recuerdos').remove([pdfName]);
    }
    await supabase.from('noticias').delete().eq('id', noticiaToDelete.id);
    setNoticiaToDelete(null);
    setFeedback({ type: 'success', message: "Publicación eliminada." });
    fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <div>
        <Link href="/admin/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Volver al Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Publicaciones de Comunidad</h1>
        <p className="text-gray-400">Comparte noticias, avisos o devocionales con tu comunidad.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULARIO */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 rounded-2xl p-6 space-y-4 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-4">Nueva Publicación</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Comunidad</label>
              <select value={comunidadSlug} onChange={(e) => setComunidadSlug(e.target.value)} disabled={userRole !== 'admin'} className={`w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm ${userRole !== 'admin' ? 'opacity-50' : ''}`}>
                <option value="jovenes">Jóvenes</option>
                <option value="caballeros">Caballeros</option>
                <option value="damas">Damas</option>
                <option value="ninos">Niños</option>
                <option value="general">General</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Título</label>
              <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm" placeholder="Ej: Aviso importante" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Contenido / Mensaje</label>
              <textarea rows={4} required value={contenido} onChange={(e) => setContenido(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm resize-none" placeholder="Escribe aquí..."></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Imagen (Opcional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-real-purple/20 file:text-real-purple w-full" />
              {preview && <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg mt-2" />}
            </div>

            {/* NUEVO CAMPO PARA PDF */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Documento PDF (Opcional)</label>
              <div className="relative">
                <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/5 file:text-white w-full" />
                {pdfFile && <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><FileText size={12}/> {pdfFile.name}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-real-purple hover:bg-real-blue text-white py-2 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 mt-4">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18}/> Publicar</>}
            </button>
          </form>
        </div>

        {/* LISTA */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Publicaciones Recientes</h3>
          {noticias.length === 0 ? (
            <div className="bg-real-dark border border-white/5 rounded-2xl p-10 text-center text-gray-500">Aún no hay publicaciones.</div>
          ) : (
            noticias.map((noticia) => (
              <div key={noticia.id} className="bg-real-dark border border-white/10 rounded-2xl p-4 flex gap-4">
                {noticia.imagen_url && (
                  <img src={noticia.imagen_url} alt={noticia.titulo} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />
                )}
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-real-gold bg-real-gold/10 px-2 py-1 rounded-md mb-2 inline-block">
                      {noticia.comunidad_slug}
                    </span>
                    
                    {/* AQUÍ ESTÁ EL ARREGLO DE LA FECHA */}
                    <span className="text-xs text-gray-500">
                      {new Date(noticia.creado_en).toLocaleDateString('es-ES', { 
                        timeZone: 'America/Santo_Domingo', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white leading-tight mb-1">{noticia.titulo}</h4>
                  <p className="text-sm text-gray-400 line-clamp-2">{noticia.contenido}</p>
                  {noticia.pdf_url && (
                    <span className="inline-flex items-center gap-1 text-xs text-real-purple mt-2 bg-real-purple/10 px-2 py-1 rounded">
                      <FileText size={12} /> PDF Adjunto
                    </span>
                  )}
                </div>
                <button onClick={() => setNoticiaToDelete(noticia)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg self-start">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL DE ELIMINACIÓN */}
      {noticiaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setNoticiaToDelete(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle size={32} className="text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">¿Eliminar publicación?</h3>
              <div className="flex gap-3 w-full mt-4">
                <button onClick={() => setNoticiaToDelete(null)} className="flex-1 bg-white/5 py-2 rounded-xl text-white">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 bg-red-500 py-2 rounded-xl text-white">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FEEDBACK */}
      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setFeedback(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <button onClick={() => setFeedback(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
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