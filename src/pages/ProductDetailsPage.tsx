import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Star, Crown, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Product = Tables<"products">;
type Review = Tables<"reviews">;

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", comment: "", name: "" });

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase.from("reviews").select("*").eq("product_id", id).eq("approved", true).order("created_at", { ascending: false }),
    ]);
    setProduct(p);
    setReviews(r || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to leave a review");
      navigate("/login");
      return;
    }
    if (!product) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: product.id,
      user_id: user.id,
      customer_name: form.name || user.email?.split("@")[0] || "Royal Customer",
      rating: form.rating,
      title: form.title,
      comment: form.comment,
      approved: false,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Review submitted! Awaiting royal approval 👑");
      setShowForm(false);
      setForm({ rating: 5, title: "", comment: "", name: "" });
    }
  };

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <Crown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-3xl text-foreground">Product not found</h1>
          <Link to="/" className="font-body text-sm text-primary mt-4 inline-block">Return to Empire</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link to={-1 as any} onClick={(e) => { e.preventDefault(); navigate(-1); }} className="inline-flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Media */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-lavender/30 to-teal-light/20 border border-border/50">
                {product.video_url ? (
                  <video src={product.video_url} controls autoPlay loop muted playsInline className="w-full h-full object-cover" poster={product.image_url || undefined} />
                ) : product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Crown className="w-20 h-20 text-primary/30" /></div>
                )}
              </div>
              {product.video_url && product.image_url && (
                <img src={product.image_url} alt={`${product.name} detail`} className="w-32 h-32 object-cover rounded-lg border border-border/50" />
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              {product.tag && (
                <span className="inline-block bg-primary text-primary-foreground font-body text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-sm">{product.tag}</span>
              )}
              <div>
                <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">{product.category}</span>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-1">{product.name}</h1>
              </div>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "fill-primary text-primary" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="font-body text-sm text-muted-foreground">{avgRating.toFixed(1)} • {reviews.length} reviews</span>
                </div>
              )}

              <p className="font-display text-3xl font-bold text-foreground">₹{product.price.toLocaleString("en-IN")}</p>

              {product.description && (
                <p className="font-body text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, category: product.category }); openCart(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md shimmer hover:scale-[1.02] transition-transform"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>
                <button
                  onClick={() => { addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, category: product.category }); navigate("/checkout"); }}
                  className="flex-1 py-4 border border-primary text-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md hover:bg-primary/10 transition-colors"
                >
                  Buy Now
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
                {[
                  { label: "Hallmarked" },
                  { label: "Lab Certified" },
                  { label: "100% Pre-Paid" },
                ].map((b) => (
                  <div key={b.label} className="text-center p-3 rounded-lg border border-border/30">
                    <p className="font-body text-[10px] tracking-wider uppercase text-muted-foreground">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <section className="mt-16 pt-12 border-t border-border/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Royal Reviews</h2>
                <p className="font-body text-sm text-muted-foreground mt-1">Words from our empire's loyal members</p>
              </div>
              <button onClick={() => setShowForm((s) => !s)} className="px-5 py-2.5 bg-primary text-primary-foreground font-body text-xs font-bold tracking-wider uppercase rounded-md">
                {showForm ? "Cancel" : "Write Review"}
              </button>
            </div>

            {showForm && (
              <form onSubmit={submitReview} className="glass-card rounded-xl p-6 mb-8 space-y-4">
                <div>
                  <label className="font-body text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">Your Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <button type="button" key={s} onClick={() => setForm({ ...form, rating: s })}>
                        <Star className={`w-6 h-6 ${s <= form.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <input type="text" placeholder="Review title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <textarea placeholder="Share your royal experience..." rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} required className="w-full px-4 py-3 border border-border rounded-md font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                <button type="submit" disabled={submitting} className="px-6 py-3 bg-primary text-primary-foreground font-body text-xs font-bold tracking-wider uppercase rounded-md disabled:opacity-50">
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-center font-body text-sm text-muted-foreground py-8">No reviews yet. Be the first to crown this piece.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="glass-card rounded-xl p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-body text-sm font-semibold text-foreground">{r.customer_name}</p>
                        <div className="flex mt-1">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-primary text-primary" : "text-muted"}`} />
                          ))}
                        </div>
                      </div>
                      <span className="font-body text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.title && <p className="font-body text-sm font-semibold text-foreground mb-1">{r.title}</p>}
                    {r.comment && <p className="font-body text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
