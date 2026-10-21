"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VisitorTracker() {
  const pathname = usePathname();
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));

  useEffect(() => {
    // Bloqueamos el tracker si estamos en el admin
    if (pathname.startsWith('/admin')) {
      return;
    }

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

    const saveVisit = async () => {
      await supabase.from('visitas').insert([
        {
          user_agent: `${device} - PWA: ${isPWA} - Página: ${pathname}`,
          device_id: deviceId,
        }
      ]);
    };

    saveVisit();

    // Canal compartido
    const channel = supabase.channel('global-visitors', {
      config: { presence: { key: sessionId } },
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          device: device,
          isPWA: isPWA,
          currentPage: pathname,
          deviceId: deviceId,
          joinedAt: new Date().toISOString(),
        });
      }
    });

    return () => { supabase.removeChannel(channel); };
  }, [pathname, sessionId]);

  return null;
}