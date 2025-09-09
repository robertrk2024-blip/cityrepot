'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Écouter l'événement beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleIOSInstall = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white rounded-lg shadow-xl border p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-smartphone-line text-blue-600 text-xl"></i>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm">
              Installer CityAlert
            </h4>
            <p className="text-gray-600 text-xs mt-1">
              {isIOS 
                ? "Ajoutez cette app à votre écran d'accueil via Safari > Partager > Ajouter à l'écran d'accueil"
                : "Installez l'application pour un accès rapide et des notifications push"
              }
            </p>
          </div>
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="w-6 h-6 text-gray-400 flex items-center justify-center flex-shrink-0"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
        
        <div className="flex gap-2 mt-3">
          {!isIOS ? (
            <button
              onClick={handleInstallClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Installer
            </button>
          ) : (
            <button
              onClick={handleIOSInstall}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Compris
            </button>
          )}
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}