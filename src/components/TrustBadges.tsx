import { Shield, Award, Diamond, Truck } from "lucide-react";

const badges = [
  { icon: Shield, label: "925 Hallmarked", desc: "Certified Purity" },
  { icon: Diamond, label: "Lab Certified", desc: "Every Stone Verified" },
  { icon: Award, label: "Premium Quality", desc: "Handcrafted Excellence" },
  { icon: Truck, label: "Pan-India Delivery", desc: "15-Day Guaranteed" },
];

const TrustBadges = () => {
  return (
    <section className="py-12 bg-lavender/30 border-y border-white-gold-bright/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, i) => (
            <div
              key={badge.label}
              className="flex flex-col items-center text-center gap-2 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <badge.icon className="w-5 h-5 text-royal-glow" />
              </div>
              <span className="font-display text-sm font-semibold text-foreground">{badge.label}</span>
              <span className="font-body text-xs text-muted-foreground">{badge.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
