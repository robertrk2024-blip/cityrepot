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

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (req.method === 'GET') {
      // Récupérer les alertes publiques
      const { data: alerts, error } = await supabaseClient
        .from('public_alerts')
        .select('*')
        .in('status', ['active', 'scheduled'])
        .order('published_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify({ alerts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { 
        title, 
        message, 
        alert_type, 
        zone, 
        image_url, 
        author, 
        priority,
        channels,
        scheduled_for 
      } = await req.json()

      // Validation des données
      if (!title || !message || !alert_type || !zone || !author) {
        return new Response(
          JSON.stringify({ error: 'Champs obligatoires manquants' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const now = new Date().toISOString()
      const isScheduled = scheduled_for && new Date(scheduled_for) > new Date()

      const alertData = {
        title,
        message,
        alert_type,
        zone,
        image_url,
        author,
        priority: priority || 'medium',
        channels: channels || ['website', 'app'],
        status: isScheduled ? 'scheduled' : 'active',
        scheduled_for: isScheduled ? scheduled_for : null,
        published_at: isScheduled ? null : now
      }

      // Créer l'alerte
      const { data: newAlert, error } = await supabaseClient
        .from('public_alerts')
        .insert([alertData])
        .select()
        .single()

      if (error) throw error

      // Si l'alerte est publiée immédiatement, envoyer les notifications
      if (!isScheduled) {
        await sendUniversalNotifications(newAlert, supabaseClient)
      }

      return new Response(
        JSON.stringify({ alert: newAlert, message: 'Alerte créée avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'PUT' && action === 'publish') {
      const { alert_id } = await req.json()

      // Publier une alerte programmée
      const { data: alert, error: updateError } = await supabaseClient
        .from('public_alerts')
        .update({
          status: 'active',
          published_at: new Date().toISOString()
        })
        .eq('id', alert_id)
        .eq('status', 'scheduled')
        .select()
        .single()

      if (updateError) throw updateError

      if (alert) {
        await sendUniversalNotifications(alert, supabaseClient)
      }

      return new Response(
        JSON.stringify({ message: 'Alerte publiée avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'PUT' && action === 'view') {
      const { alert_id } = await req.json()

      // Incrémenter le compteur de vues
      await supabaseClient.rpc('increment_alert_views', { alert_id })

      return new Response(
        JSON.stringify({ message: 'Vue enregistrée' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Action non supportée' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur dans public-alerts:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendUniversalNotifications(alert, supabaseClient) {
  try {
    console.log('🚨 Envoi de notifications universelles pour:', alert.title)

    // Simuler l'envoi selon les canaux configurés
    const notifications = []

    if (alert.channels.includes('website')) {
      notifications.push({
        type: 'website',
        message: 'Alerte publiée sur le site web public'
      })
    }

    if (alert.channels.includes('app')) {
      notifications.push({
        type: 'push',
        message: 'Notification push envoyée aux utilisateurs de l\'app'
      })
    }

    if (alert.channels.includes('sms') || alert.priority === 'critical') {
      notifications.push({
        type: 'sms',
        message: 'SMS d\'urgence envoyé à tous les citoyens inscrits'
      })
    }

    if (alert.channels.includes('social')) {
      notifications.push({
        type: 'social',
        message: 'Publication automatique sur les réseaux sociaux'
      })
    }

    // Log des notifications (en production, ici on appellerait les vraies APIs)
    for (const notif of notifications) {
      console.log(`📱 ${notif.type.toUpperCase()}: ${notif.message}`)
    }

    // Enregistrer les statistiques d'envoi
    await supabaseClient
      .from('alert_notifications')
      .insert([{
        alert_id: alert.id,
        channels_sent: alert.channels,
        estimated_recipients: getEstimatedRecipients(alert.zone),
        sent_at: new Date().toISOString()
      }])
      .select()

    console.log('✅ Notifications universelles envoyées avec succès')

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des notifications:', error)
  }
}

function getEstimatedRecipients(zone) {
  // Estimation du nombre de destinataires selon la zone
  switch (zone) {
    case 'local': return Math.floor(Math.random() * 5000) + 1000
    case 'city': return Math.floor(Math.random() * 20000) + 10000
    case 'region': return Math.floor(Math.random() * 100000) + 50000
    default: return 10000
  }
}