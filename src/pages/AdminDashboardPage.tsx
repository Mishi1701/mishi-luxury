import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Crown, Package, Users, Settings, Edit3, Image, DollarSign, BarChart3, LogOut, Plus, Trash2, Save, Eye, ShoppingBag, FileText, Shield, X, Upload, Video, ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import mishiLogo from "@/assets/mishi-logo.jpg";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

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

const categories = ["Fine Jewellery", "Lab Diamonds", "Royal Apparel", "Streetwear", "Traditional Wear", "Custom Watches"];

const AdminDashboardPage = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Tables<"orders">[]>([]);
  const [editProduct, setEditProduct] = useState<Partial<Product & { video_url?: string | null }> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const handleSaveProduct = async () => {
    if (!editProduct?.name || !editProduct?.price || !editProduct?.category) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }

    if (editProduct.id) {
      const { error } = await supabase.from("products").update({
        name: editProduct.name,
        price: editProduct.price,
        category: editProduct.category,
        description: editProduct.description,
        tag: editProduct.tag,
        status: editProduct.status || "active",
        image_url: editProduct.image_url,
      }).eq("id", editProduct.id);
      if (error) {
        toast({ title: "Error updating", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Product updated 👑" });
      }
    } else {
      const { error } = await supabase.from("products").insert({
        name: editProduct.name,
        price: editProduct.price,
        category: editProduct.category,
        description: editProduct.description,
        tag: editProduct.tag,
        status: editProduct.status || "active",
        image_url: editProduct.image_url,
      });
      if (error) {
        toast({ title: "Error adding", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Product added 👑" });
      }
    }
    setEditProduct(null);
    setShowAddForm(false);
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product deleted" });
      fetchProducts();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  if (loading || !user) return null;

  const formatPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

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
                activeTab === tab.id ? "bg-primary/20 text-primary" : "text-background/50 hover:text-background hover:bg-background/5"
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
              <p className="font-body text-xs font-semibold text-background">{user.email}</p>
              <p className="font-body text-[10px] text-background/40">Admin</p>
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
              {tabs.find(t => t.id === activeTab)?.label || "Overview"}
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">God Mode Active — Total Control</p>
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
                { label: "Products", value: String(products.length), icon: Package },
                { label: "Orders", value: String(orders.length), icon: ShoppingBag },
                { label: "Revenue", value: formatPrice(orders.reduce((s, o) => s + o.total, 0)), icon: DollarSign },
                { label: "Active Products", value: String(products.filter(p => p.status === "active").length), icon: BarChart3 },
              ].map((stat) => (
                <div key={stat.label} className="bg-background rounded-xl p-6 border border-border/50 shadow-sm">
                  <stat.icon className="w-5 h-5 text-muted-foreground mb-3" />
                  <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-body text-sm text-muted-foreground">{products.length} products</p>
              <button onClick={() => { setEditProduct({ status: "active" }); setShowAddForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-body text-xs font-bold tracking-wider uppercase rounded-md shimmer">
                <Plus className="w-3.5 h-3.5" /> Add Product
              </button>
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || editProduct?.id) && editProduct && (
              <div className="bg-background rounded-xl border border-primary/30 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-lg font-semibold">{editProduct.id ? "Edit Product" : "New Product"}</h3>
                  <button onClick={() => { setEditProduct(null); setShowAddForm(false); }}><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1 block">Name</label>
                    <input value={editProduct.name || ""} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1 block">Price (₹)</label>
                    <input type="number" value={editProduct.price || ""} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div>
                    <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1 block">Category</label>
                    <select value={editProduct.category || ""} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1 block">Tag</label>
                    <input value={editProduct.tag || ""} onChange={(e) => setEditProduct({ ...editProduct, tag: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Bestseller, New, Limited..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1 block">Description</label>
                    <textarea value={editProduct.description || ""} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                  </div>
                  <div>
                    <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1 block">Status</label>
                    <select value={editProduct.status || "active"} onChange={(e) => setEditProduct({ ...editProduct, status: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleSaveProduct} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-body text-xs font-bold tracking-wider uppercase rounded-md shimmer">
                  <Save className="w-3.5 h-3.5" /> {editProduct.id ? "Update Product" : "Add Product"}
                </button>
              </div>
            )}

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
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="font-body text-sm font-semibold text-foreground py-3 px-4">
                        {product.name}
                        {product.tag && <span className="ml-2 text-[10px] font-bold text-primary">{product.tag}</span>}
                      </td>
                      <td className="font-body text-sm font-bold text-foreground py-3 px-4">{formatPrice(product.price)}</td>
                      <td className="font-body text-xs text-muted-foreground py-3 px-4">{product.category}</td>
                      <td className="py-3 px-4">
                        <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${
                          product.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                        }`}>{product.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditProduct(product)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="bg-background rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">Order</th>
                  <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">Customer</th>
                  <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">Amount</th>
                  <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">Status</th>
                  <th className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 font-body text-sm text-muted-foreground">No orders yet</td></tr>
                ) : orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/30">
                    <td className="font-body text-sm font-semibold text-foreground py-3 px-4">{order.order_number}</td>
                    <td className="font-body text-sm text-foreground py-3 px-4">{order.customer_name || "—"}</td>
                    <td className="font-body text-sm font-bold text-foreground py-3 px-4">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${
                        order.status === "delivered" ? "bg-green-100 text-green-700" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                        "bg-primary/20 text-foreground"
                      }`}>{order.status}</span>
                    </td>
                    <td className="font-body text-sm text-muted-foreground py-3 px-4">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <p className="font-body text-sm text-muted-foreground">Upload images, 3D files (.glb/.gltf), and 4K videos</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Hero Banner", "King Avatar", "Shrimati Ji Avatar", "Logo"].map((name) => (
                <div key={name} className="bg-background rounded-xl border border-border/50 overflow-hidden group">
                  <div className="aspect-square bg-gradient-to-br from-lavender/30 to-teal-light/20 flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <div className="p-3">
                    <span className="font-body text-xs font-semibold text-foreground">{name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="bg-background rounded-xl border border-border/50 p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Admin Accounts</h3>
            <p className="font-body text-sm text-muted-foreground mb-4">
              To add admin users, sign them up and then assign the admin role via Lovable Cloud → Database → user_roles table.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border/30">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-foreground">{user.email}</p>
                <p className="font-body text-xs text-muted-foreground">Current Admin</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span className="font-body text-[10px] text-green-600 font-semibold">Authenticated</span>
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
          <div className="bg-background rounded-xl border border-border/50 p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Store Settings</h3>
            <div className="space-y-4">
              {[
                { label: "Store Name", value: "MISHI Official" },
                { label: "Contact Email", value: "mishiofficial1701@gmail.com" },
                { label: "Instagram Handle", value: "@mishiofficial" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">{label}</label>
                  <input defaultValue={value} className="w-full px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              ))}
              <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-body text-xs font-bold tracking-wider uppercase rounded-md">
                <Save className="w-3.5 h-3.5" /> Save Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
