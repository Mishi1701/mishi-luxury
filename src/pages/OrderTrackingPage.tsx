import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Package, Truck, CheckCircle2, Clock, MapPin, ArrowLeft,
  Crown, Loader2, AlertTriangle, Phone, Mail, RefreshCw,
} from "lucide-react";

interface OrderData {
  id: string;
  order_number: string;
  items: any[];
  total: number;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  created_at: string;
}

const STATUS_STEPS = [
  { key: "processing", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
];

const getStepIndex = (status: string) => {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
};

const OrderTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    if (!user || !orderId) return;
    setLoading(true);
    setError("");

    const { data, error: fetchErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchErr || !data) {
      setError("Order not found");
    } else {
      setOrder(data as OrderData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [user, orderId]);

  const currentStep = order ? getStepIndex(order.status) : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-20 text-center">
          <Crown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sign in to track orders</h2>
          <Link to="/login" className="inline-block mt-4 px-8 py-3 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md">
            Sign In
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/dashboard" className="inline-flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
              <p className="font-body text-sm text-muted-foreground">Loading order details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertTriangle className="w-10 h-10 mx-auto text-destructive mb-4" />
              <p className="font-body text-sm text-muted-foreground">{error}</p>
            </div>
          ) : order ? (
            <div className="space-y-6 animate-fade-up">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    Order #{order.order_number}
                  </h1>
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <button onClick={fetchOrder} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Refresh">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Progress Tracker */}
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-display text-base font-semibold text-foreground mb-6">Order Status</h2>
                <div className="flex items-center justify-between relative">
                  {/* Progress line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
                  <div
                    className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                    style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />

                  {STATUS_STEPS.map((step, i) => {
                    const isCompleted = i <= currentStep;
                    const isCurrent = i === currentStep;
                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background border-border text-muted-foreground"
                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        <span className={`font-body text-[10px] mt-2 font-semibold tracking-wider uppercase ${
                          isCompleted ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items */}
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-display text-base font-semibold text-foreground mb-4">Items</h2>
                <div className="space-y-3">
                  {(order.items as any[]).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md bg-secondary/50 flex items-center justify-center overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">👑</span>
                          )}
                        </div>
                        <div>
                          <p className="font-body text-sm font-semibold text-foreground">{item.name}</p>
                          <p className="font-body text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-body text-sm font-bold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/50 mt-4 pt-4 flex justify-between">
                  <span className="font-body text-sm font-bold text-foreground">Total</span>
                  <span className="font-display text-lg font-bold text-foreground">₹{order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Shipping & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.shipping_address && (
                  <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h3 className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground">Shipping Address</h3>
                    </div>
                    <p className="font-body text-sm text-foreground leading-relaxed">{order.shipping_address}</p>
                  </div>
                )}
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <h3 className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground">Contact</h3>
                  </div>
                  <div className="space-y-1.5">
                    {order.customer_name && <p className="font-body text-sm text-foreground">{order.customer_name}</p>}
                    {order.customer_phone && (
                      <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> {order.customer_phone}
                      </p>
                    )}
                    {order.customer_email && (
                      <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> {order.customer_email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Help */}
              <div className="bg-muted/30 border border-border/30 rounded-lg p-4 text-center">
                <p className="font-body text-xs text-muted-foreground">
                  Need help? Contact us on WhatsApp or use the{" "}
                  <span className="text-foreground font-semibold">Style Expert</span> chatbot below.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
