import { ArrowRight } from "lucide-react";

const chambers = [
  {
    title: "Fine Jewellery",
    subtitle: "925 Sterling Silver & Gold",
    gradient: "from-primary/20 to-lavender/30",
    emoji: "💎",
  },
  {
    title: "Lab Grown Diamonds",
    subtitle: "Certified Brilliance",
    gradient: "from-teal-light/30 to-lavender/20",
    emoji: "✨",
  },
  {
    title: "Royal Apparel",
    subtitle: "Kapde Fit for Royalty",
    gradient: "from-lavender/30 to-primary/20",
    emoji: "👑",
  },
  {
    title: "Streetwear",
    subtitle: "Urban Empire Collection",
    gradient: "from-muted to-teal-soft",
    emoji: "🔥",
  },
  {
    title: "Traditional Wear",
    subtitle: "Heritage & Grace",
    gradient: "from-primary/15 to-white-gold-bright/30",
    emoji: "🪷",
  },
  {
    title: "Custom Watches",
    subtitle: "Time, Redefined",
    gradient: "from-teal-light/20 to-primary/15",
    emoji: "⌚",
  },
];

const LuxuryChambers = () => {
  return (
    <section id="jewellery" className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <span className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground">The Empire's Finest</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 text-foreground">
            Luxury <span className="gold-text">Chambers</span>
          </h2>
          <div className="w-20 h-px bg-primary mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chambers.map((chamber, i) => (
            <a
              key={chamber.title}
              href="#"
              className="group relative overflow-hidden rounded-lg border border-white-gold-bright/40 p-8 lg:p-10 bg-gradient-to-br transition-all duration-500 hover:shadow-[var(--shadow-gold)] hover:scale-[1.02] animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${chamber.gradient} opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />
              <div className="relative z-10">
                <span className="text-4xl mb-4 block">{chamber.emoji}</span>
                <h3 className="font-display text-xl lg:text-2xl font-semibold text-foreground mb-1">
                  {chamber.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground mb-6">{chamber.subtitle}</p>
                <span className="inline-flex items-center gap-2 font-body text-xs font-semibold tracking-widest uppercase text-foreground/70 group-hover:text-foreground transition-colors">
                  Enter Chamber <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LuxuryChambers;
