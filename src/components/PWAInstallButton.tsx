"use client";

import { useState, useEffect } from "react";
import { Download, Share } from "lucide-react";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      alert("Para instalar en iPhone:\n1. Toca 'Compartir'.\n2. Selecciona 'Añadir a pantalla de inicio'.");
      return;
    }
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    } else {
      alert("Chrome aún no detecta la app. Asegúrate de estar en HTTPS y espera unos segundos.");
    }
  };

  return (
    <button 
      onClick={handleInstall}
      className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-3 py-1 md:px-5 md:py-2.5 rounded-full border border-white/10 transition-all text-[10px] md:text-xs font-medium"
    >
      {isIOS ? <Share size={14} /> : <Download size={14} />}
      Instalar App
    </button>
  );
}