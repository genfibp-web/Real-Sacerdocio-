"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ titulo }: { titulo: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      // 1. Intentar usar la API nativa (Celulares)
      if (navigator.share) {
        await navigator.share({
          title: titulo,
          text: `¡No te pierdas ${titulo}!`,
          url: window.location.href,
        });
      } else {
        // 2. Si no hay API nativa (PC), copiamos al portapapeles
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000); // Vuelve al estado normal tras 3s
      }
    } catch (error) {
      console.log("Compartir cancelado o fallido, intentando copiar...");
      // 3. Si el usuario cancela o falla, forzamos la copia en PC
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        // Fallback extremo por si el navegador bloquea el portapapeles
        alert("Copia este enlace para compartir: " + window.location.href);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
        copied 
          ? "bg-green-500 text-white" 
          : "bg-gradient-to-r from-real-purple to-real-blue hover:from-real-blue hover:to-real-purple text-white"
      }`}
    >
      {copied ? (
        <>
          <Check size={18} />
          ¡Enlace Copiado!
        </>
      ) : (
        <>
          <Share2 size={18} />
          Compartir Evento
        </>
      )}
    </button>
  );
}