"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"; // <-- NUEVO

export const dynamic = 'force-dynamic';

export default function VisitantesPage() {
  const router = useRouter(); // <-- NUEVO
  const [visitantesActivos, setVisitantesActivos] = useState<any[]>([]);
  const [conectado, setConectado] = useState(false);

  const SUPER_ADMIN_ID = "520245ef-6197-4247-8a7d-07a4772be4fc";

  useEffect(() => {
    let channel: any = null;

    const checkSuperAdminAndConnect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 🛡️ BLOQUEO ESTRICTO: Si no es el Super Admin, lo mandamos al dashboard
      if (!session || session.user.id !== SUPER_ADMIN_ID) {
        router.push("/admin/dashboard");
        return;
      }

      // Si pasó la prueba, conectamos el radar en vivo
      channel = supabase.channel('global-visitors');
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const usuarios = Object.values(state).flat();
          setVisitantesActivos(usuarios);
        })
        .subscribe((status: any) => {
          if (status === 'SUBSCRIBED') {
            setConectado(true);
          }
        });
    };

    checkSuperAdminAndConnect();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

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