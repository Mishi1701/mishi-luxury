import { Crown, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import premiumRing from "@/assets/premium-ring.jpg";
import { useSiteContent, type Hero } from "@/hooks/useSiteContent";

const HERO_DEFAULTS: Hero = {
  title: "Where Love Unites Empires",
  subtitle: "A Royal Legacy of Fine Jewellery, Lab Grown Diamonds & Premium Fashion — Built on a Sacred Promise",
};

const HeroSection = () => {
  const { content } = useSiteContent<Hero>("hero", HERO_DEFAULTS);
  const [titleA, ...titleRest] = content.title.split(" ");
  const titleB = titleRest.join(" ");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0">
        <img
          src={premiumRing}
          alt="MISHI signature solitaire ring on black marble"
          className="w-full h-full object-cover opacity-95"
          width={1280}
          height={1280}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
        <div className="animate-fade-up">
          <Crown className="w-10 h-10 mx-auto mb-6 text-primary animate-float" />
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-up delay-100">
          <span className="gold-text">{titleA}</span>
          <br />
          <span className="text-foreground">{titleB}</span>
        </h1>

        <p className="font-body text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up delay-200 font-light tracking-wide">
          {content.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
          <Link
            to="/collections/fine-jewellery"
            className="px-8 py-3.5 bg-primary text-primary-foreground font-body text-sm font-semibold tracking-widest uppercase rounded-sm shimmer animate-glow-pulse transition-all hover:scale-105"
          >
            Explore the Empire
          </Link>
          <Link
            to="/dastaan"
            className="px-8 py-3.5 border border-primary text-foreground font-body text-sm font-semibold tracking-widest uppercase rounded-sm hover:bg-primary/10 transition-all"
          >
            Our Royal Dastaan
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <ArrowDown className="w-5 h-5 text-muted-foreground" />
      </div>
    </section>
  );
};

export default HeroSection;
