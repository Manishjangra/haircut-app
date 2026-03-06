import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0'

// 1. Define CORS headers for the Flutter App
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 2. ALWAYS answer the CORS pre-flight check first
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 3. Initialize Stripe SAFELY inside the try block
    const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY in Supabase Vault!");
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // 4. Read the payment details from Flutter
    const { amount, currency } = await req.json()

    // 5. Create the Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, 
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // 6. Return Success (with CORS headers!)
    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
    
  } catch (e) {
    // 7. If ANYTHING breaks, return a readable error (with CORS headers!)
    return new Response(
      JSON.stringify({ error: e.message }), 
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})

