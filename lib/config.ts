'use client';

// Configuration centralisée et sécurisée de l'application CityReport
export const APP_CONFIG = {
  // Informations de l'application
  name: 'CityReport',
  version: '3.0.0',
  description: 'Application de signalement citoyen sécurisée',
  
  // Configuration de sécurité
  security: {
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 heures en millisecondes
    inactivityTimeout: 2 * 60 * 60 * 1000, // 2 heures en millisecondes
    maxLoginAttempts: 3,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes en millisecondes
    passwordMinLength: 12,
    tokenLength: 32,
    auditLogging: true
  },
  
  // Configuration de l'interface
  ui: {
    refreshInterval: 5000, // 5 secondes pour les données admin
    mapRefreshInterval: 30000, // 30 secondes pour la carte
    alertCheckInterval: 30000, // 30 secondes pour les alertes
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxPhotosPerReport: 3
  },
  
  // Configuration des données
  data: {
    maxReportsPerDay: 50,
    maxDescriptionLength: 1000,
    maxLocationLength: 200,
    maxNameLength: 100,
    reportCategories: [
      { id: 'routes', name: 'Routes et voirie', icon: 'ri-road-line' },
      { id: 'eclairage', name: 'Éclairage public', icon: 'ri-lightbulb-line' },
      { id: 'proprete', name: 'Propreté urbaine', icon: 'ri-delete-bin-line' },
      { id: 'espaces-verts', name: 'Espaces verts', icon: 'ri-plant-line' },
      { id: 'signalisation', name: 'Signalisation', icon: 'ri-traffic-light-line' },
      { id: 'mobilier', name: 'Mobilier urbain', icon: 'ri-home-gear-line' },
      { id: 'securite', name: 'Sécurité publique', icon: 'ri-shield-line' },
      { id: 'autre', name: 'Autre problème', icon: 'ri-question-line' }
    ],
    statusLabels: {
      'nouveau': { label: 'Nouveau', color: 'text-blue-600 bg-blue-50' },
      'en-cours': { label: 'En cours', color: 'text-yellow-600 bg-yellow-50' },
      'resolu': { label: 'Résolu', color: 'text-green-600 bg-green-50' }
    },
    priorityLabels: {
      'basse': { label: 'Basse', color: 'text-gray-600 bg-gray-50' },
      'moyenne': { label: 'Moyenne', color: 'text-blue-600 bg-blue-50' },
      'haute': { label: 'Haute', color: 'text-red-600 bg-red-50' }
    }
  },
  
  // Configuration des contacts d'urgence
  emergencyCategories: [
    { id: 'police', name: 'Police', icon: 'ri-police-car-line', color: 'text-blue-600' },
    { id: 'pompiers', name: 'Pompiers', icon: 'ri-fire-line', color: 'text-red-600' },
    { id: 'medical', name: 'Médical', icon: 'ri-heart-pulse-line', color: 'text-green-600' },
    { id: 'municipale', name: 'Services municipaux', icon: 'ri-government-line', color: 'text-purple-600' },
    { id: 'autre', name: 'Autre', icon: 'ri-phone-line', color: 'text-gray-600' }
  ],
  
  // Configuration des alertes
  alertTypes: [
    { id: 'info', name: 'Information', icon: 'ri-information-line', color: 'text-blue-600 bg-blue-50' },
    { id: 'warning', name: 'Avertissement', icon: 'ri-alert-line', color: 'text-yellow-600 bg-yellow-50' },
    { id: 'emergency', name: 'Urgence', icon: 'ri-error-warning-line', color: 'text-red-600 bg-red-50' }
  ],
  
  // URLs et endpoints
  endpoints: {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    },
    functions: {
      adminAuth: 'secure-admin-auth',
      citizenReports: 'citizen-reports',
      publicAlerts: 'public-alerts',
      emergencyContacts: 'emergency-contacts',
      universalNotifications: 'universal-notifications'
    }
  },
  
  // Configuration des notifications
  notifications: {
    enabled: true,
    requestPermission: true,
    defaultDuration: 5000, // 5 secondes
    position: 'top-right' as const,
    maxVisible: 3
  },
  
  // Configuration PWA
  pwa: {
    enabled: true,
    installPrompt: true,
    offlineSupport: true,
    backgroundSync: true
  }
};

// Validation de la configuration
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Vérifier les variables d'environnement critiques
  if (!APP_CONFIG.endpoints.supabase.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL manquante');
  }
  
  if (!APP_CONFIG.endpoints.supabase.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY manquante');
  }
  
  // Vérifier la configuration de sécurité
  if (APP_CONFIG.security.passwordMinLength < 8) {
    errors.push('Longueur minimale de mot de passe trop faible');
  }
  
  if (APP_CONFIG.security.maxLoginAttempts < 1) {
    errors.push('Nombre maximum de tentatives de connexion invalide');
  }
  
  // Vérifier la configuration UI
  if (APP_CONFIG.ui.refreshInterval < 1000) {
    errors.push('Intervalle de rafraîchissement trop rapide');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Utilitaires de configuration
export class ConfigUtils {
  // Obtenir la configuration d'une catégorie de signalement
  static getReportCategory(id: string) {
    return APP_CONFIG.data.reportCategories.find(cat => cat.id === id);
  }
  
  // Obtenir le label d'un statut
  static getStatusLabel(status: string) {
    return APP_CONFIG.data.statusLabels[status as keyof typeof APP_CONFIG.data.statusLabels];
  }
  
  // Obtenir le label d'une priorité
  static getPriorityLabel(priority: string) {
    return APP_CONFIG.data.priorityLabels[priority as keyof typeof APP_CONFIG.data.priorityLabels];
  }
  
  // Obtenir la configuration d'un type d'alerte
  static getAlertType(type: string) {
    return APP_CONFIG.alertTypes.find(t => t.id === type);
  }
  
  // Obtenir la configuration d'une catégorie de contact d'urgence
  static getEmergencyCategory(category: string) {
    return APP_CONFIG.emergencyCategories.find(cat => cat.id === category);
  }
  
  // Vérifier si un type de fichier est autorisé
  static isAllowedFileType(mimeType: string): boolean {
    return APP_CONFIG.ui.allowedFileTypes.includes(mimeType);
  }
  
  // Vérifier si la taille du fichier est acceptable
  static isValidFileSize(size: number): boolean {
    return size <= APP_CONFIG.ui.maxFileSize;
  }
  
  // Obtenir l'URL complète d'une Edge Function
  static getFunctionUrl(functionName: string): string {
    return `${APP_CONFIG.endpoints.supabase.url}/functions/v1/${functionName}`;
  }
  
  // Vérifier si l'environnement est en développement
  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
  
  // Vérifier si l'environnement est en production
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
  
  // Obtenir la version de l'application
  static getVersion(): string {
    return APP_CONFIG.version;
  }
  
  // Obtenir les headers sécurisés pour les requêtes
  static getSecureHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Client-Version': APP_CONFIG.version,
      'X-Client-Name': APP_CONFIG.name
    };
  }
  
  // Formater une date selon les paramètres locaux
  static formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Formater une date relative (il y a X minutes)
  static formatRelativeDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else {
      return this.formatDate(d);
    }
  }
}

// Export par défaut de la configuration
export default APP_CONFIG;