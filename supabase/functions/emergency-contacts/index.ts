import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const method = req.method

    if (method === 'GET') {
      // Récupérer tous les contacts actifs
      const { data: contacts, error } = await supabaseClient
        .from('emergency_contacts')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error

      return new Response(
        JSON.stringify({ contacts }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (method === 'POST') {
      const { title, name, phone, email, address, hours, icon, color } = await req.json()

      // Obtenir le prochain numéro d'ordre
      const { data: maxOrder } = await supabaseClient
        .from('emergency_contacts')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)

      const nextOrder = (maxOrder && maxOrder[0] ? maxOrder[0].display_order : 0) + 1

      const { data: contact, error } = await supabaseClient
        .from('emergency_contacts')
        .insert([{
          title,
          name,
          phone,
          email,
          address,
          hours,
          icon: icon || 'ri-phone-line',
          color: color || 'bg-blue-600',
          display_order: nextOrder
        }])
        .select()

      if (error) throw error

      return new Response(
        JSON.stringify({ contact: contact[0] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        }
      )
    }

    if (method === 'PUT') {
      const { id, title, name, phone, email, address, hours, icon, color, is_active } = await req.json()

      const { data: contact, error } = await supabaseClient
        .from('emergency_contacts')
        .update({
          title,
          name,
          phone,
          email,
          address,
          hours,
          icon,
          color,
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      return new Response(
        JSON.stringify({ contact: contact[0] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (method === 'DELETE') {
      const { id } = await req.json()

      const { error } = await supabaseClient
        .from('emergency_contacts')
        .delete()
        .eq('id', id)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})