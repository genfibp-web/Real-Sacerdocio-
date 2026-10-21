"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Monitor, Smartphone, Loader2, Radio, Globe, AppWindow } from "lucide-react";

export default function VisitantesAdmin() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const channel = supabase.channel('global-visitors', {
      config: { presence: { key: "admin-watcher" } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const activeVisitors = Object.keys(state)
          .filter(key => key !== "admin-watcher")
          .map(key => state[key][0]);
        
        setVisitors(activeVisitors);
        setLoading(false);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <div>
        <Link href="/admin/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Volver al Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Radio size={32} className="text-green-500 animate-pulse" />
          <h1 className="font-serif text-3xl font-bold text-white">Radar de Visitantes</h1>
        </div>
        <p className="text-gray-400">Monitorea en tiempo real quién está interactuando con la página web o la App.</p>
      </div>

      <div className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <h3 className="font-bold text-white">Dispositivos Conectados</h3>
          <div className="flex items-center gap-2 text-xs font-medium text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            {visitors.length} En Línea
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-real-purple" size={32} /></div>
        ) : visitors.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No hay visitantes activos en este momento.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {visitors.map((visitor, index) => (
              <div key={index} className="bg-black/50 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-medium">
                    {visitor.device === 'Desktop' ? <Monitor size={18} className="text-blue-400" /> : <Smartphone size={18} className="text-purple-400" />}
                    {visitor.device}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${visitor.isPWA ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {visitor.isPWA ? <AppWindow size={12} /> : <Globe size={12} />}
                    {visitor.isPWA ? 'App (PWA)' : 'Web'}
                  </span>
                </div>
                <div className="pt-3 border-t border-white/5">
                  <p className="text-xs text-gray-400 mb-1">Viendo ahora:</p>
                  <p className="text-sm text-real-gold font-mono bg-real-gold/10 px-2 py-1 rounded truncate">
                    {visitor.currentPage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}