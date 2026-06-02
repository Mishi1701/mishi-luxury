import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Shield, Lock, ArrowLeft, Crown, AlertTriangle, Loader2, MapPin, Truck, QrCode, CreditCard, Globe, Tag, Check, X,
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface AddressForm {
  firstName: string; lastName: string; phone: string; email: string;
  address: string; city: string; state: string; pincode: string;
}

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb";

type Country = "IN" | "INT";
type PaymentTab = "razorpay" | "upi" | "paypal";

// Load Razorpay checkout script once
const loadRazorpayScript = () => new Promise<boolean>((resolve) => {
  if ((window as any).Razorpay) return resolve(true);
  const s = document.createElement("script");
  s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { content: upiConfig } = useSiteContent<{ vpa: string; qr_url: string; merchant_name: string }>(
    "upi_payment", { vpa: "", qr_url: "", merchant_name: "MISHI Official" }
  );

  const [country, setCountry] = useState<Country>("IN");
  const [checkingPin, setCheckingPin] = useState(false);
  const [pinServiceable, setPinServiceable] = useState<boolean | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [edd, setEdd] = useState<string | null>(null);
  const [courierName, setCourierName] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentTab, setPaymentTab] = useState<PaymentTab>("razorpay");
  const [transactionId, setTransactionId] = useState("");
  const [submittingUpi, setSubmittingUpi] = useState(false);
  const [processingRazorpay, setProcessingRazorpay] = useState(false);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);

  const [form, setForm] = useState<AddressForm>({
    firstName: "", lastName: "", phone: user?.email || "",
    email: user?.email || "",
    address: "", city: "", state: "", pincode: "",
  } as any);
  const set = (key: keyof AddressForm, value: string) => setForm((p) => ({ ...p, [key]: value }));

  // Reset payment tab when country changes
  useEffect(() => {
    setPaymentTab(country === "IN" ? "razorpay" : "paypal");
  }, [country]);

  const subtotal = totalPrice;
  const gst = Math.round(subtotal * 0.03);
  const effectiveShipping = country === "IN" ? shippingCost : (shippingCost || 2500);
  const discount = appliedCoupon
    ? appliedCoupon.discount_type === "percent"
      ? Math.round((subtotal * appliedCoupon.discount_value) / 100)
      : Math.min(appliedCoupon.discount_value, subtotal)
    : 0;
  const total = Math.max(0, subtotal + gst + effectiveShipping - discount);

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return toast.error("Enter a promo code");
    setApplyingPromo(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("code, discount_type, discount_value, min_subtotal, max_uses, used_count, expires_at, active")
        .eq("code", code)
        .maybeSingle();
      if (error) throw error;
      if (!data) return toast.error("Invalid promo code");
      if (!data.active) return toast.error("This coupon is inactive");
      if (data.expires_at && new Date(data.expires_at) < new Date()) return toast.error("This coupon has expired");
      if (data.max_uses != null && data.used_count >= data.max_uses) return toast.error("This coupon has reached its limit");
      if (subtotal < (data.min_subtotal || 0)) return toast.error(`Minimum subtotal ₹${data.min_subtotal} required`);
      setAppliedCoupon({ code: data.code, discount_type: data.discount_type, discount_value: data.discount_value });
      toast.success(`Coupon ${data.code} applied 👑`);
    } catch (e: any) {
      toast.error(e.message || "Failed to apply coupon");
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromo = () => {
    setAppliedCoupon(null);
    setPromoInput("");
  };


  const checkServiceability = async (pin: string) => {
    if (pin.length !== 6) { setPinServiceable(null); setEdd(null); setShippingCost(0); setCourierName(null); return; }
    setCheckingPin(true);
    try {
      // SHIPROCKET API TOKEN & ROUTE HERE — handled inside edge function `shiprocket`
      const { data, error } = await supabase.functions.invoke("shiprocket", {
        body: { action: "get_rates", payload: { delivery_postcode: pin, weight: 0.5, cod: false, declared_value: subtotal || 1000 } },
      });
      if (error) throw error;
      if (data?.serviceable && data?.best_courier) {
        setPinServiceable(true);
        setShippingCost(data.best_courier.rate || 0);
        setCourierName(data.best_courier.courier_name);
        setEdd(data.best_courier.etd || null);
      } else { setPinServiceable(false); }
    } catch { setPinServiceable(null); }
    finally { setCheckingPin(false); }
  };

  const isFormValid = () => {
    const { firstName, lastName, phone, email, address, city, state, pincode } = form;
    const pinOk = country === "IN" ? pincode.length === 6 : pincode.trim().length >= 3;
    return firstName.trim() && lastName.trim() && phone.trim().length >= 8 &&
      email.includes("@") && address.trim() && city.trim() && state.trim() &&
      pinOk && items.length > 0;
  };

  const createOrderRecord = async (paymentMethod: string): Promise<string | null> => {
    if (!user) { toast.error("Please sign in to checkout"); navigate("/login"); return null; }
    const orderNumber = `MISHI-${Date.now().toString(36).toUpperCase()}`;
    const fullAddress = `${form.address}, ${form.city}, ${form.state} - ${form.pincode}${country === "INT" ? " (International)" : ""}`;
    const { data, error } = await supabase.from("orders").insert({
      user_id: user.id,
      order_number: orderNumber,
      items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image_url: i.image_url })),
      total,
      status: paymentMethod === "upi" ? "awaiting_upi_verification" : "pending_payment",
      customer_name: `${form.firstName} ${form.lastName}`,
      customer_email: form.email,
      customer_phone: form.phone,
      shipping_address: fullAddress,
      pincode: form.pincode,
      payment_method: paymentMethod,
      shipping_cost: effectiveShipping,
      expected_delivery: edd,
    }).select("id").single();
    if (error) { toast.error(error.message); return null; }
    setOrderId(data.id);
    return data.id;
  };

  // ---------- RAZORPAY ----------
  const handleRazorpay = async () => {
    if (!isFormValid()) return toast.error("Fill shipping details first");
    setProcessingRazorpay(true);
    const ok = await loadRazorpayScript();
    if (!ok) { setProcessingRazorpay(false); return toast.error("Razorpay SDK failed to load"); }

    const dbOrderId = orderId || await createOrderRecord("razorpay");
    if (!dbOrderId) { setProcessingRazorpay(false); return; }

    const { data, error } = await supabase.functions.invoke("razorpay", {
      body: { action: "create_order", payload: { amount_inr: total, order_db_id: dbOrderId } },
    });
    if (error || !data?.id) { setProcessingRazorpay(false); return toast.error("Failed to create Razorpay order"); }

    // PASTE RAZORPAY KEY HERE — auto-fetched from edge function (data.key_id)
    const rzp = new (window as any).Razorpay({
      key: data.key_id,
      amount: data.amount,
      currency: data.currency,
      name: "MISHI Luxury",
      description: "Royal Jewellery Purchase",
      order_id: data.id,
      prefill: {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        contact: form.phone,
      },
      theme: { color: "#7c6f9b" },
      handler: async (resp: any) => {
        const { data: verify, error: vErr } = await supabase.functions.invoke("razorpay", {
          body: {
            action: "verify_payment",
            payload: {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              order_db_id: dbOrderId,
            },
          },
        });
        setProcessingRazorpay(false);
        if (vErr || !verify?.verified) return toast.error("Payment verification failed");
        clearCart();
        toast.success("Payment successful! 👑");
        navigate(`/orders/${dbOrderId}`);
      },
      modal: { ondismiss: () => setProcessingRazorpay(false) },
    });
    rzp.on("payment.failed", (resp: any) => {
      setProcessingRazorpay(false);
      toast.error(resp?.error?.description || "Payment failed");
    });
    rzp.open();
  };

  // ---------- UPI ----------
  const handleUpiSubmit = async () => {
    if (!isFormValid()) return toast.error("Fill shipping details first");
    if (transactionId.trim().length < 8) return toast.error("Enter a valid UPI Transaction ID (UTR)");
    setSubmittingUpi(true);
    const id = orderId || await createOrderRecord("upi");
    if (!id) { setSubmittingUpi(false); return; }
    const { error } = await supabase.from("orders").update({
      transaction_id: transactionId.trim(), status: "awaiting_upi_verification",
    }).eq("id", id);
    setSubmittingUpi(false);
    if (error) return toast.error(error.message);
    clearCart();
    toast.success("Order placed! We'll verify your payment shortly. 👑");
    navigate(`/orders/${id}`);
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
              {/* Country */}
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Delivery Region
                </h2>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-lg">
                  <button onClick={() => setCountry("IN")} className={`py-2.5 rounded-md font-body text-xs font-bold tracking-wider uppercase transition-all ${country === "IN" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>🇮🇳 India</button>
                  <button onClick={() => setCountry("INT")} className={`py-2.5 rounded-md font-body text-xs font-bold tracking-wider uppercase transition-all ${country === "INT" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>🌍 International</button>
                </div>
              </div>

              {/* Shipping Address */}
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
                    <div><label className={labelCls}>Phone *</label><input className={inputCls} placeholder={country === "IN" ? "+91 XXXXX XXXXX" : "+1 XXX XXX XXXX"} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
                    <div><label className={labelCls}>Email *</label><input className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
                  </div>
                  <div><label className={labelCls}>Address *</label><input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className={labelCls}>City *</label><input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
                    <div><label className={labelCls}>{country === "IN" ? "State *" : "State / Country *"}</label><input className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} /></div>
                    <div>
                      <label className={labelCls}>{country === "IN" ? "PIN Code *" : "ZIP / Postal *"}</label>
                      <input className={inputCls} maxLength={country === "IN" ? 6 : 10} value={form.pincode} onChange={(e) => {
                        const val = country === "IN" ? e.target.value.replace(/\D/g, "") : e.target.value;
                        set("pincode", val);
                        if (country === "IN" && val.length === 6) checkServiceability(val);
                        else { setPinServiceable(null); setShippingCost(0); setEdd(null); }
                      }} />
                      {country === "IN" && checkingPin && <div className="flex items-center gap-2 mt-2 text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /><span className="font-body text-xs">Checking…</span></div>}
                      {country === "IN" && pinServiceable === true && (
                        <div className="mt-2 space-y-0.5">
                          <div className="flex items-center gap-2 text-green-600">
                            <Truck className="w-3.5 h-3.5" />
                            <span className="font-body text-xs font-semibold">{courierName} • ₹{shippingCost}</span>
                          </div>
                          {edd && <p className="font-body text-[11px] text-muted-foreground">Expected Delivery by <strong className="text-foreground">{edd}</strong></p>}
                        </div>
                      )}
                      {country === "IN" && pinServiceable === false && <div className="flex items-center gap-2 mt-2 text-destructive"><AlertTriangle className="w-3.5 h-3.5" /><span className="font-body text-xs font-semibold">Not deliverable</span></div>}
                      {country === "INT" && <p className="font-body text-[11px] text-muted-foreground mt-2">International shipping flat ₹2,500</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Payment Method</h2>

                {country === "IN" ? (
                  <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-muted/40 rounded-lg">
                    <button onClick={() => setPaymentTab("razorpay")} className={`flex items-center justify-center gap-2 py-2.5 rounded-md font-body text-xs font-bold tracking-wider uppercase transition-all ${paymentTab === "razorpay" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
                      <CreditCard className="w-3.5 h-3.5" /> UPI / Cards (India)
                    </button>
                    <button onClick={() => setPaymentTab("upi")} className={`flex items-center justify-center gap-2 py-2.5 rounded-md font-body text-xs font-bold tracking-wider uppercase transition-all ${paymentTab === "upi" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
                      <QrCode className="w-3.5 h-3.5" /> Scan & Pay
                    </button>
                  </div>
                ) : (
                  <div className="mb-5 p-3 bg-muted/40 rounded-lg flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="font-body text-xs text-muted-foreground">International orders are processed via <strong className="text-foreground">PayPal</strong> in USD.</span>
                  </div>
                )}

                {!isFormValid() ? (
                  <div className="bg-muted/30 border border-border/50 rounded-lg p-6 text-center">
                    <Lock className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                    <p className="font-body text-xs text-muted-foreground">Fill shipping details to unlock payment.</p>
                  </div>
                ) : country === "IN" && pinServiceable === false ? (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-center">
                    <p className="font-body text-xs text-destructive font-semibold">Delivery not available at your pincode.</p>
                  </div>
                ) : country === "IN" && paymentTab === "razorpay" ? (
                  <div className="space-y-4">
                    <div className="bg-foreground text-background rounded-md p-4">
                      <p className="font-body text-[10px] uppercase tracking-wider text-background/60">Amount Payable</p>
                      <p className="font-display text-2xl font-bold">₹{total.toLocaleString()}</p>
                    </div>
                    <button onClick={handleRazorpay} disabled={processingRazorpay}
                      className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                      {processingRazorpay ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                      Pay via UPI / Cards (India)
                    </button>
                    <p className="font-body text-[11px] text-muted-foreground text-center">Powered by Razorpay • UPI, Cards, Netbanking, Wallets</p>
                  </div>
                ) : country === "IN" && paymentTab === "upi" ? (
                  <div className="space-y-4">
                    {!upiConfig.vpa && !upiConfig.qr_url ? (
                      <div className="bg-muted/30 border border-border/50 rounded-lg p-6 text-center">
                        <p className="font-body text-xs text-muted-foreground">UPI not configured yet. Please use Razorpay above.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          {upiConfig.qr_url && (
                            <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-center">
                              <img src={upiConfig.qr_url} alt="UPI QR Code" className="w-44 h-44 object-contain" />
                            </div>
                          )}
                          <div className="space-y-3">
                            <p className="font-body text-xs text-muted-foreground leading-relaxed">
                              Scan this QR using <strong className="text-foreground">GPay, PhonePe, Paytm</strong> or any UPI app to complete your luxury purchase.
                            </p>
                            {upiConfig.vpa && (
                              <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                                <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground mb-1">UPI ID</p>
                                <p className="font-body text-sm font-bold text-foreground select-all">{upiConfig.vpa}</p>
                              </div>
                            )}
                            <div className="bg-foreground text-background rounded-md p-3">
                              <p className="font-body text-[10px] uppercase tracking-wider text-background/60">Amount Payable</p>
                              <p className="font-display text-2xl font-bold">₹{total.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Enter UPI Transaction ID (UTR) *</label>
                          <input className={inputCls} placeholder="e.g. 412345678901" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
                          <p className="font-body text-[11px] text-muted-foreground mt-1.5">After payment, paste the 12-digit UTR from your UPI app.</p>
                        </div>
                        <button onClick={handleUpiSubmit} disabled={submittingUpi}
                          className="w-full py-3 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                          {submittingUpi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                          Submit for Verification
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  // International → PayPal
                  // PASTE PAYPAL CLIENT ID HERE — via VITE_PAYPAL_CLIENT_ID env
                  <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
                    <PayPalButtons
                      style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                      createOrder={async () => {
                        const dbOrderId = orderId || await createOrderRecord("paypal");
                        if (!dbOrderId) throw new Error("Order creation failed");
                        const { data, error } = await supabase.functions.invoke("paypal", {
                          body: { action: "create_order", payload: { amount_inr: total, order_number: dbOrderId } },
                        });
                        if (error || !data?.id) throw new Error("PayPal order failed");
                        return data.id;
                      }}
                      onApprove={async (data) => {
                        const { data: result, error } = await supabase.functions.invoke("paypal", {
                          body: { action: "capture_order", payload: { paypal_order_id: data.orderID, order_db_id: orderId } },
                        });
                        if (error) { toast.error(error.message); return; }
                        if (result?.status === "COMPLETED") {
                          clearCart();
                          toast.success("Payment successful! 🎉");
                          navigate(`/orders/${orderId}`);
                        } else { toast.error("Payment not completed"); }
                      }}
                      onError={(err) => { console.error(err); toast.error("PayPal error"); }}
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

            {/* Order Summary */}
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
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={effectiveShipping === 0 ? "text-muted-foreground" : ""}>
                      {effectiveShipping > 0 ? `₹${effectiveShipping.toLocaleString()}` : (country === "IN" ? "Enter PIN" : "—")}
                    </span>
                  </div>
                  {edd && <p className="font-body text-[11px] text-green-700">Expected Delivery by <strong>{edd}</strong></p>}
                  <div className="border-t border-border/50 pt-3 flex justify-between">
                    <span className="font-body text-base font-bold text-foreground">Total</span>
                    <span className="font-display text-xl font-bold text-foreground">₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[{ icon: Shield, label: "Secure Checkout" }, { icon: Lock, label: "Verified Payment" }].map((b) => (
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
