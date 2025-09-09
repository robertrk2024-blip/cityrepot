
'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';

interface PublicAlert {
  id: number;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  publishedAt: string;
  image?: string;
  author: string;
  priority: 'critical' | 'medium' | 'low';
}

export default function PublicAlertsPage() {
  const [filter, setFilter] = useState<string>('all');

  const publicAlerts: PublicAlert[] = [
    {
      id: 1,
      title: '🚨 VIGILANCE MÉTÉO - Fortes pluies attendues',
      message: 'Des précipitations importantes sont prévues cette nuit et demain matin. Évitez les déplacements non essentiels et soyez prudents sur les routes. Des inondations localisées sont possibles dans les zones habituellement sensibles.',
      type: 'danger',
      publishedAt: '2024-01-15 16:30',
      image: 'https://readdy.ai/api/search-image?query=Heavy%20rain%20weather%20alert%2C%20dark%20storm%20clouds%2C%20city%20street%20flooding%2C%20realistic%20photography%2C%20urgent%20weather%20warning%2C%20dramatic%20sky%2C%20safety%20alert&width=800&height=400&seq=weather1&orientation=landscape',
      author: 'Mairie - Services d\'urgence',
      priority: 'critical'
    },
    {
      id: 2,
      title: '🛣️ Travaux avenue de la République',
      message: 'L\'avenue de la République sera fermée à la circulation du 20 au 25 janvier pour des travaux de réfection de la chaussée. Des déviations sont mises en place via les rues adjacentes. Merci de votre compréhension.',
      type: 'warning',
      publishedAt: '2024-01-14 10:15',
      image: 'https://readdy.ai/api/search-image?query=Road%20construction%20work%2C%20yellow%20barriers%2C%20construction%20equipment%2C%20street%20repair%2C%20realistic%20photography%2C%20urban%20setting%2C%20safety%20cones%2C%20workers&width=800&height=400&seq=roadwork1&orientation=landscape',
      author: 'Services Techniques',
      priority: 'medium'
    },
    {
      id: 3,
      title: '🎉 Fête de la ville - 1er février',
      message: 'Rejoignez-nous le 1er février pour la traditionnelle fête de la ville ! Au programme : animations pour enfants, stands de producteurs locaux, concerts et feu d\'artifice à 21h. Entrée gratuite pour tous.',
      type: 'success',
      publishedAt: '2024-01-13 14:45',
      image: 'https://readdy.ai/api/search-image?query=City%20festival%20celebration%2C%20colorful%20decorations%2C%20happy%20crowd%2C%20festival%20banners%2C%20fireworks%20in%20background%2C%20joyful%20atmosphere%2C%20community%20event&width=800&height=400&seq=festival1&orientation=landscape',
      author: 'Service Culture',
      priority: 'low'
    },
    {
      id: 4,
      title: '💧 Coupure d\'eau programmée - Quartier Nord',
      message: 'Une coupure d\'eau est programmée mercredi 17 janvier de 8h à 16h dans le quartier Nord pour maintenance du réseau. Veillez à faire vos réserves d\'eau potable.',
      type: 'warning',
      publishedAt: '2024-01-12 16:20',
      image: 'https://readdy.ai/api/search-image?query=Water%20utility%20maintenance%2C%20water%20pipes%2C%20municipal%20workers%2C%20construction%20site%2C%20realistic%20photography%2C%20urban%20infrastructure%2C%20safety%20equipment&width=800&height=400&seq=water1&orientation=landscape',
      author: 'Service Eau et Assainissement',
      priority: 'medium'
    }
  ];

  const getTypeColor = (type: PublicAlert['type']): string => {
    switch (type) {
      case 'danger': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-orange-500 bg-orange-50';
      case 'success': return 'border-green-500 bg-green-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const getTypeIcon = (type: PublicAlert['type']): string => {
    switch (type) {
      case 'danger': return 'ri-error-warning-fill';
      case 'warning': return 'ri-alert-fill';
      case 'success': return 'ri-checkbox-circle-fill';
      default: return 'ri-information-fill';
    }
  };

  const getTypeLabel = (type: PublicAlert['type']): string => {
    switch (type) {
      case 'danger': return 'URGENT';
      case 'warning': return 'ATTENTION';
      case 'success': return 'INFO POSITIVE';
      default: return 'INFORMATION';
    }
  };

  const getPriorityColor = (priority: PublicAlert['priority']): string => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const filteredAlerts = filter === 'all' ? publicAlerts : publicAlerts.filter(alert => alert.type === filter);

  const shareAlert = async (alert: PublicAlert): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: alert.title,
          text: alert.message,
          url: window.location.href
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback - copier dans le presse-papiers
      const textToCopy = `${alert.title}\n\n${alert.message}\n\nSource: ${alert.author}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Alerte copiée dans le presse-papiers !');
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16 pb-20">
        {/* En-tête de la page */}
        <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-4">
          <h1 className="text-xl font-bold mb-2">🚨 Alertes Officielles</h1>
          <p className="text-sm opacity-90">Informations importantes de votre mairie</p>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 border-b">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Toutes les alertes
            </button>
            <button
              onClick={() => setFilter('danger')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === 'danger' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              🚨 Urgentes
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === 'warning' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              ⚠️ Attention
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === 'success' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              ✅ Positives
            </button>
          </div>
        </div>

        {/* Liste des alertes */}
        <div className="p-4 space-y-4">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className={`bg-white rounded-lg shadow-sm border-l-4 overflow-hidden ${getTypeColor(alert.type)}`}>
              {/* Image */}
              {alert.image && (
                <div className="relative">
                  <img
                    src={alert.image}
                    alt="Illustration de l'alerte"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                    <i className={`${getTypeIcon(alert.type)} ${getPriorityColor(alert.priority)}`}></i>
                    {getTypeLabel(alert.type)}
                  </div>
                  {alert.priority === 'critical' && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      🚨 CRITIQUE
                    </div>
                  )}
                </div>
              )}

              <div className="p-4">
                {/* En-tête sans image */}
                {!alert.image && (
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-black/80 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                      <i className={`${getTypeIcon(alert.type)} ${getPriorityColor(alert.priority)}`}></i>
                      {getTypeLabel(alert.type)}
                    </div>
                    {alert.priority === 'critical' && (
                      <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                        🚨 CRITIQUE
                      </div>
                    )}
                  </div>
                )}

                {/* Contenu */}
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {alert.title}
                  </h2>
                  
                  <p className="text-gray-700 leading-relaxed">
                    {alert.message}
                  </p>

                  {/* Métadonnées */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="ri-building-line text-xs"></i>
                      <span className="font-medium">{alert.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <i className="ri-time-line text-xs"></i>
                      <span>{alert.publishedAt}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-2">
                    <button 
                      onClick={() => shareAlert(alert)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <i className="ri-share-line"></i>
                      Partager cette alerte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-8">
              <i className="ri-notification-off-line text-4xl text-gray-400 mb-4 block"></i>
              <div className="text-lg font-medium text-gray-600 mb-2">Aucune alerte pour ce filtre</div>
              <div className="text-sm text-gray-500">Consultez les autres types d'alertes</div>
            </div>
          )}
        </div>

        {/* Information en bas de page */}
        <div className="mt-6 mx-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <i className="ri-shield-check-line text-blue-600 text-xl mt-1"></i>
            <div>
              <div className="font-medium text-blue-800 mb-1">Alertes officielles vérifiées</div>
              <div className="text-sm text-blue-700">
                Toutes ces alertes sont publiées par les services officiels de votre mairie et ont été vérifiées avant diffusion.
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
