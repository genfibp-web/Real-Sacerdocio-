"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Camera, Loader2, Image as ImageIcon, X, AlertTriangle, CheckCircle, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminComunidades() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [imagenBienvenida, setImagenBienvenida] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin");
        return;
      }

      const { data: perfil } = await supabase
        .from('perfiles')
        .select('rol, comunidad_slug')
        .eq('id', session.user.id)
        .single();

      setUser({ ...perfil, id: session.user.id });

      // 🛠️ CAMBIO AQUÍ: Traemos TODAS las comunidades directo de la base de datos
      const { data: dbComunidades } = await supabase
        .from('comunidades')
        .select('*')
        .order('nombre');
      
      if (dbComunidades) {
        // Mapeamos los datos de la DB al formato que usaba tu código
        const formattedComunidades = dbComunidades.map(db => ({
          slug: db.slug,
          name: db.nombre,
          imagen_url: db.imagen_url || null
        }));
        setComunidades(formattedComunidades);
      }

      // Cargar imagen de bienvenida
      const { data: configData } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', 'home_bienvenida')
        .single();
      
      if (configData) setImagenBienvenida(configData.valor);

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
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Error al convertir a WebP"));
          },
          "image/webp",
          0.8
        );
      };
      img.onerror = () => reject(new Error("Error al leer la imagen"));
      img.src = objectUrl;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slug: string, isMainImage = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(slug);
    try {
      const webpBlob = await convertToWebP(file);
      const fileName = `${slug}-${Date.now()}.webp`;
      
      const { error: uploadError } = await supabase.storage
        .from('portadas')
        .upload(fileName, webpBlob, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portadas')
        .getPublicUrl(fileName);

      if (isMainImage) {
        // Guardar en tabla configuracion
        const { error: dbError } = await supabase
          .from('configuracion')
          .upsert({ clave: 'home_bienvenida', valor: publicUrl });
        
        if (dbError) throw dbError;
        setImagenBienvenida(publicUrl);
      } else {
        // Actualizamos el registro existente en la tabla comunidades
        const { error: dbError } = await supabase
          .from('comunidades')
          .update({ imagen_url: publicUrl })
          .eq('slug', slug);

        if (dbError) throw dbError;
        
        setComunidades(prev => prev.map(c => c.slug === slug ? { ...c, imagen_url: publicUrl } : c));
      }

      setFeedback({ type: 'success', message: "Imagen WebP actualizada correctamente." });
    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error al subir: " + error.message });
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div className="text-white p-8">Cargando...</div>;

  const isAdmin = user?.rol === 'admin' || user?.rol === 'super_admin';

  const comunidadesVisibles = comunidades.filter(c => {
    if (isAdmin) return true;
    return c.slug === user?.comunidad_slug;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      
      {/* 🔥 SECCIÓN EXCLUSIVA PARA ADMINS (Imagen de Bienvenida) */}
      {isAdmin && (
        <div>
          <h2 className="font-serif text-2xl font-bold text-white mb-4">Portada Principal</h2>
          <div className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="relative h-48 md:h-auto md:w-1/2 bg-black/50">
              {imagenBienvenida ? (
                <img src={imagenBienvenida} alt="Bienvenida" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <Home size={32} className="mb-2 opacity-50" />
                  <span className="text-xs">Sin imagen (Usando la predeterminada)</span>
                </div>
              )}
            </div>
            <div className="p-6 md:w-1/2 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">Sección "Más que una iglesia"</h3>
                <p className="text-xs text-gray-500 mt-1">Esta foto aparece en la página de inicio pública.</p>
              </div>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'home_bienvenida', true)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading === 'home_bienvenida'}
                />
                <button className="bg-real-gold hover:bg-yellow-500 text-black p-3 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold shadow-lg">
                  {uploading === 'home_bienvenida' ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                  {uploading === 'home_bienvenida' ? "..." : "Cambiar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN DE COMUNIDADES (Ahora dinámica) */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-white mb-4">Portadas de Comunidades y Ministerios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comunidadesVisibles.map((comunidad) => (
            <div key={comunidad.slug} className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden flex flex-col">
              <div className="relative h-48 bg-black/50">
                {comunidad.imagen_url ? (
                  <img src={comunidad.imagen_url} alt={comunidad.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-xs">Sin imagen</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex items-center justify-between mt-auto">
                <div>
                  <h3 className="font-bold text-white">{comunidad.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{comunidad.slug}</p>
                </div>
                
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, comunidad.slug)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading === comunidad.slug}
                  />
                  <button className="bg-real-purple hover:bg-real-blue text-white p-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium">
                    {uploading === comunidad.slug ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                    {uploading === comunidad.slug ? "..." : "Cambiar"}
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