import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Truck, RotateCcw, Video, Shield } from "lucide-react";

const PoliciesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-14 animate-fade-up">
            <span className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground">Royal Decrees</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-3 text-foreground">
              Our <span className="gold-text">Policies</span>
            </h1>
            <p className="font-body text-muted-foreground mt-4">Transparency is the hallmark of every true empire.</p>
            <div className="w-20 h-px bg-primary mx-auto mt-6" />
          </div>

          <div className="space-y-8">
            {/* Delivery */}
            <div className="glass-card rounded-xl p-8 lg:p-10 animate-fade-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-royal-glow" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground">15-Day Delivery Policy</h2>
              </div>
              <div className="space-y-3 font-body text-sm text-muted-foreground leading-relaxed">
                <p>Every order from the MISHI empire is crafted, inspected, and dispatched with royal precision.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Processing Time:</strong> 3-5 business days for quality checks and packaging</li>
                  <li><strong>Shipping Time:</strong> 7-10 business days via premium courier partners</li>
                  <li><strong>Total Delivery:</strong> Up to 15 business days from order confirmation</li>
                  <li><strong>Tracking:</strong> Real-time tracking provided via SMS and email</li>
                  <li><strong>Pan-India Delivery:</strong> We ship to all pin codes across India</li>
                </ul>
                <p className="italic">Custom orders may require additional 5-7 days for crafting.</p>
              </div>
            </div>

            {/* Returns */}
            <div className="glass-card rounded-xl p-8 lg:p-10 animate-fade-up delay-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-royal-glow" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground">4-Day Return Policy</h2>
              </div>
              <div className="space-y-3 font-body text-sm text-muted-foreground leading-relaxed">
                <p>We stand behind every product that leaves our palace. Returns are accepted within 4 days of delivery.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Window:</strong> 4 calendar days from delivery date</li>
                  <li><strong>Condition:</strong> Item must be unused, unworn, and in original packaging</li>
                  <li><strong>Refund:</strong> Full refund to original payment method within 7-10 days</li>
                  <li><strong>Exchange:</strong> Free exchange for different size/variant</li>
                </ul>
              </div>
            </div>

            {/* Unboxing Video */}
            <div className="glass-card rounded-xl p-8 lg:p-10 border-destructive/20 animate-fade-up delay-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Video className="w-5 h-5 text-destructive" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground">Mandatory Unboxing Video</h2>
              </div>
              <div className="space-y-3 font-body text-sm text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground">⚠️ THIS IS NON-NEGOTIABLE</p>
                <p>
                  To process any return or exchange, you <strong>must</strong> provide an unboxing video 
                  showing the complete process of opening the package.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Video must be <strong>continuous</strong> — no cuts or edits</li>
                  <li>Must clearly show the <strong>sealed package</strong> before opening</li>
                  <li>Must show the <strong>shipping label</strong> with order details</li>
                  <li>Must show the <strong>product condition</strong> upon unboxing</li>
                  <li>Without valid unboxing video, <strong>no returns will be accepted</strong></li>
                </ul>
                <p className="italic">This policy protects both the empire and its loyal customers.</p>
              </div>
            </div>

            {/* Privacy */}
            <div className="glass-card rounded-xl p-8 lg:p-10 animate-fade-up delay-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-royal-glow" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground">Privacy & Security</h2>
              </div>
              <div className="space-y-3 font-body text-sm text-muted-foreground leading-relaxed">
                <p>Your data is protected with the same vigilance we guard our crown jewels.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>All payments are encrypted and processed securely</li>
                  <li>We never share your personal information with third parties</li>
                  <li>All customer data is stored on secure, encrypted servers</li>
                  <li>You can request deletion of your data at any time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PoliciesPage;
