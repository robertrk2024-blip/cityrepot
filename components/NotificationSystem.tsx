
'use client';

import { useState, useEffect } from 'react';
import { AlertsManager, type PublicAlert } from '../lib/storage';

export default function NotificationSystem() {
  const [alerts, setAlerts] = useState<PublicAlert[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastCheck, setLastCheck] = useState(Date.now());

  useEffect(() => {
    checkForAlerts();
    const interval = setInterval(checkForAlerts, 30000); // Vérifier toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const checkForAlerts = () => {
    const activeAlerts = AlertsManager.getActiveAlerts();
    const newAlerts = activeAlerts.filter(alert => 
      new Date(alert.created_at).getTime() > lastCheck
    );

    if (newAlerts.length > 0) {
      // Afficher notification navigateur si permissions accordées
      if ('Notification' in window && Notification.permission === 'granted') {
        newAlerts.forEach(alert => {
          new Notification('🚨 Alerte CityReport', {
            body: alert.title,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: alert.id
          });
        });
      }
    }

    setAlerts(activeAlerts);
    setLastCheck(Date.now());
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('🎉 Notifications activées !', {
          body: 'Vous recevrez maintenant les alertes d\'urgence en temps réel.',
          icon: '/icon-192x192.png'
        });
      }
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const getAlertColor = (type: PublicAlert['type']) => {
    switch (type) {
      case 'emergency': return 'bg-red-500 text-white';
      case 'warning': return 'bg-orange-500 text-white';
      case 'info': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAlertIcon = (type: PublicAlert['type']) => {
    switch (type) {
      case 'emergency': return 'ri-alarm-warning-fill';
      case 'warning': return 'ri-error-warning-fill';
      case 'info': return 'ri-information-fill';
      default: return 'ri-notification-3-fill';
    }
  };

  // Afficher les alertes actives en haut de l'écran
  if (alerts.length === 0) return null;

  return (
    <>
      {/* Badge de notification */}
      {alerts.length > 0 && (
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="fixed top-3 left-4 z-50 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg animate-pulse"
        >
          <i className="ri-notification-3-fill"></i>
          <span className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {alerts.length}
          </span>
        </button>
      )}

      {/* Panel des notifications */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-96 overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">🚨 Alertes Actives</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{alerts.length} alerte(s) en cours</p>
            </div>

            <div className="divide-y">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 ${getAlertColor(alert.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <i className={`${getAlertIcon(alert.type)} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{alert.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {new Date(alert.created_at).toLocaleString('fr-FR')}
                        </span>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Masquer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Demande de permission de notification */}
            {'Notification' in window && Notification.permission === 'default' && (
              <div className="p-4 border-t bg-blue-50">
                <div className="text-center">
                  <p className="text-sm text-blue-800 mb-2">
                    Activez les notifications pour recevoir les alertes d'urgence même quand l'app est fermée
                  </p>
                  <button
                    onClick={requestNotificationPermission}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <i className="ri-notification-line mr-1"></i>
                    Activer les notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alerte flottante pour les urgences */}
      {alerts.some(a => a.type === 'emergency') && (
        <div className="fixed top-16 left-4 right-4 z-40 bg-red-500 text-white p-4 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-start gap-3">
            <i className="ri-alarm-warning-fill text-xl flex-shrink-0 mt-0.5"></i>
            <div className="flex-1">
              <h4 className="font-bold mb-1">🚨 ALERTE D'URGENCE</h4>
              <p className="text-sm opacity-90">
                {alerts.find(a => a.type === 'emergency')?.title}
              </p>
            </div>
            <button
              onClick={() => setShowNotifications(true)}
              className="bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center"
            >
              <i className="ri-eye-line"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
