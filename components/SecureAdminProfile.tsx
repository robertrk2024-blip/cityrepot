'use client';

import { useState, useEffect } from 'react';
import { SecureAuthManager } from '../lib/auth';
import { AdminUser } from '../lib/storage';

interface AdminProfileProps {
  onClose: () => void;
}

export default function SecureAdminProfile({ onClose }: AdminProfileProps) {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // États pour changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // États pour changement d'email
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });

  useEffect(() => {
    const user = SecureAuthManager.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Gestion du changement de mot de passe
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Validation côté client
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (passwordForm.newPassword.length < 12) {
        throw new Error('Le nouveau mot de passe doit contenir au moins 12 caractères');
      }

      // Validation de la complexité
      const hasLower = /[a-z]/.test(passwordForm.newPassword);
      const hasUpper = /[A-Z]/.test(passwordForm.newPassword);
      const hasNumber = /\d/.test(passwordForm.newPassword);
      const hasSpecial = /[@$!%*?&]/.test(passwordForm.newPassword);

      if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
        throw new Error('Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial');
      }

      await SecureAuthManager.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setMessage('Mot de passe modifié avec succès. Vous allez être déconnecté.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Déconnexion automatique après 3 secondes
      setTimeout(() => {
        SecureAuthManager.signOut();
        window.location.reload();
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  // Gestion du changement d'email
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Validation côté client
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailForm.newEmail)) {
        throw new Error('Format d\'email invalide');
      }

      if (emailForm.newEmail === currentUser?.email) {
        throw new Error('Le nouvel email doit être différent de l\'actuel');
      }

      await SecureAuthManager.changeEmail(
        emailForm.newEmail,
        emailForm.password
      );

      setMessage('Email modifié avec succès');
      setEmailForm({ newEmail: '', password: '' });
      setCurrentUser(prev => prev ? { ...prev, email: emailForm.newEmail } : null);

    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement d\'email');
    } finally {
      setLoading(false);
    }
  };

  // Indicateur de force de session
  const getSessionStrength = () => {
    const strength = SecureAuthManager.getSessionStrength();
    const colors = {
      weak: 'text-red-500 bg-red-50',
      medium: 'text-yellow-500 bg-yellow-50',
      strong: 'text-green-500 bg-green-50'
    };
    const labels = {
      weak: 'Session faible',
      medium: 'Session normale',
      strong: 'Session sécurisée'
    };
    return { color: colors[strength], label: labels[strength] };
  };

  const sessionInfo = getSessionStrength();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Profil Administrateur
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <i className="ri-close-line text-gray-500"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Messages */}
          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Informations du profil */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Informations du compte</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{currentUser.email}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Rôle:</span>
                <span className="font-medium capitalize">
                  {currentUser.role === 'super-admin' ? 'Super Administrateur' : 'Administrateur'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Nom:</span>
                <span className="font-medium">{currentUser.full_name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">État de session:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${sessionInfo.color}`}>
                  {sessionInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <i className="ri-lock-line text-blue-600"></i>
                <span className="font-medium text-blue-700">Changer le mot de passe</span>
              </div>
              <i className={`ri-arrow-${isChangingPassword ? 'up' : 'down'}-s-line text-blue-600`}></i>
            </button>

            <button
              onClick={() => setIsChangingEmail(!isChangingEmail)}
              className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <i className="ri-mail-line text-green-600"></i>
                <span className="font-medium text-green-700">Changer l'email</span>
              </div>
              <i className={`ri-arrow-${isChangingEmail ? 'up' : 'down'}-s-line text-green-600`}></i>
            </button>
          </div>

          {/* Formulaire changement de mot de passe */}
          {isChangingPassword && (
            <form onSubmit={handlePasswordChange} className="space-y-4 border-t pt-6">
              <h4 className="font-medium text-gray-800">Nouveau mot de passe</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Min. 12 caractères avec majuscules, chiffres et symboles"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </form>
          )}

          {/* Formulaire changement d'email */}
          {isChangingEmail && (
            <form onSubmit={handleEmailChange} className="space-y-4 border-t pt-6">
              <h4 className="font-medium text-gray-800">Nouvel email</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouvel email
                  </label>
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="nouveau@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe actuel (confirmation)
                  </label>
                  <input
                    type="password"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Modification...' : 'Changer l\'email'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}