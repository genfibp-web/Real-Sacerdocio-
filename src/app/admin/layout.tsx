"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, Image as ImageIcon, LogOut, MessageSquare, FileText, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  if (pathname === "/admin") return <main className="bg-real-black min-h-screen">{children}</main>;
  if (isLoading) return <div className="min-h-screen bg-real-black flex items-center justify-center text-white">Cargando panel...</div>;

  // 1. Definimos el menú base para todos
  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Eventos", href: "/admin/eventos", icon: CalendarDays },
    { name: "Publicaciones", href: "/admin/publicaciones", icon: FileText }, 
    { name: "Recuerdos", href: "/admin/galeria", icon: ImageIcon }, 
    { name: "Prédicas", href: "/admin/predicas", icon: MessageSquare },
  ];

  // 2. Si el usuario es admin, le agregamos la opción de Usuarios
  if (user?.rol === 'admin') {
    menuItems.push({ name: "Usuarios", href: "/admin/usuarios", icon: Users });
  }

  return (
    <div className="flex h-screen bg-real-black text-white">
      <aside className="w-64 bg-real-dark border-r border-white/5 flex flex-col">
        <div className="h-20 flex items-center justify-center border-b border-white/5 px-6">
          <Image src="/logo_Rs.png" alt="Logo" width={80} height={30} className="object-contain" />
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
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

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-real-dark border-b border-white/5 flex items-center justify-between px-8">
          <h2 className="text-lg font-medium text-white">Bienvenido, {user?.nombre}</h2>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-real-purple rounded-full flex items-center justify-center font-bold uppercase">
               {user?.nombre?.charAt(0) || "L"}
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}