
'use client';

import { useState, useEffect } from 'react';
import { ReportsManager, type CitizenReport } from '../../lib/storage';

export default function HistoryList() {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [filter, setFilter] = useState('tous');

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 10000); // Actualiser toutes les 10 secondes
    return () => clearInterval(interval);
  }, []);

  const loadReports = () => {
    const allReports = ReportsManager.getAllReports();
    // Trier par date de création (plus récent en premier)
    const sortedReports = allReports.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setReports(sortedReports);
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'tous') return true;
    return report.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nouveau': return 'bg-blue-100 text-blue-800';
      case 'en-cours': return 'bg-yellow-100 text-yellow-800';
      case 'resolu': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'nouveau': return 'Nouveau';
      case 'en-cours': return 'En cours';
      case 'resolu': return 'Résolu';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'haute': return 'bg-red-100 text-red-800';
      case 'moyenne': return 'bg-orange-100 text-orange-800';
      case 'basse': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'securite': return 'ri-shield-line';
      case 'routes': return 'ri-road-line';
      case 'proprete': return 'ri-delete-bin-line';
      case 'eclairage': return 'ri-lightbulb-line';
      case 'espaces-verts': return 'ri-plant-line';
      default: return 'ri-more-line';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'securite': return 'bg-red-500';
      case 'routes': return 'bg-orange-500';
      case 'proprete': return 'bg-green-500';
      case 'eclairage': return 'bg-yellow-500';
      case 'espaces-verts': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const openInGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const filterOptions = [
    { id: 'tous', name: 'Tous', count: reports.length },
    { id: 'nouveau', name: 'Nouveaux', count: reports.filter(r => r.status === 'nouveau').length },
    { id: 'en-cours', name: 'En cours', count: reports.filter(r => r.status === 'en-cours').length },
    { id: 'resolu', name: 'Résolus', count: reports.filter(r => r.status === 'resolu').length }
  ];

  return (
    <div className="space-y-4">
      {/* Statistiques */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
          <div className="text-sm text-gray-600">Signalements effectués</div>
        </div>
      </div>

      {/* Indicateur de synchronisation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-blue-700">
          <i className="ri-history-line"></i>
          <div className="text-sm">
            <div className="font-medium">📋 Historique local synchronisé</div>
            <div className="text-xs">Vos signalements sont stockés localement et visibles par les administrateurs</div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-2 overflow-x-auto">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 ${
                filter === option.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {option.name}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filter === option.id
                  ? 'bg-blue-700'
                  : 'bg-gray-200'
              }`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste des signalements */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 ${getCategoryColor(report.category)} rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className={`${getCategoryIcon(report.category)} text-white`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusText(report.status)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                    {report.priority}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 capitalize mb-1">{report.category}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">
                {formatDate(report.created_at)}
              </div>
            </div>

            {/* Localisation */}
            <div className="mb-3">
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <i className="ri-map-pin-line mr-1"></i>
                {report.location_text || 'Position GPS uniquement'}
              </div>
              
              {report.latitude && report.longitude && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-green-700">
                      <i className="ri-map-pin-fill mr-1"></i>
                      <span>Position GPS enregistrée</span>
                    </div>
                    <button
                      onClick={() => openInGoogleMaps(report.latitude!, report.longitude!)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-green-700"
                    >
                      <i className="ri-external-link-line mr-1"></i>
                      Voir sur la carte
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Métadonnées */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <span>#{report.id.slice(0, 8)}</span>
                {report.photos_count > 0 && (
                  <div className="flex items-center gap-1">
                    <i className="ri-image-line"></i>
                    <span>{report.photos_count}</span>
                  </div>
                )}
                {report.citizen_name && (
                  <span>Signé: {report.citizen_name}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <i className="ri-phone-line text-blue-500"></i>
                <span className="text-blue-600">Local</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-history-line text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {filter === 'tous' ? 'Aucun signalement' : 'Aucun signalement correspondant'}
          </h3>
          <p className="text-gray-600 text-sm">
            {filter === 'tous' 
              ? 'Vous n\'avez pas encore effectué de signalement'
              : `Aucun signalement avec le statut "${filterOptions.find(f => f.id === filter)?.name}"`
            }
          </p>
          {filter === 'tous' && (
            <button
              onClick={() => window.location.href = '/'}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Faire un signalement
            </button>
          )}
        </div>
      )}
    </div>
  );
}
