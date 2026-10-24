"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Users, Loader2, CheckCircle, AlertTriangle, X, Search } from "lucide-react";

const SUPER_ADMIN_ID = "520245ef-6197-4247-8a7d-07a4772be4fc";

export default function AdminMinisterios() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ministerios, setMinisterios] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any>(null);

  // Estados para CREAR/EDITAR
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: "", nombre: "", slug: "" });

  // Estados para GESTIONAR MIEMBROS
  const [selectedMinisterio, setSelectedMinisterio] = useState<any | null>(null);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Cargar ministerios y verificar seguridad
  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.id !== SUPER_ADMIN_ID) {
      router.push("/admin/dashboard");
      return;
    }

    const { data } = await supabase.from("comunidades").select("*").order("nombre");
    if (data) setMinisterios(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // 2. Crear o Editar Ministerio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (formData.id) {
        // Editar
        const { error } = await supabase.from("comunidades").update({ nombre: formData.nombre, slug: formData.slug }).eq("id", formData.id);
        if (error) throw error;
      } else {
        // Crear nuevo
        const { error } = await supabase.from("comunidades").insert([{ nombre: formData.nombre, slug: formData.slug }]);
        if (error) throw error;
      }

      setFeedback({ type: "success", message: "Ministerio guardado correctamente." });
      setShowForm(false);
      setFormData({ id: "", nombre: "", slug: "" });
      fetchData();
    } catch (error: any) {
      setFeedback({ type: "error", message: "Error: " + error.message });
    } finally {
      setSaving(false);
    }
  };

  // 3. Eliminar Ministerio
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este ministerio? Los miembros quedarán sin ministerio.")) return;
    await supabase.from("comunidades").delete().eq("id", id);
    fetchData();
  };

  // 4. Cargar miembros de un ministerio
  const handleOpenMiembros = async (ministerio: any) => {
    setSelectedMinisterio(ministerio);
    // Traemos TODOS los miembros
    const { data } = await supabase.from("miembros").select("*").order("nombre");
    if (data) setMiembros(data);
  };

  // 5. Asignar/Quitar miembro del ministerio
  const toggleMiembro = async (miembro: any) => {
    const isInMinisterio = miembro.comunidad_slug === selectedMinisterio.slug;
    const newSlug = isInMinisterio ? "general" : selectedMinisterio.slug;

    // Actualizamos en la DB
    await supabase.from("miembros").update({ comunidad_slug: newSlug }).eq("id", miembro.id);
    
    // Actualizamos la vista local
    setMiembros(prev => prev.map(m => m.id === miembro.id ? { ...m, comunidad_slug: newSlug } : m));
  };

  // Generar slug automáticamente desde el nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nombre = e.target.value;
    const slug = nombre.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    setFormData({ ...formData, nombre, slug });
  };

  if (loading) return <div className="text-white p-8">Cargando panel...</div>;

  const filteredMiembros = miembros.filter(m => m.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Gestión de Ministerios</h1>
          <p className="text-gray-400">Crea ministerios y administra quiénes pertenecen a ellos.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setFormData({ id: "", nombre: "", slug: "" }); }}
          className="bg-real-purple hover:bg-real-blue text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> {showForm ? "Cancelar" : "Nuevo Ministerio"}
        </button>
      </div>

      {/* FORMULARIO CREAR/EDITAR */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-white mb-4">{formData.id ? "Editar" : "Crear"} Ministerio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nombre del Ministerio</label>
              <input type="text" required value={formData.nombre} onChange={handleNameChange} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-real-purple" placeholder="Ej: Ministerio de Alabanza" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Slug (URL)</label>
              <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-real-purple" placeholder="ministerio-de-alabanza" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="mt-4 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={20} /> : "Guardar Ministerio"}
          </button>
        </form>
      )}

      {/* LISTA DE MINISTERIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ministerios.map((min) => (
          <div key={min.id} className="bg-real-dark border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{min.nombre}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">{min.slug}</p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={() => handleOpenMiembros(min)} className="flex-1 bg-real-gold/10 hover:bg-real-gold/20 text-real-gold py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                <Users size={16} /> Miembros
              </button>
              <button onClick={() => { setFormData({ id: min.id, nombre: min.nombre, slug: min.slug }); setShowForm(true); window.scrollTo(0,0); }} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                <Edit size={18} />
              </button>
              <button onClick={() => handleDelete(min.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🪟 MODAL PARA GESTIONAR MIEMBROS */}
      {selectedMinisterio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedMinisterio(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Miembros: <span className="text-real-gold">{selectedMinisterio.nombre}</span></h3>
                <p className="text-sm text-gray-400">Marca las casillas para agregar o quitar miembros.</p>
              </div>
              <button onClick={() => setSelectedMinisterio(null)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>

            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder="Buscar miembro..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white pl-10 pr-4 py-2 rounded-xl outline-none" />
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {filteredMiembros.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No se encontraron miembros.</p>
              ) : (
                filteredMiembros.map(m => {
                  const isIn = m.comunidad_slug === selectedMinisterio.slug;
                  return (
                    <div key={m.id} onClick={() => toggleMiembro(m)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors border ${isIn ? 'bg-real-gold/10 border-real-gold/30' : 'bg-black/30 border-white/5 hover:bg-white/5'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isIn ? 'bg-real-gold text-black' : 'bg-white/10 text-gray-400'}`}>
                          {m.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-medium ${isIn ? 'text-real-gold' : 'text-white'}`}>{m.nombre}</p>
                          <p className="text-xs text-gray-500">Actual: {m.comunidad_slug}</p>
                        </div>
                      </div>
                      {isIn && <CheckCircle size={20} className="text-real-gold" />}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

      {/* FEEDBACK */}
      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setFeedback(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
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