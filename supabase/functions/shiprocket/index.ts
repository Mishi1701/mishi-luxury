const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";
const PICKUP_PINCODE = Deno.env.get("PICKUP_PINCODE") || "462001";
const PICKUP_LOCATION = Deno.env.get("PICKUP_LOCATION") || "Primary";

async function getShiprocketToken(): Promise<string> {
  const email = Deno.env.get("SHIPROCKET_EMAIL");
  const password = Deno.env.get("SHIPROCKET_PASSWORD");
  if (!email || !password) throw new Error("Shiprocket credentials not configured");
  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Shiprocket auth failed [${res.status}]: ${await res.text()}`);
  const data = await res.json();
  return data.token;
}

async function srFetch(token: string, path: string, options?: RequestInit) {
  const res = await fetch(`${SHIPROCKET_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Shiprocket API [${res.status}]: ${JSON.stringify(data)}`);
  return data;
}

function pickBestCourier(couriers: any[]) {
  if (!couriers?.length) return null;
  // Prefer lowest rate, but rated decently
  const sorted = [...couriers].sort((a, b) => (a.rate || 9999) - (b.rate || 9999));
  return sorted[0];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { action, payload } = await req.json();
    const token = await getShiprocketToken();
    let result: any;

    switch (action) {
      case "check_serviceability":
      case "get_rates": {
        const { delivery_postcode, weight = 0.5, cod = false, declared_value = 1000 } = payload;
        const data = await srFetch(token,
          `/courier/serviceability/?pickup_postcode=${PICKUP_PINCODE}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=${cod ? 1 : 0}&declared_value=${declared_value}`
        );
        const couriers = data?.data?.available_courier_companies || [];
        const best = pickBestCourier(couriers);
        result = {
          serviceable: couriers.length > 0,
          best_courier: best ? {
            courier_name: best.courier_name,
            rate: Math.round(best.rate || 0),
            etd: best.etd,
            estimated_delivery_days: best.estimated_delivery_days,
          } : null,
          all_couriers: couriers.length,
          raw: data,
        };
        break;
      }

      case "create_shipment_from_order": {
        const { order_db_id } = payload;
        if (!order_db_id) throw new Error("order_db_id required");
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, serviceKey);
        const { data: order, error } = await supabase.from("orders").select("*").eq("id", order_db_id).single();
        if (error || !order) throw new Error("Order not found");

        const items = (order.items as any[]) || [];
        const orderItems = items.map((i, idx) => ({
          name: i.name || `Item ${idx + 1}`,
          sku: i.id || `MISHI-${idx}`,
          units: i.quantity || 1,
          selling_price: i.price || 0,
        }));

        const [first, ...lastParts] = (order.customer_name || "Customer").split(" ");
        const addr = order.shipping_address || "";
        const pin = order.pincode || addr.match(/\b\d{6}\b/)?.[0] || "";

        const body = {
          order_id: order.order_number,
          order_date: new Date(order.created_at).toISOString().split("T")[0],
          pickup_location: PICKUP_LOCATION,
          billing_customer_name: first,
          billing_last_name: lastParts.join(" ") || ".",
          billing_address: addr,
          billing_city: "",
          billing_pincode: pin,
          billing_state: "",
          billing_country: "India",
          billing_email: order.customer_email || "no-email@mishi.in",
          billing_phone: order.customer_phone || "0000000000",
          shipping_is_billing: true,
          order_items: orderItems,
          payment_method: "Prepaid",
          sub_total: order.total,
          length: 15, breadth: 15, height: 10, weight: 0.5,
        };

        const created = await srFetch(token, "/orders/create/adhoc", {
          method: "POST",
          body: JSON.stringify(body),
        });

        const updates: Record<string, any> = {
          status: "shipment_created",
          shipment_id: created?.shipment_id?.toString() || null,
          awb_code: created?.awb_code || null,
          courier_name: created?.courier_name || null,
        };
        if (updates.awb_code) updates.tracking_url = `https://shiprocket.co/tracking/${updates.awb_code}`;
        await supabase.from("orders").update(updates).eq("id", order_db_id);

        result = { ok: true, shiprocket: created, updates };
        break;
      }

      case "track_order": {
        const { awb } = payload;
        result = await srFetch(token, `/courier/track/awb/${awb}`);
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Shiprocket error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
