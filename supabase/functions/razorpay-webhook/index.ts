// Razorpay webhook — verifies signature, marks order paid, triggers Shiprocket.
// Configure URL in Razorpay Dashboard → Settings → Webhooks.
// Listen for: payment.captured, order.paid
import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-razorpay-signature, content-type',
};

const WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || Deno.env.get('RAZORPAY_KEY_SECRET')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const raw = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';
  const expected = createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex');

  if (expected !== signature) {
    console.error('Invalid Razorpay webhook signature');
    return new Response(JSON.stringify({ error: 'invalid signature' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const event = JSON.parse(raw);
  console.log('Razorpay webhook event:', event.event);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload?.payment?.entity;
      const order = event.payload?.order?.entity;
      const orderDbId =
        payment?.notes?.order_db_id ||
        order?.notes?.order_db_id;

      if (!orderDbId) {
        console.warn('No order_db_id in notes — skipping');
        return new Response(JSON.stringify({ ok: true, skipped: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Idempotent: only update if not already paid
      const { data: existing } = await supabase.from('orders')
        .select('id, status').eq('id', orderDbId).single();

      if (existing && existing.status !== 'paid' && existing.status !== 'shipment_created') {
        await supabase.from('orders').update({
          status: 'paid',
          transaction_id: payment?.id || null,
          payment_method: 'razorpay',
        }).eq('id', orderDbId);
      }

      // Trigger Shiprocket shipment (idempotent inside function)
      try {
        await supabase.functions.invoke('shiprocket', {
          body: { action: 'create_shipment_from_order', payload: { order_db_id: orderDbId } },
        });
      } catch (e) {
        console.error('Shiprocket auto-ship failed:', e);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
