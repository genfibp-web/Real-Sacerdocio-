"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, Image as ImageIcon, LogOut, MessageSquare, FileText, Users, Menu, X, Globe, Activity } from "lucide-react"; // <-- Activity agregado
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          .select('nombre, rol')
          .eq('id', session.user.id)
          .single();
          
        setUser({ 
          email: session.user.email, 
          nombre: perfil?.nombre || "Líder",
          rol: perfil?.rol || "lider" 
        });
        setIsLoading(false);
      }
    };

    checkUser();
  }, [pathname, router]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  if (pathname === "/admin") return <main className="bg-real-black min-h-screen">{children}</main>;
  if (isLoading) return <div className="min-h-screen bg-real-black flex items-center justify-center text-white">Cargando panel...</div>;

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Eventos", href: "/admin/eventos", icon: CalendarDays },
    { name: "Publicaciones", href: "/admin/publicaciones", icon: FileText }, 
    { name: "Recuerdos", href: "/admin/galeria", icon: ImageIcon }, 
    { name: "Prédicas", href: "/admin/predicas", icon: MessageSquare },
  ];

  if (user?.rol === 'admin') {
    menuItems.push({ name: "Usuarios", href: "/admin/usuarios", icon: Users });
    menuItems.push({ name: "Visitantes", href: "/admin/visitantes", icon: Activity }); // <-- NUEVO BOTÓN
  }

  return (
    <div className="flex h-screen bg-real-black text-white overflow-hidden">
      
      {/* OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-real-dark border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-20 flex items-center justify-between border-b border-white/5 px-6">
          <div className="logo-perspective">
            <Image src="/logo_Rs.png" alt="Logo" width={80} height={30} className="object-contain animate-logo-spin" />
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
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
        </nav>

        {/* SECCIÓN INFERIOR */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link 
            href="/" 
            className="w-full flex items-center gap-3 px-4 py-3 text-real-gold hover:text-white transition-colors rounded-xl hover:bg-real-gold/10 border border-transparent hover:border-real-gold/30"
          >
            <Globe size={20} /> Ir a la Web
          </Link>
          
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-20 bg-real-dark border-b border-white/5 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray-400 hover:text-white p-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-base md:text-lg font-medium text-white truncate">Bienvenido, {user?.nombre}</h2>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-real-purple rounded-full flex items-center justify-center font-bold uppercase flex-shrink-0">
               {user?.nombre?.charAt(0) || "L"}
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}