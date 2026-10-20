"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Users, Image as ImageIcon, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("lider");

  useEffect(() => {
    const fetchDashboardData = async () => {
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
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Cabecera responsive */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Resumen General</h1>
          <p className="text-gray-400">Aquí tienes un vistazo rápido de la actividad de tu comunidad.</p>
        </div>
        <Link 
          href="/admin/eventos/crear" 
          className="flex items-center justify-center gap-2 bg-real-purple hover:bg-real-blue text-white px-5 py-3 rounded-xl font-medium transition-colors w-full md:w-auto shadow-lg"
        >
          <Plus size={18} /> Nuevo Evento
        </Link>
      </div>

      {/* Tarjetas de Estadísticas (1 columna en celular, 3 en PC) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-real-dark border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-real-purple/20 rounded-xl">
            <CalendarDays size={28} className="text-real-purple" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Eventos Activos</p>
            <h3 className="text-3xl font-bold text-white">{eventos.length}</h3>
          </div>
        </div>

        <div className="bg-real-dark border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-real-blue/20 rounded-xl">
            <ImageIcon size={28} className="text-real-blue" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Fotos en Galería</p>
            <h3 className="text-3xl font-bold text-white">0</h3> 
          </div>
        </div>

        <div className="bg-real-dark border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-real-gold/20 rounded-xl">
            <Users size={28} className="text-real-gold" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Miembros Registrados</p>
            <h3 className="text-3xl font-bold text-white">0</h3>
          </div>
        </div>
      </div>

      {/* Tabla de Actividad Reciente */}
      <div className="bg-real-dark border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Eventos Recientes</h3>
        </div>
        
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-real-purple" size={32}/></div>
        ) : eventos.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No hay eventos creados aún. ¡Haz clic en "Nuevo Evento" para empezar!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {eventos.map((evento) => (
              <div key={evento.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative border border-white/10">
                     {evento.cartel_url ? (
                        <img src={evento.cartel_url} alt="Cartel" className="w-full h-full object-cover" />
                     ) : "IMG"}
                  </div>
                  <div>
                    <p className="font-medium text-white">{evento.titulo}</p>
                    <p className="text-sm text-gray-500">Creado el {new Date(evento.creado_en).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full w-fit ${evento.estado === 'proximo' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                  {evento.estado === 'proximo' ? 'Publicado' : 'Finalizado'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}