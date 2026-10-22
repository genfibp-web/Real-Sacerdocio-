"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { convertToWebP } from "@/lib/imageUtils";
import { Camera, Loader2, UserCircle, CheckCircle, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminAjustes() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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

      if (perfil) {
        setUser({ ...perfil, email: session.user.email });
      }
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // 1. Convertir a WebP
      const webpBlob = await convertToWebP(file);
      const fileName = `avatar-${user.id}-${Date.now()}.webp`;
      
      // 2. Subir la nueva imagen
      const { error: uploadError } = await supabase.storage
        .from('portadas')
        .upload(fileName, webpBlob, {
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Obtener la nueva URL
      const { data: { publicUrl } } = supabase.storage
        .from('portadas')
        .getPublicUrl(fileName);

      // 🗑️ 4. BORRAR LA IMAGEN ANTERIOR DEL STORAGE (Para no ocupar espacio)
      if (user.avatar_url) {
        // Extraemos el nombre del archivo de la URL vieja
        const oldFileName = user.avatar_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('portadas').remove([oldFileName]);
        }
      }

      // 5. Guardar la nueva URL en la base de datos
      const { error: dbError } = await supabase
        .from('perfiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // Actualizamos la vista
      setUser({ ...user, avatar_url: publicUrl });
      setFeedback({ type: 'success', message: "Foto de perfil actualizada y espacio liberado." });
      
    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error al subir la foto: " + error.message });
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
        
        {/* FOTO DE PERFIL */}
        <div className="relative group mb-6">
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt="Avatar" 
              className="w-32 h-32 rounded-full object-cover border-4 border-real-purple shadow-2xl" 
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-real-purple flex items-center justify-center text-5xl font-bold text-white border-4 border-white/10 shadow-2xl">
              {user?.nombre?.charAt(0).toUpperCase() || "L"}
            </div>
          )}
          
          <label className="absolute bottom-0 right-0 bg-real-gold hover:bg-yellow-500 text-black p-3 rounded-full cursor-pointer transition-colors shadow-lg">
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
              disabled={uploading}
            />
          </label>
        </div>

        <h2 className="text-2xl font-bold text-white">{user?.nombre}</h2>
        <p className="text-gray-400 capitalize">{user?.rol === 'admin' ? 'Administrador' : `Líder de ${user?.comunidad_slug}`}</p>
        <p className="text-sm text-gray-500 mt-1">{user?.email}</p>

        <div className="w-full mt-8 pt-8 border-t border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl">
            <UserCircle className="text-real-purple" size={24} />
            <div>
              <p className="text-sm font-medium text-white">Foto de Perfil</p>
              <p className="text-xs text-gray-500">Sube una foto. Se guardará en WebP y la anterior se borrará automáticamente.</p>
            </div>
          </div>
        </div>
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