'use client';

import { useState, useEffect } from 'react';

export default function AutoUpdateSystem() {
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [updateFrequency, setUpdateFrequency] = useState('weekly');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('2024-01-15 14:30');
  const [updateProgress, setUpdateProgress] = useState(0);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualUpdateType, setManualUpdateType] = useState('features');
  const [updateDescription, setUpdateDescription] = useState('');

  const availableUpdates = [
    {
      id: 1,
      type: 'security',
      title: 'Mise à jour de sécurité critique',
      description: 'Correction des vulnérabilités de sécurité et amélioration de l\'authentification',
      priority: 'critical',
      size: '15.2 MB',
      estimatedTime: '3-5 minutes',
      auto: true,
      aiGenerated: true
    },
    {
      id: 2,
      type: 'features',
      title: 'Nouvelles fonctionnalités citoyens',
      description: 'Système de suivi amélioré des signalements et nouvelle interface de contact',
      priority: 'medium',
      size: '42.8 MB',
      estimatedTime: '8-12 minutes',
      auto: false,
      aiGenerated: true
    },
    {
      id: 3,
      type: 'performance',
      title: 'Optimisations de performance',
      description: 'Amélioration de la vitesse de chargement et optimisation base de données',
      priority: 'low',
      size: '8.4 MB',
      estimatedTime: '2-3 minutes',
      auto: true,
      aiGenerated: false
    }
  ];

  const updateHistory = [
    {
      id: 1,
      version: '2.1.3',
      date: '2024-01-15 14:30',
      type: 'Automatique (IA)',
      description: 'Correction automatique des bugs détectés et optimisations mineures',
      status: 'success',
      duration: '4min 23s'
    },
    {
      id: 2,
      version: '2.1.2',
      date: '2024-01-10 09:15',
      type: 'Manuel',
      description: 'Ajout du système de contacts d\'urgence configurables',
      status: 'success',
      duration: '12min 45s'
    },
    {
      id: 3,
      version: '2.1.1',
      date: '2024-01-08 16:22',
      type: 'Automatique (IA)',
      description: 'Mise à jour de sécurité et amélioration des notifications',
      status: 'success',
      duration: '6min 12s'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return 'ri-error-warning-line';
      case 'high': return 'ri-alert-line';
      case 'medium': return 'ri-information-line';
      case 'low': return 'ri-checkbox-circle-line';
      default: return 'ri-information-line';
    }
  };

  const handleAutoUpdate = async (updateId) => {
    setIsUpdating(true);
    setUpdateProgress(0);

    const update = availableUpdates.find(u => u.id === updateId);

    // Simulation du processus de mise à jour
    const steps = [
      'Analyse des dépendances...',
      'Téléchargement des fichiers...',
      'Sauvegarde de la version actuelle...',
      'Application des modifications...',
      'Tests de sécurité...',
      'Déploiement en cours...',
      'Notification aux utilisateurs...',
      'Mise à jour terminée !'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUpdateProgress(((i + 1) / steps.length) * 100);
    }

    // Notification universelle
    if (typeof window !== 'undefined' && window.universalNotify) {
      window.universalNotify(
        '🚀 Application mise à jour',
        `Nouvelle version disponible avec : ${update.description}`,
        { 
          channels: ['push', 'website'],
          priority: update.priority === 'critical' ? 'high' : 'medium',
          type: 'success'
        }
      );
    }

    setIsUpdating(false);
    setUpdateProgress(0);
    setLastUpdate(new Date().toLocaleString('fr-FR'));
    alert('Mise à jour appliquée avec succès ! Tous les citoyens ont été notifiés.');
  };

  const handleManualUpdate = () => {
    if (updateDescription.trim()) {
      console.log('Mise à jour manuelle:', {
        type: manualUpdateType,
        description: updateDescription
      });

      // Notification universelle
      if (typeof window !== 'undefined' && window.universalNotify) {
        window.universalNotify(
          '🔧 Maintenance programmée',
          updateDescription,
          { 
            channels: ['push', 'sms', 'website'],
            priority: 'medium',
            type: 'info'
          }
        );
      }

      setUpdateDescription('');
      setShowManualModal(false);
      alert('Mise à jour manuelle programmée et citoyens notifiés !');
    }
  };

  const generateAIUpdate = () => {
    const aiSuggestions = [
      'Optimisation automatique des performances de la base de données et correction des requêtes lentes',
      'Amélioration de l\'interface utilisateur basée sur l\'analyse comportementale des citoyens',
      'Mise à jour des algorithmes de géolocalisation pour une meilleure précision des signalements',
      'Correction automatique des bugs détectés et optimisation de la mémoire',
      'Amélioration du système de notifications push et réduction de la consommation batterie'
    ];

    const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
    setUpdateDescription(randomSuggestion);
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg text-white">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">🚀 Système de Mises à Jour</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${autoUpdateEnabled ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <span className="text-sm">{autoUpdateEnabled ? 'IA Activée' : 'IA Désactivée'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">v2.1.3</div>
            <div className="text-sm opacity-90">Version actuelle</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{availableUpdates.length}</div>
            <div className="text-sm opacity-90">Mises à jour disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">99.8%</div>
            <div className="text-sm opacity-90">Uptime</div>
          </div>
        </div>
      </div>

      {/* Configuration automatique */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <i className="ri-robot-line text-blue-600"></i>
            Mises à jour automatiques (IA)
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoUpdateEnabled}
              onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {autoUpdateEnabled && (
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-start gap-2 text-green-700">
                <i className="ri-checkbox-circle-line mt-0.5"></i>
                <div className="text-sm">
                  <div className="font-medium">IA de maintenance activée</div>
                  <div>L'intelligence artificielle surveille automatiquement les performances, détecte les bugs et applique les corrections nécessaires.</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Fréquence des vérifications</label>
              <select
                value={updateFrequency}
                onChange={(e) => setUpdateFrequency(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="realtime">Temps réel (recommandé)</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuelle</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-500 mb-1">Dernière analyse IA</div>
                <div className="font-medium">{lastUpdate}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-500 mb-1">Prochaine vérification</div>
                <div className="font-medium">Dans 2h 15m</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mises à jour disponibles */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Mises à jour disponibles</h3>
          <button
            onClick={() => setShowManualModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <i className="ri-tools-line"></i>
            Mise à jour manuelle
          </button>
        </div>

        <div className="space-y-3">
          {availableUpdates.map((update) => (
            <div key={update.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPriorityColor(update.priority)}`}>
                    <i className={getPriorityIcon(update.priority)}></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {update.title}
                      {update.aiGenerated && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          <i className="ri-robot-line mr-1"></i>IA
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{update.description}</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(update.priority)}`}>
                  {update.priority === 'critical' ? 'CRITIQUE' :
                   update.priority === 'high' ? 'IMPORTANT' :
                   update.priority === 'medium' ? 'MOYEN' : 'FAIBLE'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <i className="ri-download-cloud-line text-xs"></i>
                  <span>{update.size}</span>
                </div>
                <div className="flex items-center gap-1">
                  <i className="ri-time-line text-xs"></i>
                  <span>{update.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <i className={update.auto ? 'ri-robot-line' : 'ri-user-line'} text-xs></i>
                  <span>{update.auto ? 'Auto' : 'Manuel'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAutoUpdate(update.id)}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 disabled:bg-gray-300"
                >
                  <i className="ri-download-line"></i>
                  {isUpdating ? 'Installation...' : 'Installer'}
                </button>
                <button className="px-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium">
                  <i className="ri-information-line"></i>
                </button>
                <button className="px-4 bg-yellow-100 text-yellow-700 py-2 rounded-lg text-sm font-medium">
                  <i className="ri-time-line"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barre de progression */}
      {isUpdating && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Installation en cours...</span>
            <span className="text-sm text-gray-500">{Math.round(updateProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${updateProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <i className="ri-loader-4-line animate-spin"></i>
            Veuillez patienter, l'application sera mise à jour automatiquement...
          </div>
        </div>
      )}

      {/* Historique des mises à jour */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-900 mb-4">Historique des mises à jour</h3>
        
        <div className="space-y-3">
          {updateHistory.map((update) => (
            <div key={update.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                update.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <i className={update.status === 'success' ? 'ri-check-line' : 'ri-close-line'} text-sm></i>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{update.version}</span>
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {update.type}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{update.description}</div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  <span>{update.date}</span>
                  <span>Durée: {update.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal mise à jour manuelle */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <i className="ri-tools-line text-purple-600"></i>
                  Mise à jour manuelle
                </h3>
                <button 
                  onClick={() => setShowManualModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2 text-blue-700 text-sm">
                  <i className="ri-information-line mt-0.5"></i>
                  <div>
                    <div className="font-medium">Mise à jour manuelle</div>
                    <div>Créez une mise à jour personnalisée qui sera déployée immédiatement à tous les utilisateurs</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type de mise à jour</label>
                <select
                  value={manualUpdateType}
                  onChange={(e) => setManualUpdateType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="features">Nouvelles fonctionnalités</option>
                  <option value="security">Sécurité</option>
                  <option value="performance">Performance</option>
                  <option value="bugfix">Correction de bugs</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="config">Configuration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description de la mise à jour</label>
                <div className="relative">
                  <textarea
                    value={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.value)}
                    placeholder="Décrivez les changements, améliorations et nouvelles fonctionnalités apportées..."
                    className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none"
                    maxLength={500}
                  />
                  <button
                    onClick={generateAIUpdate}
                    className="absolute top-2 right-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-blue-200"
                  >
                    <i className="ri-robot-line"></i>
                    Suggérer (IA)
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">{updateDescription.length}/500 caractères</div>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="flex items-start gap-2 text-orange-700 text-sm">
                  <i className="ri-megaphone-line mt-0.5"></i>
                  <div>
                    <div className="font-medium">Notification universelle</div>
                    <div>Tous les citoyens (avec et sans l'app) recevront une notification de cette mise à jour</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleManualUpdate}
                  disabled={!updateDescription.trim()}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 flex items-center justify-center gap-2"
                >
                  <i className="ri-rocket-line"></i>
                  Déployer maintenant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-900 mb-4">Actions rapides</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-green-100 text-green-700 p-4 rounded-lg font-medium flex items-center gap-2">
            <i className="ri-shield-check-line text-xl"></i>
            <div className="text-left">
              <div>Vérifier sécurité</div>
              <div className="text-xs opacity-75">Scan complet</div>
            </div>
          </button>
          
          <button className="bg-blue-100 text-blue-700 p-4 rounded-lg font-medium flex items-center gap-2">
            <i className="ri-database-line text-xl"></i>
            <div className="text-left">
              <div>Optimiser BDD</div>
              <div className="text-xs opacity-75">Performance</div>
            </div>
          </button>
          
          <button className="bg-purple-100 text-purple-700 p-4 rounded-lg font-medium flex items-center gap-2">
            <i className="ri-backup-line text-xl"></i>
            <div className="text-left">
              <div>Sauvegarde</div>
              <div className="text-xs opacity-75">Backup complet</div>
            </div>
          </button>
          
          <button className="bg-orange-100 text-orange-700 p-4 rounded-lg font-medium flex items-center gap-2">
            <i className="ri-pulse-line text-xl"></i>
            <div className="text-left">
              <div>Diagnostics</div>
              <div className="text-xs opacity-75">État système</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}