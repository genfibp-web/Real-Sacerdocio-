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

    // 1. OBTENER O CREAR LA IDENTIDAD DEL DISPOSITIVO
    let deviceId = localStorage.getItem("rs_device_id");
    if (!deviceId) {
      // Si es su primera vez, creamos un ID único (ej: "a1b2c3d4-e5f6...")
      deviceId = crypto.randomUUID(); 
      localStorage.setItem("rs_device_id", deviceId);
    }

    // 2. GUARDAR EN LA BASE DE DATOS
    const saveVisit = async () => {
      await supabase.from('visitas').insert([
        {
          user_agent: `${device} - PWA: ${isPWA} - Página: ${pathname}`,
          device_id: deviceId, // <-- AQUÍ GUARDAMOS LA IDENTIDAD
        }
      ]);
    };

    saveVisit();

    // 3. MANTENER EL PRESENCE (Radar en vivo)
    const channel = supabase.channel('global-visitors', {
      config: { presence: { key: sessionId } },
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          device: device,
          isPWA: isPWA,
          currentPage: pathname,
          deviceId: deviceId, // También lo enviamos al radar en vivo
          joinedAt: new Date().toISOString(),
        });
      }
    });

    return () => { supabase.removeChannel(channel); };
  }, [pathname, sessionId]);

  return null;
}