"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    } else {
      alert("Espera unos segundos o usa el menú de Chrome (3 puntos > Instalar aplicación).");
    }
  };

  return (
    <button 
      onClick={handleInstall}
      className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-3 py-1 md:px-5 md:py-2.5 rounded-full border border-white/10 transition-all text-[10px] md:text-xs font-medium"
    >
      <Download size={14} /> Instalar App
    </button>
  );
}