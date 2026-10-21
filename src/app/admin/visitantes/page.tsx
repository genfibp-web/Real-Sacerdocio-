"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// ESTA LÍNEA ES LA QUE ARREGLA EL ERROR EN VERCEL
export const dynamic = 'force-dynamic';

export default function VisitantesPage() {
  const [visitantesActivos, setVisitantesActivos] = useState<any[]>([]);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    // 1. Nos conectamos al mismo canal que usa el VisitorTracker
    const channel = supabase.channel('global-visitors');

    // 2. Escuchamos el evento 'sync' (se dispara cuando alguien entra o sale)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      
      // Aplanamos los datos para obtener un array limpio de usuarios
      const usuarios = Object.values(state).flat();
      setVisitantesActivos(usuarios);
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setConectado(true);
      }
    });

    // Limpiamos el canal cuando salimos de la página
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Radar en Vivo</h1>
        
        {/* Indicador visual de conexión en tiempo real */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${conectado ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          <span className={`w-2 h-2 rounded-full ${conectado ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          {conectado ? 'En Línea' : 'Desconectado'}
        </div>
      </div>

      {visitantesActivos.length === 0 ? (
        <div className="bg-real-dark p-8 rounded-xl border border-white/5 text-center">
          <p className="text-gray-400">No hay nadie conectado en este momento.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <p className="text-sm text-gray-400">
            Personas navegando ahora ({visitantesActivos.length}):
          </p>
          {visitantesActivos.map((v, index) => (
            <div key={index} className="bg-real-dark p-4 rounded-xl border border-white/5 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">
                  📱 {v.device || "Dispositivo desconocido"} {v.isPWA && "(App Instalada)"}
                </p>
                {/* Mostramos el ID del dispositivo (primeros 8 caracteres) */}
                <span className="text-xs font-mono text-real-gold bg-real-gold/10 px-2 py-1 rounded">
                  ID: {v.deviceId ? `${v.deviceId.substring(0, 8)}...` : "Desconocido"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Viendo: <span className="text-real-purple font-medium">{v.currentPage}</span>
              </p>
              <p className="text-xs text-gray-500">
                Conectado a las: {new Date(v.joinedAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}