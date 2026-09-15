'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare, Smartphone } from 'lucide-react';
import Image from 'next/image';

export default function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Si ya se ejecuta en modo standalone (instalada), no mostrar el banner
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) return;

    // 2. Revisar si el usuario lo descartó recientemente (en los últimos 3 días)
    const dismissedAt = localStorage.getItem('benmarket_pwa_dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) return;
    }

    // 3. Detectar iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Capturar evento nativo en Android/Chrome/Desktop
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Para iOS, mostrar después de 3 segundos si no está instalada
    let iosTimer;
    if (isIosDevice && !isStandalone) {
      iosTimer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem('benmarket_pwa_dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-red-100/60 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-100 bg-white">
            <Image
              src="/logo_new.webp"
              alt="Benmarket Express App"
              fill
              className="object-contain p-1"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 text-sm leading-snug">
              Instalá Benmarket Express
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Comprá más rápido, seguí tus pedidos y recibí alertas de ofertas directamente en tu teléfono.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstallClick}
                className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                Instalar App
              </button>

              <button
                onClick={handleDismiss}
                className="px-2.5 py-1.5 text-xs text-slate-500 font-medium hover:text-slate-800 transition"
              >
                Ahora no
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Cerrar banner"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal instruccional para iOS */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-slate-900 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base">Instalar en tu iPhone o iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="space-y-3.5 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-bold shrink-0">1</span>
                <span>Tocá el botón de <strong className="text-slate-900">Compartir</strong> <Share2 className="inline w-3.5 h-3.5 text-blue-600 mx-1" /> en la barra inferior de Safari.</span>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-bold shrink-0">2</span>
                <span>Deslizá hacia abajo y seleccioná <strong className="text-slate-900">"Agregar a pantalla de inicio"</strong> <PlusSquare className="inline w-3.5 h-3.5 text-slate-800 mx-1" />.</span>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-2.5 rounded-xl">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-bold shrink-0">3</span>
                <span>Presioná <strong className="text-slate-900">"Agregar"</strong> en la esquina superior derecha y ¡listo!</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
