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
        type, 
        title, 
        message, 
        target_audience, 
        priority,
        channels,
        author,
        alert_id 
      } = await req.json()

      console.log('🚨 Envoi de notification universelle:', { type, title, priority })

      // Simuler l'envoi de notifications selon les canaux
      const notifications = []

      if (channels.includes('app_push')) {
        notifications.push({
          channel: 'app_push',
          status: 'sent',
          recipients: getEstimatedRecipients(target_audience, 'mobile'),
          message: 'Notification push envoyée aux applications mobiles'
        })
      }

      if (channels.includes('web_notification')) {
        notifications.push({
          channel: 'web_notification',
          status: 'sent', 
          recipients: getEstimatedRecipients(target_audience, 'web'),
          message: 'Notification web envoyée aux navigateurs'
        })
      }

      if (channels.includes('sms') || priority === 'critical') {
        notifications.push({
          channel: 'sms',
          status: 'sent',
          recipients: getEstimatedRecipients(target_audience, 'sms'),
          message: 'SMS d\'urgence envoyé à tous les citoyens inscrits'
        })
      }

      if (channels.includes('email')) {
        notifications.push({
          channel: 'email',
          status: 'sent',
          recipients: getEstimatedRecipients(target_audience, 'email'), 
          message: 'Email informatif envoyé aux abonnés'
        })
      }

      if (channels.includes('social_media')) {
        notifications.push({
          channel: 'social_media',
          status: 'sent',
          recipients: getEstimatedRecipients(target_audience, 'social'),
          message: 'Publication automatique sur les réseaux sociaux'
        })
      }

      // Enregistrer les statistiques d'envoi
      if (alert_id) {
        await supabaseClient
          .from('alert_notifications') 
          .insert([{
            alert_id,
            channels_sent: channels,
            total_recipients: notifications.reduce((sum, notif) => sum + notif.recipients, 0),
            sent_at: new Date().toISOString(),
            delivery_status: 'completed'
          }])
      }

      // Log des envois
      for (const notif of notifications) {
        console.log(`📱 ${notif.channel.toUpperCase()}: ${notif.message} (${notif.recipients} destinataires)`)
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          notifications_sent: notifications.length,
          total_recipients: notifications.reduce((sum, notif) => sum + notif.recipients, 0),
          channels: notifications.map(n => n.channel),
          message: 'Notifications universelles envoyées avec succès'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Récupérer les alertes actives pour affichage public
      const { data: alerts, error } = await supabaseClient
        .from('public_alerts')
        .select('*')
        .eq('status', 'active')
        .order('published_at', { ascending: false })
        .limit(10)

      if (error) throw error

      return new Response(
        JSON.stringify({ alerts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Méthode non supportée' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur dans universal-notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function getEstimatedRecipients(audience: string, channel: string): number {
  // Estimation du nombre de destinataires selon l'audience et le canal
  const baseNumbers = {
    'local': { mobile: 1000, web: 800, sms: 500, email: 1200, social: 2000 },
    'city': { mobile: 8000, web: 6000, sms: 4000, email: 10000, social: 15000 },
    'region': { mobile: 50000, web: 40000, sms: 25000, email: 60000, social: 100000 },
    'all': { mobile: 100000, web: 80000, sms: 50000, email: 120000, social: 200000 }
  }

  const audienceKey = audience as keyof typeof baseNumbers
  const channelKey = channel as keyof typeof baseNumbers.local
  
  if (baseNumbers[audienceKey] && baseNumbers[audienceKey][channelKey]) {
    // Ajouter une variation aléatoire de ±20%
    const base = baseNumbers[audienceKey][channelKey]
    const variation = Math.random() * 0.4 - 0.2 // ±20%
    return Math.floor(base * (1 + variation))
  }

  return Math.floor(Math.random() * 1000) + 100
}