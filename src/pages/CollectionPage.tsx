import { useParams, Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Filter, ShoppingBag, Box } from "lucide-react";

const ProductViewer3D = lazy(() => import("@/components/ProductViewer3D"));

const collectionData: Record<string, { title: string; subtitle: string; description: string; gradient: string; products: { name: string; price: string; tag?: string }[] }> = {
  "fine-jewellery": {
    title: "Fine Jewellery",
    subtitle: "925 Sterling Silver & Gold",
    description: "Handcrafted masterpieces that carry the weight of legacy and the lightness of love. Every piece is 925 hallmarked and crafted by the King's own artisans.",
    gradient: "from-primary/20 to-lavender/30",
    products: [
      { name: "Royal Crown Ring", price: "₹2,499", tag: "Bestseller" },
      { name: "Empire Bracelet", price: "₹3,299", tag: "New" },
      { name: "Sacred Promise Pendant", price: "₹1,899" },
      { name: "Lavender Moon Earrings", price: "₹2,199" },
      { name: "King's Signet Ring", price: "₹4,599", tag: "Limited" },
      { name: "Eternal Vow Necklace", price: "₹5,999" },
      { name: "Royal Anklet", price: "₹1,499" },
      { name: "Palace Cufflinks", price: "₹2,899" },
    ],
  },
  "lab-diamonds": {
    title: "Lab Grown Diamonds",
    subtitle: "Certified Brilliance, Ethical Luxury",
    description: "Every diamond is lab-certified, conflict-free, and brilliant beyond compare. The same fire, the same sparkle — without the guilt.",
    gradient: "from-teal-light/30 to-lavender/20",
    products: [
      { name: "1 Carat Solitaire Ring", price: "₹45,999", tag: "Certified" },
      { name: "Diamond Tennis Bracelet", price: "₹32,999" },
      { name: "Halo Engagement Ring", price: "₹52,999", tag: "Bestseller" },
      { name: "Diamond Stud Earrings", price: "₹18,999" },
      { name: "Eternity Band", price: "₹28,999", tag: "New" },
      { name: "Princess Cut Pendant", price: "₹22,999" },
    ],
  },
  "royal-apparel": {
    title: "Royal Apparel",
    subtitle: "Kapde Fit for Royalty",
    description: "Premium fabrics meet royal design. Every thread is chosen with the precision of a jeweller and the taste of a queen.",
    gradient: "from-lavender/30 to-primary/20",
    products: [
      { name: "Royal Kurta Set", price: "₹3,999", tag: "Premium" },
      { name: "Palace Sherwani", price: "₹12,999" },
      { name: "Silk Nehru Jacket", price: "₹5,499", tag: "Bestseller" },
      { name: "Royal Palazzo Set", price: "₹2,999" },
      { name: "Empire Saree", price: "₹7,999", tag: "Limited" },
      { name: "Golden Thread Dupatta", price: "₹1,999" },
    ],
  },
  "streetwear": {
    title: "Streetwear",
    subtitle: "Urban Empire Collection",
    description: "Where royal meets rebel. Luxury streetwear that commands attention on every corner of the empire.",
    gradient: "from-muted to-teal-soft",
    products: [
      { name: "MISHI Logo Hoodie", price: "₹2,499", tag: "Trending" },
      { name: "Empire Joggers", price: "₹1,999" },
      { name: "Royal Oversized Tee", price: "₹1,299", tag: "Bestseller" },
      { name: "Crown Cap", price: "₹799" },
      { name: "Street King Jacket", price: "₹3,999", tag: "New" },
      { name: "MISHI Sneakers", price: "₹4,499" },
    ],
  },
  "traditional-wear": {
    title: "Traditional Wear",
    subtitle: "Heritage & Grace",
    description: "Rooted in Indian heritage, elevated with royal taste. Traditional wear that honours our culture while embracing modern elegance.",
    gradient: "from-primary/15 to-white-gold-bright/30",
    products: [
      { name: "Banarasi Silk Saree", price: "₹8,999", tag: "Handwoven" },
      { name: "Chikankari Kurta", price: "₹3,499" },
      { name: "Bridal Lehenga Set", price: "₹25,999", tag: "Premium" },
      { name: "Embroidered Shawl", price: "₹2,999" },
      { name: "Festive Dhoti Set", price: "₹4,499", tag: "New" },
      { name: "Heritage Anarkali", price: "₹6,999" },
    ],
  },
  "custom-watches": {
    title: "Custom Watches",
    subtitle: "Time, Redefined",
    description: "Precision meets luxury. Each timepiece is a statement — crafted for those who don't just keep time, they command it.",
    gradient: "from-teal-light/20 to-primary/15",
    products: [
      { name: "King's Chronograph", price: "₹8,999", tag: "Limited Edition" },
      { name: "Empire Automatic", price: "₹12,999" },
      { name: "Royal Skeleton Watch", price: "₹15,999", tag: "Premium" },
      { name: "MISHI Sport Edition", price: "₹6,499" },
      { name: "Moonphase Classic", price: "₹18,999", tag: "New" },
      { name: "Golden Crown Watch", price: "₹9,999" },
    ],
  },
};

const CollectionPage = () => {
  const { slug } = useParams();
  const collection = collectionData[slug || ""];

  if (!collection) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className={`pt-28 pb-16 bg-gradient-to-br ${collection.gradient}`}>
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Empire
          </Link>
          <span className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground block">{collection.subtitle}</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold mt-2 text-foreground">
            {collection.title}
          </h1>
          <p className="font-body text-muted-foreground mt-4 max-w-xl">{collection.description}</p>
        </div>
      </section>

      {/* Filters */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-body text-sm text-muted-foreground">{collection.products.length} products</span>
          <button className="flex items-center gap-2 font-body text-xs font-medium tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filter & Sort
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {collection.products.map((product, i) => (
              <div
                key={product.name}
                className="group relative rounded-lg border border-white-gold-bright/30 overflow-hidden hover:shadow-[var(--shadow-gold)] transition-all duration-500 animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Placeholder product image */}
                <div className="aspect-square bg-gradient-to-br from-lavender/40 to-teal-light/20 flex items-center justify-center">
                  <span className="text-5xl opacity-30">👑</span>
                </div>
                {product.tag && (
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground font-body text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-sm">
                    {product.tag}
                  </span>
                )}
                <div className="p-4">
                  <h3 className="font-display text-sm font-semibold text-foreground line-clamp-1">{product.name}</h3>
                  <p className="font-body text-sm font-bold text-foreground mt-1">{product.price}</p>
                  <button className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-primary/10 text-foreground font-body text-xs font-semibold tracking-wider uppercase rounded hover:bg-primary/20 transition-colors">
                    <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CollectionPage;
