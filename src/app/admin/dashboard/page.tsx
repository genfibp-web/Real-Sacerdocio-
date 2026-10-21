"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { CalendarDays, Image as ImageIcon, Users, Plus, FileText, Filter, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string>("all");
  
  // Estados para los contadores
  const [stats, setStats] = useState({
    eventos: 0,
    fotos: 0,
    miembros: 0,
    publicaciones: 0,
    saldo: 0,
  });

  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  // 1. Obtener los datos del usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('rol, comunidad_slug')
          .eq('id', session.user.id)
          .single();

        setUser({ ...perfil, id: session.user.id });
        
        // Si es líder, forzamos el filtro a su comunidad
        if (perfil?.rol === 'lider') {
          setSelectedCommunity(perfil.comunidad_slug);
        }
      }
      setLoading(false);
    };
    getUser();
  }, []);

  // 2. Cargar los datos según el filtro
  useEffect(() => {
    if (loading || !user) return;

    const fetchData = async () => {
      const isFiltering = selectedCommunity !== "all";

      // --- EVENTOS ---
      let queryEventos = supabase.from('eventos').select('*', { count: 'exact', head: true });
      if (isFiltering) queryEventos = queryEventos.eq('comunidad_slug', selectedCommunity);
      const { count: countEventos } = await queryEventos;

      // --- FOTOS (Galería) ---
      let queryFotos = supabase.from('galerias_eventos').select('*', { count: 'exact', head: true });
      if (isFiltering) queryFotos = queryFotos.eq('comunidad_slug', selectedCommunity);
      const { count: countFotos } = await queryFotos;

      // --- PUBLICACIONES ---
      let queryPublicaciones = supabase.from('publicaciones').select('*', { count: 'exact', head: true });
      if (isFiltering) queryPublicaciones = queryPublicaciones.eq('comunidad_slug', selectedCommunity);
      const { count: countPublicaciones } = await queryPublicaciones;

      // --- MIEMBROS ---
      let queryMiembros = supabase.from('miembros').select('*', { count: 'exact', head: true });
      if (isFiltering) queryMiembros = queryMiembros.eq('comunidad_slug', selectedCommunity);
      const { count: countMiembros } = await queryMiembros;

      // --- FINANZAS (Saldo) ---
      let queryFinanzas = supabase.from('transacciones').select('tipo, monto');
      if (isFiltering) queryFinanzas = queryFinanzas.eq('comunidad_slug', selectedCommunity);
      const { data: transacciones } = await queryFinanzas;
      
      const ingresos = transacciones?.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + Number(t.monto), 0) || 0;
      const egresos = transacciones?.filter(t => t.tipo === 'egreso').reduce((acc, t) => acc + Number(t.monto), 0) || 0;
      const saldoTotal = ingresos - egresos;

      setStats({
        eventos: countEventos || 0,
        fotos: countFotos || 0,
        publicaciones: countPublicaciones || 0,
        miembros: countMiembros || 0,
        saldo: saldoTotal,
      });

      // --- EVENTOS RECIENTES ---
      let queryRecent = supabase
        .from('eventos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (isFiltering) {
        queryRecent = queryRecent.eq('comunidad_slug', selectedCommunity);
      }
      
      const { data: eventsData } = await queryRecent;
      if (eventsData) setRecentEvents(eventsData);
    };

    fetchData();
  }, [user, selectedCommunity, loading]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  };

  if (loading) return <div className="text-white p-8">Cargando dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* HEADER Y FILTRO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Resumen General</h1>
          <p className="text-gray-400">
            {user?.rol === 'admin' 
              ? "Vistazo global de la actividad de la iglesia." 
              : `Actividad de la comunidad: ${user?.comunidad_slug}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Filtro solo visible para Admins */}
          {user?.rol === 'admin' && (
            <div className="flex items-center gap-2 bg-real-dark border border-white/10 px-3 py-2 rounded-xl text-sm">
              <Filter size={16} className="text-gray-400" />
              
              {/* FIX: Fondo oscuro en el select y las opciones */}
              <select 
                value={selectedCommunity} 
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="bg-real-dark text-white outline-none cursor-pointer capitalize"
              >
                <option value="all" className="bg-real-dark text-white">Todas las comunidades</option>
                <option value="general" className="bg-real-dark text-white">Fondo General</option>
                <option value="jovenes" className="bg-real-dark text-white">Jóvenes</option>
                <option value="caballeros" className="bg-real-dark text-white">Caballeros</option>
                <option value="damas" className="bg-real-dark text-white">Damas</option>
                <option value="ninos" className="bg-real-dark text-white">Niños</option>
              </select>
            </div>
          )}

          <Link 
            href="/admin/eventos" 
            className="bg-real-purple hover:bg-real-blue text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> Nuevo Evento
          </Link>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-real-dark border border-white/5 p-6 rounded-2xl flex flex-col justify-center items-center text-center gap-3">
          <div className="w-12 h-12 bg-real-purple/10 text-real-purple rounded-xl flex items-center justify-center">
            <CalendarDays size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{stats.eventos}</h3>
            <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Eventos</p>
          </div>
        </div>

        <div className="bg-real-dark border border-white/5 p-6 rounded-2xl flex flex-col justify-center items-center text-center gap-3">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
            <ImageIcon size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{stats.fotos}</h3>
            <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Fotos</p>
          </div>
        </div>

        <div className="bg-real-dark border border-white/5 p-6 rounded-2xl flex flex-col justify-center items-center text-center gap-3">
          <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{stats.publicaciones}</h3>
            <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Publicaciones</p>
          </div>
        </div>

        <div className="bg-real-dark border border-white/5 p-6 rounded-2xl flex flex-col justify-center items-center text-center gap-3">
          <div className="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{stats.miembros}</h3>
            <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Miembros</p>
          </div>
        </div>

        {/* TARJETA DE SALDO FINANCIERO */}
        <div className="bg-real-dark border border-real-gold/30 p-6 rounded-2xl flex flex-col justify-center items-center text-center gap-3 bg-gradient-to-br from-real-dark to-real-gold/5">
          <div className="w-12 h-12 bg-real-gold/10 text-real-gold rounded-xl flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${stats.saldo >= 0 ? 'text-real-gold' : 'text-red-400'}`}>
              {formatMoney(stats.saldo)}
            </h3>
            <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Saldo en Caja</p>
          </div>
        </div>

      </div>

      {/* EVENTOS RECIENTES */}
      <div className="bg-real-dark border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Eventos Recientes</h2>
          <Link href="/admin/eventos" className="text-sm text-real-purple hover:text-white transition-colors">Ver todos</Link>
        </div>
        <div className="divide-y divide-white/5">
          {recentEvents.length === 0 ? (
            <p className="p-6 text-gray-400 text-center">No se encontraron eventos.</p>
          ) : (
            recentEvents.map((event) => (
              <div key={event.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  {event.imagen_url ? (
                    <img src={event.imagen_url} alt={event.titulo} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-gray-500">
                      <CalendarDays size={20} />
                    </div>
                  )}
                  <div>
                    <h4 className="text-white font-medium">{event.titulo}</h4>
                    <p className="text-xs text-gray-500 capitalize">
                      {event.comunidad_slug || 'General'} • {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
                    {event.estado || "Publicado"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}