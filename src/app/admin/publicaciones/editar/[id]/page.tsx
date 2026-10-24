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
  const [feedback, setFeedback] = useState<any>(null);
  const [comunidadesList, setComunidadesList] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({ titulo: "", contenido: "", comunidad_slug: "general" });
  
  // Estados para manejar el arreglo de imágenes
  const [currentImages, setCurrentImages] = useState<string[]>([]); 
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: perfil } = await supabase.from('perfiles').select('rol, comunidad_slug').eq('id', session.user.id).single();
        setUser(perfil);
      }
      const { data: coms } = await supabase.from('comunidades').select('slug, nombre').order('nombre');
      if (coms) setComunidadesList(coms);

      if (params.id) {
        const { data: pub } = await supabase.from('noticias').select('*').eq('id', params.id).single();
        if (pub) {
          setFormData({ titulo: pub.titulo, contenido: pub.contenido, comunidad_slug: pub.comunidad_slug });
          setCurrentImages(pub.imagenes_urls && pub.imagenes_urls.length > 0 ? pub.imagenes_urls : (pub.imagen_url ? [pub.imagen_url] : []));
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...files]);
      setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const finalImageUrls = [...currentImages];
      
      // Subir nuevas imágenes
      for (const file of newFiles) {
        const webpFile = await convertToWebP(file);
        const fileName = `pub-${Date.now()}-${Math.random()}.webp`;
        const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, webpFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(fileName);
        finalImageUrls.push(publicUrl);
      }

      // 🧹 BORRAR FÍSICAMENTE LAS IMÁGENES ELIMINADAS DE SUPABASE STORAGE
      const { data: dbPub } = await supabase.from('noticias').select('imagenes_urls, imagen_url').eq('id', params.id).single();
      
      if (dbPub) {
        const oldUrls = dbPub.imagenes_urls && dbPub.imagenes_urls.length > 0 ? dbPub.imagenes_urls : (dbPub.imagen_url ? [dbPub.imagen_url] : []);
        
        // Buscamos cuáles estaban en la DB pero ya no están en la pantalla
        const urlsToDelete = oldUrls.filter((url: string) => !currentImages.includes(url));

        for (const url of urlsToDelete) {
          const fileName = url.split('/').pop().split('?')[0]; 
          if (fileName) {
            await supabase.storage.from('fotos').remove([fileName]);
          }
        }
      }

      // Actualizar la base de datos
      const slugFinal = user?.rol === 'lider' ? user.comunidad_slug : formData.comunidad_slug;

      const { error: dbError } = await supabase.from('noticias').update({
        titulo: formData.titulo,
        contenido: formData.contenido,
        comunidad_slug: slugFinal,
        imagenes_urls: finalImageUrls, 
        imagen_url: finalImageUrls[0] || null, 
      }).eq('id', params.id);

      if (dbError) throw dbError;

      setFeedback({ type: 'success', message: "Publicación actualizada y archivos eliminados." });
      setTimeout(() => { router.push("/admin/publicaciones"); }, 2000);

    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error al guardar: " + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white p-8">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <Link href="/admin/publicaciones" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Volver a la lista
      </Link>

      <div>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Editar Publicación</h1>
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
          <select value={formData.comunidad_slug} onChange={(e) => setFormData({...formData, comunidad_slug: e.target.value})} disabled={user?.rol === 'lider'} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple outline-none disabled:opacity-50">
            {user?.rol === 'admin' && <option value="general">General (Toda la iglesia)</option>}
            {comunidadesList.map((comunidad) => <option key={comunidad.slug} value={comunidad.slug}>{comunidad.nombre}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1">Imágenes Actuales y Nuevas</label>
          <div className="flex flex-wrap gap-3 mb-3">
            
            {/* Imágenes existentes en la BD */}
            {currentImages.map((img, i) => (
              <div key={`current-${i}`} className="w-24 h-24 rounded-lg overflow-hidden border border-white/10 relative group">
                <img src={img} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setCurrentImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={24}/>
                  <span className="text-[9px] text-white font-medium mt-1">Eliminar</span>
                </button>
              </div>
            ))}
            
            {/* Nuevas imágenes (Aún no subidas a la BD) */}
            {newPreviews.map((preview, i) => (
              <div key={`new-${i}`} className="w-24 h-24 rounded-lg overflow-hidden border border-blue-500/50 relative group">
                <img src={preview} className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 bg-blue-500 text-white text-[8px] px-1 rounded">Nueva</span>
                <button type="button" onClick={() => {
                  setNewFiles(prev => prev.filter((_, idx) => idx !== i));
                  setNewPreviews(prev => prev.filter((_, idx) => idx !== i));
                }} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={24}/>
                  <span className="text-[9px] text-white font-medium mt-1">Quitar</span>
                </button>
              </div>
            ))}

            {/* Botón para añadir más */}
            <label className="cursor-pointer w-24 h-24 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-gray-400 transition-colors">
              <Upload size={20} />
              <span className="text-[10px] mt-1">Añadir</span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <p className="text-[10px] text-gray-500">Nota: Si eliminas una foto de aquí y guardas los cambios, se borrará permanentemente de la base de datos.</p>
        </div>

        {/* 🛠️ BOTONES DE ACCIÓN */}
        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
          <Link 
            href="/admin/publicaciones" 
            className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="bg-real-purple hover:bg-real-blue text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={20} /> : "Guardar Cambios"}
          </button>
        </div>
      </form>

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setFeedback(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <button onClick={() => setFeedback(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${feedback.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {feedback.type === 'success' ? <CheckCircle size={32} className="text-green-500" /> : <AlertTriangle size={32} className="text-red-500" />}
              </div>
              <p className="text-gray-400 mb-6">{feedback.message}</p>
              <button onClick={() => setFeedback(null)} className="w-full bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-medium">Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}