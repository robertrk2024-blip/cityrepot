'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration sécurisée pour Supabase
class SecureSupabaseClient {
  private static instance: SupabaseClient | null = null;
  private static initialized = false;

  // Initialisation sécurisée du client Supabase
  static initialize(): SupabaseClient {
    if (this.instance && this.initialized) {
      return this.instance;
    }

    // Vérification des variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variables d\'environnement Supabase manquantes');
    }

    // Validation du format des URLs et clés
    if (!this.isValidUrl(supabaseUrl)) {
      throw new Error('URL Supabase invalide');
    }

    if (!this.isValidKey(supabaseAnonKey)) {
      throw new Error('Clé Supabase invalide');
    }

    // Création du client avec options de sécurité
    this.instance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'cityreport-secure-client'
        }
      }
    });

    this.initialized = true;
    return this.instance;
  }

  // Validation de l'URL Supabase
  private static isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.includes('supabase') && parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Validation de la clé Supabase
  private static isValidKey(key: string): boolean {
    return key.length > 100 && key.startsWith('eyJ');
  }

  // Récupération sécurisée du client
  static getClient(): SupabaseClient {
    if (!this.instance || !this.initialized) {
      return this.initialize();
    }
    return this.instance;
  }

  // Réinitialisation du client (pour les tests ou changements de config)
  static reset(): void {
    this.instance = null;
    this.initialized = false;
  }
}

// Export sécurisé du client Supabase
export const supabase = SecureSupabaseClient.getClient();

// Types TypeScript pour la sécurité des données
export interface DatabaseSchema {
  admin_users: {
    id: string;
    email: string;
    role: 'admin' | 'super-admin';
    full_name: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    last_login_at?: string;
    password_changed_at?: string;
  };
  
  citizen_reports: {
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
  };

  public_alerts: {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'emergency';
    is_active: boolean;
    created_at: string;
    expires_at?: string;
    author_id: string;
  };

  emergency_contacts: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    category: 'police' | 'pompiers' | 'medical' | 'municipale' | 'autre';
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

// Gestionnaire sécurisé des opérations base de données
export class SecureDatabase {
  private static client = supabase;

  // Méthode sécurisée pour les requêtes administrateur
  static async adminQuery<T = any>(
    table: keyof DatabaseSchema,
    operation: 'select' | 'insert' | 'update' | 'delete',
    data?: any,
    filters?: Record<string, any>
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      let query = this.client.from(table as string);

      switch (operation) {
        case 'select':
          query = query.select('*');
          break;
        case 'insert':
          if (!data) throw new Error('Données requises pour l\'insertion');
          return await query.insert(data).select();
        case 'update':
          if (!data) throw new Error('Données requises pour la mise à jour');
          query = query.update(data);
          break;
        case 'delete':
          query = query.delete();
          break;
      }

      // Appliquer les filtres
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const result = await query;
      return result;

    } catch (error) {
      console.error(`Erreur requête ${operation} sur ${table}:`, error);
      return { data: null, error };
    }
  }

  // Méthode sécurisée pour les signalements citoyens (accès public)
  static async citizenQuery<T = any>(
    operation: 'insert' | 'select',
    data?: any
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      const query = this.client.from('citizen_reports');

      if (operation === 'insert') {
        if (!data) throw new Error('Données requises pour le signalement');
        
        // Validation des données citoyennes
        const sanitizedData = this.sanitizeCitizenData(data);
        return await query.insert(sanitizedData).select();
      }

      if (operation === 'select') {
        // Les citoyens ne voient que les signalements publics
        return await query
          .select('id, category, location_text, status, created_at')
          .eq('status', 'resolu')
          .order('created_at', { ascending: false })
          .limit(50);
      }

      return { data: null, error: 'Opération non autorisée' };

    } catch (error) {
      console.error('Erreur requête citoyen:', error);
      return { data: null, error };
    }
  }

  // Sanitisation des données citoyennes
  private static sanitizeCitizenData(data: any): any {
    return {
      category: this.sanitizeString(data.category),
      description: this.sanitizeString(data.description, 1000),
      location_text: this.sanitizeString(data.location_text, 200),
      latitude: this.sanitizeNumber(data.latitude, -90, 90),
      longitude: this.sanitizeNumber(data.longitude, -180, 180),
      citizen_name: data.citizen_name ? this.sanitizeString(data.citizen_name, 100) : null,
      citizen_email: data.citizen_email ? this.sanitizeEmail(data.citizen_email) : null,
      photos_count: this.sanitizeNumber(data.photos_count, 0, 10),
      status: 'nouveau',
      priority: 'moyenne',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Utilitaires de sanitisation
  private static sanitizeString(value: any, maxLength: number = 255): string {
    if (typeof value !== 'string') return '';
    return value.trim().substring(0, maxLength).replace(/[<>\"']/g, '');
  }

  private static sanitizeNumber(value: any, min: number, max: number): number | null {
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    return Math.max(min, Math.min(max, num));
  }

  private static sanitizeEmail(value: any): string | null {
    if (typeof value !== 'string') return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleaned = value.trim().toLowerCase();
    return emailRegex.test(cleaned) ? cleaned : null;
  }

  // Vérification de l'état de connexion Supabase
  static async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('admin_users')
        .select('count')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  // Nettoyage des sessions expirées
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await this.client.rpc('cleanup_expired_sessions');
    } catch (error) {
      console.error('Erreur nettoyage sessions:', error);
    }
  }
}

// Gestionnaire d'erreurs Supabase
export class SupabaseErrorHandler {
  static handle(error: any): string {
    if (!error) return 'Erreur inconnue';

    // Erreurs d'authentification
    if (error.message?.includes('Invalid login credentials')) {
      return 'Identifiants invalides';
    }

    if (error.message?.includes('Email not confirmed')) {
      return 'Email non confirmé';
    }

    // Erreurs de base de données
    if (error.code === '23505') {
      return 'Cette entrée existe déjà';
    }

    if (error.code === '42501') {
      return 'Permissions insuffisantes';
    }

    // Erreurs de réseau
    if (error.message?.includes('NetworkError')) {
      return 'Erreur de connexion réseau';
    }

    // Erreur générique sécurisée
    return 'Une erreur est survenue. Veuillez réessayer.';
  }
}

// Monitoring de performance Supabase
export class SupabaseMonitor {
  private static metrics: Record<string, number[]> = {};

  static startTimer(operation: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      
      if (!this.metrics[operation]) {
        this.metrics[operation] = [];
      }
      
      this.metrics[operation].push(duration);
      
      // Garder seulement les 100 dernières mesures
      if (this.metrics[operation].length > 100) {
        this.metrics[operation] = this.metrics[operation].slice(-100);
      }

      // Log des requêtes lentes en développement
      if (process.env.NODE_ENV === 'development' && duration > 1000) {
        console.warn(`🐌 Requête Supabase lente: ${operation} (${duration.toFixed(2)}ms)`);
      }
    };
  }

  static getAverageTime(operation: string): number {
    const times = this.metrics[operation];
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  static getMetrics(): Record<string, { average: number; samples: number }> {
    const result: Record<string, { average: number; samples: number }> = {};
    
    Object.entries(this.metrics).forEach(([operation, times]) => {
      result[operation] = {
        average: this.getAverageTime(operation),
        samples: times.length
      };
    });
    
    return result;
  }
}