
'use client';

import { useState } from 'react';
import { AdminAuthManager } from '../lib/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await AdminAuthManager.signIn(email, password);
      
      // Rediriger vers le panel admin
      window.location.href = '/admin';
      
    } catch (error: any) {
      setError(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (userType: 'admin' | 'super-admin') => {
    if (userType === 'admin') {
      setEmail('admin@ville.fr');
      setPassword('admin123');
    } else {
      setEmail('super.admin@ville.fr');
      setPassword('superadmin123');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Connexion Administrateur</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
            >
              <i className="ri-close-line text-gray-600"></i>
            </button>
          </div>

          {/* Indicateur de comptes de démonstration */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <i className="ri-information-line text-blue-600 text-lg mt-0.5"></i>
              <div className="text-sm">
                <h3 className="font-medium text-blue-900 mb-2">Comptes de démonstration</h3>
                <p className="text-blue-800 mb-3">
                  Votre projet fonctionne avec un système de stockage local sécurisé. 
                  Voici les comptes administrateur pré-configurés :
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => fillCredentials('admin')}
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded text-left text-xs transition-colors"
                  >
                    👤 <strong>Admin :</strong> admin@ville.fr / admin123
                  </button>
                  <button
                    onClick={() => fillCredentials('super-admin')}
                    className="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 p-2 rounded text-left text-xs transition-colors"
                  >
                    🔧 <strong>Super Admin :</strong> super.admin@ville.fr / superadmin123
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Cliquez sur un compte pour remplir automatiquement les champs
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email administrateur
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="admin@ville.fr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <i className="ri-error-warning-line"></i>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Connexion...
                </>
              ) : (
                <>
                  <i className="ri-login-circle-line mr-2"></i>
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                ✨ Système de stockage local sécurisé
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <i className="ri-database-line"></i>
                  Données locales
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-shield-check-line"></i>
                  Sécurisé
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-speed-line"></i>
                  Instantané
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
