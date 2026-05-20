import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

const KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
const KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;
const AUTH = 'Basic ' + btoa(`${KEY_ID}:${KEY_SECRET}`);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { action, payload } = await req.json();

    if (action === 'get_key') {
      return new Response(JSON.stringify({ key_id: KEY_ID }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'create_order') {
      const { amount_inr, order_db_id } = payload;
      if (!amount_inr || amount_inr < 1) throw new Error('Invalid amount');
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { Authorization: AUTH, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount_inr * 100),
          currency: 'INR',
          receipt: order_db_id?.slice(0, 40) || `r_${Date.now()}`,
          notes: { order_db_id: order_db_id || '' },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.description || 'Razorpay order failed');
      return new Response(JSON.stringify({ id: data.id, amount: data.amount, currency: data.currency, key_id: KEY_ID }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify_payment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_db_id } = payload;
      const expected = createHmac('sha256', KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      if (expected !== razorpay_signature) {
        return new Response(JSON.stringify({ verified: false, error: 'Signature mismatch' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );

      if (order_db_id) {
        await supabase.from('orders').update({
          status: 'paid',
          transaction_id: razorpay_payment_id,
          payment_method: 'razorpay',
        }).eq('id', order_db_id);

        // Trigger Shiprocket shipment
        try {
          const { data: order } = await supabase.from('orders').select('*').eq('id', order_db_id).single();
          if (order) {
            await supabase.functions.invoke('shiprocket', {
              body: { action: 'create_shipment', payload: { order_db_id } },
            });
          }
        } catch (e) {
          console.error('Shiprocket trigger failed', e);
        }
      }

      return new Response(JSON.stringify({ verified: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Unknown action');
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
