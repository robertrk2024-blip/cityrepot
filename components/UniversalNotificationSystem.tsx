
'use client';

import { useEffect, useState } from 'react';

interface Alert {
  id: string;
  title: string;
  message: string;
  alert_type: string;
  priority: string;
  zone: string;
  author: string;
  published_at: string;
  image_url?: string;
}

export default function UniversalNotificationSystem() {
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    loadActiveAlerts();
    const interval = setInterval(loadActiveAlerts, 30000); // Vérifier toutes les 30 secondes
    
    // Demander la permission pour les notifications
    requestNotificationPermission();
    
    return () => clearInterval(interval);
  }, []);

  const loadActiveAlerts = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/universal-notifications`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      });
      
      const data = await response.json();
      
      if (data.alerts && data.alerts.length > 0) {
        const newAlerts = data.alerts.filter((alert: Alert) => 
          !alerts.some(existing => existing.id === alert.id)
        );
        
        if (newAlerts.length > 0) {
          setAlerts(prev => [...newAlerts, ...prev]);
          showNotification(newAlerts[0]); // Afficher la première nouvelle alerte
        }
      }
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Permission de notification accordée');
      }
    }
  };

  const showNotification = (alert: Alert) => {
    setCurrentAlert(alert);
    setIsVisible(true);

    // Envoyer une notification navigateur
    sendBrowserNotification(alert);

    // Durée d'affichage selon la priorité
    const duration = alert.priority === 'critical' ? 15000 : 
                    alert.priority === 'high' ? 10000 : 7000;

    setTimeout(() => {
      hideNotification();
    }, duration);
  };

  const sendBrowserNotification = (alert: Alert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(alert.title, {
        body: alert.message,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: alert.id,
        requireInteraction: alert.priority === 'critical',
        data: {
          alert_id: alert.id,
          redirect_url: window.location.origin + '/alertes'
        }
      });

      notification.onclick = function() {
        window.focus();
        window.open(this.data.redirect_url, '_blank');
        this.close();
      };

      // Auto-fermeture pour les alertes non critiques
      if (alert.priority !== 'critical') {
        setTimeout(() => notification.close(), 8000);
      }
    }
  };

  const hideNotification = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentAlert(null);
    }, 300);
  };

  const getAlertStyle = (type: string, priority: string) => {
    if (priority === 'critical') {
      return {
        bg: 'bg-gradient-to-r from-red-600 to-red-700',
        border: 'border-red-500',
        text: 'text-white',
        animation: 'animate-pulse'
      };
    }

    switch (type) {
      case 'emergency':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-orange-600',
          border: 'border-red-400',
          text: 'text-white',
          animation: ''
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-orange-500 to-yellow-600',
          border: 'border-orange-400',
          text: 'text-white',
          animation: ''
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          border: 'border-blue-400',
          text: 'text-white',
          animation: ''
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          border: 'border-gray-400',
          text: 'text-white',
          animation: ''
        };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return 'ri-error-warning-fill';
      case 'warning': return 'ri-alert-fill';
      case 'info': return 'ri-information-fill';
      default: return 'ri-notification-3-fill';
    }
  };

  const redirectToAlerts = () => {
    hideNotification();
    window.open('/alertes', '_blank');
  };

  if (!isVisible || !currentAlert) return null;

  const style = getAlertStyle(currentAlert.alert_type, currentAlert.priority);

  return (
    <>
      {/* Notification universelle en haut de l'écran */}
      <div className={`fixed top-0 left-0 right-0 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className={`${style.bg} ${style.animation} shadow-2xl border-b-4 ${style.border}`}>
          
          {/* Barre de progression pour les alertes critiques */}
          {currentAlert.priority === 'critical' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-300">
              <div className="h-full bg-white animate-progress-bar"></div>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-start gap-4">
              {/* Icône */}
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <i className={`${getAlertIcon(currentAlert.alert_type)} text-2xl text-white`}></i>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold leading-tight ${style.text}`}>
                      {currentAlert.title}
                    </h3>
                    <p className={`text-sm mt-1 ${style.text} opacity-90`}>
                      {currentAlert.message}
                    </p>

                    {/* Métadonnées */}
                    <div className="flex items-center gap-4 mt-2 text-xs opacity-75">
                      <div className="flex items-center gap-1">
                        <i className="ri-user-line"></i>
                        <span>{currentAlert.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <i className="ri-global-line"></i>
                        <span className="capitalize">{currentAlert.zone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <i className="ri-time-line"></i>
                        <span>À l'instant</span>
                      </div>
                    </div>
                  </div>

                  {/* Image (si disponible) */}
                  {currentAlert.image_url && (
                    <div className="ml-4 flex-shrink-0">
                      <img
                        src={currentAlert.image_url}
                        alt="Illustration"
                        className="w-16 h-16 rounded-lg object-cover border-2 border-white/30"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={redirectToAlerts}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <i className="ri-external-link-line"></i>
                    Voir toutes les alertes
                  </button>
                  <button
                    onClick={hideNotification}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>

              {/* Bouton fermer */}
              <button
                onClick={hideNotification}
                className="flex-shrink-0 w-8 h-8 text-white/70 hover:text-white hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Badge de notifications actives */}
      {alerts.length > 0 && (
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={redirectToAlerts}
            className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg animate-bounce hover:bg-red-600 transition-colors"
          >
            {alerts.length > 9 ? '9+' : alerts.length}
          </button>
        </div>
      )}

      {/* Styles pour l'animation */}
      <style jsx>{`
        @keyframes progress-bar {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        .animate-progress-bar {
          animation: progress-bar 15s linear forwards;
        }
      `}</style>
    </>
  );
}
