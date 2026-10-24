"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Camera, Loader2, Image as ImageIcon, X, AlertTriangle, CheckCircle, Home, Rss, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminComunidades() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [imagenBienvenida, setImagenBienvenida] = useState<string | null>(null);
  const [avatarGeneral, setAvatarGeneral] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin");
        return;
      }

      const { data: perfil } = await supabase.from('perfiles').select('rol, comunidad_slug').eq('id', session.user.id).single();
      setUser({ ...perfil, id: session.user.id });

      const { data: dbComunidades } = await supabase.from('comunidades').select('*').order('nombre');
      if (dbComunidades) {
        const formatted = dbComunidades.map(db => ({
          slug: db.slug,
          name: db.nombre,
          imagen_url: db.imagen_url || null,
          avatar_url: db.avatar_url || null // <-- Traemos el nuevo campo
        }));
        setComunidades(formatted);
      }

      const { data: configData } = await supabase.from('configuracion').select('valor').eq('clave', 'home_bienvenida').single();
      if (configData) setImagenBienvenida(configData.valor);

      const { data: avatarData } = await supabase.from('configuracion').select('valor').eq('clave', 'general_avatar').single();
      if (avatarData) setAvatarGeneral(avatarData.valor);

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const MAX_WIDTH = 1920;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No se pudo crear el contexto"));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error("Error")); }, "image/webp", 0.8);
      };
      img.onerror = () => reject(new Error("Error al leer la imagen"));
      img.src = objectUrl;
    });
  };

  // 🛠️ Actualizamos para manejar si es avatar o portada
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string, type: 'bienvenida' | 'general_avatar' | 'avatar_comunidad' | 'portada_comunidad') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(`${key}-${type}`);
    try {
      const webpBlob = await convertToWebP(file);
      const fileName = `${key}-${type}-${Date.now()}.webp`;
      
      const { error: uploadError } = await supabase.storage.from('portadas').upload(fileName, webpBlob, { contentType: 'image/webp', cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('portadas').getPublicUrl(fileName);

      if (type === 'bienvenida') {
        await supabase.from('configuracion').upsert({ clave: 'home_bienvenida', valor: publicUrl });
        setImagenBienvenida(publicUrl);
      } else if (type === 'general_avatar') {
        await supabase.from('configuracion').upsert({ clave: 'general_avatar', valor: publicUrl });
        setAvatarGeneral(publicUrl);
      } else if (type === 'avatar_comunidad') {
        await supabase.from('comunidades').update({ avatar_url: publicUrl }).eq('slug', key);
        setComunidades(prev => prev.map(c => c.slug === key ? { ...c, avatar_url: publicUrl } : c));
      } else if (type === 'portada_comunidad') {
        await supabase.from('comunidades').update({ imagen_url: publicUrl }).eq('slug', key);
        setComunidades(prev => prev.map(c => c.slug === key ? { ...c, imagen_url: publicUrl } : c));
      }

      setFeedback({ type: 'success', message: "Imagen actualizada correctamente." });
    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error al subir: " + error.message });
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div className="text-white p-8">Cargando...</div>;
  const isAdmin = user?.rol === 'admin' || user?.rol === 'super_admin';
  const comunidadesVisibles = comunidades.filter(c => isAdmin || c.slug === user?.comunidad_slug);

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-white mb-4">Portada Principal</h2>
            <div className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
              <div className="relative h-40 bg-black/50">
                {imagenBienvenida ? <img src={imagenBienvenida} alt="Bienvenida" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-500"><Home size={32} className="mb-2 opacity-50" /><span className="text-xs">Sin imagen</span></div>}
              </div>
              <div className="p-4 flex items-center justify-between mt-auto">
                <div><h3 className="font-bold text-white text-sm">Sección "Más que una iglesia"</h3><p className="text-[10px] text-gray-500">Foto en la página de inicio.</p></div>
                <label className="cursor-pointer bg-real-gold hover:bg-yellow-500 text-black p-2.5 rounded-xl transition-colors">
                  {uploading === 'home_bienvenida-bienvenida' ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'home_bienvenida', 'bienvenida')} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-white mb-4">Avatar de Real Sacerdocio</h2>
            <div className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
              <div className="relative h-40 bg-black/50 flex items-center justify-center">
                {avatarGeneral ? <img src={avatarGeneral} alt="Avatar General" className="w-24 h-24 rounded-full object-cover border-4 border-real-gold/30" /> : <div className="w-24 h-24 rounded-full bg-real-gold/10 flex items-center justify-center text-real-gold"><Rss size={40} className="opacity-50" /></div>}
              </div>
              <div className="p-4 flex items-center justify-between mt-auto">
                <div><h3 className="font-bold text-white text-sm">Foto en el Feed</h3><p className="text-[10px] text-gray-500">Para publicaciones generales.</p></div>
                <label className="cursor-pointer bg-real-gold hover:bg-yellow-500 text-black p-2.5 rounded-xl transition-colors">
                  {uploading === 'general_avatar-general_avatar' ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'general_avatar', 'general_avatar')} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-serif text-2xl font-bold text-white mb-4">Comunidades y Ministerios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comunidadesVisibles.map((comunidad) => (
            <div key={comunidad.slug} className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden flex flex-col">
              
              {/* PORTADA (Imagen Grande) */}
              <div className="relative h-32 bg-black/50">
                {comunidad.imagen_url ? <img src={comunidad.imagen_url} alt={comunidad.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-500"><ImageIcon size={24} className="mb-1 opacity-50" /><span className="text-xs">Sin portada</span></div>}
              </div>

              <div className="p-4 flex items-start justify-between relative">
                {/* AVATAR (Imagen Pequeña) */}
                <div className="absolute -top-10 left-4">
                  <div className="w-20 h-20 rounded-full border-4 border-real-dark bg-black overflow-hidden relative group">
                    {comunidad.avatar_url ? <img src={comunidad.avatar_url} alt={comunidad.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500"><UserCircle size={32} /></div>}
                    
                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      {uploading === `${comunidad.slug}-avatar_comunidad` ? <Loader2 className="animate-spin text-white" size={20} /> : <Camera className="text-white" size={20} />}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, comunidad.slug, 'avatar_comunidad')} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="ml-24 mt-2">
                  <h3 className="font-bold text-white leading-tight">{comunidad.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{comunidad.slug}</p>
                </div>
                
                {/* BOTÓN CAMBIAR PORTADA */}
                <div className="relative mt-2">
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, comunidad.slug, 'portada_comunidad')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading === `${comunidad.slug}-portada_comunidad`} />
                  <button className="bg-white/5 hover:bg-white/10 text-gray-300 p-2 rounded-lg transition-colors text-xs flex items-center gap-1 border border-white/10">
                    {uploading === `${comunidad.slug}-portada_comunidad` ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} />} Portada
                  </button>
                </div>
              </div>
            </div>
          ))}
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