"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, Loader2, Shield, User, Trash2, CheckCircle, AlertTriangle, X, Key, Eye, EyeOff, Edit, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Lista de todos los módulos disponibles en el sistema
const MODULOS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "eventos", label: "Eventos" },
  { id: "publicaciones", label: "Publicaciones" },
  { id: "galeria", label: "Recuerdos" },
  { id: "predicas", label: "Prédicas" },
  { id: "miembros", label: "Miembros" },
  { id: "finanzas", label: "Finanzas" },
  { id: "comunidades", label: "Portadas" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "usuarios", label: "Usuarios" },
  { id: "visitantes", label: "Visitantes" },
  { id: "recursos", label: "Recursos" },
];

export default function UsuariosAdmin() {
  const router = useRouter(); 
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});

  // Estados para CREAR usuario
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "lider",
    comunidad_slug: "jovenes",
  });
  const [newPermisos, setNewPermisos] = useState<string[]>(["dashboard", "eventos", "publicaciones"]);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<any | null>(null); 
  
  // Estados para EDITAR usuario
  const [usuarioToEdit, setUsuarioToEdit] = useState<any | null>(null);
  const [editRol, setEditRol] = useState("lider");
  const [editComunidad, setEditComunidad] = useState("jovenes");
  const [editPermisos, setEditPermisos] = useState<string[]>([]);

  // Estados para CONTRASEÑA
  const [usuarioToChangePass, setUsuarioToChangePass] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const SUPER_ADMIN_ID = "520245ef-6197-4247-8a7d-07a4772be4fc";

  const fetchUsuarios = async () => {
    const { data } = await supabase.from('perfiles').select('*').order('nombre');
    if (data) setUsuarios(data);
  };

  useEffect(() => {
    const checkAdminAndConnect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id !== SUPER_ADMIN_ID) {
        router.push("/admin"); 
        return;
      }
      fetchUsuarios();
    };
    checkAdminAndConnect();
  }, [router]);

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckboxChange = (id: string, isEditing: boolean) => {
    if (isEditing) {
      setEditPermisos(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    } else {
      setNewPermisos(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        comunidad_slug: formData.rol === 'admin' ? 'general' : formData.comunidad_slug,
        permisos: newPermisos
      };

      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback({ type: 'success', message: "Usuario creado exitosamente." });
      setFormData({ nombre: "", email: "", password: "", rol: "lider", comunidad_slug: "jovenes" });
      setNewPermisos(["dashboard", "eventos", "publicaciones"]);
      fetchUsuarios();
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!usuarioToDelete) return;
    const res = await fetch(`/api/usuarios?id=${usuarioToDelete.id}`, { method: 'DELETE' });
    
    if (res.ok) {
      setFeedback({ type: 'success', message: "Usuario eliminado del sistema." });
      fetchUsuarios();
    } else {
      setFeedback({ type: 'error', message: "Error al eliminar" });
    }
    setUsuarioToDelete(null); 
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioToEdit) return;
    setLoading(true);

    try {
      const res = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: usuarioToEdit.id,
          newRole: editRol,
          newCommunity: editRol === 'admin' ? 'general' : editComunidad,
          newPermisos: editPermisos,
          requesterId: SUPER_ADMIN_ID
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback({ type: 'success', message: "Permisos actualizados correctamente." });
      setUsuarioToEdit(null);
      fetchUsuarios();
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioToChangePass) return;
    setLoading(true);

    try {
      const res = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: usuarioToChangePass.id, newPassword, requesterId: SUPER_ADMIN_ID })
      });

      if (!res.ok) throw new Error("Error al cambiar contraseña");

      setFeedback({ type: 'success', message: "Contraseña actualizada correctamente." });
      setUsuarioToChangePass(null);
      setNewPassword("");
      fetchUsuarios();
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <div>
        <Link href="/admin/dashboard" className="text-sm text-gray-400 hover:text-white mb-2 inline-block">← Volver al Dashboard</Link>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-400">Crea usuarios y configura exactamente qué pueden ver en el panel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO DE CREACIÓN */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 rounded-2xl p-6 space-y-4 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-real-purple" /> Nuevo Usuario
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Nombre</label>
              <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm" placeholder="Ej: Pastor Juan" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Correo</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm" placeholder="correo@iglesia.com" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Contraseña</label>
              <input type="text" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm" placeholder="Mínimo 6 caracteres" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Rol Base (Solo visual)</label>
              <select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm">
                <option value="lider">Líder de Comunidad</option>
                <option value="admin">Administrador General</option>
              </select>
            </div>

            {formData.rol === 'lider' && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Comunidad Asignada</label>
                <select value={formData.comunidad_slug} onChange={(e) => setFormData({...formData, comunidad_slug: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm">
                  <option value="jovenes">Jóvenes</option>
                  <option value="caballeros">Caballeros</option>
                  <option value="damas">Damas</option>
                  <option value="ninos">Niños</option>
                </select>
              </div>
            )}

            {/* CHECKBOXES PARA CREAR */}
            <div className="space-y-2 mt-4 bg-black/20 p-3 rounded-xl border border-white/5">
              <label className="text-xs font-bold text-real-gold flex items-center gap-2 mb-2"><Lock size={14} /> Accesos al Panel</label>
              <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                {MODULOS.map(mod => (
                  <label key={mod.id} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white">
                    <input 
                      type="checkbox" 
                      checked={newPermisos.includes(mod.id)} 
                      onChange={() => handleCheckboxChange(mod.id, false)}
                      className="w-4 h-4 accent-real-purple rounded"
                    />
                    {mod.label}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-real-purple hover:bg-real-blue text-white py-2 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 mt-4">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Crear Usuario"}
            </button>
          </form>
        </div>

        {/* LISTA DE USUARIOS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <h3 className="font-bold text-white">Directorio</h3>
            </div>
            
            <div className="divide-y divide-white/5">
              {usuarios.map((user) => (
                <div key={user.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} className="w-12 h-12 rounded-full object-cover border border-white/20" />
                    ) : (
                      <div className="w-12 h-12 bg-real-purple/20 text-real-purple rounded-full flex items-center justify-center font-bold text-lg">
                        {user.nombre.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className={`font-medium text-lg ${user.id === SUPER_ADMIN_ID ? 'text-real-gold' : 'text-white'}`}>{user.nombre}</p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 bg-black/30 px-2 py-0.5 rounded">
                          {user.rol}
                        </span>
                        <span className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-0.5 rounded border border-white/5">
                          Clave: {showPasswords[user.id] ? (user.password_temporal || "No asignada") : "••••••••"}
                        </span>
                        {user.password_temporal && (
                          <button onClick={() => togglePassword(user.id)} className="text-gray-500 hover:text-white transition-colors" title="Ver/Ocultar Clave">
                            {showPasswords[user.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-2">
                    {user.id !== SUPER_ADMIN_ID && (
                      <button onClick={() => {
                        setUsuarioToEdit(user);
                        setEditRol(user.rol);
                        setEditComunidad(user.comunidad_slug || "jovenes");
                        setEditPermisos(user.permisos || []);
                      }} className="flex items-center gap-2 px-3 py-2 bg-real-gold/10 text-real-gold hover:bg-real-gold/20 rounded-lg transition-colors border border-real-gold/20" title="Editar Permisos">
                        <Edit size={16} /> <span className="text-xs font-medium hidden md:inline">Editar</span>
                      </button>
                    )}

                    <button onClick={() => setUsuarioToChangePass(user)} className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20" title="Cambiar Contraseña">
                      <Key size={16} /> <span className="text-xs font-medium hidden md:inline">Clave</span>
                    </button>

                    {user.id !== SUPER_ADMIN_ID ? (
                      <button onClick={() => setUsuarioToDelete(user)} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20" title="Eliminar Usuario">
                        <Trash2 size={16} /> <span className="text-xs font-medium hidden md:inline">Eliminar</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-real-gold bg-real-gold/10 px-3 py-2 rounded-lg border border-real-gold/20">
                        <Shield size={12} /> SUPER ADMIN
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🛠️ MODAL DE EDITAR ROL Y PERMISOS */}
      {usuarioToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setUsuarioToEdit(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
            <button onClick={() => setUsuarioToEdit(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-real-gold/10 rounded-full flex items-center justify-center mb-4"><Edit size={32} className="text-real-gold" /></div>
              <h3 className="text-2xl font-bold text-white mb-2">Editar Accesos</h3>
              <p className="text-gray-400 text-sm">Configura qué puede ver <strong className="text-white">{usuarioToEdit.nombre}</strong>.</p>
            </div>
            
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Rol Base</label>
                  <select value={editRol} onChange={(e) => setEditRol(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-xl focus:border-real-gold outline-none">
                    <option value="lider">Líder</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {editRol === 'lider' && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Comunidad</label>
                    <select value={editComunidad} onChange={(e) => setEditComunidad(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-xl focus:border-real-gold outline-none">
                      <option value="jovenes">Jóvenes</option>
                      <option value="caballeros">Caballeros</option>
                      <option value="damas">Damas</option>
                      <option value="ninos">Niños</option>
                    </select>
                  </div>
                )}
              </div>

              {/* CHECKBOXES PARA EDITAR */}
              <div className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/5">
                <label className="text-xs font-bold text-real-gold flex items-center gap-2 mb-2"><Lock size={14} /> Accesos al Panel</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2">
                  {MODULOS.map(mod => (
                    <label key={mod.id} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white">
                      <input 
                        type="checkbox" 
                        checked={editPermisos.includes(mod.id)} 
                        onChange={() => handleCheckboxChange(mod.id, true)}
                        className="w-4 h-4 accent-real-gold rounded"
                      />
                      {mod.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setUsuarioToEdit(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 bg-real-gold hover:bg-yellow-500 text-black py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔑 MODAL DE CAMBIO DE CONTRASEÑA */}
      {usuarioToChangePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setUsuarioToChangePass(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <button onClick={() => setUsuarioToChangePass(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4"><Key size={32} className="text-blue-400" /></div>
              <h3 className="text-2xl font-bold text-white mb-2">Nueva Contraseña</h3>
              <p className="text-gray-400 text-sm">Asigna una clave a <strong className="text-white">{usuarioToChangePass.nombre}</strong>.</p>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Contraseña (Mínimo 6 caracteres)</label>
                <input type="text" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:border-blue-500 outline-none" placeholder="Ej: Temporal2026" />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setUsuarioToChangePass(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALES DE ELIMINACIÓN Y FEEDBACK */}
      {usuarioToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setUsuarioToDelete(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <button onClick={() => setUsuarioToDelete(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6"><AlertTriangle size={32} className="text-red-500" /></div>
              <h3 className="text-2xl font-bold text-white mb-2">¿Eliminar a este usuario?</h3>
              <p className="text-gray-400 mb-8">Estás a punto de eliminar a <strong className="text-white">"{usuarioToDelete.nombre}"</strong>.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setUsuarioToDelete(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors">Sí, eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setFeedback(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
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