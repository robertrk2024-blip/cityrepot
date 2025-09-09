
'use client';

import { useState, useEffect } from 'react';
import { AlertsManager, type PublicAlert } from '../../lib/storage';

export default function AlertsManagement() {
  const [alerts, setAlerts] = useState<PublicAlert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PublicAlert | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as PublicAlert['type'],
    expires_at: ''
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = () => {
    const allAlerts = AlertsManager.getAllAlerts();
    setAlerts(allAlerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAlert) {
      // Modifier l'alerte existante
      AlertsManager.updateAlert(editingAlert.id, {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        expires_at: formData.expires_at || undefined
      });
    } else {
      // Créer une nouvelle alerte
      AlertsManager.createAlert({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        expires_at: formData.expires_at || undefined,
        author: 'Administration'
      });
    }

    // Reset form
    setFormData({ title: '', message: '', type: 'info', expires_at: '' });
    setShowCreateForm(false);
    setEditingAlert(null);
    loadAlerts();

    // Déclencher une notification pour simuler la diffusion
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Nouvelle alerte publiée', {
            body: formData.title,
            icon: '/icon-192x192.png'
          });
        }
      });
    }
  };

  const toggleAlertStatus = (id: string, isActive: boolean) => {
    AlertsManager.updateAlert(id, { is_active: !isActive });
    loadAlerts();
  };

  const deleteAlert = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      AlertsManager.deleteAlert(id);
      loadAlerts();
    }
  };

  const editAlert = (alert: PublicAlert) => {
    setEditingAlert(alert);
    setFormData({
      title: alert.title,
      message: alert.message,
      type: alert.type,
      expires_at: alert.expires_at ? alert.expires_at.split('T')[0] : ''
    });
    setShowCreateForm(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return 'ri-alarm-warning-line';
      case 'warning': return 'ri-error-warning-line';
      case 'info': return 'ri-information-line';
      default: return 'ri-notification-line';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeAlerts = alerts.filter(a => a.is_active);
  const inactiveAlerts = alerts.filter(a => !a.is_active);

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestion des alertes publiques</h2>
          <p className="text-sm text-gray-600">{activeAlerts.length} alerte(s) active(s)</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingAlert(null);
            setFormData({ title: '', message: '', type: 'info', expires_at: '' });
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <i className="ri-add-line"></i>
          Nouvelle alerte
        </button>
      </div>

      {/* Indicateur de fonctionnement */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700">
          <i className="ri-notification-line"></i>
          <div className="text-sm">
            <div className="font-medium">✅ Système d'alertes opérationnel</div>
            <div className="text-xs">Les alertes sont diffusées instantanément aux citoyens connectés</div>
          </div>
        </div>
      </div>

      {/* Formulaire de création/modification */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold mb-4">
            {editingAlert ? 'Modifier l\'alerte' : 'Nouvelle alerte publique'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre de l'alerte</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Titre de l'alerte..."
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Détails de l'alerte..."
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type d'alerte</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as PublicAlert['type']})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="info">Information</option>
                  <option value="warning">Avertissement</option>
                  <option value="emergency">Urgence</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date d'expiration (optionnel)</label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                {editingAlert ? 'Modifier' : 'Publier'} l'alerte
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingAlert(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alertes actives */}
      <div>
        <h3 className="font-semibold mb-3 text-green-600">Alertes actives ({activeAlerts.length})</h3>
        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(alert.type)}`}>
                    <i className={`${getTypeIcon(alert.type)} mr-1`}></i>
                    {alert.type === 'emergency' ? 'Urgence' : 
                     alert.type === 'warning' ? 'Avertissement' : 'Information'}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
                <div className="text-xs text-gray-500">#{alert.id.slice(0, 8)}</div>
              </div>

              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div>Par {alert.author} • {formatDate(alert.created_at)}</div>
                {alert.expires_at && (
                  <div>Expire le {formatDate(alert.expires_at)}</div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => editAlert(alert)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  Modifier
                </button>
                <button
                  onClick={() => toggleAlertStatus(alert.id, alert.is_active)}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  Désactiver
                </button>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {activeAlerts.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-notification-off-line text-xl text-gray-400"></i>
            </div>
            <p className="text-gray-500 text-sm">Aucune alerte active</p>
          </div>
        )}
      </div>

      {/* Alertes inactives */}
      {inactiveAlerts.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 text-gray-600">Alertes inactives ({inactiveAlerts.length})</h3>
          <div className="space-y-3">
            {inactiveAlerts.map((alert) => (
              <div key={alert.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(alert.type)}`}>
                      <i className={`${getTypeIcon(alert.type)} mr-1`}></i>
                      {alert.type === 'emergency' ? 'Urgence' : 
                       alert.type === 'warning' ? 'Avertissement' : 'Information'}
                    </span>
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                      Inactive
                    </span>
                  </div>
                </div>

                <div className="mb-2">
                  <h4 className="font-medium text-gray-700 mb-1">{alert.title}</h4>
                  <p className="text-sm text-gray-500">{alert.message}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAlertStatus(alert.id, alert.is_active)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                  >
                    Réactiver
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
