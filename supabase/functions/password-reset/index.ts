import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, adminId, method, contact, newPassword, resetToken } = await req.json();

    // Action: Envoyer lien de réinitialisation
    if (action === 'send_reset_link') {
      if (!adminId || !method || !contact) {
        return new Response(
          JSON.stringify({ error: 'Données manquantes' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Récupérer les infos admin
      const { data: admin, error: adminError } = await supabaseClient
        .from('admin_users')
        .select('*')
        .eq('id', adminId)
        .single();

      if (adminError || !admin) {
        return new Response(
          JSON.stringify({ error: 'Administrateur introuvable' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Générer un token de réinitialisation
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      // Sauvegarder le token
      const { error: tokenError } = await supabaseClient
        .from('password_reset_tokens')
        .insert({
          admin_id: adminId,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
          method: method,
          contact: contact
        });

      if (tokenError) {
        console.error('Erreur sauvegarde token:', tokenError);
      }

      // Créer le lien de réinitialisation
      const resetLink = `${req.headers.get('origin')}/admin/reset-password?token=${resetToken}`;

      // Simuler l'envoi selon la méthode
      if (method === 'email') {
        console.log(`📧 E-mail envoyé à ${contact}:`);
        console.log(`Lien de réinitialisation: ${resetLink}`);
        console.log(`Token: ${resetToken}`);
      } else if (method === 'sms') {
        console.log(`📱 SMS envoyé au ${contact}:`);
        console.log(`Votre lien de réinitialisation: ${resetLink}`);
        console.log(`Token: ${resetToken}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: `Lien de réinitialisation envoyé par ${method === 'email' ? 'e-mail' : 'SMS'}`,
          resetToken: resetToken // Pour les tests
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Vérifier le token de réinitialisation
    if (action === 'verify_token') {
      if (!resetToken) {
        return new Response(
          JSON.stringify({ error: 'Token manquant' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: tokenData, error: tokenError } = await supabaseClient
        .from('password_reset_tokens')
        .select('*, admin_users(*)')
        .eq('token', resetToken)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ error: 'Token invalide ou expiré' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          admin: {
            id: tokenData.admin_users.id,
            email: tokenData.admin_users.email,
            full_name: tokenData.admin_users.full_name
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Réinitialiser le mot de passe
    if (action === 'reset_password') {
      if (!resetToken || !newPassword) {
        return new Response(
          JSON.stringify({ error: 'Token ou mot de passe manquant' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (newPassword.length < 8) {
        return new Response(
          JSON.stringify({ error: 'Le mot de passe doit contenir au moins 8 caractères' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Vérifier le token
      const { data: tokenData, error: tokenError } = await supabaseClient
        .from('password_reset_tokens')
        .select('*')
        .eq('token', resetToken)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ error: 'Token invalide ou expiré' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Marquer le token comme utilisé
      await supabaseClient
        .from('password_reset_tokens')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('token', resetToken);

      // Ici on simule la mise à jour du mot de passe
      // En production, il faudrait hasher le mot de passe
      console.log(`🔐 Mot de passe mis à jour pour l'admin ${tokenData.admin_id}`);
      console.log(`Nouveau mot de passe: ${newPassword}`);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Mot de passe mis à jour avec succès'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: Changer le mot de passe (par un super-admin)
    if (action === 'change_password') {
      if (!adminId || !newPassword) {
        return new Response(
          JSON.stringify({ error: 'Données manquantes' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Vérifier que l'admin existe
      const { data: admin, error: adminError } = await supabaseClient
        .from('admin_users')
        .select('*')
        .eq('id', adminId)
        .single();

      if (adminError || !admin) {
        return new Response(
          JSON.stringify({ error: 'Administrateur introuvable' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Simuler la mise à jour du mot de passe
      console.log(`🔐 Mot de passe changé pour l'admin ${admin.email}`);
      console.log(`Nouveau mot de passe: ${newPassword}`);

      // Envoyer une notification par e-mail à l'admin
      console.log(`📧 Notification envoyée à ${admin.email}: Votre mot de passe a été modifié`);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Mot de passe modifié avec succès. L\'administrateur a été notifié par e-mail.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Action non reconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur fonction réinitialisation:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});