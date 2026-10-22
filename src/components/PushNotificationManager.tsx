"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, BellOff } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PushNotificationManager() {
  const pathname = usePathname();
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setSubscribed(true);
        });
      });
    }
  }, []);

  const handleSubscribe = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        alert("Error: El navegador no soporta Service Workers.");
        return;
      }

      // 1. Pedir permisos
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("No diste permiso para las notificaciones.");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      
      // 2. Verificar si la llave VAPID existe
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        alert("Error Crítico: La llave pública VAPID no está configurada.");
        return;
      }

      // 3. Crear la suscripción
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });

      const { endpoint, keys } = sub.toJSON() as any;
      const deviceId = localStorage.getItem("rs_device_id");

      // 4. Guardar en Supabase (AHORA SÍ VERIFICAMOS EL ERROR)
      const { error } = await supabase.from('push_subscriptions').upsert({
        endpoint: endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        device_id: deviceId || "desconocido"
      }, { onConflict: 'endpoint' });

      if (error) {
        // ¡AQUÍ VEREMOS EL ERROR REAL EN PANTALLA!
        alert("Error de Supabase: " + error.message);
        console.error("Detalle del error:", error);
      } else {
        setSubscribed(true);
        alert("¡Notificaciones activadas y guardadas en la base de datos exitosamente!");
      }

    } catch (error: any) {
      alert("Error inesperado: " + error.message);
      console.error(error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <button
      onClick={handleSubscribe}
      className={`fixed bottom-20 right-4 z-50 p-4 rounded-full shadow-2xl ${
        subscribed ? 'bg-green-600' : 'bg-real-purple'
      } text-white`}
    >
      {subscribed ? <Bell size={24} /> : <BellOff size={24} />}
    </button>
  );
}