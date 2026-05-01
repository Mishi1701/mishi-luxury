// PayPal order creation + capture for MISHI checkout
// Actions: "create_order" | "capture_order"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYPAL_ENV = Deno.env.get("PAYPAL_ENV") || "sandbox"; // "sandbox" or "live"
const PAYPAL_BASE = PAYPAL_ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getPayPalToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_SECRET");
  if (!clientId || !secret) throw new Error("PayPal credentials not configured");

  const auth = btoa(`${clientId}:${secret}`);
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed [${res.status}]: ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

// INR is not supported by PayPal — convert to USD using a fixed rate (admin-tunable later)
const INR_TO_USD = Number(Deno.env.get("INR_TO_USD") || "0.012");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, payload } = await req.json();
    const token = await getPayPalToken();

    if (action === "create_order") {
      const inrTotal = Number(payload?.amount_inr || 0);
      if (!inrTotal || inrTotal <= 0) throw new Error("Invalid amount");
      const usdAmount = (inrTotal * INR_TO_USD).toFixed(2);

      const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: payload?.order_number || `MISHI-${Date.now()}`,
              description: "MISHI Official — Royal Order",
              amount: {
                currency_code: "USD",
                value: usdAmount,
              },
            },
          ],
          application_context: {
            brand_name: "MISHI Official",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`Create order failed: ${JSON.stringify(data)}`);
      return new Response(JSON.stringify({ id: data.id, usd_amount: usdAmount, inr_amount: inrTotal }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "capture_order") {
      const orderId = payload?.paypal_order_id;
      if (!orderId) throw new Error("Missing paypal_order_id");

      const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`Capture failed: ${JSON.stringify(data)}`);

      // Update order in DB if order_db_id supplied
      if (payload?.order_db_id) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        await supabase.from("orders").update({ status: "confirmed" }).eq("id", payload.order_db_id);
      }

      return new Response(JSON.stringify({ status: data.status, capture: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("paypal error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
