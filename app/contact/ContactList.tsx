
'use client';

import { useState, useEffect } from 'react';
import { ContactsManager, type EmergencyContact } from '../../lib/storage';

export default function ContactList() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('tous');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const activeContacts = ContactsManager.getActiveContacts();
    setContacts(activeContacts.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const filteredContacts = contacts.filter(contact => {
    if (selectedCategory === 'tous') return true;
    return contact.category === selectedCategory;
  });

  const makePhoneCall = (phone: string, name: string) => {
    if (confirm(`Appeler ${name} au ${phone} ?`)) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const sendEmail = (email: string, name: string) => {
    if (confirm(`Envoyer un email à ${name} ?`)) {
      window.open(`mailto:${email}`, '_self');
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'police': return 'bg-blue-500';
      case 'pompiers': return 'bg-red-500';
      case 'medical': return 'bg-green-500';
      case 'municipale': return 'bg-purple-500';
      default: return 'bg-gray-500';
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

  const categories = [
    { id: 'tous', name: 'Tous', count: contacts.length },
    { id: 'police', name: 'Police', count: contacts.filter(c => c.category === 'police').length },
    { id: 'pompiers', name: 'Pompiers', count: contacts.filter(c => c.category === 'pompiers').length },
    { id: 'medical', name: 'Médical', count: contacts.filter(c => c.category === 'medical').length },
    { id: 'municipale', name: 'Municipal', count: contacts.filter(c => c.category === 'municipale').length },
    { id: 'autre', name: 'Autre', count: contacts.filter(c => c.category === 'autre').length }
  ].filter(cat => cat.count > 0);

  const urgencyContacts = contacts.filter(c => 
    c.category === 'police' || c.category === 'pompiers' || c.category === 'medical'
  );

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-2">Contacts d'urgence</h2>
        <div className="flex items-center gap-2 text-blue-100">
          <i className="ri-phone-line"></i>
          <span className="text-sm">{contacts.length} contact(s) disponible(s)</span>
        </div>
      </div>

      {/* Contacts d'urgence prioritaires */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
          <i className="ri-alarm-warning-line"></i>
          Numéros d'urgence
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {urgencyContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => makePhoneCall(contact.phone, contact.name)}
              className="flex items-center gap-3 bg-white p-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
            >
              <div className={`w-10 h-10 ${getCategoryColor(contact.category)} rounded-full flex items-center justify-center`}>
                <i className={`${getCategoryIcon(contact.category)} text-white`}></i>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">{contact.name}</div>
                <div className="text-sm font-mono text-red-600">{contact.phone}</div>
              </div>
              <i className="ri-phone-fill text-red-600 text-xl"></i>
            </button>
          ))}
        </div>
        <div className="mt-3 p-2 bg-red-100 rounded-lg">
          <p className="text-xs text-red-800 text-center">
            En cas d'urgence vitale, composez le <strong>112</strong> (numéro européen d'urgence)
          </p>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {category.name}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                selectedCategory === category.id
                  ? 'bg-blue-700'
                  : 'bg-gray-200'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste des contacts */}
      <div className="space-y-3">
        {filteredContacts.map((contact) => (
          <div key={contact.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 ${getCategoryColor(contact.category)} rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className={`${getCategoryIcon(contact.category)} text-white text-lg`}></i>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{contact.name}</h3>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs">
                    {getCategoryName(contact.category)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <i className="ri-phone-line text-gray-400"></i>
                    <span className="font-mono text-sm flex-1">{contact.phone}</span>
                    <button
                      onClick={() => makePhoneCall(contact.phone, contact.name)}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <i className="ri-phone-fill"></i>
                      Appeler
                    </button>
                  </div>
                  
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <i className="ri-mail-line text-gray-400"></i>
                      <span className="text-sm text-gray-600 flex-1">{contact.email}</span>
                      <button
                        onClick={() => sendEmail(contact.email!, contact.name)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <i className="ri-mail-send-fill"></i>
                        Email
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-contacts-line text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun contact</h3>
          <p className="text-gray-600 text-sm">
            {selectedCategory === 'tous' 
              ? 'Aucun contact d\'urgence disponible'
              : `Aucun contact dans la catégorie "${categories.find(c => c.id === selectedCategory)?.name}"`
            }
          </p>
        </div>
      )}

      {/* Informations importantes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <i className="ri-information-line text-blue-600 text-lg mt-0.5"></i>
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-2">Informations importantes :</h4>
            <ul className="space-y-1 text-xs">
              <li>• En cas d'urgence vitale, appelez le <strong>112</strong></li>
              <li>• Ces contacts sont mis à jour régulièrement par l'administration</li>
              <li>• Les appels vers ces numéros peuvent être enregistrés</li>
              <li>• Pour les urgences non vitales, privilégiez un signalement via l'application</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
