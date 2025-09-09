'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour l'authentification admin
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super-admin';
  full_name: string;
  created_at: string;
  is_active: boolean;
}

// Fonction pour connecter un administrateur
export async function signInAdmin(email: string, password: string) {
  try {
    // Utiliser l'authentification Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    // Vérifier que l'utilisateur est bien un admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      // Déconnecter l'utilisateur s'il n'est pas admin
      await supabase.auth.signOut();
      throw new Error('Accès non autorisé');
    }

    return {
      user: data.user,
      adminProfile: adminUser as AdminUser
    };

  } catch (error: any) {
    console.error('Erreur connexion admin:', error);
    throw new Error(error.message || 'Erreur de connexion');
  }
}

// Fonction pour déconnecter un administrateur
export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

// Fonction pour obtenir le profil admin actuel
export async function getCurrentAdminProfile(): Promise<AdminUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    if (error || !adminUser) {
      return null;
    }

    return adminUser as AdminUser;
  } catch (error) {
    console.error('Erreur récupération profil admin:', error);
    return null;
  }
}

// Fonction pour vérifier l'état de connexion
export function onAuthStateChange(callback: (user: any, adminProfile: AdminUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const adminProfile = await getCurrentAdminProfile();
      callback(session.user, adminProfile);
    } else {
      callback(null, null);
    }
  });
}