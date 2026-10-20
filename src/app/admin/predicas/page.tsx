"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Video, User, Calendar, ArrowLeft, CheckCircle, AlertTriangle, X } from "lucide-react";
import Link from "next/link";

export default function PredicasAdmin() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [predicas, setPredicas] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    titulo: "",
    predicador: "",
    fecha: "",
    video_url: "",
    descripcion: "",
  });

  // Estados para los modales personalizados
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [predicaToDelete, setPredicaToDelete] = useState<any | null>(null);

  const fetchPredicas = async () => {
    setFetching(true);
    const { data } = await supabase.from('predicas').select('*').order('fecha', { ascending: false });
    if (data) setPredicas(data);
    setFetching(false);
  };

  useEffect(() => {
    fetchPredicas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('predicas').insert([
      {
        titulo: formData.titulo,
        predicador: formData.predicador,
        fecha: formData.fecha,
        video_url: formData.video_url,
        descripcion: formData.descripcion,
      }
    ]);

    if (error) {
      setFeedback({ type: 'error', message: "Error al guardar: " + error.message });
    } else {
      setFeedback({ type: 'success', message: "¡Prédica guardada exitosamente!" });
      setFormData({ titulo: "", predicador: "", fecha: "", video_url: "", descripcion: "" });
      fetchPredicas();
    }
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!predicaToDelete) return;
    const { error } = await supabase.from('predicas').delete().eq('id', predicaToDelete.id);
    
    if (error) {
      setFeedback({ type: 'error', message: "Error al eliminar: " + error.message });
    } else {
      setFeedback({ type: 'success', message: "Prédica eliminada correctamente." });
      fetchPredicas();
    }
    setPredicaToDelete(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      <div>
        <Link href="/admin/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Volver al Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Administrar Prédicas</h1>
        <p className="text-gray-400">Sube los enlaces de los sermones para que aparezcan en la web pública.</p>
      </div>

      {/* FORMULARIO DE CREACIÓN */}
      <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Título del Mensaje</label>
            <input type="text" required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-real-purple" placeholder="Ej: El Poder de la Fe" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Predicador</label>
            <input type="text" required value={formData.predicador} onChange={(e) => setFormData({...formData, predicador: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-real-purple" placeholder="Ej: Pastor Juan" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Fecha</label>
            <input type="date" required value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-real-purple [color-scheme:dark]" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Enlace del Video (YouTube)</label>
            <div className="relative">
              <Video size={18} className="absolute left-3 top-3.5 text-gray-500" />
              <input type="url" required value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-real-purple" placeholder="https://youtube.com/watch?v=..." />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Descripción (Opcional)</label>
          <textarea rows={3} value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-real-purple resize-none" placeholder="Breve resumen del mensaje..."></textarea>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button type="submit" disabled={loading} className="bg-real-purple hover:bg-real-blue text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20}/> Guardar Prédica</>}
          </button>
        </div>
      </form>

      {/* LISTA DE PRÉDICAS EXISTENTES */}
      <div className="bg-real-dark border border-white/5 rounded-2xl overflow-hidden mt-8">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Historial de Prédicas</h3>
        </div>
        
        {fetching ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-real-purple" size={32}/></div>
        ) : predicas.length === 0 ? (
          <div className="p-10 text-center text-gray-500">Aún no has subido ninguna prédica.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {predicas.map((predica) => (
              <div key={predica.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-real-purple/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="text-real-purple" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-white text-lg">{predica.titulo}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><User size={12} /> {predica.predicador}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {predica.fecha}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setPredicaToDelete(predica)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  title="Eliminar Prédica"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE FEEDBACK (Éxito / Error) */}
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
      {predicaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setPredicaToDelete(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setPredicaToDelete(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6"><AlertTriangle size={32} className="text-red-500" /></div>
              <h3 className="text-2xl font-bold text-white mb-2">¿Eliminar esta prédica?</h3>
              <p className="text-gray-400 mb-8">Estás a punto de eliminar <strong className="text-white">"{predicaToDelete.titulo}"</strong>.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setPredicaToDelete(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors">Sí, eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}