"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Camera, Loader2, Image as ImageIcon, X, AlertTriangle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminComunidades() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const defaultComunidades = [
    { slug: "jovenes", name: "Generación KEHUNAH" },
    { slug: "caballeros", name: "Hombres de la Realeza" },
    { slug: "damas", name: "Mujeres de Buena Voluntad" },
    { slug: "ninos", name: "Niños y Adolescentes" },
    { slug: "parejas", name: "Ministerio de Parejas" },
  ];

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

      const { data: dbComunidades } = await supabase.from('comunidades').select('*');
      
      const merged = defaultComunidades.map(comp => {
        const dbItem = dbComunidades?.find(db => db.slug === comp.slug);
        return {
          ...comp,
          imagen_url: dbItem?.imagen_url || null
        };
      });
      
      setComunidades(merged);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  // 🪄 FUNCIÓN MÁGICA: Convierte cualquier imagen (JPG, PNG, etc.) a WebP
  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        // Liberamos memoria
        URL.revokeObjectURL(objectUrl);

        // Creamos un lienzo (Canvas)
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // (Opcional) Redimensionar si es una imagen gigante (ej. máximo 1920px de ancho)
        const MAX_WIDTH = 1920;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No se pudo crear el contexto del canvas"));

        // Dibujamos la imagen en el canvas y la exportamos como WebP con 80% de calidad
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Error al convertir a WebP"));
          },
          "image/webp",
          0.8 // Calidad (0.1 a 1.0)
        );
      };

      img.onerror = () => reject(new Error("Error al leer la imagen"));
      img.src = objectUrl;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slug: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(slug);
    try {
      // 1. Convertir la imagen a WebP
      const webpBlob = await convertToWebP(file);
      
      // 2. Nombrar el archivo (forzamos extensión .webp)
      const fileName = `${slug}-${Date.now()}.webp`;
      
      // 3. Subir el Blob a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('portadas')
        .upload(fileName, webpBlob, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false // Evitamos sobrescribir si hay un error
        });

      if (uploadError) throw uploadError;

      // 4. Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('portadas')
        .getPublicUrl(fileName);

      // 5. Guardar en la base de datos (Insert o Update)
      const { error: dbError } = await supabase
        .from('comunidades')
        .upsert({ 
          slug: slug, 
          name: comunidades.find(c => c.slug === slug)?.name,
          imagen_url: publicUrl 
        }, { onConflict: 'slug' });

      if (dbError) throw dbError;

      // Actualizar la vista local
      setComunidades(prev => prev.map(c => c.slug === slug ? { ...c, imagen_url: publicUrl } : c));
      setFeedback({ type: 'success', message: "Imagen convertida a WebP y actualizada correctamente." });
      
    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error al subir: " + error.message });
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div className="text-white p-8">Cargando...</div>;

  const comunidadesVisibles = comunidades.filter(c => {
    if (user?.rol === 'admin' || user?.rol === 'super_admin') return true;
    return c.slug === user?.comunidad_slug;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Portadas de Comunidades</h1>
        <p className="text-gray-400">Actualiza las imágenes que aparecen en la web pública. (Se guardarán automáticamente en formato .webp)</p>
      </div>

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
                  accept="image/*" // Acepta cualquier imagen, el código la convierte a webp
                  onChange={(e) => handleImageUpload(e, comunidad.slug)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading === comunidad.slug}
                />
                <button className="bg-real-purple hover:bg-real-blue text-white p-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium">
                  {uploading === comunidad.slug ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Camera size={18} />
                  )}
                  {uploading === comunidad.slug ? "Procesando..." : "Cambiar Foto"}
                </button>
              </div>
            </div>
          </div>
        ))}
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