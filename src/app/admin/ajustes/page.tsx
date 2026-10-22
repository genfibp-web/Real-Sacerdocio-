"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { convertToWebPAvatar } from "@/lib/imageUtils"; 
import { Camera, Loader2, UserCircle, CheckCircle, AlertTriangle, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminAjustes() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewImage, setViewImage] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin");
        return;
      }

      const { data: perfil } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (perfil) setUser({ ...perfil, email: session.user.email });
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const getFileNameFromUrl = (url: string) => {
    if (!url) return null;
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.split('?')[0]; 
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // 1. Convertir y recortar (800x800)
      const webpFile = await convertToWebPAvatar(file, 800, 0.9);
      const fileName = `avatar-${user.id}-${Date.now()}.webp`;
      
      // 2. Subir al nuevo bucket 'perfiles'
      const { error: uploadError } = await supabase.storage
        .from('perfiles') // <-- CAMBIADO AQUÍ
        .upload(fileName, webpFile, { contentType: 'image/webp', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('perfiles').getPublicUrl(fileName); // <-- CAMBIADO AQUÍ

      // 3. Borrar la anterior del bucket 'perfiles'
      if (user.avatar_url) {
        const oldFileName = getFileNameFromUrl(user.avatar_url);
        if (oldFileName) {
          const { error: removeError } = await supabase.storage.from('perfiles').remove([oldFileName]); // <-- CAMBIADO AQUÍ
          if (removeError) console.error("Error al borrar foto anterior:", removeError);
        }
      }

      // 4. Guardar en la DB
      const { error: dbError } = await supabase
        .from('perfiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (dbError) throw dbError;

      setUser({ ...user, avatar_url: publicUrl });
      setFeedback({ type: 'success', message: "Foto actualizada (800x800px)." });
      
      window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { newUrl: publicUrl } }));

    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error al subir la foto: " + error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user || !user.avatar_url) return;
    setUploading(true);

    try {
      // 1. Borrar del bucket 'perfiles'
      const fileName = getFileNameFromUrl(user.avatar_url);
      if (fileName) {
        const { error: removeError } = await supabase.storage.from('perfiles').remove([fileName]); // <-- CAMBIADO AQUÍ
        if (removeError) throw new Error("No se pudo borrar el archivo físico: " + removeError.message);
      }

      // 2. Borrar de la DB
      const { error: dbError } = await supabase
        .from('perfiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (dbError) throw dbError;

      setUser({ ...user, avatar_url: null });
      setFeedback({ type: 'success', message: "Foto de perfil eliminada correctamente." });

      window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { newUrl: null } }));

    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error al eliminar: " + error.message });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-white p-8">Cargando ajustes...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 relative">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Mi Perfil</h1>
        <p className="text-gray-400">Administra tu información personal y tu foto de perfil.</p>
      </div>

      <div className="bg-real-dark border border-white/10 rounded-3xl p-8 flex flex-col items-center">
        
        <div className="relative group mb-6">
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt="Avatar" 
              onClick={() => setViewImage(true)}
              className="w-32 h-32 rounded-full object-cover border-4 border-real-purple shadow-2xl cursor-pointer hover:opacity-80 transition-opacity" 
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-real-purple flex items-center justify-center text-5xl font-bold text-white border-4 border-white/10 shadow-2xl">
              {user?.nombre?.charAt(0).toUpperCase() || "L"}
            </div>
          )}
          
          <label className="absolute bottom-0 right-0 bg-real-gold hover:bg-yellow-500 text-black p-3 rounded-full cursor-pointer transition-colors shadow-lg">
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        <h2 className="text-2xl font-bold text-white">{user?.nombre}</h2>
        <p className="text-gray-400 capitalize">{user?.rol === 'admin' ? 'Administrador' : `Líder de ${user?.comunidad_slug}`}</p>
        <p className="text-sm text-gray-500 mt-1">{user?.email}</p>

        <div className="w-full mt-8 pt-8 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <UserCircle className="text-real-purple" size={24} />
              <div>
                <p className="text-sm font-medium text-white">Foto de Perfil</p>
                <p className="text-xs text-gray-500">Se recorta a 800x800px y se guarda en la carpeta 'perfiles'.</p>
              </div>
            </div>
            {user?.avatar_url && (
              <button onClick={handleDeleteAvatar} disabled={uploading} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar foto">
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {viewImage && user?.avatar_url && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setViewImage(false)}>
          <button className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full" onClick={() => setViewImage(false)}><X size={24} /></button>
          <img src={user.avatar_url} alt="Foto" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

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