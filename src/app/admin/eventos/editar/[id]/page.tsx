"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { convertToWebP } from "@/lib/imageUtils";
import { Upload, Loader2, ArrowLeft, Image as ImageIcon, MapPin, CheckCircle, AlertTriangle, X } from "lucide-react";
import Link from "next/link";

export default function EditarEvento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("lider");
  const [tipoUbicacion, setTipoUbicacion] = useState<"iglesia" | "otra">("iglesia");
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    hora: "",
    ubicacion: "",
    comunidad_slug: "jovenes",
    destacado: false,
    cartel_url: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', session.user.id).single();
        if (perfil) setUserRole(perfil.rol);
      }

      const { data } = await supabase.from("eventos").select("*").eq("id", id).single();
      if (data) {
        setFormData({
          titulo: data.titulo || "",
          descripcion: data.descripcion || "",
          fecha_inicio: data.fecha_inicio || "",
          fecha_fin: data.fecha_fin || "",
          hora: data.hora || "",
          ubicacion: data.ubicacion || "",
          comunidad_slug: data.comunidad_slug || "jovenes",
          destacado: data.destacado || false,
          cartel_url: data.cartel_url || "",
        });
        setTipoUbicacion(data.ubicacion === "Iglesia Real Sacerdocio" ? "iglesia" : "otra");
        setPreview(data.cartel_url);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagen(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUbicacionChange = (tipo: "iglesia" | "otra") => {
    setTipoUbicacion(tipo);
    if (tipo === "iglesia") setFormData({ ...formData, ubicacion: "Iglesia Real Sacerdocio" });
    else setFormData({ ...formData, ubicacion: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let final_cartel_url = formData.cartel_url;

      if (imagen) {
        // Borrar imagen vieja
        if (formData.cartel_url) {
          const oldUrl = new URL(formData.cartel_url);
          const oldFileName = oldUrl.pathname.split('/').pop();
          if (oldFileName) await supabase.storage.from('fotos').remove([oldFileName]);
        }
        
        // Convertir y subir nueva
        const imagenWebP = await convertToWebP(imagen);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, imagenWebP);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(fileName);
        final_cartel_url = publicUrl;
      }

      const { error: dbError } = await supabase.from('eventos').update({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin || null,
        hora: formData.hora,
        ubicacion: formData.ubicacion,
        comunidad_slug: formData.comunidad_slug,
        destacado: formData.destacado,
        cartel_url: final_cartel_url,
      }).eq('id', id);

      if (dbError) throw dbError;
      
      setFeedback({ type: 'success', message: "Cambios guardados exitosamente." });
      setTimeout(() => { window.location.href = "/admin/eventos"; }, 2000);

    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error al actualizar: " + error.message });
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-real-purple" size={40}/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      <Link href="/admin/eventos" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Volver a la lista
      </Link>

      <div>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Editar Evento</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Portada del Evento</label>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3 h-48 bg-black/50 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center overflow-hidden relative">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center text-gray-500"><ImageIcon size={32} className="mx-auto mb-2 opacity-50" /></div>}
            </div>
            <div className="flex-1">
              <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-medium">
                <Upload size={20} /> Reemplazar Fotografía (Se convierte a WebP)
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Título del Evento</label><input type="text" required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple" /></div>
        <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Descripción</label><textarea required rows={4} value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple resize-none"></textarea></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Fecha Inicio</label><input type="date" required value={formData.fecha_inicio} onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl [color-scheme:dark]" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Fecha Fin</label><input type="date" value={formData.fecha_fin} onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl [color-scheme:dark]" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Hora</label><input type="time" required value={formData.hora} onChange={(e) => setFormData({...formData, hora: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl [color-scheme:dark]" /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-xl border border-white/5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">¿Dónde será el evento?</label>
            <select value={tipoUbicacion} onChange={(e) => handleUbicacionChange(e.target.value as "iglesia" | "otra")} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-real-purple appearance-none">
              <option value="iglesia">En la Iglesia Real Sacerdocio</option>
              <option value="otra">En otra ubicación (Externa)</option>
            </select>
          </div>
          {tipoUbicacion === "iglesia" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Dirección</label>
              <div className="w-full bg-black/30 border border-white/10 text-gray-400 px-4 py-3 rounded-xl flex items-center gap-2">
                <MapPin size={18} className="text-real-purple" /> Villa Hermosa / La Romana (Fijado)
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Dirección del Lugar</label>
              <input type="text" required value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Comunidad Organizadora</label>
            <select value={formData.comunidad_slug} onChange={(e) => setFormData({...formData, comunidad_slug: e.target.value})} disabled={userRole !== 'admin'} className={`w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl appearance-none ${userRole !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <option value="jovenes">Generación Kehunah (Jóvenes)</option>
              <option value="caballeros">Hombres de la Realeza</option>
              <option value="damas">Mujeres de Buena Voluntad</option>
              <option value="ninos">Niños y Adolescentes</option>
              <option value="general">General (Toda la iglesia)</option>
            </select>
          </div>
          <div className="flex items-center gap-3 bg-black/30 p-4 rounded-xl border border-white/5 mt-6">
            <input type="checkbox" id="destacado" checked={formData.destacado} onChange={(e) => setFormData({...formData, destacado: e.target.checked})} className="w-5 h-5 accent-real-purple rounded cursor-pointer" />
            <label htmlFor="destacado" className="text-sm text-gray-300 cursor-pointer"><strong className="block text-white">Destacar en la Página Principal</strong></label>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
          <Link href="/admin/eventos" className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5">Cancelar</Link>
          <button type="submit" disabled={saving} className="bg-real-purple hover:bg-real-blue text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={20} /> : "Guardar Cambios"}
          </button>
        </div>
      </form>

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
    </div>
  );
}