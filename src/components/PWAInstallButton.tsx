"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export default function PWAInstallButton() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  const handleInstall = () => {
    if (isIOS) {
      alert("Para instalar en iPhone:\n1. Toca el botón 'Compartir' (el cuadro con flecha).\n2. Selecciona 'Añadir a pantalla de inicio'.");
    } else {
      // Descarga el archivo APK para Android
      window.location.href = "/real-sacerdocio.apk";
    }
  };

  return (
    <button 
      onClick={handleInstall}
      className="inline-flex items-center gap-1.5 bg-real-purple hover:bg-real-blue text-white px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/10 transition-all text-xs md:text-sm font-bold shadow-lg"
    >
      <Download size={16} /> Instalar App
    </button>
  );
}