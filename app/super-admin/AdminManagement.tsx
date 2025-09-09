
'use client';

import { useState } from 'react';

export default function AdminManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('agent');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetMethod, setResetMethod] = useState('email');
  const [resetValue, setResetValue] = useState('');

  const admins = [
    {
      id: 1,
      email: 'chef.police@ville.fr',
      name: 'Commissaire Durand',
      role: 'chef-service',
      department: 'Police Municipale',
      status: 'actif',
      lastLogin: '2024-01-15 09:30',
      phone: '+33 6 12 34 56 78',
      permissions: ['all']
    },
    {
      id: 2,
      email: 'agent.dupont@ville.fr',
      name: 'Agent Dupont',
      role: 'agent',
      department: 'Police Municipale',
      status: 'actif',
      lastLogin: '2024-01-15 14:20',
      phone: '+33 6 23 45 67 89',
      permissions: ['reports', 'responses']
    },
    {
      id: 3,
      email: 'tech.martin@ville.fr',
      name: 'Technicien Martin',
      role: 'agent',
      department: 'Services Techniques',
      status: 'actif',
      lastLogin: '2024-01-14 16:45',
      phone: '+33 6 34 56 78 90',
      permissions: ['reports', 'maintenance']
    },
    {
      id: 4,
      email: 'admin.sophie@ville.fr',
      name: 'Sophie Laurent',
      role: 'superviseur',
      department: 'Administration',
      status: 'inactif',
      lastLogin: '2024-01-10 11:20',
      phone: '+33 6 45 67 89 01',
      permissions: ['reports', 'users', 'stats']
    }
  ];

  const roleOptions = [
    { value: 'agent', label: 'Agent', color: 'bg-blue-100 text-blue-800' },
    { value: 'superviseur', label: 'Superviseur', color: 'bg-orange-100 text-orange-800' },
    { value: 'chef-service', label: 'Chef de Service', color: 'bg-red-100 text-red-800' },
    { value: 'super-admin', label: 'Super Admin', color: 'bg-purple-100 text-purple-800' }
  ];

  const getRoleColor = (role) => {
    const roleOption = roleOptions.find(option => option.value === role);
    return roleOption ? roleOption.color : 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role) => {
    const roleOption = roleOptions.find(option => option.value === role);
    return roleOption ? roleOption.label : role;
  };

  const handleAddAdmin = () => {
    if (newAdminEmail.trim()) {
      console.log('Ajout admin:', { email: newAdminEmail, role: newAdminRole });
      setNewAdminEmail('');
      setShowAddForm(false);
      
      alert('Nouvel administrateur ajouté ! Notification envoyée à tous les citoyens.');
    }
  };

  const handleResetPassword = (admin) => {
    setSelectedAdmin(admin);
    setShowResetModal(true);
    setResetValue('');
  };

  const handleChangePassword = () => {
    if (newPassword.length >= 8) {
      console.log('Changement mot de passe pour:', selectedAdmin.email, 'nouveau:', newPassword);
      setNewPassword('');
      setShowPasswordModal(false);
      setSelectedAdmin(null);
      alert('Mot de passe modifié avec succès !');
    }
  };

  const handleSendResetLink = () => {
    if (resetValue.trim()) {
      const method = resetMethod === 'email' ? 'e-mail' : 'SMS';
      console.log(`Envoi lien de réinitialisation via ${method} à:`, resetValue);
      alert(`Lien de réinitialisation envoyé par ${method} à ${resetValue}`);
      setShowResetModal(false);
      setSelectedAdmin(null);
      setResetValue('');
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(result);
  };

  return (
    <div className="space-y-4">
      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">12</div>
          <div className="text-sm text-gray-600">Total administrateurs</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">9</div>
          <div className="text-sm text-gray-600">Actifs aujourd'hui</div>
        </div>
      </div>

      {/* Bouton d'ajout */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50"
        >
          <i className="ri-add-line text-xl"></i>
          Ajouter un administrateur
        </button>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Adresse e-mail</label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@ville.fr"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Rôle</label>
              <select
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 text-sm">
                <i className="ri-information-line"></i>
                <span>Tous les citoyens recevront automatiquement une notification de ce changement</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddAdmin}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium"
              >
                Envoyer l'invitation
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des administrateurs */}
      <div className="space-y-3">
        {admins.map((admin) => (
          <div key={admin.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-purple-600"></i>
                </div>
                <div>
                  <div className="font-medium">{admin.name}</div>
                  <div className="text-sm text-gray-600">{admin.email}</div>
                  <div className="text-xs text-gray-500">{admin.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(admin.role)}`}>
                  {getRoleLabel(admin.role)}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  admin.status === 'actif' ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Service:</span>
                <span className="font-medium">{admin.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Dernière connexion:</span>
                <span className="font-medium">{admin.lastLogin}</span>
              </div>
            </div>

            {/* Permissions */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-500 mb-2">Permissions:</div>
              <div className="flex flex-wrap gap-1">
                {admin.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {permission === 'all' ? 'Toutes' : 
                     permission === 'reports' ? 'Signalements' :
                     permission === 'responses' ? 'Réponses' :
                     permission === 'users' ? 'Utilisateurs' :
                     permission === 'stats' ? 'Statistiques' :
                     permission === 'maintenance' ? 'Maintenance' : permission}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
              <button 
                onClick={() => {
                  setSelectedAdmin(admin);
                  setShowPasswordModal(true);
                }}
                className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
              >
                <i className="ri-key-line text-xs"></i>
                Changer
              </button>
              <button 
                onClick={() => handleResetPassword(admin)}
                className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
              >
                <i className="ri-mail-line text-xs"></i>
                Réinitialiser
              </button>
              <button className="px-4 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium">
                Suspendre
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Changer le mot de passe</h3>
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <i className="ri-shield-user-line text-yellow-600 mt-1"></i>
                  <div>
                    <div className="font-medium text-yellow-800">Admin concerné</div>
                    <div className="text-sm text-yellow-700">{selectedAdmin.name}</div>
                    <div className="text-xs text-yellow-600">{selectedAdmin.email}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={generateRandomPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-refresh-line"></i>
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {newPassword.length}/8 caractères minimum
                </div>
              </div>

              <button
                onClick={generateRandomPassword}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <i className="ri-dice-line"></i>
                Générer un mot de passe aléatoire
              </button>

              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <i className="ri-checkbox-circle-line"></i>
                  <span>Le nouveau mot de passe sera automatiquement envoyé à l'administrateur</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={newPassword.length < 8}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 flex items-center justify-center gap-2"
                >
                  <i className="ri-save-line"></i>
                  Changer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réinitialisation par email/SMS */}
      {showResetModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Réinitialiser le mot de passe</h3>
                <button 
                  onClick={() => setShowResetModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <i className="ri-user-settings-line text-blue-600 mt-1"></i>
                  <div>
                    <div className="font-medium text-blue-800">Admin concerné</div>
                    <div className="text-sm text-blue-700">{selectedAdmin.name}</div>
                    <div className="text-xs text-blue-600">{selectedAdmin.email}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Méthode de réinitialisation</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="resetMethod"
                      value="email"
                      checked={resetMethod === 'email'}
                      onChange={(e) => setResetMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center gap-2">
                      <i className="ri-mail-line text-blue-600"></i>
                      <span>Par e-mail</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="resetMethod"
                      value="sms"
                      checked={resetMethod === 'sms'}
                      onChange={(e) => setResetMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center gap-2">
                      <i className="ri-smartphone-line text-green-600"></i>
                      <span>Par SMS</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {resetMethod === 'email' ? 'Adresse e-mail' : 'Numéro de téléphone'}
                </label>
                <div className="relative">
                  <input
                    type={resetMethod === 'email' ? 'email' : 'tel'}
                    value={resetValue}
                    onChange={(e) => setResetValue(e.target.value)}
                    placeholder={resetMethod === 'email' ? selectedAdmin.email : selectedAdmin.phone}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                  />
                  <i className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${
                    resetMethod === 'email' ? 'ri-mail-line' : 'ri-smartphone-line'
                  }`}></i>
                </div>
                <button
                  onClick={() => setResetValue(resetMethod === 'email' ? selectedAdmin.email : selectedAdmin.phone)}
                  className="text-xs text-blue-600 mt-1 hover:underline"
                >
                  Utiliser {resetMethod === 'email' ? 'l\'e-mail' : 'le téléphone'} par défaut
                </button>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="flex items-start gap-2 text-orange-700 text-sm">
                  <i className="ri-information-line mt-0.5"></i>
                  <div>
                    <div className="font-medium">Lien de réinitialisation</div>
                    <div>Un lien sécurisé sera envoyé pour permettre à l'administrateur de créer un nouveau mot de passe</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendResetLink}
                  disabled={!resetValue.trim()}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 flex items-center justify-center gap-2"
                >
                  <i className={resetMethod === 'email' ? 'ri-mail-send-line' : 'ri-message-2-line'}></i>
                  Envoyer le lien
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
