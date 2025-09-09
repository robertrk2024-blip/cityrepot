'use client';

import { useState } from 'react';

export default function PublicAlertsManagement() {
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [alertZone, setAlertZone] = useState('city');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const publicAlerts = [
    {
      id: 1,
      title: '🚨 VIGILANCE MÉTÉO - Fortes pluies attendues',
      message: 'Des précipitations importantes sont prévues cette nuit et demain matin. Évitez les déplacements non essentiels et soyez prudents sur les routes.',
      type: 'danger',
      zone: 'city',
      status: 'active',
      publishedAt: '2024-01-15 16:30',
      views: 15420,
      image: 'https://readdy.ai/api/search-image?query=Heavy%20rain%20weather%20alert%2C%20dark%20storm%20clouds%2C%20city%20street%20flooding%2C%20realistic%20photography%2C%20urgent%20weather%20warning%2C%20dramatic%20sky%2C%20safety%20alert&width=800&height=400&seq=weather1&orientation=landscape',
      author: 'Super Admin - Mairie',
      channels: ['website', 'app', 'sms', 'social']
    },
    {
      id: 2,
      title: '🛣️ Travaux avenue de la République',
      message: 'L\'avenue de la République sera fermée à la circulation du 20 au 25 janvier pour des travaux de réfection. Des déviations sont mises en place.',
      type: 'warning',
      zone: 'local',
      status: 'scheduled',
      scheduledFor: '2024-01-20 07:00',
      estimatedViews: 8500,
      image: 'https://readdy.ai/api/search-image?query=Road%20construction%20work%2C%20yellow%20barriers%2C%20construction%20equipment%2C%20street%20repair%2C%20realistic%20photography%2C%20urban%20setting%2C%20safety%20cones%2C%20workers&width=800&height=400&seq=roadwork1&orientation=landscape',
      author: 'Super Admin - Services Techniques',
      channels: ['website', 'app', 'sms']
    },
    {
      id: 3,
      title: '🎉 Fête de la ville - 1er février',
      message: 'Rejoignez-nous le 1er février pour la traditionnelle fête de la ville ! Animations, stands locaux et feu d\'artifice au programme. Entrée gratuite pour tous.',
      type: 'success',
      zone: 'city',
      status: 'draft',
      estimatedViews: 12000,
      image: 'https://readdy.ai/api/search-image?query=City%20festival%20celebration%2C%20colorful%20decorations%2C%20happy%20crowd%2C%20festival%20banners%2C%20fireworks%20in%20background%2C%20joyful%20atmosphere%2C%20community%20event&width=800&height=400&seq=festival1&orientation=landscape',
      author: 'Super Admin - Culture',
      channels: ['website', 'app', 'social']
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'danger': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'danger': return 'ri-error-warning-line';
      case 'warning': return 'ri-alert-line';
      case 'success': return 'ri-checkbox-circle-line';
      default: return 'ri-information-line';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'En ligne';
      case 'scheduled': return 'Programmée';
      case 'draft': return 'Brouillon';
      case 'expired': return 'Expirée';
      default: return status;
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleCreateAlert = () => {
    if (alertTitle.trim() && alertMessage.trim()) {
      const newAlert = {
        title: alertTitle,
        message: alertMessage,
        type: alertType,
        zone: alertZone,
        scheduledDate,
        scheduledTime,
        image: selectedImage ? 'uploaded' : null
      };
      
      console.log('Nouvelle alerte publique créée:', newAlert);
      
      // Notification universelle
      if (typeof window !== 'undefined' && window.universalNotify) {
        window.universalNotify(
          alertTitle,
          alertMessage,
          { 
            channels: ['push', 'sms', 'website'],
            priority: alertType === 'danger' ? 'critical' : alertType === 'warning' ? 'high' : 'medium',
            type: alertType,
            image: imagePreview
          }
        );
      }
      
      setAlertTitle('');
      setAlertMessage('');
      setAlertType('info');
      setAlertZone('city');
      setScheduledDate('');
      setScheduledTime('');
      setSelectedImage(null);
      setImagePreview('');
      setShowCreateAlert(false);
      
      alert('Alerte publique créée et diffusée à tous les citoyens !');
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 p-4 rounded-lg text-white">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Alertes Publiques Citoyens</h1>
          <button
            onClick={() => setShowCreateAlert(true)}
            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-white/30"
          >
            <i className="ri-megaphone-line"></i>
            Nouvelle alerte
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">45,230</div>
            <div className="text-sm opacity-90">Citoyens alertés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm opacity-90">Alertes actives</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">98%</div>
            <div className="text-sm opacity-90">Taux de lecture</div>
          </div>
        </div>
      </div>

      {/* Information importante */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <i className="ri-global-line text-blue-600 text-xl mt-1"></i>
          <div>
            <div className="font-medium text-blue-800 mb-1">Diffusion universelle</div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• <strong>Site web public :</strong> Visible par tous les visiteurs</div>
              <div>• <strong>Application mobile :</strong> Notifications push aux utilisateurs</div>
              <div>• <strong>SMS d'urgence :</strong> Envoi automatique selon la priorité</div>
              <div>• <strong>Réseaux sociaux :</strong> Publication automatique sur les comptes officiels</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des alertes publiques */}
      <div className="space-y-4">
        {publicAlerts.map((alert) => (
          <div key={alert.id} className={`bg-white rounded-lg shadow-sm border-l-4 ${getTypeColor(alert.type).split(' ')[2]}`}>
            {/* Image de l'alerte */}
            {alert.image && (
              <div className="relative">
                <img
                  src={alert.image}
                  alt="Illustration de l'alerte"
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(alert.type)}`}>
                  <i className={`${getTypeIcon(alert.type)} mr-1`}></i>
                  {alert.type === 'danger' ? 'URGENT' : 
                   alert.type === 'warning' ? 'ATTENTION' :
                   alert.type === 'success' ? 'INFO POSITIVE' : 'INFORMATION'}
                </div>
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                  {getStatusText(alert.status)}
                </div>
              </div>
            )}

            <div className="p-4">
              {/* En-tête sans image */}
              {!alert.image && (
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(alert.type)}`}>
                      <i className={`${getTypeIcon(alert.type)} mr-1`}></i>
                      {alert.type === 'danger' ? 'URGENT' : 
                       alert.type === 'warning' ? 'ATTENTION' :
                       alert.type === 'success' ? 'INFO POSITIVE' : 'INFORMATION'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {getStatusText(alert.status)}
                    </span>
                  </div>
                </div>
              )}

              {/* Contenu de l'alerte */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{alert.title}</h3>
                <p className="text-gray-700 leading-relaxed">{alert.message}</p>
              </div>

              {/* Statistiques et informations */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <i className="ri-eye-line text-xs"></i>
                    <span>{alert.views ? `${alert.views.toLocaleString()} vues` : `${alert.estimatedViews?.toLocaleString()} vues estimées`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="ri-map-pin-line text-xs"></i>
                    <span>{alert.zone === 'city' ? 'Ville entière' : 'Zone locale'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <i className="ri-user-line text-xs"></i>
                    <span>{alert.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="ri-time-line text-xs"></i>
                    <span>
                      {alert.status === 'active' ? `Publié ${alert.publishedAt}` :
                       alert.status === 'scheduled' ? `Programmé ${alert.scheduledFor}` :
                       'Brouillon'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Canaux de diffusion */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Canaux de diffusion :</div>
                <div className="flex flex-wrap gap-1">
                  {alert.channels.map((channel, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs flex items-center gap-1"
                    >
                      <i className={
                        channel === 'website' ? 'ri-global-line' :
                        channel === 'app' ? 'ri-smartphone-line' :
                        channel === 'sms' ? 'ri-message-line' :
                        channel === 'social' ? 'ri-share-line' : 'ri-notification-line'
                      }></i>
                      {channel === 'website' ? 'Site web' :
                       channel === 'app' ? 'App mobile' :
                       channel === 'sms' ? 'SMS' :
                       channel === 'social' ? 'Réseaux sociaux' : channel}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t">
                <button className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                  <i className="ri-edit-line text-xs"></i>
                  Modifier
                </button>
                <button className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                  <i className="ri-share-line text-xs"></i>
                  Rediffuser
                </button>
                <button className="px-4 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium">
                  <i className="ri-delete-bin-line text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de création d'alerte */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">🚨 Créer une alerte publique</h3>
                <button 
                  onClick={() => setShowCreateAlert(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Information importante */}
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="flex items-start gap-2 text-orange-700 text-sm">
                  <i className="ri-megaphone-line mt-0.5"></i>
                  <div>
                    <div className="font-medium">Alerte publique universelle</div>
                    <div>Cette alerte sera visible par TOUS les citoyens, même sans l'application</div>
                  </div>
                </div>
              </div>

              {/* Type d'alerte */}
              <div>
                <label className="block text-sm font-medium mb-2">Niveau d'urgence</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertType('info')}
                    className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                      alertType === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <i className="ri-information-line"></i>
                    Information
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertType('success')}
                    className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                      alertType === 'success' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <i className="ri-checkbox-circle-line"></i>
                    Positive
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertType('warning')}
                    className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                      alertType === 'warning' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <i className="ri-alert-line"></i>
                    Attention
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertType('danger')}
                    className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                      alertType === 'danger' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <i className="ri-error-warning-line"></i>
                    URGENT
                  </button>
                </div>
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium mb-2">Zone de diffusion</label>
                <select 
                  value={alertZone}
                  onChange={(e) => setAlertZone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="city">Toute la ville</option>
                  <option value="local">Zone locale seulement</option>
                  <option value="region">Région entière</option>
                </select>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium mb-2">Titre de l'alerte</label>
                <input
                  type="text"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="Ex: Vigilance météo, Travaux urgents, Événement spécial..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                  maxLength={120}
                />
                <div className="text-xs text-gray-500 mt-1">{alertTitle.length}/120 caractères</div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2">Message détaillé</label>
                <textarea
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="Décrivez précisément la situation, les consignes à suivre et les informations importantes pour les citoyens..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm h-32 resize-none"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">{alertMessage.length}/500 caractères</div>
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm font-medium mb-2">Photo d'illustration (optionnelle)</label>
                
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="alertImage"
                    />
                    <label htmlFor="alertImage" className="cursor-pointer">
                      <i className="ri-camera-line text-3xl text-gray-400 mb-2 block"></i>
                      <div className="text-sm text-gray-600">Cliquez pour ajouter une photo</div>
                      <div className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (max 5MB)</div>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      ✅ Photo ajoutée
                    </div>
                  </div>
                )}
              </div>

              {/* Programmation (optionnel) */}
              <div>
                <label className="block text-sm font-medium mb-2">Programmation (optionnel)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Laissez vide pour publier immédiatement
                </div>
              </div>

              {/* Aperçu des canaux */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-sm text-green-800 font-medium mb-2">📡 Canaux de diffusion automatiques :</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                  <div>✅ Site web public</div>
                  <div>✅ Application mobile</div>
                  <div>✅ Notifications push</div>
                  <div>✅ SMS {alertType === 'danger' ? '(URGENT)' : '(selon priorité)'}</div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateAlert(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateAlert}
                  disabled={!alertTitle.trim() || !alertMessage.trim()}
                  className={`flex-1 py-3 rounded-lg font-medium disabled:bg-gray-300 flex items-center justify-center gap-2 ${
                    alertType === 'danger' ? 'bg-red-600 text-white' :
                    alertType === 'warning' ? 'bg-orange-600 text-white' :
                    alertType === 'success' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  <i className="ri-megaphone-line"></i>
                  {scheduledDate ? 'Programmer l\'alerte' : 'Publier immédiatement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}