
'use client';

import { useState, useEffect } from 'react';
import { ContactsManager, type EmergencyContact } from '../../lib/storage';

export default function ContactManagement() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'autre' as EmergencyContact['category']
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const allContacts = ContactsManager.getAllContacts();
    setContacts(allContacts.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingContact) {
      // Modifier le contact existant
      ContactsManager.updateContact(editingContact.id, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        category: formData.category
      });
    } else {
      // Créer un nouveau contact
      ContactsManager.createContact({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        category: formData.category
      });
    }

    // Reset form
    setFormData({ name: '', phone: '', email: '', category: 'autre' });
    setShowCreateForm(false);
    setEditingContact(null);
    loadContacts();
  };

  const toggleContactStatus = (id: string, isActive: boolean) => {
    ContactsManager.updateContact(id, { is_active: !isActive });
    loadContacts();
  };

  const deleteContact = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      ContactsManager.deleteContact(id);
      loadContacts();
    }
  };

  const editContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      category: contact.category
    });
    setShowCreateForm(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'police': return 'bg-blue-100 text-blue-800';
      case 'pompiers': return 'bg-red-100 text-red-800';
      case 'medical': return 'bg-green-100 text-green-800';
      case 'municipale': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'police': return 'ri-shield-line';
      case 'pompiers': return 'ri-fire-line';
      case 'medical': return 'ri-heart-pulse-line';
      case 'municipale': return 'ri-government-line';
      default: return 'ri-phone-line';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'police': return 'Police';
      case 'pompiers': return 'Pompiers';
      case 'medical': return 'Médical';
      case 'municipale': return 'Municipal';
      default: return 'Autre';
    }
  };

  const makePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const activeContacts = contacts.filter(c => c.is_active);
  const inactiveContacts = contacts.filter(c => !c.is_active);

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestion des contacts d'urgence</h2>
          <p className="text-sm text-gray-600">{activeContacts.length} contact(s) actif(s)</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingContact(null);
            setFormData({ name: '', phone: '', email: '', category: 'autre' });
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <i className="ri-add-line"></i>
          Nouveau contact
        </button>
      </div>

      {/* Indicateur de fonctionnement */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700">
          <i className="ri-contacts-line"></i>
          <div className="text-sm">
            <div className="font-medium">✅ Répertoire des contacts opérationnel</div>
            <div className="text-xs">Modifications sauvegardées automatiquement</div>
          </div>
        </div>
      </div>

      {/* Formulaire de création/modification */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold mb-4">
            {editingContact ? 'Modifier le contact' : 'Nouveau contact d\'urgence'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom du service/contact</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Police Municipale"
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Ex: 05 61 22 29 92"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email (optionnel)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="contact@service.fr"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as EmergencyContact['category']})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="police">Police</option>
                <option value="pompiers">Pompiers</option>
                <option value="medical">Médical</option>
                <option value="municipale">Service Municipal</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                {editingContact ? 'Modifier' : 'Ajouter'} le contact
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingContact(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts actifs */}
      <div>
        <h3 className="font-semibold mb-3 text-green-600">Contacts actifs ({activeContacts.length})</h3>
        <div className="grid grid-cols-1 gap-3">
          {activeContacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${getCategoryColor(contact.category)} rounded-full flex items-center justify-center`}>
                    <i className={`${getCategoryIcon(contact.category)} text-lg`}></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{contact.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(contact.category)}`}>
                      {getCategoryName(contact.category)}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Actif
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <i className="ri-phone-line text-gray-400"></i>
                  <span className="font-mono text-sm">{contact.phone}</span>
                  <button
                    onClick={() => makePhoneCall(contact.phone)}
                    className="ml-auto bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    Appeler
                  </button>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <i className="ri-mail-line text-gray-400"></i>
                    <span className="text-sm text-gray-600">{contact.email}</span>
                    <button
                      onClick={() => sendEmail(contact.email!)}
                      className="ml-auto bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
                    >
                      Email
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => editContact(contact)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  Modifier
                </button>
                <button
                  onClick={() => toggleContactStatus(contact.id, contact.is_active)}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  Désactiver
                </button>
                <button
                  onClick={() => deleteContact(contact.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {activeContacts.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-contacts-line text-xl text-gray-400"></i>
            </div>
            <p className="text-gray-500 text-sm">Aucun contact actif</p>
          </div>
        )}
      </div>

      {/* Contacts inactifs */}
      {inactiveContacts.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 text-gray-600">Contacts inactifs ({inactiveContacts.length})</h3>
          <div className="space-y-3">
            {inactiveContacts.map((contact) => (
              <div key={contact.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${getCategoryColor(contact.category)} rounded-full flex items-center justify-center opacity-50`}>
                      <i className={`${getCategoryIcon(contact.category)}`}></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">{contact.name}</h4>
                      <span className="text-xs text-gray-500">{contact.phone}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                    Inactif
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleContactStatus(contact.id, contact.is_active)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                  >
                    Réactiver
                  </button>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
