"use client";

import { Download } from "lucide-react";

// 👇 CAMBIA ESTO A true CUANDO QUIERAS QUE EL BOTÓN DESCARGA EL APK
const HABILITAR_DESCARGA_APK = false;

export default function PWAInstallButton() {
  return (
    <button 
      disabled={!HABILITAR_DESCARGA_APK}
      className={`inline-flex items-center gap-1.5 px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/10 transition-all text-xs md:text-sm font-bold shadow-lg
        ${HABILITAR_DESCARGA_APK 
          ? "bg-real-purple hover:bg-real-blue text-white cursor-pointer" 
          : "bg-white/5 text-gray-500 cursor-not-allowed opacity-50"
        }
      `}
    >
      <Download size={16} /> Instalar App (Próximamente)
    </button>
  );
}