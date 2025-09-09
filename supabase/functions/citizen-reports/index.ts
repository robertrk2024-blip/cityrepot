import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const { 
        category, 
        description, 
        location_text,
        latitude,
        longitude,
        location_accuracy,
        location_timestamp,
        citizen_name,
        citizen_email,
        photos_count 
      } = await req.json()

      // Validation des données obligatoires
      if (!category || !description || !latitude || !longitude) {
        return new Response(
          JSON.stringify({ error: 'Données obligatoires manquantes' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Créer le signalement
      const { data: report, error } = await supabaseClient
        .from('citizen_reports')
        .insert([{
          category,
          description,
          location_text,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          location_accuracy: location_accuracy ? parseInt(location_accuracy) : null,
          location_timestamp,
          citizen_name: citizen_name || 'Citoyen anonyme',
          citizen_email,
          photos_count: photos_count || 0,
          status: 'nouveau',
          priority: 'normale'
        }])
        .select()
        .single()

      if (error) {
        console.error('Erreur création signalement:', error)
        throw error
      }

      console.log('✅ Nouveau signalement créé:', report.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          report_id: report.id,
          message: 'Signalement enregistré avec succès' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const adminOnly = url.searchParams.get('admin') === 'true'

      if (adminOnly) {
        // Récupérer tous les signalements pour l'admin
        const { data: reports, error } = await supabaseClient
          .from('citizen_reports')
          .select(`
            *,
            assigned_admin:assigned_to(full_name)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify({ reports }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Récupérer les signalements publics (pour la carte)
      const { data: reports, error } = await supabaseClient
        .from('citizen_reports')
        .select('id, category, latitude, longitude, status, created_at')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      return new Response(
        JSON.stringify({ reports }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'PUT') {
      const { report_id, status, priority, assigned_to, resolution_notes } = await req.json()

      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (status) updateData.status = status
      if (priority) updateData.priority = priority
      if (assigned_to) updateData.assigned_to = assigned_to
      if (resolution_notes) updateData.resolution_notes = resolution_notes
      if (status === 'resolu') updateData.resolved_at = new Date().toISOString()

      const { data: report, error } = await supabaseClient
        .from('citizen_reports')
        .update(updateData)
        .eq('id', report_id)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ 
          success: true, 
          report,
          message: 'Signalement mis à jour' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Méthode non supportée' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur citizen-reports:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})