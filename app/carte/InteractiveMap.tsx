
'use client';

import { useState, useEffect } from 'react';
import { ReportsManager, type CitizenReport } from '../../lib/storage';

export default function InteractiveMap() {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [filter, setFilter] = useState('tous');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    loadReports();
    getCurrentLocation();
    const interval = setInterval(loadReports, 30000); // Actualiser toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const loadReports = () => {
    const allReports = ReportsManager.getAllReports();
    const reportsWithLocation = allReports.filter(r => r.latitude && r.longitude);
    setReports(reportsWithLocation);
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        () => {
          // Position par défaut (Toulouse)
          setUserLocation({ lat: 43.6047, lng: 1.4442 });
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setUserLocation({ lat: 43.6047, lng: 1.4442 });
      setIsLoadingLocation(false);
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'tous') return true;
    if (filter === 'urgent') return report.priority === 'haute';
    return report.status === filter;
  });

  const getMarkerColor = (report: CitizenReport) => {
    if (report.priority === 'haute') return '#ef4444'; // rouge
    if (report.status === 'resolu') return '#22c55e'; // vert
    if (report.status === 'en-cours') return '#f59e0b'; // orange
    return '#3b82f6'; // bleu
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'securite': return 'ri-shield-fill';
      case 'routes': return 'ri-road-map-fill';
      case 'proprete': return 'ri-delete-bin-fill';
      case 'eclairage': return 'ri-lightbulb-fill';
      case 'espaces-verts': return 'ri-plant-fill';
      default: return 'ri-map-pin-fill';
    }
  };

  const openInGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const getDirections = (report: CitizenReport) => {
    if (userLocation && report.latitude && report.longitude) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${report.latitude},${report.longitude}`;
      window.open(url, '_blank');
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterOptions = [
    { id: 'tous', name: 'Tous', count: reports.length },
    { id: 'nouveau', name: 'Nouveaux', count: reports.filter(r => r.status === 'nouveau').length },
    { id: 'en-cours', name: 'En cours', count: reports.filter(r => r.status === 'en-cours').length },
    { id: 'urgent', name: 'Urgent', count: reports.filter(r => r.priority === 'haute').length }
  ];

  const statsByCategory = reports.reduce((acc, report) => {
    acc[report.category] = (acc[report.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-2">Carte des signalements</h2>
        <div className="flex items-center gap-2 text-blue-100">
          <i className="ri-map-pin-line"></i>
          <span className="text-sm">{filteredReports.length} signalement(s) géolocalisé(s)</span>
        </div>
      </div>

      {/* Indicateur de synchronisation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700">
          <i className="ri-map-2-line"></i>
          <div className="text-sm">
            <div className="font-medium">🗺️ Carte interactive opérationnelle</div>
            <div className="text-xs">Positions GPS exactes • Actualisation automatique toutes les 30 secondes</div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-lg font-bold text-blue-600">{reports.length}</div>
          <div className="text-xs text-gray-600">Avec position GPS</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-lg font-bold text-red-600">
            {reports.filter(r => r.priority === 'haute').length}
          </div>
          <div className="text-xs text-gray-600">Priorité haute</div>
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

      {/* Carte simulée avec Google Maps */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="h-64 bg-gray-100 relative">
          {userLocation ? (
            <iframe
              src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgTo_P5N7w4&center=${userLocation.lat},${userLocation.lng}&zoom=13&language=fr`}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <i className="ri-loader-4-line animate-spin text-2xl text-gray-400 mb-2"></i>
                <p className="text-sm text-gray-600">Chargement de la carte...</p>
              </div>
            </div>
          )}
          
          {/* Bouton de géolocalisation */}
          <button
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="absolute top-3 right-3 bg-white shadow-lg rounded-lg w-10 h-10 flex items-center justify-center disabled:opacity-50"
          >
            <i className={`ri-crosshair-line ${isLoadingLocation ? 'animate-spin' : ''} text-gray-600`}></i>
          </button>
        </div>
      </div>

      {/* Légende */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium mb-3">Légende</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Priorité haute</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Nouveau</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Résolu</span>
          </div>
        </div>
      </div>

      {/* Liste des signalements avec positions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Signalements géolocalisés</h3>
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0 mt-2"
                style={{ backgroundColor: getMarkerColor(report) }}
              ></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 capitalize">{report.category}</h4>
                  <span className="text-xs text-gray-500">#{report.id.slice(0, 8)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{report.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                  <span>{formatDate(report.created_at)}</span>
                  {userLocation && report.latitude && report.longitude && (
                    <span>
                      📍 {calculateDistance(
                        userLocation.lat, userLocation.lng,
                        report.latitude, report.longitude
                      ).toFixed(1)} km
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openInGoogleMaps(report.latitude!, report.longitude!)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <i className="ri-map-pin-line"></i>
                    Voir position
                  </button>
                  
                  {userLocation && (
                    <button
                      onClick={() => getDirections(report)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <i className="ri-navigation-line"></i>
                      Itinéraire
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-map-pin-line text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun signalement géolocalisé</h3>
          <p className="text-gray-600 text-sm">
            {filter === 'tous' 
              ? 'Aucun signalement avec position GPS disponible'
              : `Aucun signalement géolocalisé correspondant au filtre "${filterOptions.find(f => f.id === filter)?.name}"`
            }
          </p>
        </div>
      )}

      {/* Statistiques par catégorie */}
      {Object.keys(statsByCategory).length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium mb-3">Répartition par catégorie</h3>
          <div className="space-y-2">
            {Object.entries(statsByCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className={`${getCategoryIcon(category)} text-gray-500`}></i>
                  <span className="text-sm capitalize">{category}</span>
                </div>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
