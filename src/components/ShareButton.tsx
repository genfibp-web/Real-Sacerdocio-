"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ titulo }: { titulo: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: titulo,
          text: `¡Mira esta publicación de Real Sacerdocio: ${titulo}!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        alert("Copia este enlace para compartir: " + window.location.href);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all w-full md:w-auto ${
        copied 
          ? "bg-green-500 text-white" 
          : "bg-real-purple hover:bg-real-blue text-white"
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
          Compartir Publicación
        </>
      )}
    </button>
  );
}