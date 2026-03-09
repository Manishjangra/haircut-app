import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import admin from 'npm:firebase-admin'

// 1. Initialize Firebase Admin using a secure environment variable
const firebaseConfig = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');

if (firebaseConfig && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(firebaseConfig)),
  });
}

serve(async (req) => {
  try {
    // 2. Parse the Webhook Payload from Supabase
    const payload = await req.json();
    const record = payload.record; // The new row inserted into 'notifications'

    if (!record || !record.title || !record.message) {
      return new Response("No record found or missing data", { status: 400 });
    }

    // 3. Initialize Supabase Client with Admin privileges to read tokens
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    let tokens: string[] = [];

    // 4. Fetch Provider Tokens (if target is 'providers' or 'all')
    if (record.target_audience === 'providers' || record.target_audience === 'all') {
      const { data: providers } = await supabase
        .from('providers')
        .select('fcm_token')
        .not('fcm_token', 'is', null);
        
      if (providers) {
        tokens.push(...providers.map(p => p.fcm_token).filter(Boolean));
      }
    }

    // 5. Fetch Customer Tokens (if target is 'customers' or 'all')
    if (record.target_audience === 'customers' || record.target_audience === 'all') {
      const { data: customers } = await supabase
        .from('profiles')
        .select('fcm_token')
        .not('fcm_token', 'is', null);
        
      if (customers) {
        tokens.push(...customers.map(c => c.fcm_token).filter(Boolean));
      }
    }

    // Remove any duplicate tokens
    tokens = [...new Set(tokens)];

    // If nobody has an FCM token saved, exit gracefully
    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No FCM tokens found in database." }), 
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 6. Blast the Push Notification via Firebase!
    const message = {
      notification: {
        title: record.title,
        body: record.message,
      },
      tokens: tokens, // Firebase will send this to up to 500 phones at once
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return new Response(JSON.stringify({ success: true, firebaseResponse: response }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});