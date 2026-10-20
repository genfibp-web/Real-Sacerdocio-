"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostramos el cartel solo si no lo ha cerrado antes
      if (!localStorage.getItem("pwa_prompt_closed")) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const closePrompt = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_closed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-sm bg-real-dark border border-real-purple/50 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center gap-3">
        <div className="bg-real-purple/20 p-2 rounded-xl">
          <Download className="text-real-purple" size={24} />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Instala nuestra App</p>
          <p className="text-gray-400 text-xs">Accede más rápido desde tu celular.</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button 
          onClick={handleInstallClick}
          className="bg-real-purple hover:bg-real-blue text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
        >
          Instalar
        </button>
        <button onClick={closePrompt} className="text-gray-500 hover:text-white text-xs flex justify-center items-center">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}