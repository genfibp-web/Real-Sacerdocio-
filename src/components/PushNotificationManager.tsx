"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, BellOff } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PushNotificationManager() {
  const pathname = usePathname();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // 1. Verificar si ya está suscrito
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const subscribe = async () => {
    if (!("serviceWorker" in navigator)) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });

    const { endpoint, keys } = subscription.toJSON() as any;
    
    // Obtenemos el device_id de la PWA para vincular el dispositivo
    const deviceId = localStorage.getItem("rs_device_id");

    await supabase.from('push_subscriptions').upsert({
      endpoint: endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      device_id: deviceId // <-- Guardamos el ID de la PWA para saber quién es
    }, { onConflict: 'endpoint' });

    setIsSubscribed(true);
  };

  // 🪄 AUTO-SUSCRIPCIÓN: Si tiene la PWA abierta, intentamos suscribir automáticamente
  useEffect(() => {
    const autoSubscribe = async () => {
      // Solo intentamos si el navegador soporta notificaciones y no está suscrito
      if ("Notification" in window && "serviceWorker" in navigator && !isSubscribed) {
        // Si el permiso ya está concedido (porque ya dijo que sí antes)
        if (Notification.permission === "granted") {
          await subscribe();
        }
      }
    };
    
    // Esperamos un momento a que cargue la página para no bloquear
    const timer = setTimeout(autoSubscribe, 3000);
    return () => clearTimeout(timer);
  }, [isSubscribed]);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  };

  // 🛡️ SI ESTAMOS EN EL PANEL DE ADMIN, NO MOSTRAMOS NADA
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <button
      onClick={subscribe}
      disabled={isSubscribed}
      className={`fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 p-4 rounded-full shadow-2xl transition-all hover:scale-105 ${
        isSubscribed 
          ? 'bg-green-600 text-white' // Si ya está suscrito, se pone verde
          : 'bg-real-purple hover:bg-real-blue text-white'
      }`}
      title={isSubscribed ? "Notificaciones activadas" : "Activar notificaciones"}
    >
      {isSubscribed ? <Bell size={24} /> : <BellOff size={24} />}
    </button>
  );
}