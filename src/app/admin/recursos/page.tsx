"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Database, HardDrive, Users, Activity, ShieldCheck, Loader2, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminRecursos() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    db: { bytes: 0, pretty: "0 MB" },
    storage: { bytes: 0, pretty: "0 MB" },
    realtime: 0, // Conexiones concurrentes (estimado)
    profiles: 0,
    visitas: 0,
  });

  const SUPER_ADMIN_ID = "520245ef-6197-4247-8a7d-07a4772be4fc";
  
  // Límites del Plan Gratuito de Supabase
  const LIMITS = {
    db: 500 * 1024 * 1024, // 500 MB en bytes
    storage: 1 * 1024 * 1024 * 1024, // 1 GB en bytes
    realtime: 200, // Conexiones concurrentes
  };

  useEffect(() => {
    const fetchData = async () => {
      // 1. Verificación de seguridad
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id !== SUPER_ADMIN_ID) {
        router.push("/admin/dashboard");
        return;
      }
      setUser(session.user);

      try {
        // 2. Obtener tamaño de la Base de Datos
        const { data: dbData, error: dbError } = await supabase.rpc('get_db_size');
        if (dbError) throw dbError;
        
        // 3. Obtener tamaño del Storage
        const { data: storageData, error: storageError } = await supabase.rpc('get_storage_size');
        if (storageError) throw storageError;

        // 4. Obtener conteo de usuarios y visitas (opcional, para más contexto)
        const { count: profilesCount } = await supabase.from('perfiles').select('*', { count: 'exact', head: true });
        const { count: visitasCount } = await supabase.from('visitas').select('*', { count: 'exact', head: true });

        // 5. (Estimado) Conexiones Realtime - Podemos usar un canal de prueba
        const testChannel = supabase.channel('resource-test');
        testChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            const state = testChannel.presenceState();
            setMetrics(prev => ({ ...prev, realtime: Object.keys(state).length }));
            testChannel.unsubscribe();
          }
        });

        setMetrics({
          db: { bytes: Number(dbData?.[0]?.size_bytes || 0), pretty: dbData?.[0]?.size_pretty || "0 MB" },
          storage: { bytes: Number(storageData?.[0]?.size_bytes || 0), pretty: storageData?.[0]?.size_pretty || "0 MB" },
          realtime: 0, // Se actualizará con el canal
          profiles: profilesCount || 0,
          visitas: visitasCount || 0,
        });

      } catch (error) {
        console.error("Error cargando métricas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const calculatePercentage = (current: number, max: number) => {
    return Math.min(100, (current / max) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) return <div className="text-white p-8 flex items-center gap-2"><Loader2 className="animate-spin" /> Cargando métricas del sistema...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-3 bg-real-purple/20 rounded-xl text-real-purple">
          <BarChart3 size={28} />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Centro de Control</h1>
          <p className="text-gray-400 text-sm">Monitoreo de recursos y estado de la plataforma (Solo Super Admin)</p>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Base de Datos */}
        <div className="bg-real-dark border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <Database size={24} />
            <h3 className="font-bold text-white text-lg">Base de Datos</h3>
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{metrics.db.pretty}</p>
            <p className="text-xs text-gray-500">de 500 MB (Plan Gratuito)</p>
          </div>
          <div className="w-full bg-black/50 rounded-full h-2.5 mt-2 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full ${getProgressColor(calculatePercentage(metrics.db.bytes, LIMITS.db))}`}
              style={{ width: `${calculatePercentage(metrics.db.bytes, LIMITS.db)}%` }}
            ></div>
          </div>
          <p className="text-xs text-right text-gray-400">
            {calculatePercentage(metrics.db.bytes, LIMITS.db).toFixed(1)}% usado
          </p>
        </div>

        {/* Almacenamiento */}
        <div className="bg-real-dark border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-purple-400 mb-2">
            <HardDrive size={24} />
            <h3 className="font-bold text-white text-lg">Storage</h3>
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{metrics.storage.pretty}</p>
            <p className="text-xs text-gray-500">de 1 GB (Plan Gratuito)</p>
          </div>
          <div className="w-full bg-black/50 rounded-full h-2.5 mt-2 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full ${getProgressColor(calculatePercentage(metrics.storage.bytes, LIMITS.storage))}`}
              style={{ width: `${calculatePercentage(metrics.storage.bytes, LIMITS.storage)}%` }}
            ></div>
          </div>
          <p className="text-xs text-right text-gray-400">
            {calculatePercentage(metrics.storage.bytes, LIMITS.storage).toFixed(1)}% usado
          </p>
        </div>

        {/* Conexiones Realtime */}
        <div className="bg-real-dark border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-green-400 mb-2">
            <Activity size={24} />
            <h3 className="font-bold text-white text-lg">Conexiones en Vivo</h3>
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">{metrics.realtime} <span className="text-lg text-gray-500">/ {LIMITS.realtime}</span></p>
            <p className="text-xs text-gray-500">Límite de conexiones simultáneas</p>
          </div>
          <div className="w-full bg-black/50 rounded-full h-2.5 mt-2 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full ${getProgressColor((metrics.realtime / LIMITS.realtime) * 100)}`}
              style={{ width: `${(metrics.realtime / LIMITS.realtime) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-right text-gray-400">
            {((metrics.realtime / LIMITS.realtime) * 100).toFixed(1)}% usado
          </p>
        </div>
      </div>

      {/* SECCIÓN DE DATOS DE LA IGLESIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-real-dark border border-white/10 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-real-gold/10 text-real-gold rounded-xl"><Users size={24} /></div>
            <div>
              <p className="text-sm text-gray-400">Miembros Registrados</p>
              <p className="text-2xl font-bold text-white">{metrics.profiles}</p>
            </div>
          </div>
        </div>

        <div className="bg-real-dark border border-white/10 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-real-purple/10 text-real-purple rounded-xl"><ShieldCheck size={24} /></div>
            <div>
              <p className="text-sm text-gray-400">Visitas Totales</p>
              <p className="text-2xl font-bold text-white">{metrics.visitas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* NOTA DE ADVERTENCIA */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-yellow-200/80">
          <p className="font-bold text-yellow-500 mb-1">Límites del Plan Gratuito</p>
          <p>Si tu base de datos supera los 500 MB, tu proyecto entrará en modo de solo lectura y no podrás insertar nuevos datos. Te recomendamos monitorear este panel periódicamente para evitar sorpresas.</p>
        </div>
      </div>
    </div>
  );
}