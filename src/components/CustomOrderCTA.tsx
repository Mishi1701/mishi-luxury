import { Palette, ArrowRight } from "lucide-react";

const CustomOrderCTA = () => {
  return (
    <section id="custom" className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-xl border border-white-gold-bright/40 bg-gradient-to-br from-lavender/40 via-background to-teal-light/30 p-10 lg:p-16 text-center shimmer">
          <Palette className="w-10 h-10 text-royal-glow mx-auto mb-6 animate-float" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Vision, <span className="gold-text">Our Craft</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Dream it and we'll forge it. From bespoke engagement rings to custom royal apparel — 
            the King's artisans bring your imagination to life with 925 hallmarked precision.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-body text-sm font-semibold tracking-widest uppercase rounded-sm hover:scale-105 transition-transform animate-glow-pulse"
          >
            Begin Your Design <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CustomOrderCTA;
