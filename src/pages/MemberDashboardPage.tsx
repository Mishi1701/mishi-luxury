import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Crown, Package, Heart, Clock, MapPin, ChevronRight, Palette } from "lucide-react";

const sampleOrders = [
  { id: "MISHI-001", items: "Royal Crown Ring × 1", total: "₹2,499", status: "Delivered", date: "Dec 25, 2024" },
  { id: "MISHI-002", items: "Empire Bracelet × 1, Sacred Pendant × 1", total: "₹5,198", status: "Shipped", date: "Dec 28, 2024" },
  { id: "MISHI-003", items: "Custom Engagement Ring", total: "₹18,999", status: "Crafting", date: "Jan 2, 2025" },
];

const savedDesigns = [
  { name: "Custom Solitaire Ring", category: "Fine Jewellery", budget: "₹15,000 - ₹50,000", status: "Under Review" },
  { name: "Personalized Bracelet", category: "Fine Jewellery", budget: "Under ₹5,000", status: "Approved" },
];

const MemberDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-lavender/40 flex items-center justify-center border-2 border-primary/30">
              <Crown className="w-7 h-7 text-royal-glow" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Welcome Back, Royal Member</h1>
              <p className="font-body text-sm text-muted-foreground">Your Empire Dashboard</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-fade-up delay-100">
            {[
              { label: "Total Orders", value: "3", icon: Package },
              { label: "Wishlist", value: "7", icon: Heart },
              { label: "Custom Designs", value: "2", icon: Palette },
              { label: "Reward Points", value: "450", icon: Crown },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-5 text-center">
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-royal-glow" />
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Order History */}
          <div className="mb-10 animate-fade-up delay-200">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Order History</h2>
            <div className="space-y-3">
              {sampleOrders.map((order) => (
                <div key={order.id} className="glass-card rounded-xl p-5 flex items-center justify-between hover:shadow-[var(--shadow-gold)] transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-royal-glow" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground">{order.id}</p>
                      <p className="font-body text-xs text-muted-foreground">{order.items}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-body text-sm font-bold text-foreground">{order.total}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                        order.status === "Delivered" ? "bg-green-500" :
                        order.status === "Shipped" ? "bg-blue-500" : "bg-primary"
                      }`} />
                      <span className="font-body text-xs text-muted-foreground">{order.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Custom Designs */}
          <div className="animate-fade-up delay-300">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Saved Custom Designs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedDesigns.map((design) => (
                <div key={design.name} className="glass-card rounded-xl p-5 hover:shadow-[var(--shadow-gold)] transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground">{design.name}</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">{design.category} • {design.budget}</p>
                    </div>
                    <span className={`font-body text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                      design.status === "Approved" ? "bg-green-100 text-green-700" : "bg-primary/10 text-foreground"
                    }`}>
                      {design.status}
                    </span>
                  </div>
                </div>
              ))}
              <Link
                to="/custom-orders"
                className="flex items-center justify-center gap-2 border-2 border-dashed border-border/50 rounded-xl p-5 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <Palette className="w-4 h-4" />
                <span className="font-body text-sm font-semibold">New Custom Design</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MemberDashboardPage;
