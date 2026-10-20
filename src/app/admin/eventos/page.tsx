"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, Loader2, Trash2, Edit, AlertTriangle, X, CheckCircle, Archive } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ListaEventos() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userRole, setUserRole] = useState<string>("lider");

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: perfil } = await supabase.from('perfiles').select('rol, comunidad_slug').eq('id', session.user.id).maybeSingle();
        
        const role = perfil?.rol || 'lider';
        const comunidad = perfil?.comunidad_slug || '';
        setUserRole(role);

        let query = supabase.from('eventos').select('*').order('creado_en', { ascending: false });
        
        if (role !== 'admin' && comunidad) {
          query = query.eq('comunidad_slug', comunidad);
        }

        const { data } = await query;
        if (data) setEventos(data);
      }
    } catch (error) {
      console.error("Error general:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('eventos').update({ aprobado: true }).eq('id', id);
    if (error) alert("Error al aprobar: " + error.message);
    else fetchEventos();
  };

  const handleFinalize = async (id: string) => {
    if (!window.confirm("¿Estás seguro de finalizar este evento? Desaparecerá de la web pública.")) return;
    const { error } = await supabase.from('eventos').update({ estado: 'finalizado' }).eq('id', id);
    if (error) alert("Error al finalizar: " + error.message);
    else fetchEventos();
  };

  const openDeleteModal = (evento: any) => { setEventToDelete(evento); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEventToDelete(null); };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      if (eventToDelete.cartel_url) {
        const url = new URL(eventToDelete.cartel_url);
        const fileName = url.pathname.split('/').pop(); 
        if (fileName) await supabase.storage.from('fotos').remove([fileName]);
      }
      const { error } = await supabase.from('eventos').delete().eq('id', eventToDelete.id);
      if (error) throw error;
      fetchEventos();
      closeModal();
    } catch (error: any) {
      alert("Error al eliminar: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin/dashboard" className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-2">
            <ArrowLeft size={16} /> Volver al Dashboard
          </Link>
          <h1 className="font-serif text-3xl font-bold text-white">Todos los Eventos</h1>
        </div>
        <Link href="/admin/eventos/crear" className="flex items-center gap-2 bg-real-purple hover:bg-real-blue text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
          <Plus size={18} /> Nuevo Evento
        </Link>
      </div>

      <div className="bg-real-dark border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-real-purple" size={32}/></div>
        ) : eventos.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No hay eventos creados aún.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {eventos.map((evento) => (
              <div key={evento.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-black flex-shrink-0 overflow-hidden border border-white/10">
                    {evento.cartel_url ? <img src={evento.cartel_url} alt={evento.titulo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Sin foto</div>}
                  </div>
                  <div>
                    <p className="font-medium text-white text-lg">{evento.titulo}</p>
                    <p className="text-sm text-gray-500">Comunidad: {evento.comunidad_slug} | Fecha: {evento.fecha_inicio}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!evento.aprobado ? (
                    userRole === 'admin' ? (
                      <button onClick={() => handleApprove(evento.id)} className="flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500 hover:text-black transition-colors">
                        <CheckCircle size={14} /> Aprobar
                      </button>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        En Revisión
                      </span>
                    )
                  ) : evento.estado === 'finalizado' ? (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-400">
                      Finalizado
                    </span>
                  ) : (
                    <>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-400">
                        Publicado
                      </span>
                      {userRole === 'admin' && (
                        <button onClick={() => handleFinalize(evento.id)} className="p-2 bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 rounded-lg transition-colors" title="Finalizar Evento">
                          <Archive size={18} />
                        </button>
                      )}
                    </>
                  )}
                  
                  <Link href={`/admin/eventos/editar/${evento.id}`} className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors">
                    <Edit size={18} />
                  </Link>
                  
                  <button onClick={() => openDeleteModal(evento)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6"><AlertTriangle size={32} className="text-red-500" /></div>
              <h3 className="text-2xl font-bold text-white mb-2">¿Eliminar este evento?</h3>
              <p className="text-gray-400 mb-8">Estás a punto de eliminar <strong className="text-white">"{eventToDelete?.titulo}"</strong>.</p>
              <div className="flex gap-3 w-full">
                <button onClick={closeModal} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium">Cancelar</button>
                <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                  {isDeleting ? <Loader2 className="animate-spin" size={20} /> : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}