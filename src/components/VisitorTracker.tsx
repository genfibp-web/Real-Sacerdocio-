"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VisitorTracker() {
  const pathname = usePathname();
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    const userAgent = navigator.userAgent;
    const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    let device = "Desktop";
    if (/iphone|ipad|ipod/i.test(userAgent)) device = "iPhone";
    else if (/android/i.test(userAgent)) device = "Android";
    else if (isMobile) device = "Móvil";

    let deviceId: string;
    const storedId = localStorage.getItem("rs_device_id");
    
    if (storedId) {
      deviceId = storedId;
    } else {
      deviceId = crypto.randomUUID(); 
      localStorage.setItem("rs_device_id", deviceId);
    }

    // Guardar historial en DB (opcional, puedes dejarlo)
    const saveVisit = async () => {
      await supabase.from('visitas').insert([{
        user_agent: `${device} - PWA: ${isPWA} - Página: ${pathname}`,
        device_id: deviceId,
      }]);
    };
    saveVisit();

    // Canal de Presence
    const channel = supabase.channel('global-visitors', {
      config: { presence: { key: sessionId } },
    });

    // Función para entrar a la lista
    const enterRadar = async () => {
      if (channel.state === 'joined') {
        await channel.track({
          device: device,
          isPWA: isPWA,
          currentPage: pathname,
          deviceId: deviceId,
          joinedAt: new Date().toISOString(),
        });
      }
    };

    // Función para SALIR de la lista
    const leaveRadar = async () => {
      if (channel.state === 'joined') {
        await channel.untrack(); // <-- AQUÍ ESTÁ LA MAGIA: Nos borra del radar
      }
    };

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await enterRadar();
      }
    });

    // Detectar si el usuario cambia de pestaña o minimiza
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        enterRadar(); // Volvió: Aparece en el radar
      } else {
        leaveRadar(); // Se fue: Desaparece del radar
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => { 
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel); 
    };
  }, [pathname, sessionId]);

  return null;
}