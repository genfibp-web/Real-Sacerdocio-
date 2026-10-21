"use client";

import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Si el usuario no ha cerrado el cartel antes, lo mostramos
      if (!localStorage.getItem("pwa_prompt_closed")) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // En iOS mostramos el cartel de instrucciones manuales
    if (isIosDevice && !(window.navigator as any).standalone && !localStorage.getItem("pwa_prompt_closed")) {
      setShowPrompt(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const closePrompt = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_closed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-sm bg-real-dark border border-real-purple/50 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-start gap-3">
        <div className="bg-real-purple/20 p-2 rounded-xl mt-1">
          <Download className="text-real-purple" size={24} />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Instala nuestra App</p>
          {isIOS ? (
            <p className="text-gray-400 text-xs mt-1">
              Toca <Share size={12} className="inline mx-1" /> y luego <br/>
              <strong>"Añadir a pantalla de inicio"</strong>
            </p>
          ) : (
            <p className="text-gray-400 text-xs mt-1">Accede más rápido desde tu celular.</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {!isIOS && (
          <button onClick={handleInstallClick} className="bg-real-purple hover:bg-real-blue text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
            Instalar
          </button>
        )}
        <button onClick={closePrompt} className="text-gray-500 hover:text-white text-xs flex justify-center items-center mt-auto">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}