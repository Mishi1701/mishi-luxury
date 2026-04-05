import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Palette, Send, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = ["Fine Jewellery", "Lab Diamond Ring", "Royal Apparel", "Custom Watch", "Bridal Set", "Other"];

const CustomOrdersPage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Royal Order Received 👑",
      description: "The King's artisans will contact you within 24 hours to discuss your vision.",
    });
    setName(""); setPhone(""); setCategory(""); setBudget(""); setDescription("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14 animate-fade-up">
            <Palette className="w-10 h-10 text-royal-glow mx-auto mb-4 animate-float" />
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Your Vision, <span className="gold-text">Our Craft</span>
            </h1>
            <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
              Dream it and we'll forge it. Tell us your vision and the King's master artisans will bring it to life with 925 hallmarked precision.
            </p>
            <div className="w-20 h-px bg-primary mx-auto mt-6" />
          </div>

          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 lg:p-10 space-y-6 animate-fade-up delay-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-body text-xs font-semibold tracking-wider uppercase text-foreground/70 mb-2 block">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="font-body text-xs font-semibold tracking-wider uppercase text-foreground/70 mb-2 block">Phone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-body text-xs font-semibold tracking-wider uppercase text-foreground/70 mb-2 block">Category</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-body text-xs font-semibold tracking-wider uppercase text-foreground/70 mb-2 block">Budget Range</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select budget</option>
                  <option value="under-5k">Under ₹5,000</option>
                  <option value="5k-15k">₹5,000 - ₹15,000</option>
                  <option value="15k-50k">₹15,000 - ₹50,000</option>
                  <option value="50k-plus">₹50,000+</option>
                  <option value="no-limit">No Limit — Make it Royal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-body text-xs font-semibold tracking-wider uppercase text-foreground/70 mb-2 block">Describe Your Vision</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-background border border-border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Tell us everything — the design, the occasion, the emotion you want it to carry..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-md shimmer animate-glow-pulse hover:scale-[1.02] transition-transform"
            >
              <Send className="w-4 h-4" /> Submit Your Royal Order
            </button>

            <p className="text-center font-body text-xs text-muted-foreground">
              <Crown className="w-3 h-3 inline mr-1" />
              The King's artisans will reach out within 24 hours
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomOrdersPage;
