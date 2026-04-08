import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Shield, Lock, CreditCard, Smartphone, ArrowLeft, Crown,
  CheckCircle2, AlertTriangle, Loader2, MapPin, Truck,
} from "lucide-react";

interface AddressForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const PICKUP_PINCODE = "462001"; // MISHI warehouse pincode

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [placing, setPlacing] = useState(false);
  const [checkingPin, setCheckingPin] = useState(false);
  const [pinServiceable, setPinServiceable] = useState<boolean | null>(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  const [form, setForm] = useState<AddressForm>({
    firstName: "",
    lastName: "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const set = (key: keyof AddressForm, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const subtotal = totalPrice;
  const gst = Math.round(subtotal * 0.03);
  const shipping = 0;
  const total = subtotal + gst + shipping;

  // ── Shiprocket Serviceability Check ──
  const checkServiceability = async (pin: string) => {
    if (pin.length !== 6) {
      setPinServiceable(null);
      setDeliveryEstimate(null);
      return;
    }
    setCheckingPin(true);
    try {
      const { data, error } = await supabase.functions.invoke("shiprocket", {
        body: {
          action: "check_serviceability",
          payload: {
            pickup_postcode: PICKUP_PINCODE,
            delivery_postcode: pin,
            weight: 0.5,
            cod: false,
          },
        },
      });
      if (error) throw error;

      const couriers = data?.data?.available_courier_companies;
      if (couriers && couriers.length > 0) {
        setPinServiceable(true);
        const etd = couriers[0]?.etd;
        setDeliveryEstimate(etd ? `Estimated delivery: ${etd}` : "Delivery available");
      } else {
        setPinServiceable(false);
        setDeliveryEstimate(null);
      }
    } catch {
      setPinServiceable(null);
      setDeliveryEstimate(null);
    } finally {
      setCheckingPin(false);
    }
  };

  // ── Validation ──
  const isFormValid = () => {
    const { firstName, lastName, phone, email, address, city, state, pincode } = form;
    return (
      firstName.trim() &&
      lastName.trim() &&
      phone.trim().length >= 10 &&
      email.trim().includes("@") &&
      address.trim() &&
      city.trim() &&
      state.trim() &&
      pincode.length === 6 &&
      items.length > 0
    );
  };

  // ── Place Order ──
  const placeOrder = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/login");
      return;
    }
    if (!isFormValid()) {
      toast.error("Please fill all fields correctly");
      return;
    }
    if (pinServiceable === false) {
      toast.error("Delivery not available at this pincode");
      return;
    }

    setPlacing(true);
    try {
      const orderNumber = `MISHI-${Date.now().toString(36).toUpperCase()}`;
      const fullAddress = `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`;

      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        order_number: orderNumber,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image_url: i.image_url,
        })),
        total,
        status: "processing",
        customer_name: `${form.firstName} ${form.lastName}`,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: fullAddress,
      });

      if (error) throw error;

      clearCart();
      toast.success("Order placed successfully! 🎉", {
        description: `Order #${orderNumber}`,
      });
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-20 text-center">
          <Crown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <p className="font-body text-sm text-muted-foreground mb-6">Add some royal pieces before checkout</p>
          <Link to="/collections/all" className="inline-block px-8 py-3 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md">
            Browse Collection
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 border border-border rounded-md font-body text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors";
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
            {/* Left - Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Shipping Address */}
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>First Name *</label>
                      <input className={inputCls} placeholder="First name" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name *</label>
                      <input className={inputCls} placeholder="Last name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Phone (WhatsApp) *</label>
                      <input className={inputCls} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Email *</label>
                      <input className={inputCls} placeholder="your@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Address *</label>
                    <input className={inputCls} placeholder="House no., Building, Street" value={form.address} onChange={(e) => set("address", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>City *</label>
                      <input className={inputCls} placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>State *</label>
                      <input className={inputCls} placeholder="State" value={form.state} onChange={(e) => set("state", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>PIN Code *</label>
                      <input
                        className={inputCls}
                        placeholder="000000"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          set("pincode", val);
                          if (val.length === 6) checkServiceability(val);
                          else { setPinServiceable(null); setDeliveryEstimate(null); }
                        }}
                      />
                      {/* Serviceability indicator */}
                      {checkingPin && (
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="font-body text-xs">Checking delivery...</span>
                        </div>
                      )}
                      {pinServiceable === true && (
                        <div className="flex items-center gap-2 mt-2 text-green-600">
                          <Truck className="w-3.5 h-3.5" />
                          <span className="font-body text-xs font-semibold">{deliveryEstimate || "Delivery available"}</span>
                        </div>
                      )}
                      {pinServiceable === false && (
                        <div className="flex items-center gap-2 mt-2 text-destructive">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="font-body text-xs font-semibold">Delivery not available at this pincode</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Payment Method</h2>
                <div className="space-y-3 mb-4">
                  <button
                    onClick={() => setPaymentMethod("upi")}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-foreground" />
                    <div className="text-left flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">UPI</p>
                      <p className="font-body text-xs text-muted-foreground">GPay, PhonePe, BHIM, Paytm</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "upi" ? "border-primary bg-primary" : "border-border"}`} />
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-foreground" />
                    <div className="text-left flex-1">
                      <p className="font-body text-sm font-semibold text-foreground">Credit / Debit Card</p>
                      <p className="font-body text-xs text-muted-foreground">Visa, Mastercard, RuPay</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "card" ? "border-primary bg-primary" : "border-border"}`} />
                  </button>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-body text-xs font-bold text-foreground mb-1">100% Pre-Paid Orders Only</p>
                      <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                        Due to exclusive customization and premium quality assurance, we only accept 100% pre-paid orders.
                        No COD available. No returns on personalized items. All orders include a mandatory unboxing video requirement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal */}
              <div className="bg-muted/30 border border-border/30 rounded-lg p-4">
                <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                  By placing this order, you agree to MISHI Official's{" "}
                  <Link to="/policies" className="text-foreground underline">15-Day Delivery Policy</Link>,{" "}
                  <Link to="/policies" className="text-foreground underline">4-Day Return Policy</Link> (with mandatory unboxing video),
                  and our 100% pre-paid payment terms. No returns on personalized or custom-made items.
                </p>
              </div>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-xl p-6 sticky top-28">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Order Summary</h2>

                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md bg-secondary/50 flex items-center justify-center overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">👑</span>
                          )}
                        </div>
                        <div>
                          <p className="font-body text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                          <p className="font-body text-[11px] text-muted-foreground">{item.category} × {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-body text-sm font-bold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/50 pt-4 space-y-2">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">GST (3%)</span>
                    <span className="text-foreground">₹{gst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="border-t border-border/50 pt-3 flex justify-between">
                    <span className="font-body text-base font-bold text-foreground">Total</span>
                    <span className="font-display text-xl font-bold text-foreground">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={placing || !isFormValid()}
                  className="w-full mt-6 py-4 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {placing ? (
                    <><Loader2 className="w-4 h-4 inline mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <><Lock className="w-4 h-4 inline mr-2" /> Pay ₹{total.toLocaleString()}</>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { icon: Shield, label: "Secure Checkout" },
                    { icon: CheckCircle2, label: "Authentic Moissanite" },
                    { icon: Lock, label: "SSL Encrypted" },
                    { icon: Crown, label: "925 Hallmarked" },
                  ].map((badge) => (
                    <div key={badge.label} className="flex items-center gap-2 py-2">
                      <badge.icon className="w-3.5 h-3.5 text-royal-glow shrink-0" />
                      <span className="font-body text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">{badge.label}</span>
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
