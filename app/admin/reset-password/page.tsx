
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setError('Token de réinitialisation manquant');
      setValidating(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          action: 'verify_token',
          resetToken: token 
        })
      });

      const result = await response.json();

      if (result.success) {
        setAdminInfo(result.admin);
      } else {
        setError(result.error || 'Token invalide');
      }
    } catch (err) {
      setError('Erreur de vérification du token');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          action: 'reset_password',
          resetToken: token,
          newPassword: newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Erreur lors de la réinitialisation');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(result);
    setConfirmPassword(result);
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 w-full max-w-md text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Vérification du lien de réinitialisation...</div>
        </div>
      </div>
    );
  }

  if (error && !adminInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <i className="ri-error-warning-line text-2xl text-red-600"></i>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Lien invalide</h1>
            <p className="text-gray-600">{error}</p>
          </div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <i className="ri-home-line"></i>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <i className="ri-check-line text-2xl text-green-600"></i>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Mot de passe mis à jour</h1>
            <p className="text-gray-600">Votre nouveau mot de passe a été enregistré avec succès.</p>
          </div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <i className="ri-login-circle-line"></i>
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-key-2-line text-xl text-blue-600"></i>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Nouveau mot de passe</h1>
            <p className="text-sm text-gray-600 mt-2">
              Créez un nouveau mot de passe pour votre compte administrateur
            </p>
          </div>
        </div>

        {/* Infos admin */}
        {adminInfo && (
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-purple-600"></i>
              </div>
              <div>
                <div className="font-medium">{adminInfo.full_name}</div>
                <div className="text-sm text-gray-600">{adminInfo.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <i className="ri-error-warning-line text-red-500"></i>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Minimum 8 caractères"
                required
              />
              <button
                type="button"
                onClick={generatePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="ri-refresh-line"></i>
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {newPassword.length}/8 caractères minimum
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Répétez le mot de passe"
              required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <div className="text-xs text-red-500 mt-1">
                Les mots de passe ne correspondent pas
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={generatePassword}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-200"
          >
            <i className="ri-dice-line"></i>
            Générer un mot de passe sécurisé
          </button>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2 text-blue-700 text-sm">
              <i className="ri-shield-check-line mt-0.5"></i>
              <div>
                <div className="font-medium">Conseils de sécurité</div>
                <div>Utilisez un mot de passe fort avec au moins 8 caractères, incluant lettres, chiffres et symboles.</div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Mise à jour...
              </>
            ) : (
              <>
                <i className="ri-save-line"></i>
                Enregistrer le nouveau mot de passe
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-center">
            <Link 
              href="/"
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1"
            >
              <i className="ri-arrow-left-line text-xs"></i>
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
