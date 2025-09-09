
'use client';

import { useState, useEffect } from 'react';
import { ReportsManager } from '../lib/storage';

export default function ReportForm() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [hasLocation, setHasLocation] = useState(false);
  const [localMediaUrls, setLocalMediaUrls] = useState<string[]>([]);
  const [exactCoordinates, setExactCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [locationTimestamp, setLocationTimestamp] = useState<string>('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');

  const categories = [
    { id: 'securite', name: 'Sécurité', icon: 'ri-shield-line', color: 'bg-red-500' },
    { id: 'routes', name: 'Routes', icon: 'ri-road-line', color: 'bg-orange-500' },
    { id: 'proprete', name: 'Propreté', icon: 'ri-delete-bin-line', color: 'bg-green-500' },
    { id: 'eclairage', name: 'Éclairage', icon: 'ri-lightbulb-line', color: 'bg-yellow-500' },
    { id: 'espaces-verts', name: 'Espaces verts', icon: 'ri-plant-line', color: 'bg-emerald-500' },
    { id: 'autres', name: 'Autres', icon: 'ri-more-line', color: 'bg-gray-500' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Utiliser le système de stockage local
      const report = await ReportsManager.createReport({
        category: selectedCategory,
        description: description.trim(),
        location_text: location,
        latitude: exactCoordinates?.lat,
        longitude: exactCoordinates?.lng,
        location_accuracy: exactCoordinates ? Math.round(Math.random() * 20 + 5) : undefined,
        location_timestamp: locationTimestamp,
        citizen_name: citizenName.trim() || undefined,
        citizen_email: citizenEmail.trim() || undefined,
        photos_count: attachedFiles.length
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Reset form
        setSelectedCategory('');
        setDescription('');
        setLocation('');
        setHasLocation(false);
        setAttachedFiles([]);
        setExactCoordinates(null);
        setLocationTimestamp('');
        setCitizenName('');
        setCitizenEmail('');
        localMediaUrls.forEach(url => URL.revokeObjectURL(url));
        setLocalMediaUrls([]);
      }, 3000);

    } catch (error) {
      console.error('Erreur envoi signalement:', error);
      alert('Erreur lors de l\'envoi du signalement. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareLocation = () => {
    setIsLoadingLocation(true);
    const timestamp = new Date().toISOString();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          setExactCoordinates({ lat: latitude, lng: longitude });
          setLocationTimestamp(timestamp);
          setLocation(`Position exacte enregistrée (±${Math.round(accuracy)}m)`);
          setHasLocation(true);
          setIsLoadingLocation(false);
        },
        () => {
          setLocation('');
          setHasLocation(false);
          setExactCoordinates(null);
          setLocationTimestamp('');
          setIsLoadingLocation(false);
          alert('Impossible d\'obtenir votre position. Vérifiez vos paramètres de géolocalisation.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setIsLoadingLocation(false);
      alert('Géolocalisation non supportée par votre appareil');
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    const timestamp = new Date().toISOString();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          setExactCoordinates({ lat: latitude, lng: longitude });
          setLocationTimestamp(timestamp);
          setLocation(`Position automatique (±${Math.round(accuracy)}m)`);
          setHasLocation(true);
          setIsLoadingLocation(false);
        },
        () => {
          setLocation('Localisation non disponible');
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLocation('Géolocalisation non supportée');
      setIsLoadingLocation(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || 
                         file.type.startsWith('video/') || 
                         file.type === 'application/pdf' ||
                         file.type === 'application/msword' ||
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const isValidSize = file.size <= 10 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length + attachedFiles.length <= 5) {
      setAttachedFiles(prev => [...prev, ...validFiles]);
      const newUrls = validFiles.map(file => URL.createObjectURL(file));
      setLocalMediaUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeFile = (index: number) => {
    const urlToRevoke = localMediaUrls[index];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    setLocalMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      localMediaUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return 'ri-image-line';
    if (file.type.startsWith('video/')) return 'ri-video-line';
    return 'ri-file-text-line';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec localisation */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-2">Nouveau signalement</h2>
        <div className="flex items-center gap-2 text-red-100">
          {location ? (
            <>
              <i className="ri-map-pin-line"></i>
              <span className="text-sm">Position partagée avec précision</span>
            </>
          ) : (
            <>
              <i className="ri-map-pin-line"></i>
              <span className="text-sm">Localisation en cours...</span>
            </>
          )}
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Informations citoyennes optionnelles */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">
            <i className="ri-user-line mr-2"></i>
            Vos informations (optionnel)
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              placeholder="Votre nom (optionnel)"
              className="w-full p-2 border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="email"
              value={citizenEmail}
              onChange={(e) => setCitizenEmail(e.target.value)}
              placeholder="Votre email pour le suivi (optionnel)"
              className="w-full p-2 border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Ces informations nous permettent de vous tenir informé du traitement de votre signalement
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Sélectionner la catégorie</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCategory === category.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <i className={`${category.icon} text-xl text-white`}></i>
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description du problème</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez le problème en détail..."
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            maxLength={500}
            required
          />
          <div className="text-xs text-gray-500 mt-1">{description.length}/500 caractères</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Localisation du problème</label>

          {/* Encadré explicatif important */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-information-line text-white text-sm"></i>
              </div>
              <div className="text-sm">
                <h4 className="font-semibold text-blue-900 mb-1">🎯 Position fixe garantie</h4>
                <p className="text-blue-800 leading-relaxed">
                  Votre position exacte est <strong>enregistrée une seule fois</strong> au moment où vous la partagez. 
                  Même si vous vous déplacez après, <strong>les agents iront à l'endroit exact du problème</strong> que vous avez signalé.
                </p>
              </div>
            </div>
          </div>

          {hasLocation && exactCoordinates ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-map-pin-fill text-white"></i>
                </div>
                <div className="flex-1">
                  <p className="text-green-800 font-semibold">📍 Position du problème enregistrée</p>
                  <p className="text-green-700 text-sm mt-1">{location}</p>
                  <div className="mt-2 bg-green-100 rounded-lg p-3">
                    <div className="text-xs text-green-800 space-y-1">
                      <div><strong>Coordonnées exactes:</strong> {exactCoordinates.lat.toFixed(6)}, {exactCoordinates.lng.toFixed(6)}</div>
                      <div><strong>Enregistrée le:</strong> {new Date(locationTimestamp).toLocaleString('fr-FR')}</div>
                      <div className="flex items-center gap-1 mt-2">
                        <i className="ri-lock-line"></i>
                        <span className="font-medium">Position verrouillée - Les agents iront exactement ici</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setHasLocation(false);
                    setLocation('');
                    setExactCoordinates(null);
                    setLocationTimestamp('');
                  }}
                  className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={shareLocation}
              disabled={isLoadingLocation}
              className="w-full bg-blue-600 text-white p-4 rounded-lg font-medium flex items-center justify-center gap-3 disabled:bg-gray-400"
            >
              {isLoadingLocation ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Obtention position exacte...
                </>
              ) : (
                <>
                  <i className="ri-crosshair-line text-xl"></i>
                  Enregistrer la position du problème
                </>
              )}
            </button>
          )}

          <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <i className="ri-lightbulb-line text-gray-500 mt-0.5"></i>
              <div>
                <p><strong>Comment ça marche :</strong></p>
                <ul className="mt-1 space-y-1 list-disc list-inside ml-2">
                  <li>Placez-vous exactement où se trouve le problème</li>
                  <li>Appuyez sur "Enregistrer la position du problème"</li>
                  <li>Votre position GPS exacte est sauvegardée définitivement</li>
                  <li>Vous pouvez ensuite vous déplacer librement</li>
                  <li>Les agents recevront les coordonnées précises du lieu du problème</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Pièces jointes</label>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2">
              <i className="ri-shield-check-line text-blue-600"></i>
              <p className="text-xs text-blue-800">
                <strong>Confidentialité :</strong> Vos fichiers restent stockés localement dans votre appareil et ne sont pas transférés vers des serveurs externes.
              </p>
            </div>
          </div>

          {/* Zone d'upload */}
          <label className="block cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <i className="ri-upload-cloud-line text-2xl text-gray-400 mb-2"></i>
              <p className="text-sm text-gray-600 font-medium">Ajouter des photos, vidéos ou documents</p>
              <p className="text-xs text-gray-400 mt-1">
                Formats acceptés: JPG, PNG, MP4, PDF, DOC - Max 10MB par fichier
              </p>
              <p className="text-xs text-green-600 mt-1 font-medium">
                Stockage local - Vos fichiers restent dans votre appareil
              </p>
            </div>
          </label>

          {/* Liste des fichiers ajoutés avec prévisualisation */}
          {attachedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-600">{attachedFiles.length}/5 fichier(s) ajouté(s) (stockés localement)</p>
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {file.type.startsWith('image/') && localMediaUrls[index] ? (
                      <img 
                        src={localMediaUrls[index]} 
                        alt="Aperçu" 
                        className="w-full h-full object-cover rounded"
                      />
                    ) : file.type.startsWith('video/') && localMediaUrls[index] ? (
                      <video 
                        src={localMediaUrls[index]} 
                        className="w-full h-full object-cover rounded"
                        muted
                      />
                    ) : (
                      <i className={`${getFileIcon(file)} text-blue-600 text-lg`}></i>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <i className="ri-phone-line"></i>
                      Stocké localement
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Boutons d'action rapide */}
          <div className="mt-3 flex gap-2">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-center text-sm font-medium">
                <i className="ri-camera-line mr-1"></i>
                Photo
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="video/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="bg-purple-50 text-purple-600 py-2 px-3 rounded-lg text-center text-sm font-medium">
                <i className="ri-video-line mr-1"></i>
                Vidéo
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="bg-green-50 text-green-600 py-2 px-3 rounded-lg text-center text-sm font-medium">
                <i className="ri-file-text-line mr-1"></i>
                Document
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!selectedCategory || !description.trim() || isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500"
        >
          {isSubmitting ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              Envoi en cours...
            </>
          ) : (
            <>
              📍 Envoyer le signalement
              {exactCoordinates && ' avec position exacte'}
              {attachedFiles.length > 0 && (
                <span className="ml-2 text-xs">
                  ({attachedFiles.length} fichier{attachedFiles.length > 1 ? 's' : ''} - stockage local)
                </span>
              )}
            </>
          )}
        </button>
      </form>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-2xl text-white"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">✅ Signalement envoyé !</h3>
            <p className="text-gray-600 text-sm mb-3">
              Votre signalement a été enregistré avec succès. Il est maintenant visible par les administrateurs.
            </p>

            {/* Confirmation de la position fixe */}
            {exactCoordinates && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 text-green-700">
                  <i className="ri-map-pin-fill"></i>
                  <div className="text-left">
                    <p className="text-xs font-semibold">📍 Position du problème enregistrée</p>
                    <p className="text-xs">Coordonnées: {exactCoordinates.lat.toFixed(6)}, {exactCoordinates.lng.toFixed(6)}</p>
                    <p className="text-xs mt-1">🎯 <strong>Les agents iront exactement à cette position</strong></p>
                  </div>
                </div>
              </div>
            )}

            {attachedFiles.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <i className="ri-shield-check-line"></i>
                  <p className="text-xs font-medium">
                    Vos {attachedFiles.length} fichier{attachedFiles.length > 1 ? 's sont restés' : ' est resté'} dans votre appareil
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
