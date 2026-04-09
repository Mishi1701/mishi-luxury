import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Package, Heart, Clock, ChevronRight, Palette, Loader2, LogOut } from "lucide-react";

const MemberDashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user, navigate]);

  if (!user) return null;

  const statusColor = (s: string) =>
    s === "delivered" ? "bg-green-500" : s === "shipped" ? "bg-blue-500" : s === "confirmed" ? "bg-teal-500" : "bg-primary";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-10 animate-fade-up">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-lavender/40 flex items-center justify-center border-2 border-primary/30">
                <Crown className="w-6 h-6 text-royal-glow" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Welcome Back</h1>
                <p className="font-body text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <button onClick={() => signOut()} className="font-body text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10 animate-fade-up">
            {[
              { label: "Total Orders", value: orders.length.toString(), icon: Package },
              { label: "Active", value: orders.filter(o => o.status !== "delivered").length.toString(), icon: Clock },
              { label: "Delivered", value: orders.filter(o => o.status === "delivered").length.toString(), icon: Heart },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-5 text-center">
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-royal-glow" />
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Orders */}
          <div className="animate-fade-up">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Your Orders</h2>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="glass-card rounded-xl p-10 text-center">
                <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-body text-sm text-muted-foreground mb-4">No orders yet. Start your royal collection!</p>
                <Link to="/collections/all" className="inline-block px-6 py-2.5 bg-primary text-primary-foreground font-body text-xs font-bold tracking-widest uppercase rounded-md">
                  Browse Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="glass-card rounded-xl p-5 flex items-center justify-between hover:shadow-[var(--shadow-gold)] transition-shadow block"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-royal-glow" />
                      </div>
                      <div>
                        <p className="font-body text-sm font-semibold text-foreground">{order.order_number}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-body text-sm font-bold text-foreground">₹{order.total.toLocaleString()}</p>
                        <div className="flex items-center gap-1.5 mt-1 justify-end">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusColor(order.status)}`} />
                          <span className="font-body text-xs text-muted-foreground capitalize">{order.status}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Custom Design CTA */}
          <div className="mt-10 animate-fade-up">
            <Link
              to="/custom-orders"
              className="glass-card rounded-xl p-6 flex items-center gap-4 hover:shadow-[var(--shadow-gold)] transition-shadow block"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Palette className="w-4 h-4 text-royal-glow" />
              </div>
              <div className="flex-1">
                <p className="font-body text-sm font-semibold text-foreground">Request Custom Design</p>
                <p className="font-body text-xs text-muted-foreground">Get a personalized piece crafted just for you</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MemberDashboardPage;
