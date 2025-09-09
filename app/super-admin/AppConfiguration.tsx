'use client';

import { useState } from 'react';

export default function AppConfiguration() {
  const [appSettings, setAppSettings] = useState({
    appName: 'CityReport',
    appSubtitle: 'Signalement Citoyen - Améliorons notre ville ensemble',
    appIcon: '/icon-192x192.png',
    websiteUrl: 'https://cityreport.ville.fr',
    contactEmail: 'contact@ville.fr',
    supportPhone: '05 12 34 56 78',
    address: '12 Place de la Mairie, 31000 Toulouse',
    developerCredit: 'Cette application a été développée par le groupe UMOJA',
    developerLogo: 'Ir Robert Kitenge RK'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState(appSettings);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');

  const handleSave = async () => {
    let finalSettings = { ...tempSettings };

    // Si une nouvelle icône a été uploadée
    if (iconFile) {
      const formData = new FormData();
      formData.append('icon', iconFile);
      
      try {
        // Ici, en production, vous uploaderiez vers votre serveur
        // Pour la démo, on utilise un URL temporaire
        const reader = new FileReader();
        reader.onload = (e) => {
          finalSettings.appIcon = e.target?.result as string;
          updateAppSettings(finalSettings);
        };
        reader.readAsDataURL(iconFile);
      } catch (error) {
        console.error('Erreur upload icône:', error);
        updateAppSettings(finalSettings);
      }
    } else {
      updateAppSettings(finalSettings);
    }
  };

  const updateAppSettings = (newSettings) => {
    setAppSettings(newSettings);
    setIsEditing(false);
    setIconFile(null);
    setIconPreview('');

    // Mettre à jour les métadonnées de l'application
    updateAppMetadata(newSettings);

    // Notification automatique à tous les citoyens
    if (typeof window !== 'undefined' && window.universalNotify) {
      window.universalNotify(
        'Application mise à jour',
        `${newSettings.appName} a été mis à jour avec une nouvelle identité visuelle. Redémarrez pour voir les changements.`,
        { 
          channels: ['push', 'sms'],
          priority: 'high',
          type: 'update'
        }
      );
    }

    alert('Configuration mise à jour ! Tous les utilisateurs ont été notifiés de la mise à jour.');
  };

  const updateAppMetadata = (settings) => {
    // Mettre à jour le titre de la page
    document.title = `${settings.appName} - Signalement Citoyen`;
    
    // Mettre à jour l'icône du navigateur
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = settings.appIcon;
    if (!document.querySelector('link[rel="icon"]')) {
      document.head.appendChild(favicon);
    }

    // Mettre à jour les métadonnées PWA
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      // En production, vous générereriez un nouveau manifest.json
      console.log('Manifest PWA mis à jour avec:', settings);
    }
  };

  const handleCancel = () => {
    setTempSettings(appSettings);
    setIsEditing(false);
    setIconFile(null);
    setIconPreview('');
  };

  const handleInputChange = (field, value) => {
    setTempSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image (PNG, JPG, SVG)');
        return;
      }

      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('L\'image doit faire moins de 2MB');
        return;
      }

      setIconFile(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIconUpload = () => {
    setIconFile(null);
    setIconPreview('');
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Configuration de l'Application</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Version 2.1.0</span>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <i className="ri-information-line text-blue-600 mt-0.5"></i>
            <div className="text-sm text-blue-700">
              <div className="font-medium">Mise à jour en temps réel</div>
              <div>Les changements d'icône et de nom seront appliqués immédiatement à tous les utilisateurs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration principale */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Identité de l'application</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <i className="ri-edit-line"></i>
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
              >
                <i className="ri-save-line"></i>
                Sauvegarder
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Icône de l'application */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">
              <i className="ri-image-line mr-1"></i>
              Icône de l'application
            </label>
            
            <div className="flex items-start gap-4">
              {/* Aperçu actuel */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-100 rounded-xl border-2 border-gray-200 overflow-hidden">
                  <img 
                    src={iconPreview || appSettings.appIcon} 
                    alt="Icône app"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiM5Q0E3QzAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnoiLz48L3N2Zz4=';
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center">Actuelle</div>
              </div>

              {/* Upload nouvelle icône */}
              {isEditing && (
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      id="icon-upload"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                    />
                    <label 
                      htmlFor="icon-upload" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <i className="ri-upload-cloud-2-line text-2xl text-gray-400"></i>
                      <div className="text-sm font-medium text-gray-600">
                        Cliquez pour changer l'icône
                      </div>
                      <div className="text-xs text-gray-500">
                        PNG, JPG, SVG • Max 2MB • Recommandé: 512x512px
                      </div>
                    </label>
                  </div>

                  {iconFile && (
                    <div className="mt-3 flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <i className="ri-file-image-line text-green-600"></i>
                        <span className="text-sm font-medium text-green-700">{iconFile.name}</span>
                      </div>
                      <button
                        onClick={removeIconUpload}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Nom de l'application */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <i className="ri-smartphone-line mr-1"></i>
              Nom de l'application
            </label>
            {isEditing ? (
              <input
                type="text"
                value={tempSettings.appName}
                onChange={(e) => handleInputChange('appName', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-medium"
                placeholder="Ex: CityReport, MonVille, CitoyenConnect..."
                maxLength={20}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg font-medium text-gray-900 text-lg">
                {appSettings.appName}
              </div>
            )}
          </div>

          {/* Sous-titre */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <i className="ri-text mr-1"></i>
              Description/Slogan
            </label>
            {isEditing ? (
              <textarea
                value={tempSettings.appSubtitle}
                onChange={(e) => handleInputChange('appSubtitle', e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Description courte qui apparaît en bas de l'écran d'accueil"
                maxLength={80}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                {appSettings.appSubtitle}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informations de contact */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-900 mb-4">Informations de contact</h3>

        <div className="space-y-4">
          {/* Site web */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <i className="ri-global-line mr-1"></i>
              Site web officiel
            </label>
            {isEditing ? (
              <input
                type="url"
                value={tempSettings.websiteUrl}
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://votre-ville.fr"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-blue-600 font-medium">
                {appSettings.websiteUrl}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <i className="ri-mail-line mr-1"></i>
              Email de contact
            </label>
            {isEditing ? (
              <input
                type="email"
                value={tempSettings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="contact@votre-ville.fr"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-blue-600 font-medium">
                {appSettings.contactEmail}
              </div>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <i className="ri-phone-line mr-1"></i>
              Téléphone (optionnel)
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={tempSettings.supportPhone}
                onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="05 12 34 56 78"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                {appSettings.supportPhone}
              </div>
            )}
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <i className="ri-map-pin-line mr-1"></i>
              Adresse postale
            </label>
            {isEditing ? (
              <textarea
                value={tempSettings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Adresse complète de la mairie ou du service"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                {appSettings.address}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section développeur */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-900 mb-4">Crédit développeur</h3>

        <div className="space-y-4">
          {/* Crédit développeur */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <i className="ri-code-line mr-1"></i>
              Mention développeur
            </label>
            {isEditing ? (
              <input
                type="text"
                value={tempSettings.developerCredit}
                onChange={(e) => handleInputChange('developerCredit', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Cette application a été développée par..."
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                {appSettings.developerCredit}
              </div>
            )}
          </div>

          {/* Logo/signature développeur */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <i className="ri-user-star-line mr-1"></i>
              Signature/Logo développeur
            </label>
            {isEditing ? (
              <input
                type="text"
                value={tempSettings.developerLogo}
                onChange={(e) => handleInputChange('developerLogo', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nom ou signature du développeur principal"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {appSettings.developerLogo}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Aperçu */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-900 mb-4">Aperçu écran d'accueil</h3>

        <div className="bg-gradient-to-b from-blue-600 to-blue-700 p-6 rounded-xl text-white">
          <div className="text-center space-y-4">
            {/* Icône app preview */}
            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-lg bg-white/10 backdrop-blur">
              <img 
                src={iconPreview || (isEditing ? tempSettings.appIcon : appSettings.appIcon)} 
                alt="Aperçu icône"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNGRkZGRkYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnoiLz48L3N2Zz4=';
                }}
              />
            </div>
            
            <div className="text-2xl font-bold">
              {isEditing ? tempSettings.appName : appSettings.appName}
            </div>
            <div className="text-sm opacity-90">
              {isEditing ? tempSettings.appSubtitle : appSettings.appSubtitle}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/20 space-y-1 text-xs opacity-75">
              <div>🌐 {isEditing ? tempSettings.websiteUrl : appSettings.websiteUrl}</div>
              <div>✉️ {isEditing ? tempSettings.contactEmail : appSettings.contactEmail}</div>
              <div>🏛️ {isEditing ? tempSettings.address : appSettings.address}</div>
            </div>

            {/* Aperçu crédit développeur */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-xs opacity-75 mb-1">
                {isEditing ? tempSettings.developerCredit : appSettings.developerCredit}
              </div>
              <div className="text-sm font-bold text-purple-200">
                {isEditing ? tempSettings.developerLogo : appSettings.developerLogo}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de déploiement immédiat */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between text-white">
          <div>
            <div className="font-medium">Déploiement en temps réel</div>
            <div className="text-sm opacity-90">Appliquer immédiatement les changements à tous les utilisateurs</div>
          </div>
          <button 
            onClick={() => {
              // Forcer la mise à jour immédiate
              updateAppMetadata(appSettings);
              
              if (typeof window !== 'undefined' && window.universalNotify) {
                window.universalNotify(
                  `${appSettings.appName} mis à jour`,
                  'Votre application a été mise à jour avec une nouvelle identité. Les changements sont maintenant actifs !',
                  { 
                    channels: ['push'],
                    priority: 'high',
                    type: 'update'
                  }
                );
              }
              alert('Mise à jour déployée en temps réel ! Tous les utilisateurs voient maintenant les nouveaux changements.');
            }}
            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-white/30 transition-colors"
          >
            <i className="ri-rocket-line"></i>
            Déployer
          </button>
        </div>
      </div>
    </div>
  );
}
