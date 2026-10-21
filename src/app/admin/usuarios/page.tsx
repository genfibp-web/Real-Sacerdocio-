"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, Loader2, Shield, User, Trash2, CheckCircle, AlertTriangle, X, Radio } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 

export default function UsuariosAdmin() {
  const router = useRouter(); 
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
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
    let room: any = null; 

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

      // 🛡️ IMPORTANTE: El canal aquí es 'online-users', NO 'global-visitors'
      room = supabase.channel('online-users');
      room.on('presence', { event: 'sync' }, () => {
        const state = room.presenceState();
        const users = Object.keys(state).map((key) => (state[key][0] as any).user_id);
        setOnlineUsers(users);
      }).subscribe(async (status: any) => {
        if (status === 'SUBSCRIBED') {
          await room.track({ user_id: session.user.id });
        }
      });
    };

    checkAdminAndConnect();

    return () => { 
      if (room) supabase.removeChannel(room); 
    };
  }, [router]);

  // ... (El resto de tu JSX, modales y formulario se queda exactamente igual)
  // ... (Mantén el return con el formulario y la tabla)
  
  // NOTA: Pega el resto de tu JSX aquí si lo borraste, 
  // pero asegúrate de que NO tenga el código de 'VisitantesPage'.
  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
       {/* ... tu JSX del directorio de líderes ... */}
       <h1 className="font-serif text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
    </div>
  );
}