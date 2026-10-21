"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VisitorTracker() {
  const pathname = usePathname();
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    let device = "Desktop";
    if (/iphone|ipad|ipod/i.test(userAgent)) device = "iPhone";
    else if (/android/i.test(userAgent)) device = "Android";
    else if (isMobile) device = "Móvil";

    // 1. GUARDAR EN LA BASE DE DATOS (Para el historial del panel)
    const saveVisit = async () => {
      const { error } = await supabase.from('visitas').insert([
        {
          user_agent: `${device} - PWA: ${isPWA} - Página: ${pathname}`,
        }
      ]);
      if (error) console.error("Error guardando visita:", error);
    };

    saveVisit();

    // 2. MANTENER EL PRESENCE (Por si luego quieres un radar en vivo)
    const channel = supabase.channel('global-visitors', {
      config: { presence: { key: sessionId } },
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          device: device,
          isPWA: isPWA,
          currentPage: pathname,
          joinedAt: new Date().toISOString(),
        });
      }
    });

    return () => { supabase.removeChannel(channel); };
  }, [pathname, sessionId]);

  return null;
}