'use client';

import { useState } from 'react';
import AdminHeader from './AdminHeader';
import ReportsList from './ReportsList';
import ReportDetail from './ReportDetail';
import AlertsManagement from './AlertsManagement';
import ContactManagement from './ContactManagement';

export default function AdminPage() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentView, setCurrentView] = useState('reports'); // 'reports' | 'alerts' | 'contacts'

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      {/* Navigation entre les sections */}
      <div className="pt-16 bg-white border-b">
        <div className="flex">
          <button
            onClick={() => {
              setCurrentView('reports');
              setSelectedReport(null);
            }}
            className={`flex-1 py-3 text-sm font-medium ${
              currentView === 'reports'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            <i className="ri-flag-line mr-2"></i>
            Signalements
          </button>
          <button
            onClick={() => {
              setCurrentView('alerts');
              setSelectedReport(null);
            }}
            className={`flex-1 py-3 text-sm font-medium ${
              currentView === 'alerts'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500'
            }`}
          >
            <i className="ri-alarm-warning-line mr-2"></i>
            Alertes publiques
          </button>
          <button
            onClick={() => {
              setCurrentView('contacts');
              setSelectedReport(null);
            }}
            className={`flex-1 py-3 text-sm font-medium ${
              currentView === 'contacts'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500'
            }`}
          >
            <i className="ri-contacts-line mr-2"></i>
            Contacts
          </button>
        </div>
      </div>

      <main className="p-4">
        {currentView === 'reports' ? (
          selectedReport ? (
            <ReportDetail 
              report={selectedReport} 
              onBack={() => setSelectedReport(null)}
            />
          ) : (
            <ReportsList onSelectReport={setSelectedReport} />
          )
        ) : currentView === 'alerts' ? (
          <AlertsManagement />
        ) : (
          <ContactManagement />
        )}
      </main>
    </div>
  );
}