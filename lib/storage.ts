
'use client';

// Système de stockage local avec fallback et synchronisation Supabase optionnelle

export interface CitizenReport {
  id: string;
  category: string;
  description: string;
  location_text: string;
  latitude?: number;
  longitude?: number;
  status: 'nouveau' | 'en-cours' | 'resolu';
  priority: 'basse' | 'moyenne' | 'haute';
  created_at: string;
  updated_at: string;
  citizen_name?: string;
  citizen_email?: string;
  photos_count: number;
  attachments?: File[];
  location_accuracy?: number;
  location_timestamp?: string;
}

export interface PublicAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'emergency';
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  author: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  category: 'police' | 'pompiers' | 'medical' | 'municipale' | 'autre';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super-admin';
  full_name: string;
  created_at: string;
  is_active: boolean;
}

// Clés de stockage local
const STORAGE_KEYS = {
  REPORTS: 'cityreport_citizen_reports',
  ALERTS: 'cityreport_public_alerts',
  CONTACTS: 'cityreport_emergency_contacts',
  ADMIN_SESSION: 'cityreport_admin_session',
  ADMIN_USERS: 'cityreport_admin_users'
};

// Génération d'ID unique
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Utilitaires de stockage sécurisé
class SecureLocalStorage {
  static setItem(key: string, value: any): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Erreur sauvegarde locale:', error);
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
      return defaultValue;
    } catch (error) {
      console.error('Erreur lecture locale:', error);
      return defaultValue;
    }
  }

  static removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Erreur suppression locale:', error);
    }
  }
}

// Gestionnaire des signalements citoyens
export class ReportsManager {
  static async createReport(reportData: Partial<CitizenReport>): Promise<CitizenReport> {
    const report: CitizenReport = {
      id: generateId(),
      category: reportData.category || '',
      description: reportData.description || '',
      location_text: reportData.location_text || '',
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      status: 'nouveau',
      priority: 'moyenne',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      citizen_name: reportData.citizen_name,
      citizen_email: reportData.citizen_email,
      photos_count: reportData.photos_count || 0,
      location_accuracy: reportData.location_accuracy,
      location_timestamp: reportData.location_timestamp
    };

    // Sauvegarde locale
    const reports = this.getAllReports();
    reports.push(report);
    SecureLocalStorage.setItem(STORAGE_KEYS.REPORTS, reports);

    // Tentative de synchronisation Supabase (optionnelle)
    try {
      await this.syncToSupabase(report);
    } catch (error) {
      console.log('Synchronisation Supabase échouée, stockage local uniquement');
    }

    return report;
  }

  static getAllReports(): CitizenReport[] {
    return SecureLocalStorage.getItem(STORAGE_KEYS.REPORTS, []);
  }

  static getReportById(id: string): CitizenReport | null {
    const reports = this.getAllReports();
    return reports.find(r => r.id === id) || null;
  }

  static updateReport(id: string, updates: Partial<CitizenReport>): CitizenReport | null {
    const reports = this.getAllReports();
    const index = reports.findIndex(r => r.id === id);
    
    if (index === -1) return null;

    reports[index] = {
      ...reports[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    SecureLocalStorage.setItem(STORAGE_KEYS.REPORTS, reports);
    return reports[index];
  }

  static deleteReport(id: string): boolean {
    const reports = this.getAllReports();
    const filteredReports = reports.filter(r => r.id !== id);
    
    if (filteredReports.length === reports.length) return false;

    SecureLocalStorage.setItem(STORAGE_KEYS.REPORTS, filteredReports);
    return true;
  }

  private static async syncToSupabase(report: CitizenReport): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/citizen-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(report)
    });

