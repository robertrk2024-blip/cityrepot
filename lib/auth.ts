
'use client';

import { supabase } from './supabase';
import { AdminUser } from './storage';

// Interface pour la gestion sécurisée des sessions
export interface SecureSession {
  user: AdminUser;
  token: string;
  expiresAt: string;
  lastActivity: string;
}

// Classe de gestion de l'authentification sécurisée
export class SecureAuthManager {
  private static readonly SESSION_KEY = 'cityreport_secure_session';
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 heures
  private static readonly INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 heures

  // Connexion sécurisée avec validation côté serveur
  static async signIn(email: string, password: string): Promise<AdminUser> {
    try {
      // Validation des données d'entrée
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }

      if (!this.isValidEmail(email)) {
        throw new Error('Format d\'email invalide');
      }

      if (password.length < 8) {
        throw new Error('Mot de passe trop court');
      }

      // Appel sécurisé à l'Edge Function d'authentification
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'login',
          email: email.toLowerCase().trim(),
          password: password
        }
      });

      if (error) {
        console.error('Erreur authentification:', error);
        throw new Error('Erreur de connexion');
      }

      if (!data.success) {
        throw new Error(data.message || 'Identifiants invalides');
      }

      // Créer une session sécurisée
      const session = this.createSecureSession(data.user);
      this.saveSession(session);

      // Audit de connexion
      this.logSecurityEvent('LOGIN_SUCCESS', data.user.email);

      return data.user;

    } catch (error: any) {
      // Audit de tentative de connexion échouée
      this.logSecurityEvent('LOGIN_FAILED', email);
      throw new Error(error.message || 'Erreur de connexion');
    }
  }

  // Changement de mot de passe sécurisé
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('Session expirée');
    }

    try {
      // Validation du nouveau mot de passe
      this.validatePassword(newPassword);

      // Appel sécurisé pour changer le mot de passe
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'change_password',
          userId: session.user.id,
          currentPassword: currentPassword,
          newPassword: newPassword
        }
      });

      if (error || !data.success) {
        throw new Error(data?.message || 'Erreur lors du changement de mot de passe');
      }

      // Invalider toutes les sessions existantes
      this.signOut();

      // Audit du changement de mot de passe
      this.logSecurityEvent('PASSWORD_CHANGED', session.user.email);

    } catch (error: any) {
      this.logSecurityEvent('PASSWORD_CHANGE_FAILED', session.user.email);
      throw new Error(error.message || 'Erreur lors du changement de mot de passe');
    }
  }

  // Changement d'email sécurisé
  static async changeEmail(newEmail: string, password: string): Promise<void> {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('Session expirée');
    }

    try {
      // Validation du nouvel email
      if (!this.isValidEmail(newEmail)) {
        throw new Error('Format d\'email invalide');
      }

      // Appel sécurisé pour changer l'email
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'change_email',
          userId: session.user.id,
          newEmail: newEmail.toLowerCase().trim(),
          password: password
        }
      });

      if (error || !data.success) {
        throw new Error(data?.message || 'Erreur lors du changement d\'email');
      }

      // Mettre à jour la session
      session.user.email = newEmail.toLowerCase().trim();
      this.saveSession(session);

      // Audit du changement d'email
      this.logSecurityEvent('EMAIL_CHANGED', `${session.user.email} -> ${newEmail}`);

    } catch (error: any) {
      this.logSecurityEvent('EMAIL_CHANGE_FAILED', session.user.email);
      throw new Error(error.message || 'Erreur lors du changement d\'email');
    }
  }

  // Validation de mot de passe renforcée
  private static validatePassword(password: string): void {
    if (password.length < 12) {
      throw new Error('Le mot de passe doit contenir au moins 12 caractères');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins une minuscule');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins un chiffre');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new Error('Le mot de passe doit contenir au moins un caractère spécial');
    }

    // Vérification contre les mots de passe communs
    const commonPasswords = ['password123', 'admin123', 'cityreport123'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
      throw new Error('Mot de passe trop commun');
    }
  }

  // Validation d'email
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Création de session sécurisée
  private static createSecureSession(user: AdminUser): SecureSession {
    const now = new Date();
    return {
      user,
      token: this.generateSecureToken(),
      expiresAt: new Date(now.getTime() + this.SESSION_DURATION).toISOString(),
      lastActivity: now.toISOString()
    };
  }

  // Génération de token sécurisé
  private static generateSecureToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback pour les environnements sans crypto
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Sauvegarde sécurisée de session
  private static saveSession(session: SecureSession): void {
    try {
      if (typeof window !== 'undefined') {
        const encryptedSession = this.encryptSession(session);
        sessionStorage.setItem(this.SESSION_KEY, encryptedSession);
      }
    } catch (error) {
      console.error('Erreur sauvegarde session:', error);
    }
  }

  // Chiffrement simple de session (à améliorer en production)
  private static encryptSession(session: SecureSession): string {
    return btoa(JSON.stringify(session));
  }

  // Déchiffrement de session
  private static decryptSession(encryptedSession: string): SecureSession | null {
    try {
      return JSON.parse(atob(encryptedSession));
    } catch {
      return null;
    }
  }

  // Récupération de session avec validation
  static getCurrentSession(): SecureSession | null {
    try {
      if (typeof window === 'undefined') return null;

      const encryptedSession = sessionStorage.getItem(this.SESSION_KEY);
      if (!encryptedSession) return null;

      const session = this.decryptSession(encryptedSession);
      if (!session) return null;

      const now = new Date();
      
      // Vérifier l'expiration
      if (new Date(session.expiresAt) < now) {
        this.signOut();
        return null;
      }

      // Vérifier l'inactivité
      if (now.getTime() - new Date(session.lastActivity).getTime() > this.INACTIVITY_TIMEOUT) {
        this.signOut();
        return null;
      }

      // Mettre à jour l'activité
      session.lastActivity = now.toISOString();
      this.saveSession(session);

      return session;

    } catch (error) {
      console.error('Erreur récupération session:', error);
      this.signOut();
      return null;
    }
  }

  // Récupération de l'utilisateur actuel
  static getCurrentUser(): AdminUser | null {
    const session = this.getCurrentSession();
    return session?.user || null;
  }

  // Vérification d'authentification
  static isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }

  // Vérification de rôle
  static hasRole(role: 'admin' | 'super-admin'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Déconnexion sécurisée
  static signOut(): void {
    try {
      const session = this.getCurrentSession();
      if (session) {
        this.logSecurityEvent('LOGOUT', session.user.email);
      }

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem('cityreport_preferences');
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  }

  // Audit de sécurité
  private static logSecurityEvent(event: string, details: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      details,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      ip: 'Hidden' // L'IP sera récupérée côté serveur
    };

    // Envoyer à l'Edge Function d'audit (optionnel)
    try {
      supabase.functions.invoke('security-audit', {
        body: logEntry
      }).catch(() => {
        // Ignore les erreurs d'audit pour ne pas impacter l'expérience utilisateur
      });
    } catch {
      // Ignore silencieusement
    }

    // Log local pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Événement de sécurité:', logEntry);
    }
  }

  // Réinitialisation de mot de passe (pour super-admin)
  static async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'super-admin') {
      throw new Error('Accès non autorisé');
    }

    try {
      this.validatePassword(newPassword);

      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'reset_user_password',
          targetUserId: userId,
          newPassword: newPassword,
          adminId: currentUser.id
        }
      });

      if (error || !data.success) {
        throw new Error(data?.message || 'Erreur lors de la réinitialisation');
      }

      this.logSecurityEvent('PASSWORD_RESET_BY_ADMIN', `Admin ${currentUser.email} reset password for user ${userId}`);

    } catch (error: any) {
      this.logSecurityEvent('PASSWORD_RESET_FAILED', `Admin ${currentUser.email} failed to reset password for user ${userId}`);
      throw new Error(error.message || 'Erreur lors de la réinitialisation');
    }
  }

  // Vérification de la force de session
  static getSessionStrength(): 'weak' | 'medium' | 'strong' {
    const session = this.getCurrentSession();
    if (!session) return 'weak';

    const now = new Date();
    const sessionAge = now.getTime() - new Date(session.lastActivity).getTime();
    const timeUntilExpiry = new Date(session.expiresAt).getTime() - now.getTime();

    if (sessionAge < 30 * 60 * 1000 && timeUntilExpiry > 6 * 60 * 60 * 1000) {
      return 'strong';
    } else if (sessionAge < 60 * 60 * 1000 && timeUntilExpiry > 2 * 60 * 60 * 1000) {
      return 'medium';
    } else {
      return 'weak';
    }
  }
}
