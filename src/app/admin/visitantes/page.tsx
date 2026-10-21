"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default function VisitantesPage() {
  const [visitantesActivos, setVisitantesActivos] = useState<any[]>([]);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    const channel = supabase.channel('global-visitors');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const usuarios = Object.values(state).flat();
        setVisitantesActivos(usuarios);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConectado(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Radar en Vivo</h1>
        
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
            Dispositivos conectados ({visitantesActivos.length}):
          </p>
          {visitantesActivos.map((v, index) => (
            <div key={index} className="bg-real-dark p-4 rounded-xl border border-white/5 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Luz verde fija, sin importar si cambia de pestaña */}
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-sm font-medium text-white">
                    📱 {v.device || "Dispositivo"}
                  </p>
                </div>
                <span className="text-xs font-mono text-real-gold bg-real-gold/10 px-2 py-1 rounded">
                  ID: {v.deviceId ? `${v.deviceId.substring(0, 8)}...` : "Desconocido"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Viendo: <span className="text-real-purple font-medium">{v.currentPage}</span>
              </p>
              <p className="text-xs text-gray-500">
                En línea desde: {v.joinedAt ? new Date(v.joinedAt).toLocaleTimeString() : "Ahora"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}