import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import admin from 'npm:firebase-admin'

// 1. Initialize Firebase (Reusing the exact same secret you already saved!)
const firebaseConfig = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
if (firebaseConfig && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(firebaseConfig)),
  });
}

serve(async (req) => {
  try {
    // 2. Read the Webhook from the `bookings` table
    const payload = await req.json();
    const { type, record, old_record } = payload;

    // Connect to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    let customerMessage = null;
    let providerMessage = null;

    // 3. LOGIC: Determine what message to send based on what happened
    if (type === 'INSERT') {
      // EVENT 1: A brand new booking was just created!
      customerMessage = { 
        title: "Booking Confirmed! ✅", 
        body: "Your payment was successful and your appointment is confirmed." 
      };
      providerMessage = { 
        title: "New Booking Alert! ✂️", 
        body: "You just received a new appointment request!" 
      };
    } 
    else if (type === 'UPDATE') {
      // EVENT 2: The booking status was updated to 'completed'
      // We check old_record so we don't send this multiple times
      if (record.status === 'completed' && old_record?.status !== 'completed') {
        customerMessage = { 
          title: "Service Complete 🌟", 
          body: "Your haircut is complete. Thank you for choosing us!" 
        };
        providerMessage = { 
          title: "Job Done! 💰", 
          body: "Service marked as complete. Your earnings have been updated." 
        };
      }
    }

    // If it's just a random update (like changing the time), do nothing
    if (!customerMessage && !providerMessage) {
      return new Response("No alerts needed for this update.", { status: 200 });
    }

    const messagesToSend: any[] = [];

    // 4. Fetch the specific Customer's phone token
    // NOTE: Make sure your column name is 'user_id' (or change it to 'customer_id' if that's what you used)
    if (customerMessage && record.user_id) { 
      const { data: customer } = await supabase.from('profiles').select('fcm_token').eq('id', record.user_id).single();
      if (customer?.fcm_token) {
        messagesToSend.push({ token: customer.fcm_token, notification: customerMessage });
      }
    }

    // 5. Fetch the specific Provider's phone token
    if (providerMessage && record.provider_id) {
      const { data: provider } = await supabase.from('providers').select('fcm_token').eq('id', record.provider_id).single();
      if (provider?.fcm_token) {
        messagesToSend.push({ token: provider.fcm_token, notification: providerMessage });
      }
    }

    // 6. Send the messages to the specific phones!
    if (messagesToSend.length > 0) {
      const response = await admin.messaging().sendEach(messagesToSend);
      return new Response(JSON.stringify({ success: true, deliveries: response }), { status: 200 });
    }

    return new Response("No valid FCM tokens found for these users.", { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});