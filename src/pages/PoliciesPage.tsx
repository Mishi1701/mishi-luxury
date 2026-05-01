import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Truck, RotateCcw, Video, Shield } from "lucide-react";
import { useSiteContent, type Policies } from "@/hooks/useSiteContent";

const POLICY_DEFAULTS: Policies = {
  delivery: "15-Day Royal Delivery — All orders are dispatched within 15 days of confirmation.",
  returns: "4-Day Return Window — Mandatory unboxing video required. No returns on personalized/custom items.",
  privacy: "Your data is sacred. We never share or sell customer information.",
};

const PoliciesPage = () => {
  const { content } = useSiteContent<Policies>("policies", POLICY_DEFAULTS);

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
            <PolicyCard icon={Truck} title="15-Day Delivery Policy" body={content.delivery} delay="" />
            <PolicyCard icon={RotateCcw} title="4-Day Return Policy" body={content.returns} delay="delay-100" />
            <PolicyCard icon={Video} title="Mandatory Unboxing Video" body="To process any return or exchange, you must provide a continuous unboxing video showing the sealed package, shipping label, and product condition. Without it, no returns will be accepted." delay="delay-200" destructive />
            <PolicyCard icon={Shield} title="Privacy & Security" body={content.privacy} delay="delay-300" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const PolicyCard = ({ icon: Icon, title, body, delay, destructive }: { icon: any; title: string; body: string; delay: string; destructive?: boolean }) => (
  <div className={`glass-card rounded-xl p-8 lg:p-10 animate-fade-up ${delay} ${destructive ? "border-destructive/20" : ""}`}>
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${destructive ? "bg-destructive/10" : "bg-primary/20"}`}>
        <Icon className={`w-5 h-5 ${destructive ? "text-destructive" : "text-royal-glow"}`} />
      </div>
      <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
    </div>
    <p className="font-body text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{body}</p>
  </div>
);

export default PoliciesPage;