    if (!response.ok) {
      throw new Error('Sync failed');
    }
  }

  // Initialisation avec données d'exemple
  static initializeWithSampleData(): void {
    const existingReports = this.getAllReports();
    if (existingReports.length > 0) return;

    const sampleReports: CitizenReport[] = [
      {
        id: 'sample-1',
        category: 'routes',
        description: 'Nid-de-poule important sur l\'Avenue de la République, dangereux pour les véhicules',
        location_text: 'Avenue de la République, près du carrefour',
        latitude: 43.6047,
        longitude: 1.4442,
        status: 'nouveau',
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
        status: 'en-cours',
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
        status: 'nouveau',
        priority: 'basse',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        photos_count: 3,
        location_accuracy: 12
      }
    ];

    SecureLocalStorage.setItem(STORAGE_KEYS.REPORTS, sampleReports);
  }
}

// Gestionnaire des alertes publiques
export class AlertsManager {
  static createAlert(alertData: Partial<PublicAlert>): PublicAlert {
    const alert: PublicAlert = {
      id: generateId(),
      title: alertData.title || '',
      message: alertData.message || '',
      type: alertData.type || 'info',
      is_active: true,
      created_at: new Date().toISOString(),
      expires_at: alertData.expires_at,
      author: alertData.author || 'Administration'
    };

    const alerts = this.getAllAlerts();
    alerts.push(alert);
    SecureLocalStorage.setItem(STORAGE_KEYS.ALERTS, alerts);

    return alert;
  }

  static getAllAlerts(): PublicAlert[] {
    return SecureLocalStorage.getItem(STORAGE_KEYS.ALERTS, []);
  }

  static getActiveAlerts(): PublicAlert[] {
    const alerts = this.getAllAlerts();
    const now = new Date();
    
    return alerts.filter(alert => {
      if (!alert.is_active) return false;
      if (alert.expires_at && new Date(alert.expires_at) < now) return false;
      return true;
    });
  }

  static updateAlert(id: string, updates: Partial<PublicAlert>): PublicAlert | null {
    const alerts = this.getAllAlerts();
    const index = alerts.findIndex(a => a.id === id);
    
    if (index === -1) return null;

    alerts[index] = { ...alerts[index], ...updates };
    SecureLocalStorage.setItem(STORAGE_KEYS.ALERTS, alerts);
    
    return alerts[index];
  }

  static deleteAlert(id: string): boolean {
    const alerts = this.getAllAlerts();
    const filteredAlerts = alerts.filter(a => a.id !== id);
    
    if (filteredAlerts.length === alerts.length) return false;

    SecureLocalStorage.setItem(STORAGE_KEYS.ALERTS, filteredAlerts);
    return true;
  }

  static initializeWithSampleData(): void {
    const existingAlerts = this.getAllAlerts();
    if (existingAlerts.length > 0) return;

    const sampleAlerts: PublicAlert[] = [
      {
        id: 'alert-1',
        title: 'Travaux Avenue Jean Jaurès',
        message: 'Des travaux de réfection de la chaussée auront lieu du 15 au 20 décembre. Circulation alternée mise en place.',
        type: 'warning',
        is_active: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'Service Voirie'
      },
      {
        id: 'alert-2',
        title: 'Coupure d\'eau programmée',
        message: 'Interruption de l\'alimentation en eau potable secteur Centre-Ville de 14h à 17h demain pour maintenance.',
        type: 'info',
        is_active: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        author: 'Service Technique'
      }
    ];

    SecureLocalStorage.setItem(STORAGE_KEYS.ALERTS, sampleAlerts);
  }
}

