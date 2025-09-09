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

    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email et mot de passe requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérifier les identifiants admin dans la base
    const { data: adminUser, error: adminError } = await supabaseClient
      .from('admin_users')
      .select('id, email, role, full_name, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Identifiants incorrects' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérification du mot de passe (simulation pour la démo)
    const validPassword = (
      (email === 'admin@ville.fr' && password === 'admin123') ||
      (email === 'superadmin@ville.fr' && password === 'super123')
    );

    if (!validPassword) {
      return new Response(
        JSON.stringify({ error: 'Mot de passe incorrect' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Créer une session d'authentification
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: adminUser.role,
        full_name: adminUser.full_name,
        admin_id: adminUser.id
      }
    });

    if (authError) {
      console.error('Erreur création session:', authError);
    }

    // Générer un token de session pour le client
    const sessionToken = btoa(JSON.stringify({
      email: adminUser.email,
      role: adminUser.role,
      id: adminUser.id,
      full_name: adminUser.full_name,
      timestamp: Date.now()
    }));

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          full_name: adminUser.full_name
        },
        session_token: sessionToken
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur authentification admin:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});