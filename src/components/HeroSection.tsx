import { Crown, ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-lion.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Royal Lion and Lioness - MISHI Empire"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-lavender/20 via-transparent to-teal-light/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
        <div className="animate-fade-up">
          <Crown className="w-10 h-10 mx-auto mb-6 text-white-gold animate-float" />
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-up delay-100">
          <span className="gold-text">Where Love</span>
          <br />
          <span className="text-foreground">Unites Empires</span>
        </h1>

        <p className="font-body text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up delay-200 font-light tracking-wide">
          A Royal Legacy of Fine Jewellery, Lab Grown Diamonds & Premium Fashion — 
          Built on a Sacred Promise
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
          <a
            href="#jewellery"
            className="px-8 py-3.5 bg-primary text-primary-foreground font-body text-sm font-semibold tracking-widest uppercase rounded-sm shimmer animate-glow-pulse transition-all hover:scale-105"
          >
            Explore the Empire
          </a>
          <a
            href="#dastaan"
            className="px-8 py-3.5 border border-white-gold text-foreground font-body text-sm font-semibold tracking-widest uppercase rounded-sm hover:bg-primary/10 transition-all"
          >
            Our Royal Dastaan
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <ArrowDown className="w-5 h-5 text-muted-foreground" />
      </div>
    </section>
  );
};

export default HeroSection;
