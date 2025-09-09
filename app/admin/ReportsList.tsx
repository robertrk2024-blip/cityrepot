
'use client';

import { useState, useEffect } from 'react';
import { ReportsManager, type CitizenReport } from '../../lib/storage';

export default function ReportsList({ onSelectReport }: { onSelectReport: (report: CitizenReport) => void }) {
  const [filter, setFilter] = useState('tous');
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, resolved: 0 });

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 5000); // Actualiser toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  const loadReports = () => {
    try {
      const allReports = ReportsManager.getAllReports();
      setReports(allReports);
      
      // Calculer les statistiques
      const active = allReports.filter(r => r.status !== 'resolu').length;
      const resolved = allReports.filter(r => r.status === 'resolu').length;
      setStats({ active, resolved });
    } catch (error) {
      console.error('Erreur chargement signalements:', error);
    } finally {
      setLoading(false);
    }
  };

  const openInGoogleMaps = (latitude: number, longitude: number, description: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const updateReportStatus = (id: string, status: CitizenReport['status']) => {
    ReportsManager.updateReport(id, { status });
    loadReports();
  };

  const updateReportPriority = (id: string, priority: CitizenReport['priority']) => {
    ReportsManager.updateReport(id, { priority });
    loadReports();
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'tous') return true;
    if (filter === 'urgent') return report.priority === 'haute';
    return report.status === filter;
  });

  const filterOptions = [
    { id: 'tous', name: 'Tous', count: reports.length },
    { id: 'nouveau', name: 'Nouveaux', count: reports.filter(r => r.status === 'nouveau').length },
    { id: 'en-cours', name: 'En cours', count: reports.filter(r => r.status === 'en-cours').length },
    { id: 'urgent', name: 'Urgent', count: reports.filter(r => r.priority === 'haute').length }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'haute': return 'bg-red-100 text-red-800';
      case 'moyenne': return 'bg-orange-100 text-orange-800';
      case 'basse': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-200 h-16 rounded-lg"></div>
            <div className="bg-gray-200 h-16 rounded-lg"></div>
          </div>
          <div className="bg-gray-200 h-12 rounded-lg mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Signalements actifs</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-sm text-gray-600">Résolus ce mois</div>
        </div>
      </div>

      {/* Indicateur de synchronisation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700">
          <i className="ri-database-line"></i>
          <div className="text-sm">
            <div className="font-medium">✅ Stockage local actif - {reports.length} signalements</div>
            <div className="text-xs">Actualisation automatique toutes les 5 secondes</div>
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
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {option.name}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filter === option.id
                  ? 'bg-red-700'
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
          <div
            key={report.id}
            className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {getStatusText(report.status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                  {report.priority}
                </span>
              </div>
              <div className="text-xs text-gray-500">#{report.id.slice(0, 8)}</div>
            </div>

            <div className="mb-3">
              <div className="font-medium text-gray-900 mb-1 capitalize">{report.category}</div>
              <div className="text-sm text-gray-600 line-clamp-2">{report.description}</div>
            </div>

            {/* Position GPS avec bouton Google Maps */}
            {report.latitude && report.longitude && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-blue-700">
                    <i className="ri-map-pin-fill mr-1"></i>
                    <span className="font-medium">GPS: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                  </div>
                  <button
                    onClick={() => openInGoogleMaps(report.latitude!, report.longitude!, report.description)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <i className="ri-navigation-line"></i>
                    Itinéraire
                  </button>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  🎯 Position exacte du problème - Cliquez sur "Itinéraire" pour vous y rendre
                </div>
              </div>
            )}

            <div className="flex items-center text-xs text-gray-500 mb-2">
              <i className="ri-map-pin-line mr-1"></i>
              {report.location_text || 'Position GPS uniquement'}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-3">
                <span>Par {report.citizen_name || 'Citoyen anonyme'}</span>
                <span>{formatDate(report.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                {report.photos_count > 0 && (
                  <div className="flex items-center gap-1">
                    <i className="ri-image-line"></i>
                    <span>{report.photos_count}</span>
                  </div>
                )}
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  <i className="ri-phone-line"></i>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex gap-2 mb-3">
              <select
                value={report.status}
                onChange={(e) => updateReportStatus(report.id, e.target.value as CitizenReport['status'])}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="nouveau">Nouveau</option>
                <option value="en-cours">En cours</option>
                <option value="resolu">Résolu</option>
              </select>
              <select
                value={report.priority}
                onChange={(e) => updateReportPriority(report.id, e.target.value as CitizenReport['priority'])}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="basse">Basse</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onSelectReport(report)}
                className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Voir détails
              </button>
              {report.latitude && report.longitude && (
                <button
                  onClick={() => openInGoogleMaps(report.latitude!, report.longitude!, report.description)}
                  className="bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <i className="ri-map-pin-line"></i>
                  Maps
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-list-line text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun signalement</h3>
          <p className="text-gray-600 text-sm">
            {filter === 'tous' 
              ? 'Aucun signalement pour le moment' 
              : `Aucun signalement avec le filtre "${filterOptions.find(f => f.id === filter)?.name}"`
            }
          </p>
        </div>
      )}
    </div>
  );
}
