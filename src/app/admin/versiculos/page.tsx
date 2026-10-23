"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BookOpen, Loader2, Plus, Trash2, CheckCircle, AlertTriangle } from "lucide-react";

export default function AdminVersiculos() {
  const [versiculos, setVersiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    cita: "",
    texto: "",
    mensaje: "",
  });

  const fetchVersiculos = async () => {
    const { data } = await supabase.from('versiculos_diarios').select('*').order('fecha', { ascending: false });
    if (data) setVersiculos(data);
  };

  useEffect(() => { fetchVersiculos(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('versiculos_diarios').insert([formData]);
    
    if (error) {
      setFeedback({ type: 'error', message: "Error: " + error.message });
    } else {
      setFeedback({ type: 'success', message: "Versículo programado exitosamente." });
      setFormData({ ...formData, cita: "", texto: "", mensaje: "" });
      fetchVersiculos();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este versículo?")) {
      await supabase.from('versiculos_diarios').delete().eq('id', id);
      fetchVersiculos();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Versículos Diarios</h1>
        <p className="text-gray-400">Programa la Palabra que se mostrará y notificará cada día.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="bg-real-dark p-6 rounded-2xl border border-white/10 space-y-4 h-fit">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Plus size={20} className="text-real-purple"/> Nuevo Versículo</h3>
          
          <div>
            <label className="text-xs text-gray-400 block mb-1">Fecha de publicación</label>
            <input type="date" required value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white p-3 rounded-xl [color-scheme:dark]" />
          </div>
          
          <div>
            <label className="text-xs text-gray-400 block mb-1">Cita (Ej: Juan 3:16)</label>
            <input type="text" required value={formData.cita} onChange={(e) => setFormData({...formData, cita: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white p-3 rounded-xl" placeholder="Ej: Filipenses 4:13" />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Texto Bíblico</label>
            <textarea required rows={3} value={formData.texto} onChange={(e) => setFormData({...formData, texto: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white p-3 rounded-xl" placeholder="Todo lo puedo en Cristo que me fortalece..." />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Mensaje / Reflexión</label>
            <textarea required rows={4} value={formData.mensaje} onChange={(e) => setFormData({...formData, mensaje: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white p-3 rounded-xl" placeholder="Escribe una breve reflexión sobre este versículo..." />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-real-purple hover:bg-real-blue text-white py-3 rounded-xl font-bold transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Programar Versículo"}
          </button>

          {feedback && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${feedback.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {feedback.type === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>} {feedback.message}
            </div>
          )}
        </form>

        {/* LISTA */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><BookOpen size={20} className="text-real-gold"/> Programados</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {versiculos.map(v => (
              <div key={v.id} className="bg-real-dark p-4 rounded-xl border border-white/5 flex justify-between items-start gap-4">
                <div>
                  <p className="text-real-gold font-bold text-sm mb-1">{new Date(v.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  <p className="text-white font-serif font-bold">{v.cita}</p>
                  <p className="text-gray-400 text-sm line-clamp-2 mt-1">{v.texto}</p>
                </div>
                <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 size={18}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}