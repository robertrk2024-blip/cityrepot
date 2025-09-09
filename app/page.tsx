
'use client';

import { useState, useEffect } from 'react';
import ReportForm from '../components/ReportForm';
import NotificationSystem from '../components/NotificationSystem';
import AdminLoginModal from '../components/AdminLoginModal';
import { initializeStorage } from '../lib/storage';

export default function Home() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    // Initialiser le système de stockage avec les données d'exemple
    initializeStorage();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header intégré */}
      <header className="fixed top-0 w-full bg-blue-600 text-white z-50 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold font-['Pacifico']">CityReport</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden md:block">Signalement Citoyen</span>
            <button
              onClick={() => setShowAdminLogin(true)}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
              title="Accès administrateur"
            >
              <i className="ri-admin-line text-white"></i>
            </button>
          </div>
        </div>
      </header>
      
      <NotificationSystem />

      <main className="pt-16 pb-32 md:pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <ReportForm />
          
          {/* Section informations en bas */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center space-y-4">
              <div className="space-y-2">
                <div className="text-xl md:text-2xl font-bold text-blue-600 font-['Pacifico']">CityReport</div>
                <div className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Signalement Citoyen - Améliorons notre ville ensemble
                </div>
              </div>
              
              {/* Indicateur de fonctionnement */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                  <i className="ri-checkbox-circle-fill text-lg"></i>
                  <span className="font-medium">✅ Application 100% opérationnelle</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-green-600">
                  <div className="flex items-center justify-center gap-1">
                    <i className="ri-database-line"></i>
                    <span>Stockage local sécurisé</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <i className="ri-map-pin-line"></i>
                    <span>Géolocalisation précise</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <i className="ri-admin-line"></i>
                    <span>Panel admin fonctionnel</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <i className="ri-notification-line"></i>
                    <span>Alertes temps réel</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <i className="ri-global-line text-blue-500"></i>
                  <a href="https://cityreport.ville.fr" className="text-blue-600 hover:underline">
                    cityreport.ville.fr
                  </a>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <i className="ri-mail-line text-blue-500"></i>
                  <a href="mailto:contact@ville.fr" className="text-blue-600 hover:underline">
                    contact@ville.fr
                  </a>
                </div>
                <div className="flex items-center justify-center gap-2 md:col-span-1">
                  <i className="ri-map-pin-line text-blue-500"></i>
                  <span className="text-center md:text-left">12 Place de la Mairie, 31000 Toulouse</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="text-xs md:text-sm text-gray-400">
                  Version 3.0.0 • Développé avec ❤️ pour nos citoyens
                </div>
                
                {/* Instructions de connexion admin */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-xs text-blue-700 mb-2">
                    <strong>Accès administrateur :</strong>
                  </div>
                  <div className="text-xs text-blue-600 space-y-1">
                    <div>👤 Admin : admin@ville.fr / admin123</div>
                    <div>🔧 Super Admin : super.admin@ville.fr / superadmin123</div>
                  </div>
                  <div className="text-xs text-blue-500 mt-2">
                    Cliquez sur l'icône admin (⚙️) en haut à droite pour vous connecter
                  </div>
                </div>

                {/* Crédit développeur */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="text-xs text-gray-500 text-center">
                    Cette application a été développée par le groupe UMOJA
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">RK</span>
                    </div>
                    <div className="text-sm font-bold text-purple-600 font-['Pacifico']">
                      Ir Robert Kitenge RK
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Navigation bottom */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
          <a href="/" className="flex flex-col items-center justify-center py-2 px-1 text-blue-600">
            <i className="ri-home-fill text-xl"></i>
            <span className="text-xs font-medium mt-1">Accueil</span>
          </a>
          <a href="/alertes" className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 hover:text-gray-900">
            <i className="ri-notification-3-line text-xl"></i>
            <span className="text-xs font-medium mt-1">Alertes</span>
          </a>
          <a href="/carte" className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 hover:text-gray-900">
            <i className="ri-map-line text-xl"></i>
            <span className="text-xs font-medium mt-1">Carte</span>
          </a>
          <a href="/historique" className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 hover:text-gray-900">
            <i className="ri-history-line text-xl"></i>
            <span className="text-xs font-medium mt-1">Historique</span>
          </a>
          <a href="/contact" className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 hover:text-gray-900">
            <i className="ri-phone-line text-xl"></i>
            <span className="text-xs font-medium mt-1">Contact</span>
          </a>
        </div>
      </nav>
      
      {/* Modal de connexion admin */}
      <AdminLoginModal 
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />
    </div>
  );
}
