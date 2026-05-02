import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Filter, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useCart } from "@/hooks/useCart";

type Product = Tables<"products">;

const collectionMeta: Record<string, { title: string; subtitle: string; description: string; gradient: string; dbCategory: string }> = {
  "fine-jewellery": {
    title: "Fine Jewellery", subtitle: "925 Sterling Silver & Gold",
    description: "Handcrafted masterpieces that carry the weight of legacy and the lightness of love.",
    gradient: "from-primary/20 to-lavender/30", dbCategory: "Fine Jewellery",
  },
  "lab-diamonds": {
    title: "Lab Grown Diamonds", subtitle: "Certified Brilliance, Ethical Luxury",
    description: "Every diamond is lab-certified, conflict-free, and brilliant beyond compare.",
    gradient: "from-teal-light/30 to-lavender/20", dbCategory: "Lab Diamonds",
  },
  "royal-apparel": {
    title: "Royal Apparel", subtitle: "Kapde Fit for Royalty",
    description: "Premium fabrics meet royal design.",
    gradient: "from-lavender/30 to-primary/20", dbCategory: "Royal Apparel",
  },
  "streetwear": {
    title: "Streetwear", subtitle: "Urban Empire Collection",
    description: "Where royal meets rebel. Luxury streetwear that commands attention.",
    gradient: "from-muted to-teal-soft", dbCategory: "Streetwear",
  },
  "traditional-wear": {
    title: "Traditional Wear", subtitle: "Heritage & Grace",
    description: "Rooted in Indian heritage, elevated with royal taste.",
    gradient: "from-primary/15 to-white-gold-bright/30", dbCategory: "Traditional Wear",
  },
  "custom-watches": {
    title: "Custom Watches", subtitle: "Time, Redefined",
    description: "Precision meets luxury. Each timepiece is a statement.",
    gradient: "from-teal-light/20 to-primary/15", dbCategory: "Custom Watches",
  },
};

const CollectionPage = () => {
  const { slug } = useParams();
  const meta = collectionMeta[slug || ""];
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (!meta) return;
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("category", meta.dbCategory)
        .eq("status", "active")
        .order("created_at");
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, [meta]);

  if (!meta) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="font-display text-3xl text-foreground">Collection Not Found</h1>
          <Link to="/" className="font-body text-sm text-primary mt-4 inline-block">Return to Empire</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className={`pt-28 pb-16 bg-gradient-to-br ${meta.gradient}`}>
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Empire
          </Link>
          <span className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground block">{meta.subtitle}</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold mt-2 text-foreground">{meta.title}</h1>
          <p className="font-body text-muted-foreground mt-4 max-w-xl">{meta.description}</p>
        </div>
      </section>

      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-body text-sm text-muted-foreground">{products.length} products</span>
          <button className="flex items-center gap-2 font-body text-xs font-medium tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filter & Sort
          </button>
        </div>
      </div>

      

      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-lg border border-border/30 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted/30" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted/30 rounded w-3/4" />
                    <div className="h-4 bg-muted/30 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="group relative rounded-lg border border-white-gold-bright/30 overflow-hidden hover:shadow-[var(--shadow-gold)] transition-all duration-500 animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <Link to={`/products/${product.id}`} className="block aspect-square bg-gradient-to-br from-lavender/40 to-teal-light/20 flex items-center justify-center overflow-hidden">
                    {product.video_url ? (
                      <video src={product.video_url} muted loop playsInline autoPlay className="w-full h-full object-cover" poster={product.image_url || undefined} />
                    ) : product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="text-5xl opacity-30">👑</span>
                    )}
                  </Link>
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground font-body text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-sm">
                      {product.tag}
                    </span>
                  )}
                  <div className="p-4">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-display text-sm font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    <p className="font-body text-sm font-bold text-foreground mt-1">{formatPrice(product.price)}</p>
                    <button
                      onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, category: product.category })}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-primary/10 text-foreground font-body text-xs font-semibold tracking-wider uppercase rounded hover:bg-primary/20 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CollectionPage;
