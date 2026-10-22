"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, Loader2, Shield, User, Trash2, CheckCircle, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UsuariosAdmin() {
  const router = useRouter(); 
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  
  // Estado para el visor de imágenes
  const [viewingAvatar, setViewingAvatar] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "lider",
    comunidad_slug: "jovenes",
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<any | null>(null); 

  const SUPER_ADMIN_ID = "520245ef-6197-4247-8a7d-07a4772be4fc";

  const fetchUsuarios = async () => {
    const { data } = await supabase.from('perfiles').select('*').order('nombre');
    if (data) setUsuarios(data);
  };

  useEffect(() => {
    const checkAdminAndConnect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/admin"); 
        return;
      }

      if (session.user.id !== SUPER_ADMIN_ID) {
        router.push("/admin/dashboard"); 
        return;
      }

      fetchUsuarios();
    };

    checkAdminAndConnect();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        comunidad_slug: formData.rol === 'admin' ? 'general' : formData.comunidad_slug
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
    const data = await res.json();

    if (!res.ok) {
      setFeedback({ type: 'error', message: "Error al eliminar: " + data.error });
    } else {
      setFeedback({ type: 'success', message: "Usuario eliminado del sistema." });
      fetchUsuarios();
    }
    setUsuarioToDelete(null); 
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <div>
        <Link href="/admin/dashboard" className="text-sm text-gray-400 hover:text-white mb-2 inline-block">
          ← Volver al Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-400">Crea, administra y monitorea a los líderes de la iglesia.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-real-dark border border-white/10 rounded-2xl p-6 space-y-4 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-real-purple" /> Nuevo Líder
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Nombre</label>
              <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm" placeholder="Ej: Pastor Juan" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Correo Electrónico</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm" placeholder="lider@realsacerdocio.com" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Contraseña Temporal</label>
              <input type="text" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm" placeholder="Mínimo 6 caracteres" />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Rol</label>
              <select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm">
                <option value="lider">Líder de Comunidad</option>
                <option value="admin">Administrador General</option>
              </select>
            </div>

            {formData.rol === 'lider' && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Comunidad</label>
                <select value={formData.comunidad_slug} onChange={(e) => setFormData({...formData, comunidad_slug: e.target.value})} className="w-full bg-black/50 border border-white/10 text-white px-3 py-2 rounded-lg text-sm">
                  <option value="jovenes">Jóvenes</option>
                  <option value="caballeros">Caballeros</option>
                  <option value="damas">Damas</option>
                  <option value="ninos">Niños</option>
                </select>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-real-purple hover:bg-real-blue text-white py-2 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 mt-4">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Crear Usuario"}
            </button>
          </form>
        </div>

        {/* LISTA DE USUARIOS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-real-dark border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h3 className="font-bold text-white">Directorio de Líderes</h3>
            </div>
            
            <div className="divide-y divide-white/5">
              {usuarios.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {/* 👇 AVATAR CLICABLE (Con fallback rápido) 👇 */}
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.nombre} 
                          onClick={() => setViewingAvatar(user.avatar_url)}
                          className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm cursor-pointer hover:scale-110 transition-transform" 
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-real-purple/20 text-real-purple rounded-full flex items-center justify-center font-bold">
                          {user.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${user.id === SUPER_ADMIN_ID ? 'text-real-gold' : 'text-white'}`}>
                        {user.nombre}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {user.rol === 'admin' ? (
                          <>
                            <Shield size={12} className="text-real-gold" />
                            <span className="text-real-gold font-medium">Administrador General</span>
                          </>
                        ) : (
                          <>
                            <User size={12} />
                            <span className="capitalize">Líder</span>
                            {user.comunidad_slug && <span>• {user.comunidad_slug}</span>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {user.id !== SUPER_ADMIN_ID ? (
                    <button onClick={() => setUsuarioToDelete(user)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-real-gold bg-real-gold/10 px-2 py-1 rounded-md border border-real-gold/20">
                      <Shield size={12} /> SUPER ADMIN
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 VISOR DE IMAGEN (LIGHTBOX) PARA EL DIRECTORIO */}
      {viewingAvatar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setViewingAvatar(null)}>
          <button className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors" onClick={() => setViewingAvatar(null)}>
            <X size={24} />
          </button>
          <img 
            src={viewingAvatar} 
            alt="Foto en grande" 
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      {/* MODAL DE ELIMINACIÓN */}
      {usuarioToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setUsuarioToDelete(null)}></div>
          <div className="relative bg-real-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setUsuarioToDelete(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6"><AlertTriangle size={32} className="text-red-500" /></div>
              <h3 className="text-2xl font-bold text-white mb-2">¿Eliminar a este líder?</h3>
              <p className="text-gray-400 mb-8">
                Estás a punto de eliminar a <strong className="text-white">"{usuarioToDelete.nombre}"</strong>. Perderá acceso al panel y se borrará su cuenta permanentemente.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setUsuarioToDelete(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors">Sí, eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FEEDBACK */}
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