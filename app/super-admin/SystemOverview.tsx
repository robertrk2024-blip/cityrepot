'use client';

export default function SystemOverview() {
  const stats = [
    { label: 'Signalements aujourd\'hui', value: 23, icon: 'ri-alert-line', color: 'text-blue-600' },
    { label: 'Administrateurs actifs', value: 9, icon: 'ri-admin-line', color: 'text-purple-600' },
    { label: 'Temps de réponse moyen', value: '2h 15m', icon: 'ri-time-line', color: 'text-green-600' },
    { label: 'Taux de résolution', value: '94%', icon: 'ri-check-line', color: 'text-orange-600' }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'admin_login',
      message: 'Agent Dupont s\'est connecté',
      time: 'Il y a 5 minutes',
      icon: 'ri-login-circle-line',
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'new_report',
      message: 'Nouveau signalement #156 reçu',
      time: 'Il y a 12 minutes',
      icon: 'ri-alert-line',
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'report_resolved',
      message: 'Signalement #145 marqué comme résolu',
      time: 'Il y a 28 minutes',
      icon: 'ri-check-circle-line',
      color: 'text-green-600'
    },
    {
      id: 4,
      type: 'admin_added',
      message: 'Nouvel administrateur ajouté: tech.jean@ville.fr',
      time: 'Il y a 1 heure',
      icon: 'ri-user-add-line',
      color: 'text-purple-600'
    },
    {
      id: 5,
      type: 'system_maintenance',
      message: 'Maintenance programmée effectuée',
      time: 'Il y a 3 heures',
      icon: 'ri-settings-3-line',
      color: 'text-orange-600'
    }
  ];

  const departments = [
    { name: 'Police Municipale', agents: 5, active: 4, reports: 15 },
    { name: 'Services Techniques', agents: 4, active: 3, reports: 8 },
    { name: 'Voirie', agents: 3, active: 2, reports: 12 },
    { name: 'Propreté', agents: 2, active: 2, reports: 6 }
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <i className={`${stat.icon} text-xl ${stat.color}`}></i>
              <span className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </span>
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* État du système */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <i className="ri-pulse-line text-purple-600"></i>
          État du système
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Serveur principal</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-green-600">Opérationnel</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Base de données</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-green-600">Opérationnel</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">API externes</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-yellow-600">Ralenti</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services par département */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <i className="ri-building-line text-purple-600"></i>
          Services par département
        </h3>
        <div className="space-y-3">
          {departments.map((dept, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="font-medium mb-2">{dept.name}</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Agents:</span>
                  <div className="font-medium">{dept.active}/{dept.agents}</div>
                </div>
                <div>
                  <span className="text-gray-500">En ligne:</span>
                  <div className="font-medium text-green-600">{dept.active}</div>
                </div>
                <div>
                  <span className="text-gray-500">Signalements:</span>
                  <div className="font-medium text-blue-600">{dept.reports}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <i className="ri-history-line text-purple-600"></i>
          Activité récente
        </h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                <i className={`${activity.icon} ${activity.color}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{activity.message}</div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}