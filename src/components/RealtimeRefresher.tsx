"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RealtimeRefresher() {
  const router = useRouter();

  useEffect(() => {
    // Creamos un canal de escucha para toda la base de datos
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' }, // Escucha Crear, Editar y Borrar en cualquier tabla
        (payload) => {
          console.log('¡Cambio detectado en la base de datos! Refrescando vista...', payload);
          
          // router.refresh() recarga los datos del servidor sin recargar la página entera
          // (No pierde el scroll ni el estado actual del usuario)
          router.refresh(); 
        }
      )
      .subscribe();

    // Limpiamos la conexión cuando el usuario cierra la página
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null; // Este componente no se ve, solo trabaja en segundo plano
}