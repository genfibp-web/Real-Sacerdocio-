"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, Loader2, Search, Filter, Phone, MapPin, Trash2, AlertTriangle, X, CheckCircle, Edit, Cake } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MiembrosAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [miembros, setMiembros] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCommunity, setFilterCommunity] = useState("all");

  // Estados para el formulario de AGREGAR
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    fecha_nacimiento: "",
    comunidad_slug: "jovenes",
  });
  const [showForm, setShowForm] = useState(false);

  // Estados para EDITAR
  const [miembroToEdit, setMiembroToEdit] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    telefono: "",
    fecha_nacimiento: "",
    comunidad_slug: "",
  });

  // Estados para ELIMINAR
  const [miembroToDelete, setMiembroToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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

  const fetchMiembros = async () => {
    setLoading(true);
    let query = supabase.from('miembros').select('*').order('nombre');

    if (user?.rol === 'lider') {
      query = query.eq('comunidad_slug', user.comunidad_slug);
    } else if (user?.rol === 'admin' && filterCommunity !== 'all') {
      query = query.eq('comunidad_slug', filterCommunity);
    }

    const { data } = await query;
    if (data) setMiembros(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchMiembros();
  }, [user, filterCommunity]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Limpiamos los campos vacíos a null para evitar errores en Supabase
    const payload = {
      nombre: formData.nombre,
      telefono: formData.telefono.trim() || null,
      fecha_nacimiento: formData.fecha_nacimiento || null,
      comunidad_slug: formData.comunidad_slug,
    };

    const { error } = await supabase.from('miembros').insert([payload]);
    
    if (error) {
      setFeedback({ type: 'error', message: "Error al guardar: " + error.message });
    } else {
      setFeedback({ type: 'success', message: "Miembro registrado exitosamente." });
      setShowForm(false);
      setFormData({ nombre: "", telefono: "", fecha_nacimiento: "", comunidad_slug: user.rol === 'lider' ? user.comunidad_slug : 'jovenes' });
      fetchMiembros();
    }
    setSaving(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!miembroToEdit) return;
    setSaving(true);

    const payload = {
      nombre: editFormData.nombre,
      telefono: editFormData.telefono.trim() || null,
      fecha_nacimiento: editFormData.fecha_nacimiento || null,
      comunidad_slug: editFormData.comunidad_slug,
    };

    const { error } = await supabase
      .from('miembros')
      .update(payload)
      .eq('id', miembroToEdit.id);

    if (error) {
      setFeedback({ type: 'error', message: "Error al actualizar: " + error.message });
    } else {
      setFeedback({ type: 'success', message: "Miembro actualizado correctamente." });
      setMiembroToEdit(null);
      fetchMiembros();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!miembroToDelete) return;
    setDeleting(true);

    const { error } = await supabase
      .from('miembros')
      .delete()
      .eq('id', miembroToDelete.id);

    if (error) {
      setFeedback({ type: 'error', message: "Error al eliminar: " + error.message });
    } else {
      setFeedback({ type: 'success', message: "Miembro eliminado del censo." });
      fetchMiembros();
    }
    
    setDeleting(false);
    setMiembroToDelete(null);
  };

  const formatPhone = (phone: string) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) cleaned = cleaned.substring(1);
    if (cleaned.length === 10) return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    return cleaned;
  };

  // 🎂 FUNCIONES DE CUMPLEAÑOS Y EDAD
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const [year, month, day] = birthDate.split('-').map(Number);
    const birth = new Date(year, month - 1, day);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getBirthdayStatus = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = birthDate.split('-').map(Number);
    
    let nextBirthday = new Date(today.getFullYear(), month - 1, day);
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Si es hoy, retorna today. Si falta cualquier cantidad de días, retorna upcoming.
    if (diffDays === 0) return { status: 'today', days: 0 };
    return { status: 'upcoming', days: diffDays };
  };

  const filteredMiembros = miembros.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const birthdaysToday = miembros.filter(m => {
    const bday = getBirthdayStatus(m.fecha_nacimiento);
    return bday?.status === 'today';
  });

  if (!user) return <div className="p-8 text-white">Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      
      {/* 🎉 BANNER DE CUMPLEAÑOS DE HOY */}
      {birthdaysToday.length > 0 && (
        <div className="bg-gradient-to-r from-real-purple/20 to-real-gold/20 border border-real-gold/30 p-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="w-12 h-12 bg-real-gold text-black rounded-full flex items-center justify-center shrink-0">
            <Cake size={24} />
          </div>
          <div>
            <h3 className="text-real-gold font-bold text-lg">¡Hoy estamos de fiesta! 🎉</h3>
            <p className="text-gray-300 text-sm">
              Felicidades a: <span className="font-bold text-white">{birthdaysToday.map(m => m.nombre).join(', ')}</span>
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Censo de Miembros</h1>
          <p className="text-gray-400">Administra el directorio de hermanos de la iglesia.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-real-purple hover:bg-real-blue text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
        >
          <UserPlus size={18} /> {showForm ? "Cancelar" : "Agregar Miembro"}
        </button>
      </div>

      {/* FORMULARIO DE AGREGAR */}
      {showForm && (
        <form onSubmit={handleAddMember} className="bg-real-dark border border-white/10 p-6 rounded-2xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-white mb-4">Registrar Nuevo Miembro</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nombre Completo</label>
              <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg" placeholder="Ej: Juan Pérez" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Teléfono (Opcional)</label>
              <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg" placeholder="Ej: 809-555-1234" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fecha de Nacimiento</label>
              <input type="date" value={formData.fecha_nacimiento} onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg [color-scheme:dark]" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Comunidad</label>
              {/* FIX: Dropdown oscuro */}
              <select disabled={user.rol === 'lider'} value={formData.comunidad_slug} onChange={(e) => setFormData({...formData, comunidad_slug: e.target.value})} className="w-full bg-real-dark border border-white/10 text-white px-3 py-2 rounded-lg disabled:opacity-50">
                <option value="jovenes" className="bg-real-dark text-white">Jóvenes</option>
                <option value="caballeros" className="bg-real-dark text-white">Caballeros</option>
                <option value="damas" className="bg-real-dark text-white">Damas</option>
                <option value="ninos" className="bg-real-dark text-white">Niños</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="mt-4 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={18} /> : "Guardar Miembro"}
          </button>
        </form>
      )}

      {/* TABLA / LISTA */}
      <div className="bg-real-dark border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between bg-white/5">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:border-real-purple" />
          </div>

          {user.rol === 'admin' && (
            <div className="flex items-center gap-2 bg-real-dark border border-white/10 px-3 py-2 rounded-lg text-sm">
              <Filter size={16} className="text-gray-400" />
              {/* FIX: Dropdown oscuro */}
              <select value={filterCommunity} onChange={(e) => setFilterCommunity(e.target.value)} className="bg-real-dark text-white outline-none cursor-pointer capitalize">
                <option value="all" className="bg-real-dark text-white">Todas las comunidades</option>
                <option value="jovenes" className="bg-real-dark text-white">Jóvenes</option>
                <option value="caballeros" className="bg-real-dark text-white">Caballeros</option>
                <option value="damas" className="bg-real-dark text-white">Damas</option>
                <option value="ninos" className="bg-real-dark text-white">Niños</option>
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando censo...</div>
        ) : filteredMiembros.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No se encontraron miembros.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredMiembros.map((miembro) => {
              const age = calculateAge(miembro.fecha_nacimiento);
              const bday = getBirthdayStatus(miembro.fecha_nacimiento);
              
              return (
                <div key={miembro.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 text-gray-300 rounded-full flex items-center justify-center font-bold relative">
                      {miembro.nombre.charAt(0).toUpperCase()}
                      {bday?.status === 'today' && (
                         <span className="absolute -bottom-1 -right-1 text-sm">🎂</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{miembro.nombre}</p>
                        {age !== null && (
                          <span className="text-xs text-gray-400 font-normal">({age} años)</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1 capitalize"><MapPin size={12} /> {miembro.comunidad_slug}</span>
                        {miembro.telefono && (
                          <a href={`tel:${miembro.telefono.replace(/[^\d+]/g, '')}`} className="flex items-center gap-1 hover:text-real-purple transition-colors font-medium" title={`Llamar a ${miembro.nombre}`}>
                            <Phone size={12} /> {formatPhone(miembro.telefono)}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    
                    {/* FIX: Etiqueta de cumpleaños SIEMPRE visible si falta tiempo */}
                    {bday?.status === 'today' ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-real-gold bg-real-gold/20 border border-real-gold/30 px-2 py-1 rounded-md animate-pulse">
                        <Cake size={12} /> ¡Hoy es su cumpleaños! 🎉
                      </div>
                    ) : bday?.status === 'upcoming' ? (
                      <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                        <Cake size={12} className="text-real-gold" /> Faltan {bday.days} días
                      </div>
                    ) : null}

                    <div className="text-xs text-gray-500 hidden lg:block mr-2">
                      {miembro.fecha_nacimiento ? new Date(miembro.fecha_nacimiento + 'T00:00:00').toLocaleDateString() : 'Sin fecha'}
                    </div>
                    
                    <button 
                      onClick={() => {
                        setMiembroToEdit(miembro);
                        setEditFormData({ 
                          nombre: miembro.nombre, 
                          telefono: miembro.telefono || "", 
                          fecha_nacimiento: miembro.fecha_nacimiento || "",
                          comunidad_slug: miembro.comunidad_slug 
                        });
                      }}
                      className="p-2 text-gray-500 hover:text-real-gold hover:bg-real-gold/10 rounded-lg transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                      title="Editar miembro"
                    >
                      <Edit size={18} />
                    </button>

                    <button 
                      onClick={() => setMiembroToDelete(miembro)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                      title="Eliminar miembro"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🛠️ MODAL DE EDICIÓN */}
      {miembroToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setMiembroToEdit(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setMiembroToEdit(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <h3 className="text-2xl font-bold text-white mb-6">Editar Miembro</h3>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nombre Completo</label>
                <input type="text" required value={editFormData.nombre} onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Teléfono</label>
                <input type="text" value={editFormData.telefono} onChange={(e) => setEditFormData({...editFormData, telefono: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Fecha de Nacimiento</label>
                <input type="date" value={editFormData.fecha_nacimiento} onChange={(e) => setEditFormData({...editFormData, fecha_nacimiento: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg [color-scheme:dark]" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Comunidad</label>
                <select disabled={user.rol === 'lider'} value={editFormData.comunidad_slug} onChange={(e) => setEditFormData({...editFormData, comunidad_slug: e.target.value})} className="w-full bg-real-dark border border-white/10 text-white px-3 py-2 rounded-lg disabled:opacity-50">
                  <option value="jovenes" className="bg-real-dark text-white">Jóvenes</option>
                  <option value="caballeros" className="bg-real-dark text-white">Caballeros</option>
                  <option value="damas" className="bg-real-dark text-white">Damas</option>
                  <option value="ninos" className="bg-real-dark text-white">Niños</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setMiembroToEdit(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-real-purple hover:bg-real-blue text-white py-3 rounded-xl font-medium transition-colors flex justify-center items-center gap-2">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚠️ MODAL DE ELIMINACIÓN */}
      {miembroToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setMiembroToDelete(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setMiembroToDelete(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6"><AlertTriangle size={32} className="text-red-500" /></div>
              <h3 className="text-2xl font-bold text-white mb-2">¿Eliminar a este miembro?</h3>
              <p className="text-gray-400 mb-8">
                Estás a punto de eliminar a <strong className="text-white">"{miembroToDelete.nombre}"</strong> del censo de la iglesia.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setMiembroToDelete(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors flex justify-center items-center gap-2">
                  {deleting ? <Loader2 size={18} className="animate-spin" /> : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL DE FEEDBACK */}
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