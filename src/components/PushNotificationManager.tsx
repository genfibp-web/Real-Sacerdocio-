"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PushNotificationManager() {
  const pathname = usePathname();
  const [status, setStatus] = useState<'loading' | 'subscribed' | 'not-subscribed' | 'unsupported'>('loading');

  useEffect(() => {
    const checkSubscription = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus('unsupported');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          // Verificamos si el endpoint de este dispositivo existe en Supabase
          const { data } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('endpoint', subscription.endpoint)
            .maybeSingle();

          // Si existe en la base de datos, está activo. Si no, está "fantasma" (hay que volver a suscribir).
          if (data) {
            setStatus('subscribed');
          } else {
            setStatus('not-subscribed');
          }
        } else {
          setStatus('not-subscribed');
        }
      } catch (error) {
        console.error("Error al verificar suscripción", error);
        setStatus('not-subscribed');
      }
    };

    checkSubscription();
  }, []);

  const subscribe = async () => {
    if (!("serviceWorker" in navigator)) return;

    // 1. Si hay una suscripción vieja en el navegador, la borramos primero
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe();
    }

    // 2. Pedimos permiso
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    // 3. Creamos la nueva suscripción
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });

    const { endpoint, keys } = newSubscription.toJSON() as any;
    
    // 4. La guardamos en Supabase
    const deviceId = localStorage.getItem("rs_device_id");

    await supabase.from('push_subscriptions').upsert({
      endpoint: endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      device_id: deviceId
    }, { onConflict: 'endpoint' });

    setStatus('subscribed');
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  };

  if (pathname.startsWith('/admin') || status === 'loading' || status === 'unsupported') {
    return null;
  }

  return (
    <button
      onClick={subscribe}
      disabled={status === 'subscribed'}
      className={`fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 p-4 rounded-full shadow-2xl transition-all hover:scale-105 flex items-center justify-center ${
        status === 'subscribed' 
          ? 'bg-green-600/50 text-white cursor-default' 
          : 'bg-real-purple hover:bg-real-blue text-white'
      }`}
      title={status === 'subscribed' ? "Notificaciones activadas" : "Activar notificaciones"}
    >
      {status === 'subscribed' ? <Bell size={24} /> : <BellOff size={24} />}
    </button>
  );
}