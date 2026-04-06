import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Crown, Package, Users, Settings, Edit3, Image, DollarSign, BarChart3, LogOut, Plus, Trash2, Save, Eye, ShoppingBag, FileText, Shield } from "lucide-react";
import mishiLogo from "@/assets/mishi-logo.jpg";

interface AdminUser {
  email: string;
  name: string;
  role: string;
}

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "content", label: "Content", icon: Edit3 },
  { id: "media", label: "Media", icon: Image },
  { id: "users", label: "Users", icon: Users },
  { id: "policies", label: "Policies", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

const sampleProducts = [
  { id: 1, name: "Royal Crown Ring", price: "₹2,499", category: "Fine Jewellery", status: "Active" },
  { id: 2, name: "1 Carat Solitaire Ring", price: "₹45,999", category: "Lab Diamonds", status: "Active" },
  { id: 3, name: "MISHI Logo Hoodie", price: "₹2,499", category: "Streetwear", status: "Active" },
  { id: 4, name: "King's Chronograph", price: "₹8,999", category: "Custom Watches", status: "Draft" },
  { id: 5, name: "Banarasi Silk Saree", price: "₹8,999", category: "Traditional Wear", status: "Active" },
];

const sampleOrders = [
  { id: "MISHI-001", customer: "Rahul S.", amount: "₹4,598", status: "Processing", date: "2024-12-28" },
  { id: "MISHI-002", customer: "Priya M.", amount: "₹52,999", status: "Shipped", date: "2024-12-27" },
  { id: "MISHI-003", customer: "Amit K.", amount: "₹2,499", status: "Delivered", date: "2024-12-25" },
];

const AdminDashboardPage = () => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem("mishi_admin");
    if (!stored) {
      navigate("/admin");
      return;
    }
    setAdmin(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("mishi_admin");
    navigate("/admin");
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-foreground text-background min-h-screen p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <img src={mishiLogo} alt="MISHI" className="h-8 w-auto brightness-[10]" />
          <div>
            <p className="font-display text-sm font-bold text-background">MISHI</p>
            <p className="font-body text-[10px] text-background/40 tracking-wider uppercase">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-body text-xs font-medium tracking-wider transition-colors ${
                activeTab === tab.id
                  ? "bg-primary/20 text-primary"
                  : "text-background/50 hover:text-background hover:bg-background/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-background/10 pt-4 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <Crown className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-body text-xs font-semibold text-background">{admin.name}</p>
              <p className="font-body text-[10px] text-background/40">{admin.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md font-body text-xs text-background/40 hover:text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {activeTab === "overview" && "Empire Overview"}
              {activeTab === "products" && "Product Management"}
              {activeTab === "orders" && "Order Management"}
              {activeTab === "content" && "Content Editor — God Mode"}
              {activeTab === "media" && "Media Library"}
              {activeTab === "users" && "Admin Users"}
              {activeTab === "policies" && "Policy Editor"}
              {activeTab === "settings" && "Empire Settings"}
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {admin.role === "Co-Founder" ? "Shrimati Ji's Command View" : "God Mode Active — Total Control"}
            </p>
          </div>
          <Link to="/" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-foreground font-body text-xs font-semibold tracking-wider uppercase rounded-md hover:bg-primary/20 transition-colors">
            <Eye className="w-3.5 h-3.5" /> View Storefront
          </Link>
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: "₹3,45,897", icon: DollarSign, change: "+12.5%" },
                { label: "Orders", value: "47", icon: ShoppingBag, change: "+8.2%" },
                { label: "Products", value: "38", icon: Package, change: "+3" },
                { label: "Members", value: "234", icon: Users, change: "+18" },
              ].map((stat) => (
                <div key={stat.label} className="bg-background rounded-xl p-6 border border-border/50 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-body text-xs font-semibold text-green-600">{stat.change}</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-background rounded-xl p-6 border border-border/50">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3">Order</th>
                      <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3">Customer</th>
                      <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3">Amount</th>
                      <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3">Status</th>
                      <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/30">
                        <td className="font-body text-sm font-semibold text-foreground py-3">{order.id}</td>
                        <td className="font-body text-sm text-foreground py-3">{order.customer}</td>
                        <td className="font-body text-sm font-bold text-foreground py-3">{order.amount}</td>
                        <td className="py-3">
                          <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${
                            order.status === "Delivered" ? "bg-green-100 text-green-700" :
                            order.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                            "bg-primary/20 text-primary-foreground"
                          }`}>{order.status}</span>
                        </td>
                        <td className="font-body text-sm text-muted-foreground py-3">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-body text-sm text-muted-foreground">{sampleProducts.length} products</p>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-body text-xs font-bold tracking-wider uppercase rounded-md shimmer">
                <Plus className="w-3.5 h-3.5" /> Add Product
              </button>
            </div>
            <div className="bg-background rounded-xl border border-border/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">Product</th>
                    <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">Price</th>
                    <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">Category</th>
                    <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">Status</th>
                    <th className="text-right font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="font-body text-sm font-semibold text-foreground py-3 px-4">{product.name}</td>
                      <td className="font-body text-sm font-bold text-foreground py-3 px-4">{product.price}</td>
                      <td className="font-body text-xs text-muted-foreground py-3 px-4">{product.category}</td>
                      <td className="py-3 px-4">
                        <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${
                          product.status === "Active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                        }`}>{product.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Editor */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="bg-background rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Hero Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">Tagline Line 1</label>
                  <input defaultValue="Where Love" className="w-full px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">Tagline Line 2</label>
                  <input defaultValue="Unites Empires" className="w-full px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">Subtitle</label>
                  <textarea defaultValue="A Royal Legacy of Fine Jewellery, Lab Grown Diamonds & Premium Fashion — Built on a Sacred Promise" rows={2} className="w-full px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-body text-xs font-bold tracking-wider uppercase rounded-md">
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </div>

            <div className="bg-background rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">About — Royal Dastaan</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">King's Description</label>
                  <textarea rows={4} defaultValue="Born in the heart of India, raised with the roar of a lion..." className="w-full px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">Shrimati Ji's Description</label>
                  <textarea rows={4} defaultValue="The grace behind the throne. The lioness whose quiet elegance speaks louder than any crown..." className="w-full px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-body text-xs font-bold tracking-wider uppercase rounded-md">
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Media */}
        {activeTab === "media" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-body text-sm text-muted-foreground">Upload images, 3D files (.glb/.gltf), and 4K videos</p>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-body text-xs font-bold tracking-wider uppercase rounded-md">
                <Plus className="w-3.5 h-3.5" /> Upload Media
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Hero Banner", "King Avatar", "Shrimati Ji Avatar", "Logo"].map((name) => (
                <div key={name} className="bg-background rounded-xl border border-border/50 overflow-hidden group">
                  <div className="aspect-square bg-gradient-to-br from-lavender/30 to-teal-light/20 flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-body text-xs font-semibold text-foreground">{name}</span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="bg-background rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Admin Accounts</h3>
              <div className="space-y-4">
                {[
                  { name: "The King", email: "mishiofficial1701@gmail.com", role: "Founder", status: "Active" },
                  { name: "Shrimati Ji", email: "shrimatiji@mishiofficial.com", role: "Co-Founder", status: "Active" },
                ].map((user) => (
                  <div key={user.email} className="flex items-center justify-between p-4 rounded-lg border border-border/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-royal-glow" />
                      </div>
                      <div>
                        <p className="font-body text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="font-body text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-body text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-foreground">{user.role}</span>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-green-600" />
                        <span className="font-body text-[10px] text-green-600 font-semibold">2FA On</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Policies */}
        {activeTab === "policies" && (
          <div className="space-y-6">
            {["15-Day Delivery Policy", "4-Day Return Policy", "Mandatory Unboxing Video", "Pre-Paid Only Policy"].map((policy) => (
              <div key={policy} className="bg-background rounded-xl border border-border/50 p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">{policy}</h3>
                <textarea rows={4} className="w-full px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" defaultValue={`Edit the ${policy} content here...`} />
                <button className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-body text-xs font-bold tracking-wider uppercase rounded-md">
                  <Save className="w-3.5 h-3.5" /> Update Policy
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-background rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Store Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">Store Name</label>
                  <input defaultValue="MISHI Official" className="w-full px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">Contact Email</label>
                  <input defaultValue="mishiofficial1701@gmail.com" className="w-full px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">Instagram Handle</label>
                  <input defaultValue="@mishiofficial" className="w-full px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-body text-xs font-bold tracking-wider uppercase rounded-md">
                  <Save className="w-3.5 h-3.5" /> Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
