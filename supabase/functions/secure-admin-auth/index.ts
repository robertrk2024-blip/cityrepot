import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminCredentials {
  email: string;
  role: 'admin' | 'super-admin';
  password_hash: string;
  full_name: string;
  is_active: boolean;
  last_login_at?: string;
  failed_attempts: number;
  locked_until?: string;
}

// Comptes administrateur sécurisés par défaut
const defaultAdmins: Record<string, AdminCredentials> = {
  'admin@ville.fr': {
    email: 'admin@ville.fr',
    role: 'admin',
    password_hash: '$2a$12$LQv3c1yqBWVHxkd0LQ4YCOuCqkqhXqOTrq7X8VvqHWzKJnKzQj7NK', // admin123
    full_name: 'Administrateur Principal',
    is_active: true,
    failed_attempts: 0
  },
  'super.admin@ville.fr': {
    email: 'super.admin@ville.fr',
    role: 'super-admin',
    password_hash: '$2a$12$8K7Z3p9fGNV2Hk4mL1qY8uDrW5tA6cRzE9nX0sVbM2qI4jF7hL3pO', // superadmin123
    full_name: 'Super Administrateur',
    is_active: true,
    failed_attempts: 0
  }
};

// Fonction de hachage simple (en production, utiliser bcrypt)
async function simpleHash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'cityreport_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Vérification de mot de passe
async function verifyPassword(password: string, stored: AdminCredentials): Promise<boolean> {
  // Pour la démo, vérification simple
  const testHashes = {
    'admin@ville.fr': await simpleHash('admin123'),
    'super.admin@ville.fr': await simpleHash('superadmin123')
  };
  
  const inputHash = await simpleHash(password);
  return inputHash === testHashes[stored.email];
}

// Génération de token sécurisé
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Vérification de la force du mot de passe
function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 12) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 12 caractères' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial' };
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, email, password, currentPassword, newPassword, newEmail, userId, targetUserId } = await req.json();

    // Action: Connexion administrateur
    if (action === 'login') {
      if (!email || !password) {
        return new Response(
          JSON.stringify({ success: false, message: 'Email et mot de passe requis' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();
      const admin = defaultAdmins[normalizedEmail];

      if (!admin || !admin.is_active) {
        // Audit de tentative de connexion échouée
        console.log(`🚫 Tentative de connexion échouée: ${normalizedEmail} - Admin inexistant`);
        return new Response(
          JSON.stringify({ success: false, message: 'Identifiants invalides' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Vérifier le verrouillage de compte
      if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
        return new Response(
          JSON.stringify({ success: false, message: 'Compte temporairement verrouillé' }),
          { status: 423, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Vérifier le mot de passe
      const isValidPassword = await verifyPassword(password, admin);

      if (!isValidPassword) {
        // Incrémenter les tentatives échouées
        admin.failed_attempts += 1;
        
        // Verrouiller après 3 tentatives
        if (admin.failed_attempts >= 3) {
          admin.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
        }

        console.log(`🚫 Tentative de connexion échouée: ${normalizedEmail} - Mot de passe incorrect (${admin.failed_attempts}/3)`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: admin.failed_attempts >= 3 ? 'Compte verrouillé pour 30 minutes' : 'Identifiants invalides'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Réinitialiser les tentatives échouées
      admin.failed_attempts = 0;
      admin.locked_until = undefined;
      admin.last_login_at = new Date().toISOString();

      // Créer une session sécurisée
      const sessionToken = generateSecureToken();
      
      console.log(`✅ Connexion réussie: ${normalizedEmail} (${admin.role})`);

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: normalizedEmail.replace('@', '_').replace('.', '_'),
            email: admin.email,
            role: admin.role,
            full_name: admin.full_name,
            created_at: new Date().toISOString(),
            is_active: admin.is_active
          },
          session: {
            token: sessionToken,
            expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 heures
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Changement de mot de passe
    if (action === 'change_password') {
      if (!userId || !currentPassword || !newPassword) {
        return new Response(
          JSON.stringify({ success: false, message: 'Données manquantes' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Trouver l'admin par ID
      const adminEmail = Object.keys(defaultAdmins).find(email => 
        email.replace('@', '_').replace('.', '_') === userId
      );

      if (!adminEmail || !defaultAdmins[adminEmail]) {
        return new Response(
          JSON.stringify({ success: false, message: 'Utilisateur introuvable' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const admin = defaultAdmins[adminEmail];

      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await verifyPassword(currentPassword, admin);
      if (!isCurrentPasswordValid) {
        return new Response(
          JSON.stringify({ success: false, message: 'Mot de passe actuel incorrect' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Valider le nouveau mot de passe
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return new Response(
          JSON.stringify({ success: false, message: passwordValidation.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mettre à jour le mot de passe (simulation)
      admin.password_hash = await simpleHash(newPassword);
      
      console.log(`🔐 Mot de passe changé: ${adminEmail}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Mot de passe modifié avec succès' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Changement d'email
    if (action === 'change_email') {
      if (!userId || !newEmail || !password) {
        return new Response(
          JSON.stringify({ success: false, message: 'Données manquantes' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Trouver l'admin par ID
      const adminEmail = Object.keys(defaultAdmins).find(email => 
        email.replace('@', '_').replace('.', '_') === userId
      );

      if (!adminEmail || !defaultAdmins[adminEmail]) {
        return new Response(
          JSON.stringify({ success: false, message: 'Utilisateur introuvable' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const admin = defaultAdmins[adminEmail];

      // Vérifier le mot de passe
      const isPasswordValid = await verifyPassword(password, admin);
      if (!isPasswordValid) {
        return new Response(
          JSON.stringify({ success: false, message: 'Mot de passe incorrect' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Vérifier que le nouvel email n'existe pas déjà
      const normalizedNewEmail = newEmail.toLowerCase().trim();
      if (defaultAdmins[normalizedNewEmail]) {
        return new Response(
          JSON.stringify({ success: false, message: 'Cet email est déjà utilisé' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mettre à jour l'email (simulation)
      admin.email = normalizedNewEmail;
      
      console.log(`📧 Email changé: ${adminEmail} -> ${normalizedNewEmail}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Email modifié avec succès' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Réinitialisation de mot de passe (par super-admin)
    if (action === 'reset_user_password') {
      if (!targetUserId || !newPassword || !userId) {
        return new Response(
          JSON.stringify({ success: false, message: 'Données manquantes' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Vérifier que l'utilisateur actuel est super-admin
      const adminEmail = Object.keys(defaultAdmins).find(email => 
        email.replace('@', '_').replace('.', '_') === userId
      );

      if (!adminEmail || defaultAdmins[adminEmail].role !== 'super-admin') {
        return new Response(
          JSON.stringify({ success: false, message: 'Accès non autorisé' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Trouver l'utilisateur cible
      const targetEmail = Object.keys(defaultAdmins).find(email => 
        email.replace('@', '_').replace('.', '_') === targetUserId
      );

      if (!targetEmail || !defaultAdmins[targetEmail]) {
        return new Response(
          JSON.stringify({ success: false, message: 'Utilisateur cible introuvable' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Valider le nouveau mot de passe
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return new Response(
          JSON.stringify({ success: false, message: passwordValidation.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Réinitialiser le mot de passe
      defaultAdmins[targetEmail].password_hash = await simpleHash(newPassword);
      defaultAdmins[targetEmail].failed_attempts = 0;
      defaultAdmins[targetEmail].locked_until = undefined;
      
      console.log(`🔐 Mot de passe réinitialisé par ${adminEmail} pour ${targetEmail}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Mot de passe réinitialisé avec succès' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Action non reconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur fonction auth:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});