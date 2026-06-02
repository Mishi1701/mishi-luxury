import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Crown, Package, Users, Settings, Edit3, Image as ImageIcon, DollarSign, BarChart3, LogOut, Plus, Trash2, Save, Eye, ShoppingBag, FileText, Shield, X, Upload, Video, Loader2, Sparkles, Star, MessageSquare, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import mishiLogo from "@/assets/mishi-logo.jpg";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
type Review = Tables<"reviews">;
type Order = Tables<"orders">;
type Coupon = { id: string; code: string; discount_type: string; discount_value: number; min_subtotal: number; max_uses: number | null; used_count: number; expires_at: string | null; active: boolean; description: string | null; created_at: string };

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "coupons", label: "Owner's Discount", icon: Sparkles },
  { id: "branding", label: "Branding", icon: ImageIcon },
  { id: "payments", label: "Payments", icon: DollarSign },
  { id: "content", label: "Content", icon: Edit3 },
  { id: "policies", label: "Policies", icon: FileText },
  { id: "users", label: "Users", icon: Users },
];

const categories = ["Fine Jewellery", "Lab Diamonds", "Royal Apparel", "Streetwear", "Traditional Wear", "Custom Watches"];

const AdminDashboardPage = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Site content state
  const [hero, setHero] = useState({ title: "", subtitle: "" });
  const [socials, setSocials] = useState({ instagram: "", email: "", phone: "" });
  const [policies, setPolicies] = useState({ delivery: "", returns: "", privacy: "" });
  const [upiCfg, setUpiCfg] = useState({ vpa: "", qr_url: "", merchant_name: "MISHI Official" });
  const [branding, setBranding] = useState({ logo_url: "" });
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [savingContent, setSavingContent] = useState(false);

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({ code: "", discount_type: "percent", discount_value: 10, min_subtotal: 0, active: true });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/admin");
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchReviews();
    fetchContent();
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data } = await (supabase as any).from("coupons").select("*").order("created_at", { ascending: false });
    if (data) setCoupons(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const fetchReviews = async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (data) setReviews(data);
  };

  const fetchContent = async () => {
    const { data } = await supabase.from("site_content").select("*");
    data?.forEach((row) => {
      const c = row.content as any;
      if (row.section_key === "hero") setHero({ title: c.title || "", subtitle: c.subtitle || "" });
      if (row.section_key === "socials") setSocials({ instagram: c.instagram || "", email: c.email || "", phone: c.phone || "" });
      if (row.section_key === "policies") setPolicies({ delivery: c.delivery || "", returns: c.returns || "", privacy: c.privacy || "" });
      if (row.section_key === "upi_payment") setUpiCfg({ vpa: c.vpa || "", qr_url: c.qr_url || "", merchant_name: c.merchant_name || "MISHI Official" });
      if (row.section_key === "branding") setBranding({ logo_url: c.logo_url || "" });
    });
  };

  const uploadLogo = async (file: File) => {
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `branding/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-media").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("product-media").getPublicUrl(path);
      const next = { logo_url: urlData.publicUrl };
      setBranding(next);
      await saveContent("branding", next);
      toast({ title: "Logo updated — live across the site 👑" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setUploadingLogo(false); }
  };

  // ---------- COUPONS ----------
  const saveCoupon = async () => {
    if (!newCoupon.code?.trim() || !newCoupon.discount_value) return toast({ title: "Code & value required", variant: "destructive" });
    const payload = {
      code: newCoupon.code.trim().toUpperCase(),
      discount_type: newCoupon.discount_type || "percent",
      discount_value: Number(newCoupon.discount_value),
      min_subtotal: Number(newCoupon.min_subtotal || 0),
      max_uses: newCoupon.max_uses ? Number(newCoupon.max_uses) : null,
      expires_at: newCoupon.expires_at || null,
      active: newCoupon.active ?? true,
      description: newCoupon.description || null,
    };
    const { error } = await (supabase as any).from("coupons").insert(payload);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Coupon created 👑" });
    setNewCoupon({ code: "", discount_type: "percent", discount_value: 10, min_subtotal: 0, active: true });
    fetchCoupons();
  };

  const toggleCoupon = async (id: string, active: boolean) => {
    await (supabase as any).from("coupons").update({ active }).eq("id", id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await (supabase as any).from("coupons").delete().eq("id", id);
    fetchCoupons();
  };

  // ---------- ORDER ACTIONS ----------
  const acceptOrder = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    try {
      await supabase.functions.invoke("shiprocket", {
        body: { action: "create_shipment_from_order", payload: { order_db_id: orderId } },
      });
      toast({ title: "Order accepted & shipment created 👑" });
    } catch { toast({ title: "Accepted — shipment failed; create manually" }); }
    fetchOrders();
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Cancel this order?")) return;
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Order cancelled" });
    fetchOrders();
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Permanently delete this order? This cannot be undone.")) return;
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Order deleted" });
    fetchOrders();
  };


  const uploadQr = async (file: File) => {
    setUploadingQr(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `upi-qr/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-media").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("product-media").getPublicUrl(path);
      setUpiCfg((p) => ({ ...p, qr_url: urlData.publicUrl }));
      toast({ title: "QR uploaded — remember to Save 👑" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setUploadingQr(false); }
  };

  const verifyUpiOrder = async (orderId: string, approve: boolean) => {
    const { error } = await supabase.from("orders").update({
      status: approve ? "paid" : "payment_rejected",
    }).eq("id", orderId);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    if (approve) {
      // Auto-create shipment
      try {
        await supabase.functions.invoke("shiprocket", {
          body: { action: "create_shipment_from_order", payload: { order_db_id: orderId } },
        });
        toast({ title: "Verified & shipment created 👑" });
      } catch {
        toast({ title: "Verified — shipment failed (try manually)" });
      }
    } else toast({ title: "Order rejected" });
    fetchOrders();
  };

  const saveContent = async (key: string, content: object) => {
    setSavingContent(true);
    const { error } = await supabase.from("site_content").upsert([{ section_key: key, content: content as any }], { onConflict: "section_key" });
    setSavingContent(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Saved 👑", description: "Live on website now." });
  };

  const handleUploadFile = async (file: File, type: "image" | "video") => {
    const setter = type === "image" ? setUploadingImage : setUploadingVideo;
    setter(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${type}s/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-media").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("product-media").getPublicUrl(path);
      setEditProduct((p) => p ? { ...p, [type === "image" ? "image_url" : "video_url"]: urlData.publicUrl } : p);
      toast({ title: `${type === "image" ? "Photo" : "Video"} uploaded 👑` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally { setter(false); }
  };

  const generateAIDescription = async () => {
    if (!editProduct?.name || !editProduct?.category) {
      toast({ title: "Add name & category first", variant: "destructive" });
      return;
    }
    setGeneratingDesc(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-description", {
        body: { name: editProduct.name, category: editProduct.category, keywords: editProduct.tag },
      });
      if (error) throw error;
      if (data?.description) {
        setEditProduct({ ...editProduct, description: data.description });
        toast({ title: "AI Description ready ✨" });
      }
    } catch (err: any) {
      toast({ title: "AI failed", description: err.message, variant: "destructive" });
    } finally { setGeneratingDesc(false); }
  };

  const handleSaveProduct = async () => {
    if (!editProduct?.name || !editProduct?.price || !editProduct?.category) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    const payload = {
      name: editProduct.name, price: editProduct.price, category: editProduct.category,
      description: editProduct.description, tag: editProduct.tag,
      status: editProduct.status || "active",
      image_url: editProduct.image_url, video_url: editProduct.video_url || null,
    };
    const { error } = editProduct.id
      ? await supabase.from("products").update(payload).eq("id", editProduct.id)
      : await supabase.from("products").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: editProduct.id ? "Product updated 👑" : "Product added 👑" });
      setEditProduct(null);
      setShowAddForm(false);
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchProducts(); }
  };

  const moderateReview = async (id: string, approved: boolean) => {
    const { error } = await supabase.from("reviews").update({ approved }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: approved ? "Review approved" : "Review unpublished" }); fetchReviews(); }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Review deleted" }); fetchReviews(); }
  };

  const handleLogout = async () => { await signOut(); navigate("/admin"); };

  if (loading || !user) return null;

  const formatPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;
  const inputCls = "w-full px-3 py-2 border border-border rounded-md font-body text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelCls = "font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1 block";
  const btnPrimary = "flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-body text-xs font-bold tracking-wider uppercase rounded-md hover:opacity-90 transition-opacity disabled:opacity-50";

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
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-body text-xs font-medium tracking-wider transition-colors ${
                activeTab === tab.id ? "bg-primary/20 text-primary" : "text-background/50 hover:text-background hover:bg-background/5"
              }`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-background/10 pt-4 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center"><Crown className="w-4 h-4 text-primary" /></div>
            <div className="min-w-0">
              <p className="font-body text-xs font-semibold text-background truncate">{user.email}</p>
              <p className="font-body text-[10px] text-background/40">Admin</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md font-body text-xs text-background/40 hover:text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{tabs.find(t => t.id === activeTab)?.label}</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">God Mode Active — Total Control</p>
          </div>
          <Link to="/" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-foreground font-body text-xs font-semibold tracking-wider uppercase rounded-md hover:bg-primary/20 transition-colors">
            <Eye className="w-3.5 h-3.5" /> View Storefront
          </Link>
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Products", value: String(products.length), icon: Package },
              { label: "Orders", value: String(orders.length), icon: ShoppingBag },
              { label: "Revenue", value: formatPrice(orders.reduce((s, o) => s + o.total, 0)), icon: DollarSign },
              { label: "Pending Reviews", value: String(reviews.filter(r => !r.approved).length), icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="bg-background rounded-xl p-6 border border-border/50 shadow-sm">
                <stat.icon className="w-5 h-5 text-muted-foreground mb-3" />
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-body text-sm text-muted-foreground">{products.length} products</p>
              <button onClick={() => { setEditProduct({ status: "active" }); setShowAddForm(true); }} className={btnPrimary}>
                <Plus className="w-3.5 h-3.5" /> Add Product
              </button>
            </div>

            {(showAddForm || editProduct?.id) && editProduct && (
              <div className="bg-background rounded-xl border border-primary/30 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-lg font-semibold">{editProduct.id ? "Edit Product" : "New Product"}</h3>
                  <button onClick={() => { setEditProduct(null); setShowAddForm(false); }}><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Name</label><input className={inputCls} value={editProduct.name || ""} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} /></div>
                  <div><label className={labelCls}>Price (₹)</label><input type="number" className={inputCls} value={editProduct.price || ""} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} /></div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select className={inputCls} value={editProduct.category || ""} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}>
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Tag (Bestseller, New...)</label><input className={inputCls} value={editProduct.tag || ""} onChange={(e) => setEditProduct({ ...editProduct, tag: e.target.value })} /></div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelCls + " mb-0"}>Description</label>
                      <button type="button" onClick={generateAIDescription} disabled={generatingDesc} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50">
                        {generatingDesc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {generatingDesc ? "Generating..." : "AI Description"}
                      </button>
                    </div>
                    <textarea rows={4} className={inputCls + " resize-none"} value={editProduct.description || ""} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select className={inputCls} value={editProduct.status || "active"} onChange={(e) => setEditProduct({ ...editProduct, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h4 className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3 flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" /> Upload Media (Video preferred)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Product Photo</label>
                      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadFile(f, "image"); }} />
                      {editProduct.image_url ? (
                        <div className="relative group">
                          <img src={editProduct.image_url} alt="" className="w-full h-32 object-cover rounded-lg border border-border" />
                          <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <button onClick={() => imageInputRef.current?.click()} className="px-3 py-1.5 bg-background rounded-md text-xs font-semibold">Replace</button>
                            <button onClick={() => setEditProduct({ ...editProduct, image_url: null })} className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs">Remove</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => imageInputRef.current?.click()} disabled={uploadingImage}
                          className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 disabled:opacity-50">
                          {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
                          <span className="font-body text-xs text-muted-foreground">{uploadingImage ? "Uploading..." : "Upload photo"}</span>
                        </button>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>Product Video ⭐</label>
                      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadFile(f, "video"); }} />
                      {editProduct.video_url ? (
                        <div className="relative group">
                          <video src={editProduct.video_url} className="w-full h-32 object-cover rounded-lg border border-primary" muted />
                          <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <button onClick={() => videoInputRef.current?.click()} className="px-3 py-1.5 bg-background rounded-md text-xs">Replace</button>
                            <button onClick={() => setEditProduct({ ...editProduct, video_url: null })} className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs">Remove</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo}
                          className="w-full h-32 border-2 border-dashed border-primary/40 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary disabled:opacity-50 bg-primary/5">
                          {uploadingVideo ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Video className="w-5 h-5 text-primary" />}
                          <span className="font-body text-xs text-foreground font-semibold">{uploadingVideo ? "Uploading..." : "Upload video"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button onClick={handleSaveProduct} className={btnPrimary}>
                  <Save className="w-3.5 h-3.5" /> {editProduct.id ? "Update" : "Add"} Product
                </button>
              </div>
            )}

            <div className="bg-background rounded-xl border border-border/50 overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border/50 bg-muted/30">
                  {["Product", "Price", "Category", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-border/30 hover:bg-muted/10">
                      <td className="font-body text-sm font-semibold text-foreground py-3 px-4 flex items-center gap-2">
                        {p.video_url ? <Video className="w-3.5 h-3.5 text-primary" /> : p.image_url ? <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" /> : null}
                        {p.name}
                      </td>
                      <td className="font-body text-sm font-bold py-3 px-4">{formatPrice(p.price)}</td>
                      <td className="font-body text-xs text-muted-foreground py-3 px-4">{p.category}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => setEditProduct(p)} className="p-1.5 text-muted-foreground hover:text-foreground"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-3">
            <p className="font-body text-sm text-muted-foreground">{reviews.filter(r => !r.approved).length} pending • {reviews.filter(r => r.approved).length} approved</p>
            {reviews.length === 0 ? (
              <p className="text-center font-body text-sm text-muted-foreground py-12">No reviews yet</p>
            ) : reviews.map((r) => {
              const product = products.find(p => p.id === r.product_id);
              return (
                <div key={r.id} className="bg-background rounded-xl border border-border/50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-body text-sm font-semibold text-foreground">{r.customer_name}</p>
                        <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-primary text-primary" : "text-muted"}`} />)}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${r.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {r.approved ? "Approved" : "Pending"}
                        </span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground mb-2">on <strong>{product?.name || "Unknown product"}</strong> • {new Date(r.created_at).toLocaleDateString()}</p>
                      {r.title && <p className="font-body text-sm font-semibold text-foreground mb-1">{r.title}</p>}
                      {r.comment && <p className="font-body text-sm text-muted-foreground">{r.comment}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => moderateReview(r.id, !r.approved)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold ${r.approved ? "bg-muted text-muted-foreground" : "bg-green-600 text-white"}`}>
                        <Check className="w-3 h-3" /> {r.approved ? "Unpublish" : "Approve"}
                      </button>
                      <button onClick={() => deleteReview(r.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-destructive/10 text-destructive">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-background rounded-xl border border-border/50 overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border/50 bg-muted/30">
                {["Order", "Customer", "Amount", "Pay", "Status", "Tracking", "Date", "Actions"].map(h => <th key={h} className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">{h}</th>)}
              </tr></thead>
              <tbody>
                {orders.length === 0 ? <tr><td colSpan={8} className="text-center py-8 font-body text-sm text-muted-foreground">No orders yet</td></tr> :
                  orders.map(o => (
                    <tr key={o.id} className="border-b border-border/30">
                      <td className="font-body text-sm font-semibold py-3 px-4">{o.order_number}</td>
                      <td className="font-body text-sm py-3 px-4">{o.customer_name || "—"}</td>
                      <td className="font-body text-sm font-bold py-3 px-4">{formatPrice(o.total)}</td>
                      <td className="font-body text-xs uppercase py-3 px-4">{(o as any).payment_method || "—"}</td>
                      <td className="py-3 px-4"><span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-foreground">{o.status}</span></td>
                      <td className="py-3 px-4 font-body text-xs">
                        {(o as any).tracking_url ? (
                          <a href={(o as any).tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold">{(o as any).awb_code}</a>
                        ) : "—"}
                      </td>
                      <td className="font-body text-sm text-muted-foreground py-3 px-4">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1.5">
                          {o.status !== "paid" && o.status !== "shipment_created" && o.status !== "cancelled" && (
                            <button onClick={() => acceptOrder(o.id)} title="Accept & Ship" className="p-1.5 rounded bg-green-600/10 text-green-700 hover:bg-green-600 hover:text-white transition-colors"><Check className="w-3.5 h-3.5" /></button>
                          )}
                          {o.status !== "cancelled" && (
                            <button onClick={() => cancelOrder(o.id)} title="Cancel" className="p-1.5 rounded bg-amber-500/10 text-amber-700 hover:bg-amber-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
                          )}
                          <button onClick={() => deleteOrder(o.id)} title="Delete" className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "branding" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-background rounded-xl border border-primary/30 p-6">
              <h3 className="font-display text-lg font-semibold mb-1">Brand Logo</h3>
              <p className="font-body text-xs text-muted-foreground mb-5">Upload a new logo — it will instantly replace the old one across Navbar, Footer, and Invoices.</p>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
              {branding.logo_url ? (
                <div className="space-y-3">
                  <div className="bg-foreground rounded-lg p-8 flex items-center justify-center">
                    <img src={branding.logo_url} alt="Current logo" className="max-h-24 object-contain brightness-[10]" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} className={btnPrimary}>
                      {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Replace Logo
                    </button>
                    <button onClick={async () => { setBranding({ logo_url: "" }); await saveContent("branding", { logo_url: "" }); }} className="px-4 py-2 border border-border rounded-md font-body text-xs font-bold tracking-wider uppercase hover:bg-muted/30">Reset to Default</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 disabled:opacity-50">
                  {uploadingLogo ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                  <span className="font-body text-xs text-muted-foreground">{uploadingLogo ? "Uploading..." : "Upload brand logo (PNG/SVG)"}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "coupons" && (
          <div className="space-y-6 max-w-5xl">
            <div className="bg-background rounded-xl border border-primary/30 p-6">
              <h3 className="font-display text-lg font-semibold mb-1">Create Owner's Discount</h3>
              <p className="font-body text-xs text-muted-foreground mb-5">Custom codes customers can apply at checkout.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelCls}>Code *</label><input className={inputCls + " font-mono uppercase"} placeholder="MISHI20" value={newCoupon.code || ""} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} /></div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select className={inputCls} value={newCoupon.discount_type} onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}>
                    <option value="percent">Percent (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div><label className={labelCls}>Value *</label><input type="number" className={inputCls} value={newCoupon.discount_value || ""} onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })} /></div>
                <div><label className={labelCls}>Min Subtotal (₹)</label><input type="number" className={inputCls} value={newCoupon.min_subtotal || 0} onChange={(e) => setNewCoupon({ ...newCoupon, min_subtotal: Number(e.target.value) })} /></div>
                <div><label className={labelCls}>Max Uses (blank = ∞)</label><input type="number" className={inputCls} value={newCoupon.max_uses || ""} onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value ? Number(e.target.value) : null })} /></div>
                <div><label className={labelCls}>Expires</label><input type="datetime-local" className={inputCls} value={newCoupon.expires_at || ""} onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })} /></div>
                <div className="md:col-span-3"><label className={labelCls}>Description (internal)</label><input className={inputCls} value={newCoupon.description || ""} onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })} /></div>
              </div>
              <button onClick={saveCoupon} className={btnPrimary + " mt-4"}><Plus className="w-3.5 h-3.5" /> Create Coupon</button>
            </div>

            <div className="bg-background rounded-xl border border-border/50 overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border/50 bg-muted/30">
                  {["Code", "Discount", "Min ₹", "Uses", "Expires", "Status", "Actions"].map(h => <th key={h} className="text-left font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 px-4">{h}</th>)}
                </tr></thead>
                <tbody>
                  {coupons.length === 0 ? <tr><td colSpan={7} className="text-center py-8 font-body text-sm text-muted-foreground">No coupons yet</td></tr> :
                    coupons.map(c => (
                      <tr key={c.id} className="border-b border-border/30">
                        <td className="font-mono text-sm font-bold py-3 px-4">{c.code}</td>
                        <td className="font-body text-sm py-3 px-4">{c.discount_type === "percent" ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                        <td className="font-body text-sm py-3 px-4">₹{c.min_subtotal}</td>
                        <td className="font-body text-sm py-3 px-4">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                        <td className="font-body text-xs text-muted-foreground py-3 px-4">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => toggleCoupon(c.id, !c.active)} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{c.active ? "Active" : "Inactive"}</button>
                        </td>
                        <td className="py-3 px-4">
                          <button onClick={() => deleteCoupon(c.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {activeTab === "payments" && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-background rounded-xl border border-primary/30 p-6">
              <h3 className="font-display text-lg font-semibold mb-1">UPI Scan & Pay Configuration</h3>
              <p className="font-body text-xs text-muted-foreground mb-5">Customers will see this QR / VPA on the checkout page.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>UPI Static QR (Image)</label>
                  <input ref={qrInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadQr(f); }} />
                  {upiCfg.qr_url ? (
                    <div className="relative group">
                      <img src={upiCfg.qr_url} alt="QR" className="w-full h-48 object-contain rounded-lg border border-border bg-muted/20" />
                      <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button onClick={() => qrInputRef.current?.click()} className="px-3 py-1.5 bg-background rounded-md text-xs font-semibold">Replace</button>
                        <button onClick={() => setUpiCfg({ ...upiCfg, qr_url: "" })} className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => qrInputRef.current?.click()} disabled={uploadingQr}
                      className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 disabled:opacity-50">
                      {uploadingQr ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                      <span className="font-body text-xs text-muted-foreground">{uploadingQr ? "Uploading..." : "Upload QR image"}</span>
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>UPI VPA / ID</label>
                    <input className={inputCls} placeholder="mishi@upi" value={upiCfg.vpa} onChange={(e) => setUpiCfg({ ...upiCfg, vpa: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Merchant Name</label>
                    <input className={inputCls} value={upiCfg.merchant_name} onChange={(e) => setUpiCfg({ ...upiCfg, merchant_name: e.target.value })} />
                  </div>
                  <button onClick={() => saveContent("upi_payment", upiCfg)} disabled={savingContent} className={btnPrimary}>
                    <Save className="w-3.5 h-3.5" /> Save UPI Settings
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">UPI Payments — Awaiting Verification</h3>
              {orders.filter(o => o.payment_method === "upi" && o.status === "awaiting_upi_verification").length === 0 ? (
                <p className="font-body text-sm text-muted-foreground py-6 text-center">No pending UPI verifications.</p>
              ) : (
                <div className="space-y-3">
                  {orders.filter(o => o.payment_method === "upi" && o.status === "awaiting_upi_verification").map(o => (
                    <div key={o.id} className="border border-border/50 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-body text-sm font-bold">{o.order_number} — {formatPrice(o.total)}</p>
                        <p className="font-body text-xs text-muted-foreground">{o.customer_name} • {o.customer_phone}</p>
                        <p className="font-body text-xs mt-1">UTR: <span className="font-mono font-semibold text-foreground select-all">{o.transaction_id || "—"}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => verifyUpiOrder(o.id, true)} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-green-600 text-white">Verify & Ship</button>
                        <button onClick={() => verifyUpiOrder(o.id, false)} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-destructive/10 text-destructive">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-background rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Hero Section</h3>
              <div className="space-y-4">
                <div><label className={labelCls}>Headline</label><input className={inputCls} value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} /></div>
                <div><label className={labelCls}>Subheadline</label><textarea rows={2} className={inputCls + " resize-none"} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} /></div>
                <button onClick={() => saveContent("hero", hero)} disabled={savingContent} className={btnPrimary}><Save className="w-3.5 h-3.5" /> Save Hero</button>
              </div>
            </div>

            <div className="bg-background rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Socials & Contact (Live in Footer)</h3>
              <div className="space-y-4">
                <div><label className={labelCls}>Instagram URL</label><input className={inputCls} placeholder="https://instagram.com/..." value={socials.instagram} onChange={(e) => setSocials({ ...socials, instagram: e.target.value })} /></div>
                <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={socials.email} onChange={(e) => setSocials({ ...socials, email: e.target.value })} /></div>
                <div><label className={labelCls}>Phone</label><input className={inputCls} value={socials.phone} onChange={(e) => setSocials({ ...socials, phone: e.target.value })} /></div>
                <button onClick={() => saveContent("socials", socials)} disabled={savingContent} className={btnPrimary}><Save className="w-3.5 h-3.5" /> Save Socials</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "policies" && (
          <div className="space-y-6 max-w-3xl">
            {([
              { key: "delivery", label: "15-Day Delivery Policy" },
              { key: "returns", label: "4-Day Return Policy" },
              { key: "privacy", label: "Privacy Policy" },
            ] as const).map(({ key, label }) => (
              <div key={key} className="bg-background rounded-xl border border-border/50 p-6">
                <h3 className="font-display text-lg font-semibold mb-3">{label}</h3>
                <textarea rows={5} className={inputCls + " resize-none"} value={policies[key]} onChange={(e) => setPolicies({ ...policies, [key]: e.target.value })} />
              </div>
            ))}
            <button onClick={() => saveContent("policies", policies)} disabled={savingContent} className={btnPrimary}><Save className="w-3.5 h-3.5" /> Save All Policies</button>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-background rounded-xl border border-border/50 p-6 max-w-2xl">
            <h3 className="font-display text-lg font-semibold mb-4">Admin Account</h3>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border/30">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Crown className="w-4 h-4 text-primary" /></div>
              <div className="flex-1">
                <p className="font-body text-sm font-semibold">{user.email}</p>
                <p className="font-body text-xs text-muted-foreground">Current Admin</p>
              </div>
              <Shield className="w-4 h-4 text-green-600" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
