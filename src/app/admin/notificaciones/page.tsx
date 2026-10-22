"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export default function AdminNotificaciones() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    url: "/"
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/notificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");

      setFeedback({ type: 'success', message: `Notificación enviada a ${data.count} dispositivos.` });
      setFormData({ title: "", body: "", url: "/" });
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Enviar Notificación</h1>
        <p className="text-gray-400">Envía un mensaje directo a los celulares de la congregación.</p>
      </div>

      <form onSubmit={handleSend} className="bg-real-dark border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Título</label>
          <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg" placeholder="Ej: ¡Culto hoy!" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Mensaje</label>
          <textarea required value={formData.body} onChange={(e) => setFormData({...formData, body: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg h-24" placeholder="Te esperamos a las 7:00 PM..." />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Enlace al abrir (Opcional)</label>
          <input type="text" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg" placeholder="/eventos" />
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-real-purple hover:bg-real-blue text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-4">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          {loading ? "Enviando..." : "Enviar Notificación"}
        </button>
      </form>

      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {feedback.message}
        </div>
      )}
    </div>
  );
}