// Gestionnaire des contacts d'urgence
export class ContactsManager {
  static createContact(contactData: Partial<EmergencyContact>): EmergencyContact {
    const contact: EmergencyContact = {
      id: generateId(),
      name: contactData.name || '',
      phone: contactData.phone || '',
      email: contactData.email,
      category: contactData.category || 'autre',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const contacts = this.getAllContacts();
    contacts.push(contact);
    SecureLocalStorage.setItem(STORAGE_KEYS.CONTACTS, contacts);

    return contact;
  }

  static getAllContacts(): EmergencyContact[] {
    return SecureLocalStorage.getItem(STORAGE_KEYS.CONTACTS, []);
  }

  static getActiveContacts(): EmergencyContact[] {
    return this.getAllContacts().filter(c => c.is_active);
  }

  static updateContact(id: string, updates: Partial<EmergencyContact>): EmergencyContact | null {
    const contacts = this.getAllContacts();
    const index = contacts.findIndex(c => c.id === id);
    
    if (index === -1) return null;

    contacts[index] = {
      ...contacts[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    SecureLocalStorage.setItem(STORAGE_KEYS.CONTACTS, contacts);
    return contacts[index];
  }

  static deleteContact(id: string): boolean {
    const contacts = this.getAllContacts();
    const filteredContacts = contacts.filter(c => c.id !== id);
    
    if (filteredContacts.length === contacts.length) return false;

    SecureLocalStorage.setItem(STORAGE_KEYS.CONTACTS, filteredContacts);
    return true;
  }

  static initializeWithSampleData(): void {
    const existingContacts = this.getAllContacts();
    if (existingContacts.length > 0) return;

    const sampleContacts: EmergencyContact[] = [
      {
        id: 'contact-1',
        name: 'Police Municipale',
        phone: '05 61 22 29 92',
        email: 'police.municipale@ville-toulouse.fr',
        category: 'police',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'contact-2',
        name: 'Service Technique Municipal',
        phone: '05 61 22 31 31',
        email: 'services.techniques@ville-toulouse.fr',
        category: 'municipale',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'contact-3',
        name: 'Urgences Médicales',
        phone: '15',
        category: 'medical',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'contact-4',
        name: 'Sapeurs-Pompiers',
        phone: '18',
        category: 'pompiers',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    SecureLocalStorage.setItem(STORAGE_KEYS.CONTACTS, sampleContacts);
  }
}

// Gestionnaire d'authentification admin
export class AdminAuthManager {
  static initializeAdminUsers(): void {
    const existingUsers = SecureLocalStorage.getItem(STORAGE_KEYS.ADMIN_USERS, []);
    if (existingUsers.length > 0) return;

    // Comptes admin par défaut
    const defaultAdmins: AdminUser[] = [
      {
        id: 'admin-1',
        email: 'admin@ville.fr',
        role: 'admin',
        full_name: 'Administrateur Principal',
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 'admin-2',
        email: 'super.admin@ville.fr',
        role: 'super-admin',
        full_name: 'Super Administrateur',
        created_at: new Date().toISOString(),
        is_active: true
      }
    ];

    SecureLocalStorage.setItem(STORAGE_KEYS.ADMIN_USERS, defaultAdmins);

    // Mots de passe par défaut (en production, utiliser un système sécurisé)
    SecureLocalStorage.setItem('admin_passwords', {
      'admin@ville.fr': 'admin123',
      'super.admin@ville.fr': 'superadmin123'
    });
  }

  static async signIn(email: string, password: string): Promise<AdminUser> {
    const users = SecureLocalStorage.getItem(STORAGE_KEYS.ADMIN_USERS, []);
    const passwords = SecureLocalStorage.getItem('admin_passwords', {});

    const user = users.find((u: AdminUser) => u.email === email && u.is_active);
    
    if (!user || passwords[email] !== password) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Créer une session
    const session = {
      user,
      timestamp: new Date().toISOString(),
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
    };

    SecureLocalStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, session);
    return user;
  }

  static signOut(): void {
    SecureLocalStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  }

  static getCurrentUser(): AdminUser | null {
    const session = SecureLocalStorage.getItem(STORAGE_KEYS.ADMIN_SESSION, null);
    
    if (!session) return null;
    
    // Vérifier expiration
    if (new Date(session.expires) < new Date()) {
      this.signOut();
      return null;
    }

    return session.user;
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

// Initialisation complète du système
export function initializeStorage(): void {
  ReportsManager.initializeWithSampleData();
  AlertsManager.initializeWithSampleData();
  ContactsManager.initializeWithSampleData();
  AdminAuthManager.initializeAdminUsers();
}
