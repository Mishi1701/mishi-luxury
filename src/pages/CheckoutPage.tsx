import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Shield, Lock, ArrowLeft, Crown, AlertTriangle, Loader2, MapPin, Truck,
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface AddressForm {
  firstName: string; lastName: string; phone: string; email: string;
  address: string; city: string; state: string; pincode: string;
}

const PICKUP_PINCODE = "462001";
// Public PayPal client ID - safe to expose. For real production, set via env or admin panel
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb";

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [placing, setPlacing] = useState(false);
  const [checkingPin, setCheckingPin] = useState(false);
  const [pinServiceable, setPinServiceable] = useState<boolean | null>(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [form, setForm] = useState<AddressForm>({
    firstName: "", lastName: "", phone: "", email: user?.email || "",
    address: "", city: "", state: "", pincode: "",
  });

  const set = (key: keyof AddressForm, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const subtotal = totalPrice;
  const gst = Math.round(subtotal * 0.03);
  const total = subtotal + gst;

  const checkServiceability = async (pin: string) => {
    if (pin.length !== 6) { setPinServiceable(null); setDeliveryEstimate(null); return; }
    setCheckingPin(true);
    try {
      const { data, error } = await supabase.functions.invoke("shiprocket", {
        body: { action: "check_serviceability", payload: { pickup_postcode: PICKUP_PINCODE, delivery_postcode: pin, weight: 0.5, cod: false } },
      });
      if (error) throw error;
      const couriers = data?.data?.available_courier_companies;
      if (couriers?.length > 0) {
        setPinServiceable(true);
        setDeliveryEstimate(couriers[0]?.etd ? `Estimated delivery: ${couriers[0].etd}` : "Delivery available");
      } else {
        setPinServiceable(false);
      }
    } catch { setPinServiceable(null); }
    finally { setCheckingPin(false); }
  };

  const isFormValid = () => {
    const { firstName, lastName, phone, email, address, city, state, pincode } = form;
    return firstName.trim() && lastName.trim() && phone.trim().length >= 10 &&
      email.includes("@") && address.trim() && city.trim() && state.trim() &&
      pincode.length === 6 && items.length > 0;
  };

  const createOrderRecord = async (): Promise<string | null> => {
    if (!user) {
      toast.error("Please sign in to checkout");
      navigate("/login");
      return null;
    }
    const orderNumber = `MISHI-${Date.now().toString(36).toUpperCase()}`;
    const fullAddress = `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`;
    const { data, error } = await supabase.from("orders").insert({
      user_id: user.id,
      order_number: orderNumber,
      items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image_url: i.image_url })),
      total,
      status: "pending_payment",
      customer_name: `${form.firstName} ${form.lastName}`,
      customer_email: form.email,
      customer_phone: form.phone,
      shipping_address: fullAddress,
    }).select("id, order_number").single();
    if (error) { toast.error(error.message); return null; }
    setOrderId(data.id);
    return data.id;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-20 text-center">
          <Crown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <Link to="/collections/fine-jewellery" className="inline-block mt-4 px-8 py-3 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md">Browse Collection</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 border border-border rounded-md font-body text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelCls = "font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 block";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/cart" className="inline-flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>First Name *</label><input className={inputCls} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
                    <div><label className={labelCls}>Last Name *</label><input className={inputCls} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Phone *</label><input className={inputCls} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
                    <div><label className={labelCls}>Email *</label><input className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
                  </div>
                  <div><label className={labelCls}>Address *</label><input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className={labelCls}>City *</label><input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
                    <div><label className={labelCls}>State *</label><input className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} /></div>
                    <div>
                      <label className={labelCls}>PIN Code *</label>
                      <input className={inputCls} maxLength={6} value={form.pincode} onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        set("pincode", val);
                        if (val.length === 6) checkServiceability(val); else setPinServiceable(null);
                      }} />
                      {checkingPin && <div className="flex items-center gap-2 mt-2 text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /><span className="font-body text-xs">Checking...</span></div>}
                      {pinServiceable === true && <div className="flex items-center gap-2 mt-2 text-green-600"><Truck className="w-3.5 h-3.5" /><span className="font-body text-xs font-semibold">{deliveryEstimate}</span></div>}
                      {pinServiceable === false && <div className="flex items-center gap-2 mt-2 text-destructive"><AlertTriangle className="w-3.5 h-3.5" /><span className="font-body text-xs font-semibold">Not deliverable</span></div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">Pay with PayPal</h2>
                <p className="font-body text-xs text-muted-foreground mb-4">Pay securely with PayPal balance, Credit / Debit Card, or your bank account.</p>

                {!isFormValid() ? (
                  <div className="bg-muted/30 border border-border/50 rounded-lg p-6 text-center">
                    <Lock className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                    <p className="font-body text-xs text-muted-foreground">Please fill in all shipping details to proceed with payment.</p>
                  </div>
                ) : pinServiceable === false ? (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-center">
                    <p className="font-body text-xs text-destructive font-semibold">Delivery not available at your pincode.</p>
                  </div>
                ) : (
                  <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
                    <PayPalButtons
                      style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                      createOrder={async () => {
                        setPlacing(true);
                        try {
                          const dbOrderId = orderId || await createOrderRecord();
                          if (!dbOrderId) throw new Error("Order creation failed");
                          const { data, error } = await supabase.functions.invoke("paypal", {
                            body: { action: "create_order", payload: { amount_inr: total, order_number: dbOrderId } },
                          });
                          if (error) throw error;
                          if (!data?.id) throw new Error("PayPal order creation failed");
                          return data.id;
                        } catch (e: any) {
                          toast.error(e.message || "Failed to start payment");
                          throw e;
                        } finally {
                          setPlacing(false);
                        }
                      }}
                      onApprove={async (data) => {
                        try {
                          const { data: result, error } = await supabase.functions.invoke("paypal", {
                            body: { action: "capture_order", payload: { paypal_order_id: data.orderID, order_db_id: orderId } },
                          });
                          if (error) throw error;
                          if (result?.status === "COMPLETED") {
                            clearCart();
                            toast.success("Payment successful! 🎉");
                            navigate(`/orders/${orderId}`);
                          } else {
                            toast.error("Payment not completed");
                          }
                        } catch (e: any) {
                          toast.error(e.message || "Capture failed");
                        }
                      }}
                      onError={(err) => {
                        console.error("PayPal error:", err);
                        toast.error("PayPal error. Please try again.");
                      }}
                      onCancel={() => toast.info("Payment cancelled")}
                    />
                  </PayPalScriptProvider>
                )}

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                    <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">100% Pre-Paid Orders Only.</strong> No COD. Mandatory unboxing video required for returns. No returns on personalized items.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="glass-card rounded-xl p-6 sticky top-28">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Order Summary</h2>
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md bg-secondary/50 flex items-center justify-center overflow-hidden">
                          {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <Crown className="w-5 h-5 text-primary/50" />}
                        </div>
                        <div>
                          <p className="font-body text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                          <p className="font-body text-[11px] text-muted-foreground">× {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-body text-sm font-bold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/50 pt-4 space-y-2">
                  <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">GST (3%)</span><span>₹{gst.toLocaleString()}</span></div>
                  <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Shipping</span><span className="text-green-600 font-semibold">FREE</span></div>
                  <div className="border-t border-border/50 pt-3 flex justify-between">
                    <span className="font-body text-base font-bold text-foreground">Total</span>
                    <span className="font-display text-xl font-bold text-foreground">₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[{ icon: Shield, label: "Secure Checkout" }, { icon: Lock, label: "PayPal Protected" }].map((b) => (
                    <div key={b.label} className="flex items-center gap-2 p-2 rounded border border-border/30">
                      <b.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-body text-[10px] tracking-wider uppercase text-muted-foreground">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
