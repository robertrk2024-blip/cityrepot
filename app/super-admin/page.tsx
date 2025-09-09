
'use client';

import { useState } from 'react';
import SuperAdminHeader from './SuperAdminHeader';
import SystemOverview from './SystemOverview';
import AdminManagement from './AdminManagement';
import ServiceManagement from './ServiceManagement';
import PublicAlertsManagement from './PublicAlertsManagement';
import AppConfiguration from './AppConfiguration';
import AutoUpdateSystem from './AutoUpdateSystem';
import ContactManagement from '../admin/ContactManagement';

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'ri-dashboard-line' },
    { id: 'updates', label: 'Mises à jour', icon: 'ri-refresh-line' },
    { id: 'admins', label: 'Administrateurs', icon: 'ri-team-line' },
    { id: 'services', label: 'Services', icon: 'ri-service-line' },
    { id: 'alerts', label: 'Alertes Publiques', icon: 'ri-megaphone-line' },
    { id: 'config', label: 'Configuration', icon: 'ri-settings-3-line' },
    { id: 'contacts', label: 'Contacts d\'urgence', icon: 'ri-contacts-line' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SystemOverview />;
      case 'updates':
        return <AutoUpdateSystem />;
      case 'admins':
        return <AdminManagement />;
      case 'services':
        return <ServiceManagement />;
      case 'alerts':
        return <PublicAlertsManagement />;
      case 'config':
        return <AppConfiguration />;
      case 'contacts':
        return <ContactManagement />;
      default:
        return <SystemOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20">
      <SuperAdminHeader />
      
      <div className="p-4">
        {/* Navigation par onglets */}
        <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        {renderContent()}
      </div>
    </div>
  );
}
