import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShoppingBag, Crown } from "lucide-react";

const CartPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="animate-fade-up">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Your Royal Cart
            </h1>
            <p className="font-body text-muted-foreground mb-8">
              Your cart is empty. Explore the empire and find treasures worthy of your crown.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-sm shimmer hover:scale-105 transition-transform"
            >
              <Crown className="w-4 h-4" /> Explore the Empire
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
