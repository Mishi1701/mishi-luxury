import { Heart, Crown, Sparkles } from "lucide-react";

const RoyalDastaan = () => {
  return (
    <section id="dastaan" className="py-20 lg:py-28 bg-gradient-to-b from-lavender/20 via-background to-teal-soft/20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-14 animate-fade-up">
          <span className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground">The Story Behind the Crown</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 text-foreground">
            The Royal <span className="gold-text">Dastaan</span>
          </h2>
          <div className="w-20 h-px bg-primary mx-auto mt-6" />
        </div>

        <div className="space-y-10 animate-fade-up delay-200">
          {/* The King */}
          <div className="glass-card rounded-lg p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-royal-glow" />
              <h3 className="font-display text-2xl font-semibold text-foreground">The King</h3>
            </div>
            <p className="font-body text-muted-foreground leading-relaxed">
              A visionary born with the heart of a lion and the precision of a master jeweller. 
              He doesn't follow trends — he commands them. Every piece in the MISHI empire carries 
              his uncompromising standard: nothing leaves the palace that isn't extraordinary. 
              His word is hallmarked. His craft is certified. His legacy is eternal.
            </p>
          </div>

          {/* Shrimati Ji */}
          <div className="glass-card rounded-lg p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-royal-glow" />
              <h3 className="font-display text-2xl font-semibold text-foreground">Shrimati Ji</h3>
            </div>
            <p className="font-body text-muted-foreground leading-relaxed">
              The grace behind the throne. The lioness whose quiet elegance speaks louder than 
              any crown. She is the compass of taste, the curator of beauty, and the soul of 
              every collection. Her eye for perfection transforms metal into emotion, stones 
              into stories, and fabric into legacy. The empire breathes because she believes.
            </p>
          </div>

          {/* The Promise */}
          <div className="text-center glass-card rounded-lg p-8 lg:p-10 border-primary/30">
            <Heart className="w-8 h-8 text-royal-glow mx-auto mb-4" />
            <h3 className="font-display text-2xl font-semibold text-foreground mb-3">The Sacred Promise</h3>
            <p className="font-body text-muted-foreground leading-relaxed italic">
              "This empire was not built for profit. It was built on a promise — a sacred vow 
              made to her. That one day, their love would not just shine between them, but would 
              adorn the world. Every ring, every diamond, every thread carries that oath. MISHI 
              is not a brand. It is a love letter, sealed in gold, delivered to you."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoyalDastaan;
