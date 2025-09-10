const sampleReports: CitizenReport[] = [
  {
    id: 'sample-1',
    category: 'routes',
    description: 'Nid-de-poule important sur l\'Avenue de la République, dangereux pour les véhicules',
    location_text: 'Avenue de la République, près du carrefour',
    latitude: 43.6047,
    longitude: 1.4442,
    status: 'nouveau',    // ✅
    priority: 'haute',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    citizen_name: 'Marie Dubois',
    citizen_email: 'marie.dubois@email.fr',
    photos_count: 2,
    location_accuracy: 8
  },
  {
    id: 'sample-2',
    category: 'eclairage',
    description: 'Lampadaire défaillant depuis plusieurs jours, zone très sombre le soir',
    location_text: 'Rue des Écoles, devant le numéro 45',
    latitude: 43.6055,
    longitude: 1.4435,
    status: 'en_cours',   // ✅ corrigé
    priority: 'moyenne',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    citizen_name: 'Jean Martin',
    photos_count: 1,
    location_accuracy: 15
  },
  {
    id: 'sample-3',
    category: 'proprete',
    description: 'Dépôt sauvage d\'ordures sur le trottoir, situation qui perdure',
    location_text: 'Place du Marché, côté nord',
    latitude: 43.6038,
    longitude: 1.4458,
    status: 'nouveau',    // ✅
    priority: 'basse',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    photos_count: 3,
    location_accuracy: 12
  }
];
