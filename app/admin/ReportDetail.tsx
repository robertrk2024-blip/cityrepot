
'use client';

import { useState } from 'react';
import { ReportsManager, type CitizenReport } from '../../lib/storage';

interface ReportDetailProps {
  report: CitizenReport;
  onBack: () => void;
}

export default function ReportDetail({ report, onBack }: ReportDetailProps) {
  const [currentReport, setCurrentReport] = useState(report);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: report.status,
    priority: report.priority,
    notes: ''
  });

  const openInGoogleMaps = () => {
    if (currentReport.latitude && currentReport.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${currentReport.latitude},${currentReport.longitude}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  const handleSaveChanges = () => {
    const updatedReport = ReportsManager.updateReport(currentReport.id, {
      status: editForm.status,
      priority: editForm.priority
    });
    
    if (updatedReport) {
      setCurrentReport(updatedReport);
    }
    setIsEditing(false);
  };

  const deleteReport = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
      ReportsManager.deleteReport(currentReport.id);
      onBack();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <i className="ri-arrow-left-line text-gray-600"></i>
        </button>
        <div>
          <h1 className="text-xl font-bold">Détail du signalement</h1>
          <p className="text-sm text-gray-500">#{currentReport.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* Informations principales */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-16 h-16 ${getCategoryColor(currentReport.category)} rounded-full flex items-center justify-center flex-shrink-0`}>
            <i className={`${getCategoryIcon(currentReport.category)} text-2xl text-white`}></i>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold capitalize mb-2">{currentReport.category}</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentReport.status)}`}>
                {currentReport.status === 'nouveau' ? 'Nouveau' : 
                 currentReport.status === 'en-cours' ? 'En cours' : 'Résolu'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(currentReport.priority)}`}>
                Priorité {currentReport.priority}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
          >
            <i className="ri-edit-line mr-1"></i>
            Modifier
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{currentReport.description}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Localisation</h3>
            <div className="space-y-2">
              {currentReport.location_text && (
                <div className="flex items-start gap-2">
                  <i className="ri-map-pin-line text-gray-400 mt-1"></i>
                  <span className="text-gray-700">{currentReport.location_text}</span>
                </div>
              )}
              {currentReport.latitude && currentReport.longitude && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-blue-700 mb-1">
                        <i className="ri-map-pin-fill"></i>
                        <span className="font-medium">Position GPS exacte</span>
                      </div>
                      <div className="text-sm text-blue-600">
                        Lat: {currentReport.latitude.toFixed(6)}, Lng: {currentReport.longitude.toFixed(6)}
                      </div>
                      {currentReport.location_accuracy && (
                        <div className="text-xs text-blue-500 mt-1">
                          Précision: ±{currentReport.location_accuracy}m
                        </div>
                      )}
                    </div>
                    <button
                      onClick={openInGoogleMaps}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <i className="ri-navigation-line"></i>
                      Ouvrir dans Maps
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Informations citoyen</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Nom: {currentReport.citizen_name || 'Anonyme'}</div>
              <div>Email: {currentReport.citizen_email || 'Non renseigné'}</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Pièces jointes</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <i className="ri-attachment-line"></i>
              <span>{currentReport.photos_count} fichier(s) joint(s) (stockage local)</span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Historique</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Créé le {formatDate(currentReport.created_at)}</span>
              </div>
              {currentReport.updated_at !== currentReport.created_at && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Modifié le {formatDate(currentReport.updated_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire d'édition */}
      {isEditing && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold mb-4">Modifier le signalement</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Statut</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value as CitizenReport['status']})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="nouveau">Nouveau</option>
                <option value="en-cours">En cours</option>
                <option value="resolu">Résolu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priorité</label>
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({...editForm, priority: e.target.value as CitizenReport['priority']})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="basse">Basse</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveChanges}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {currentReport.latitude && currentReport.longitude && (
          <button
            onClick={openInGoogleMaps}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <i className="ri-navigation-line"></i>
            Aller sur site
          </button>
        )}
        <button
          onClick={deleteReport}
          className="bg-red-600 text-white py-3 px-4 rounded-lg font-medium flex items-center gap-2"
        >
          <i className="ri-delete-bin-line"></i>
          Supprimer
        </button>
      </div>
    </div>
  );
}
