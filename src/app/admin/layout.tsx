"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
// 👇 Agregamos Network para Ministerios
import { LayoutDashboard, CalendarDays, Image as ImageIcon, LogOut, MessageSquare, FileText, Users, Menu, X, Globe, Activity, Contact, DollarSign, Camera, BarChart3, Send, Network } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const SUPER_ADMIN_ID = "520245ef-6197-4247-8a7d-07a4772be4fc";

  useEffect(() => {
    if (pathname === "/admin") {
      setIsLoading(false);
      return;
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin");
      } else {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('nombre, rol, avatar_url, permisos') 
          .eq('id', session.user.id)
          .single();
          
        setUser({ 
          id: session.user.id, 
          email: session.user.email, 
          nombre: perfil?.nombre || "Líder",
          rol: perfil?.rol || "lider",
          avatar_url: perfil?.avatar_url,
          permisos: perfil?.permisos || []
        });
        setIsLoading(false);
      }
    };

    checkUser();
  }, [pathname, router]);

  useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      setUser((prev: any) => prev ? { ...prev, avatar_url: e.detail.newUrl } : null);
    };
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  if (pathname === "/admin") return <main className="bg-real-black min-h-screen">{children}</main>;
  if (isLoading) return <div className="min-h-screen bg-real-black flex items-center justify-center text-white">Cargando panel...</div>;

  // 🔥 LISTA MAESTRA DE MÓDULOS (El ID debe coincidir con el de la base de datos)
  const allMenuItems = [
    { id: "dashboard", name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { id: "eventos", name: "Eventos", href: "/admin/eventos", icon: CalendarDays },
    { id: "publicaciones", name: "Publicaciones", href: "/admin/publicaciones", icon: FileText }, 
    { id: "galeria", name: "Recuerdos", href: "/admin/galeria", icon: ImageIcon }, 
    { id: "predicas", name: "Prédicas", href: "/admin/predicas", icon: MessageSquare },
    { id: "miembros", name: "Miembros", href: "/admin/miembros", icon: Contact },
    { id: "finanzas", name: "Finanzas", href: "/admin/finanzas", icon: DollarSign },
    { id: "comunidades", name: "Portadas", href: "/admin/comunidades", icon: Camera },
    { id: "notificaciones", name: "Notificaciones", href: "/admin/notificaciones", icon: Send },
    { id: "usuarios", name: "Usuarios", href: "/admin/usuarios", icon: Users },
    { id: "visitantes", name: "Visitantes", href: "/admin/visitantes", icon: Activity },
    { id: "recursos", name: "Recursos", href: "/admin/recursos", icon: BarChart3 },
  ];

  // 🛡️ FILTRO MÁGICO: Si eres Súper Admin ves todo, si no, solo lo que está en tu array de permisos
  const menuItems = allMenuItems.filter(item => {
    if (user?.id === SUPER_ADMIN_ID) return true; 
    return user?.permisos?.includes(item.id);
  });

  return (
    <div className="flex h-screen bg-real-black text-white overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-real-dark border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-20 flex items-center justify-between border-b border-white/5 px-6">
          <div className="logo-perspective">
            <Image src="/logo_Rs.png" alt="Logo" width={80} height={30} className="object-contain animate-logo-spin" />
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? "bg-real-purple/20 text-real-purple font-semibold" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}

          {/* 👇 BOTÓN EXCLUSIVO PARA EL SÚPER ADMIN 👇 */}
          {user?.id === SUPER_ADMIN_ID && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Administración</p>
              </div>
              <Link 
                href="/admin/ministerios" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === "/admin/ministerios" ? "bg-real-gold/20 text-real-gold font-semibold" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
              >
                <Network size={20} />
                Ministerios
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 text-real-gold hover:text-white transition-colors rounded-xl hover:bg-real-gold/10 border border-transparent hover:border-real-gold/30">
            <Globe size={20} /> Ir a la Web
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-20 bg-real-dark border-b border-white/5 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-400 hover:text-white p-2" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            <h2 className="text-base md:text-lg font-medium text-white truncate">Bienvenido, {user?.nombre}</h2>
          </div>
          <Link href="/admin/ajustes" className="flex items-center hover:opacity-80 transition-opacity">
             {user?.avatar_url ? (
               <img src={user.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-real-purple shadow-md" />
             ) : (
               <div className="w-12 h-12 bg-real-purple rounded-full flex items-center justify-center font-bold text-lg uppercase flex-shrink-0 border-2 border-white/10">
                 {user?.nombre?.charAt(0) || "L"}
               </div>
             )}
          </Link>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}