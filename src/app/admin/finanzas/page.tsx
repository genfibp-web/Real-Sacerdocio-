"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DollarSign, ArrowUpRight, ArrowDownRight, Plus, Filter, Loader2, X, AlertTriangle, CheckCircle, Trash2, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FinanzasAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [transacciones, setTransacciones] = useState<any[]>([]);
  const [filterCommunity, setFilterCommunity] = useState("all");
  const [showForm, setShowForm] = useState(false);
  
  // 📅 Estado para el mes seleccionado (Formato: YYYY-MM). Por defecto, el mes actual.
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [formData, setFormData] = useState({
    tipo: "ingreso",
    monto: "",
    descripcion: "",
    comunidad_slug: "general",
  });

  const [txToDelete, setTxToDelete] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const SUPER_ADMIN_ID = "520245ef-6197-4247-8a7d-07a4772be4fc";

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin");
        return;
      }
      
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('rol, comunidad_slug')
        .eq('id', session.user.id)
        .single();

      setUser({ ...perfil, id: session.user.id });
      
      if (perfil?.rol === 'lider') {
        setFilterCommunity(perfil.comunidad_slug);
        setFormData(prev => ({ ...prev, comunidad_slug: perfil.comunidad_slug }));
      }
    };
    getUser();
  }, [router]);

  const fetchTransacciones = async () => {
    setLoading(true);
    // Traemos todas las transacciones (o las del filtro de comunidad)
    // El filtrado por mes se hace en el frontend para que sea instantáneo al cambiar de mes
    let query = supabase.from('transacciones').select('*').order('fecha', { ascending: false });

    if (user?.rol === 'lider') {
      query = query.eq('comunidad_slug', user.comunidad_slug);
    } else if (user?.rol === 'admin' && filterCommunity !== 'all') {
      query = query.eq('comunidad_slug', filterCommunity);
    }

    const { data } = await query;
    if (data) setTransacciones(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchTransacciones();
  }, [user, filterCommunity]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const montoNumerico = parseFloat(formData.monto.replace(/[^0-9.-]+/g, ""));
    if (isNaN(montoNumerico)) {
      setFeedback({ type: 'error', message: "Por favor, ingresa un monto válido." });
      setSaving(false);
      return;
    }

    // Insertamos con la fecha actual
    const { error } = await supabase.from('transacciones').insert([{
      ...formData,
      monto: montoNumerico,
      creado_por: user.id,
      fecha: new Date().toISOString()
    }]);
    
    if (error) {
      setFeedback({ type: 'error', message: "Error al guardar: " + error.message });
    } else {
      setFeedback({ type: 'success', message: "Transacción registrada exitosamente." });
      setShowForm(false);
      setFormData({ tipo: "ingreso", monto: "", descripcion: "", comunidad_slug: user.rol === 'lider' ? user.comunidad_slug : 'general' });
      fetchTransacciones();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!txToDelete) return;
    setDeleting(true);

    const { error } = await supabase
      .from('transacciones')
      .delete()
      .eq('id', txToDelete.id);

    if (error) {
      setFeedback({ type: 'error', message: "Error al eliminar: " + error.message });
    } else {
      setFeedback({ type: 'success', message: "Transacción eliminada correctamente." });
      fetchTransacciones();
    }
    setDeleting(false);
    setTxToDelete(null);
  };

  // 🧮 LÓGICA DE CÁLCULO Y COMPARACIÓN DE MESES
  const getMonthTransactions = (monthStr: string) => {
    return transacciones.filter(t => t.fecha.startsWith(monthStr));
  };

  // Calculamos el mes anterior
  const getPreviousMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const prevMonthStr = getPreviousMonth(selectedMonth);
  
  const currentTx = getMonthTransactions(selectedMonth);
  const prevTx = getMonthTransactions(prevMonthStr);

  const calcStats = (txs: any[]) => {
    const inc = txs.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + Number(t.monto), 0);
    const exp = txs.filter(t => t.tipo === 'egreso').reduce((acc, t) => acc + Number(t.monto), 0);
    return { inc, exp, bal: inc - exp };
  };

  const currentStats = calcStats(currentTx);
  const prevStats = calcStats(prevTx);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  };

  // Función para calcular la tendencia
  const getTrend = (current: number, prev: number, isExpense = false) => {
    if (prev === 0 && current === 0) return null;
    if (prev === 0) return { type: 'up', text: 'Nuevo', color: isExpense ? 'text-red-400' : 'text-green-400' };
    
    const diff = current - prev;
    const percent = (diff / prev) * 100;
    
    if (diff === 0) return { type: 'neutral', text: '0%', color: 'text-gray-400' };
    
    const isPositive = diff > 0;
    // Para egresos, que suba es malo (rojo), que baje es bueno (verde)
    const isGood = isExpense ? !isPositive : isPositive;
    
    return {
      type: isPositive ? 'up' : 'down',
      text: `${Math.abs(percent).toFixed(1)}%`,
      color: isGood ? 'text-green-400' : 'text-red-400',
      icon: isPositive ? TrendingUp : TrendingDown
    };
  };

  const trendInc = getTrend(currentStats.inc, prevStats.inc, false);
  const trendExp = getTrend(currentStats.exp, prevStats.exp, true);
  const trendBal = getTrend(currentStats.bal, prevStats.bal, false);

  if (!user) return <div className="p-8 text-white">Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      
      {/* HEADER CON SELECTOR DE MES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Finanzas</h1>
          <p className="text-gray-400">Control de ingresos, egresos y fondos.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* Selector de mes */}
          <div className="flex items-center gap-2 bg-real-dark border border-white/10 px-3 py-2 rounded-xl text-sm w-full md:w-auto justify-center">
            <Calendar size={18} className="text-real-purple" />
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>

          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-real-purple hover:bg-real-blue text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
          >
            <Plus size={18} /> {showForm ? "Cancelar" : "Nueva Transacción"}
          </button>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN CON COMPARATIVA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* INGRESOS */}
        <div className="bg-real-dark border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center shrink-0">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Ingresos Totales</p>
              <h3 className="text-2xl font-bold text-white">{formatMoney(currentStats.inc)}</h3>
            </div>
          </div>
          {trendInc && (
            <div className={`mt-4 text-xs font-medium flex items-center gap-1 ${trendInc.color}`}>
              {trendInc.icon && <trendInc.icon size={14} />}
              {trendInc.text} <span className="text-gray-500 font-normal">vs mes anterior</span>
            </div>
          )}
        </div>

        {/* EGRESOS */}
        <div className="bg-real-dark border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center shrink-0">
              <ArrowDownRight size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Egresos Totales</p>
              <h3 className="text-2xl font-bold text-white">{formatMoney(currentStats.exp)}</h3>
            </div>
          </div>
          {trendExp && (
            <div className={`mt-4 text-xs font-medium flex items-center gap-1 ${trendExp.color}`}>
              {trendExp.icon && <trendExp.icon size={14} />}
              {trendExp.text} <span className="text-gray-500 font-normal">vs mes anterior</span>
            </div>
          )}
        </div>

        {/* SALDO */}
        <div className="bg-real-dark border border-white/5 p-6 rounded-2xl flex flex-col justify-between border-real-gold/30 bg-gradient-to-br from-real-dark to-real-gold/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-real-gold/10 text-real-gold rounded-xl flex items-center justify-center shrink-0">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Saldo del Mes</p>
              <h3 className={`text-2xl font-bold ${currentStats.bal >= 0 ? 'text-real-gold' : 'text-red-400'}`}>
                {formatMoney(currentStats.bal)}
              </h3>
            </div>
          </div>
          {trendBal && (
            <div className={`mt-4 text-xs font-medium flex items-center gap-1 ${trendBal.color}`}>
              {trendBal.icon && <trendBal.icon size={14} />}
              {trendBal.text} <span className="text-gray-500 font-normal">vs mes anterior</span>
            </div>
          )}
        </div>
      </div>

      {/* FORMULARIO (Se queda igual) */}
      {showForm && (
        <form onSubmit={handleAddTransaction} className="bg-real-dark border border-white/10 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-white mb-4">Registrar Transacción</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tipo</label>
              <select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg">
                <option value="ingreso">Ingreso (+)</option>
                <option value="egreso">Egreso (-)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Monto (DOP)</label>
              <input type="number" step="0.01" required value={formData.monto} onChange={(e) => setFormData({...formData, monto: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Descripción</label>
              <input type="text" required value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg" placeholder="Ej: Ofrenda domingo" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Comunidad / Fondo</label>
              <select disabled={user.rol === 'lider'} value={formData.comunidad_slug} onChange={(e) => setFormData({...formData, comunidad_slug: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg disabled:opacity-50">
                <option value="general">Fondo General (Iglesia)</option>
                <option value="jovenes">Jóvenes</option>
                <option value="caballeros">Caballeros</option>
                <option value="damas">Damas</option>
                <option value="ninos">Niños</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="mt-4 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={18} /> : "Guardar Transacción"}
          </button>
        </form>
      )}

      {/* HISTORIAL DE MOVIMIENTOS (Filtrado por el mes seleccionado) */}
      <div className="bg-real-dark border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between bg-white/5">
          <h3 className="font-bold text-white flex items-center gap-2">
            <DollarSign size={18} /> Movimientos de {selectedMonth}
          </h3>

          {user.rol === 'admin' && (
            <div className="flex items-center gap-2 bg-black/50 border border-white/10 px-3 py-2 rounded-lg text-sm">
              <Filter size={16} className="text-gray-400" />
              <select value={filterCommunity} onChange={(e) => setFilterCommunity(e.target.value)} className="bg-transparent text-white outline-none cursor-pointer">
                <option value="all">Todos los fondos</option>
                <option value="general">Fondo General</option>
                <option value="jovenes">Jóvenes</option>
                <option value="caballeros">Caballeros</option>
                <option value="damas">Damas</option>
                <option value="ninos">Niños</option>
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando finanzas...</div>
        ) : currentTx.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No hay movimientos en este mes.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {currentTx.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.tipo === 'ingreso' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.tipo === 'ingreso' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <p className="font-medium text-white">{tx.descripcion}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="capitalize px-2 py-0.5 bg-white/5 rounded-md">{tx.comunidad_slug}</span>
                      <span>{new Date(tx.fecha).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`font-bold ${tx.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.tipo === 'ingreso' ? '+' : '-'} {formatMoney(Number(tx.monto))}
                  </div>
                  
                  {user?.id === SUPER_ADMIN_ID && (
                    <button 
                      onClick={() => setTxToDelete(tx)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                      title="Eliminar transacción"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE ELIMINACIÓN Y FEEDBACK (Iguales) */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setTxToDelete(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setTxToDelete(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6"><AlertTriangle size={32} className="text-red-500" /></div>
              <h3 className="text-2xl font-bold text-white mb-2">¿Eliminar Transacción?</h3>
              <p className="text-gray-400 mb-8">
                Estás a punto de borrar el movimiento: <strong className="text-white">"{txToDelete.descripcion}"</strong> por un monto de <strong className="text-white">{formatMoney(txToDelete.monto)}</strong>.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setTxToDelete(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors flex justify-center items-center gap-2">
                  {deleting ? <Loader2 size={18} className="animate-spin" /> : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setFeedback(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setFeedback(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${feedback.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {feedback.type === 'success' ? <CheckCircle size={32} className="text-green-500" /> : <AlertTriangle size={32} className="text-red-500" />}
              </div>
              <p className="text-gray-400 mb-6">{feedback.message}</p>
              <button onClick={() => setFeedback(null)} className="w-full bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-medium transition-colors">Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}