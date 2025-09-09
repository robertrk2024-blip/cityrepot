'use client';

import { useState } from 'react';

export default function ServiceManagement() {
  const [activeSection, setActiveSection] = useState('configuration');

  const configOptions = [
    {
      title: 'Délai de réponse maximum',
      description: 'Temps limite pour répondre aux signalements urgents',
      value: '2 heures',
      type: 'duration'
    },
    {
      title: 'Notifications automatiques',
      description: 'Envoyer des notifications aux citoyens',
      value: true,
      type: 'boolean'
    },
    {
      title: 'Géolocalisation obligatoire',
      description: 'Forcer la géolocalisation pour les signalements',
      value: true,
      type: 'boolean'
    },
    {
      title: 'Photos maximales par signalement',
      description: 'Nombre maximum de photos autorisées',
      value: '5',
      type: 'number'
    },
    {
      title: 'Taille maximale des fichiers',
      description: 'Taille limite pour les pièces jointes',
      value: '10 MB',
      type: 'size'
    }
  ];

  const categories = [
    { id: 1, name: 'Sécurité', icon: 'ri-shield-line', active: true, reports: 45 },
    { id: 2, name: 'Routes', icon: 'ri-road-map-line', active: true, reports: 32 },
    { id: 3, name: 'Propreté', icon: 'ri-leaf-line', active: true, reports: 28 },
    { id: 4, name: 'Éclairage', icon: 'ri-lightbulb-line', active: true, reports: 15 },
    { id: 5, name: 'Espaces verts', icon: 'ri-plant-line', active: true, reports: 12 },
    { id: 6, name: 'Stationnement', icon: 'ri-parking-line', active: false, reports: 8 }
  ];

  const sections = [
    { id: 'configuration', name: 'Configuration', icon: 'ri-settings-3-line' },
    { id: 'categories', name: 'Catégories', icon: 'ri-folder-line' },
    { id: 'permissions', name: 'Permissions', icon: 'ri-lock-line' },
    { id: 'maintenance', name: 'Maintenance', icon: 'ri-tools-line' }
  ];

  return (
    <div className="space-y-4">
      {/* Navigation des sections */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 gap-0">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center justify-center gap-2 py-3 text-sm font-medium ${
                activeSection === section.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className={section.icon}></i>
              {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration générale */}
      {activeSection === 'configuration' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <i className="ri-settings-3-line text-purple-600"></i>
              Paramètres système
            </h3>
            <div className="space-y-4">
              {configOptions.map((option, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.title}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                  <div className="ml-4">
                    {option.type === 'boolean' ? (
                      <div className={`w-12 h-6 rounded-full relative cursor-pointer ${
                        option.value ? 'bg-purple-600' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                          option.value ? 'left-6' : 'left-0.5'
                        }`}></div>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-purple-600">
                        {option.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-3">Actions système</h3>
            <div className="space-y-2">
              <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium text-left">
                Sauvegarder la configuration
              </button>
              <button className="w-full p-3 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium text-left">
                Exporter les données
              </button>
              <button className="w-full p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium text-left">
                Réinitialiser les paramètres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gestion des catégories */}
      {activeSection === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <i className="ri-folder-line text-purple-600"></i>
                Catégories de signalement
              </h3>
              <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm">
                Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className={`${category.icon} text-lg text-purple-600`}></i>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.reports} signalements</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      category.active ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      {category.active ? 'Actif' : 'Inactif'}
                    </span>
                    <button className="ml-2 p-1 text-gray-400 hover:text-gray-600">
                      <i className="ri-more-line"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gestion des permissions */}
      {activeSection === 'permissions' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <i className="ri-lock-line text-purple-600"></i>
              Matrice des permissions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Rôle</th>
                    <th className="text-center py-2">Voir</th>
                    <th className="text-center py-2">Répondre</th>
                    <th className="text-center py-2">Modifier</th>
                    <th className="text-center py-2">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">Agent</td>
                    <td className="text-center py-2">
                      <i className="ri-check-line text-green-600"></i>
                    </td>
                    <td className="text-center py-2">
                      <i className="ri-check-line text-green-600"></i>
                    </td>
                    <td className="text-center py-2">
                      <i className="ri-close-line text-red-600"></i>
                    </td>
                    <td className="text-center py-2">
                      <i className="ri-close-line text-red-600"></i>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">Superviseur</td>
                    <td className="text-center py-2">
                      <i className="ri-check-line text-green-600"></i>
                    </td>
                    <td className="text-center py-2">
                      <i className="ri-check-line text-green-600"></i>
                    </td>
                    <td className="text-center py-2">
                      <i className="ri-check-line text-green-600"></i>
                    </td>
                    <td className="text-center py-2">
                      <i className="ri-close-line text-red-600"></i>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 font-medium">Chef de Service</td>
                    <td className="text-center py-2">
                      <i className="ri-check-line text-green-600"></i>
                    </td>
                    <td className="text-center py-2">
                      <i className="ri-check-line text-green-600"></i>
                    </td>
                    <td className="text-center py-2">
                      <i className="ri-check-line text-green-600"></i>
                    </td>
                    <td className="text-center py-2">
                      <i className="ri-check-line text-green-600"></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance système */}
      {activeSection === 'maintenance' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <i className="ri-tools-line text-purple-600"></i>
              Outils de maintenance
            </h3>
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Nettoyage de la base de données</div>
                  <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                    Exécuter
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Supprime les signalements anciens et les fichiers orphelins
                </div>
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Sauvegarde complète</div>
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                    Démarrer
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Dernière sauvegarde: 14/01/2024 à 03:00
                </div>
              </div>
              
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Vérification du système</div>
                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
                    Vérifier
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Teste l'intégrité des données et la performance
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-3 text-red-600">Zone de danger</h3>
            <div className="space-y-2">
              <button className="w-full p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium text-left border border-red-200">
                Réinitialiser toutes les données
              </button>
              <div className="text-xs text-red-500 px-3">
                Cette action est irréversible et supprimera toutes les données
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}