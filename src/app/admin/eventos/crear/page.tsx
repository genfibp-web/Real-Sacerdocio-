"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { convertToWebP } from "@/lib/imageUtils";
import { Upload, Loader2, ArrowLeft, Image as ImageIcon, MapPin, CheckCircle, AlertTriangle, X } from "lucide-react";
import Link from "next/link";

export default function CrearEvento() {
  const [loading, setLoading] = useState(false);
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
    ubicacion: "Iglesia Real Sacerdocio",
    comunidad_slug: "jovenes",
    destacado: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: perfil } = await supabase.from('perfiles').select('rol, comunidad_slug').eq('id', session.user.id).single();
        if (perfil) {
          setUserRole(perfil.rol);
          if (perfil.rol === 'lider') {
            setFormData(prev => ({ ...prev, comunidad_slug: perfil.comunidad_slug }));
          }
        }
      }
    };
    fetchUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagen(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUbicacionChange = (tipo: "iglesia" | "otra") => {
    setTipoUbicacion(tipo);
    if (tipo === "iglesia") {
      setFormData({ ...formData, ubicacion: "Iglesia Real Sacerdocio" });
    } else {
      setFormData({ ...formData, ubicacion: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let cartel_url = "";

      if (imagen) {
        // CONVERTIR A WEBP
        const imagenWebP = await convertToWebP(imagen);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        
        const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, imagenWebP);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(fileName);
        cartel_url = publicUrl;
      }

      const slug = formData.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const slugFinal = slug + "-" + Math.floor(Math.random() * 1000);

      const { error: dbError } = await supabase.from('eventos').insert([{
        titulo: formData.titulo,
        slug: slugFinal,
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin || null,
        hora: formData.hora,
        ubicacion: formData.ubicacion,
        comunidad_slug: formData.comunidad_slug,
        destacado: formData.destacado,
        cartel_url: cartel_url,
        aprobado: userRole === 'admin' ? true : false,
      }]);

      if (dbError) throw dbError;

      // 🔔 NOTIFICACIÓN PROFESIONAL
      if (userRole === 'admin') {
        try {
          // Formateamos la fecha para que se vea bonita (Ej: 25 de Octubre)
          const fechaObj = new Date(formData.fecha_inicio + 'T12:00:00');
          const fechaFormateada = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
          
          await fetch('/api/notificaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: "Real Sacerdocio", // Título directo y oficial
              body: `Te invitamos a: ${formData.titulo}. El ${fechaFormateada} a las ${formData.hora}.`,
              url: `/eventos/${slugFinal}`
            })
          });
        } catch (notifError) {
          console.error("La notificación falló", notifError);
        }
      }
      
      setFeedback({ 
        type: 'success', 
        message: userRole === 'admin' 
          ? "Evento publicado exitosamente." 
          : "Evento enviado a revisión."
      });
      
      setTimeout(() => { window.location.href = "/admin/eventos"; }, 2000);

    } catch (error: any) {
      setFeedback({ type: 'error', message: "Error: " + error.message });
      setLoading(false);
    } 
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      <Link href="/admin/eventos" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Volver a la lista
      </Link>

      <div>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Crear Nuevo Evento</h1>
        <p className="text-gray-400">
          {userRole === 'admin' ? "Como administrador, tu evento se publicará inmediatamente y enviará una notificación." : "Tu evento pasará a revisión antes de publicarse."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Portada del Evento</label>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3 h-48 bg-black/50 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center overflow-hidden relative">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center text-gray-500"><ImageIcon size={32} className="mx-auto mb-2 opacity-50" /><p className="text-xs">Sin imagen</p></div>}
            </div>
            <div className="flex-1">
              <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-medium w-full md:w-auto">
                <Upload size={20} /> Subir Fotografía (Se convierte a WebP)
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Título del Evento</label>
          <input type="text" required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Descripción / Información</label>
          <textarea required rows={4} value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple resize-none"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Fecha de Inicio</label><input type="date" required value={formData.fecha_inicio} onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl [color-scheme:dark]" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Fecha de Fin</label><input type="date" value={formData.fecha_fin} onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl [color-scheme:dark]" /></div>
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
              <input type="text" required placeholder="Ej: Casa de Retiros Elim..." value={formData.ubicacion} onChange={(e) => setFormData({...formData, ubicacion: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-real-purple" />
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

        <div className="pt-6 border-t border-white/10 flex justify-end items-center gap-4">
          <Link href="/admin/eventos" className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancelar</Link>
          <button type="submit" disabled={loading} className="bg-real-purple hover:bg-real-blue text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : userRole === 'admin' ? "Publicar Evento" : "Enviar a Revisión"}
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