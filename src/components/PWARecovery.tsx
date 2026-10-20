"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

export default function PWARecovery() {
  const pathname = usePathname();

  useEffect(() => {
    // Solo actuar en rutas de admin
    if (!pathname.startsWith('/admin')) return;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Si estamos en el admin, no hay sesión y no estamos en el login...
      if (!session && pathname !== '/admin') {
        console.log("Sesión perdida en PWA. Recargando...");
        // Forzamos una recarga completa para que el middleware re-lea las cookies
        window.location.reload();
      }
    };

    // Verificar cuando la app vuelve del segundo plano
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pathname]);

  return null;
}