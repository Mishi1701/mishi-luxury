import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

async function getShiprocketToken(): Promise<string> {
  const email = Deno.env.get("SHIPROCKET_EMAIL");
  const password = Deno.env.get("SHIPROCKET_PASSWORD");
  if (!email || !password) throw new Error("Shiprocket credentials not configured");

  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket auth failed [${res.status}]: ${text}`);
  }
  const data = await res.json();
  return data.token;
}

async function shiprocketFetch(token: string, path: string, options?: RequestInit) {
  const res = await fetch(`${SHIPROCKET_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Shiprocket API error [${res.status}]: ${JSON.stringify(data)}`);
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    const token = await getShiprocketToken();

    let result;

    switch (action) {
      case "check_serviceability": {
        const { pickup_postcode, delivery_postcode, weight, cod } = payload;
        result = await shiprocketFetch(token,
          `/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=${cod ? 1 : 0}`
        );
        break;
      }

      case "create_order": {
        result = await shiprocketFetch(token, "/orders/create/adhoc", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        // Update order in our DB with shiprocket details
        if (result.order_id && payload.order_db_id) {
          const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
          const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
          const supabase = createClient(supabaseUrl, serviceKey);
          await supabase.from("orders").update({
            status: "confirmed",
          }).eq("id", payload.order_db_id);
        }
        break;
      }

      case "track_order": {
        const { shipment_id } = payload;
        result = await shiprocketFetch(token, `/courier/track/shipment/${shipment_id}`);
        break;
      }

      case "cancel_order": {
        result = await shiprocketFetch(token, "/orders/cancel", {
          method: "POST",
          body: JSON.stringify({ ids: [payload.order_id] }),
        });
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Shiprocket error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
