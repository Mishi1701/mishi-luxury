import { Heart, Crown, Sparkles, MapPin } from "lucide-react";
import kingAvatar from "@/assets/king-avatar.png";
import shrimatiAvatar from "@/assets/shrimati-ji-avatar.png";

const RoyalDastaan = () => {
  return (
    <section id="dastaan" className="py-20 lg:py-28 bg-gradient-to-b from-lavender/20 via-background to-teal-soft/20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-14 animate-fade-up">
          <span className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground">The Story Behind the Crown</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 text-foreground">
            The Royal <span className="gold-text">Dastaan</span>
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto">
            Every empire has an origin. Ours was born not from ambition, but from a promise whispered across 800 kilometres.
          </p>
          <div className="w-20 h-px bg-primary mx-auto mt-6" />
        </div>

        {/* The Characters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-fade-up delay-100">
          {/* The King */}
          <div className="glass-card rounded-xl p-8 text-center group hover:shadow-[var(--shadow-gold)] transition-shadow duration-500">
            <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary/40 shadow-lg group-hover:border-primary transition-colors duration-500">
              <img src={kingAvatar} alt="The King" className="w-full h-full object-cover" loading="lazy" width={512} height={768} />
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-royal-glow" />
              <h3 className="font-display text-2xl font-semibold text-foreground">The King</h3>
            </div>
            <div className="flex items-center justify-center gap-1 mb-4">
              <MapPin className="w-3.5 h-3.5 text-accent-foreground" />
              <span className="font-body text-xs text-muted-foreground tracking-wider uppercase">Madhya Pradesh</span>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Born in the heart of India, raised with the roar of a lion. He carries fire in his eyes 
              and gold in his hands. A self-made visionary who doesn't follow trends — he commands them. 
              Every ring he crafts, every stone he sets, every thread he approves carries his uncompromising 
              standard. His word is hallmarked. His craft is certified. His love? Eternal. He promised her 
              the world — and then he built one.
            </p>
          </div>

          {/* Shrimati Ji */}
          <div className="glass-card rounded-xl p-8 text-center group hover:shadow-[var(--shadow-gold)] transition-shadow duration-500">
            <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-secondary/60 shadow-lg group-hover:border-secondary transition-colors duration-500">
              <img src={shrimatiAvatar} alt="Shrimati Ji" className="w-full h-full object-cover" loading="lazy" width={512} height={768} />
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-royal-glow" />
              <h3 className="font-display text-2xl font-semibold text-foreground">Shrimati Ji</h3>
            </div>
            <div className="flex items-center justify-center gap-1 mb-4">
              <MapPin className="w-3.5 h-3.5 text-accent-foreground" />
              <span className="font-body text-xs text-muted-foreground tracking-wider uppercase">Jharkhand</span>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              The grace behind the throne. The lioness whose quiet elegance speaks louder than any crown. 
              From the mineral-rich lands of Jharkhand, she carries within her the strength of the earth 
              and the softness of moonlight. She is the compass of taste, the curator of beauty, and the 
              soul of every collection. Her eye for perfection transforms metal into emotion, stones into 
              stories. The empire breathes because she believes.
            </p>
          </div>
        </div>

        {/* The Love Story */}
        <div className="space-y-8 animate-fade-up delay-200">
          <div className="glass-card rounded-xl p-8 lg:p-10 border-primary/20">
            <h3 className="font-display text-2xl font-semibold text-foreground mb-4 text-center">
              A Bridge Across 800 Kilometres
            </h3>
            <div className="space-y-4 font-body text-sm text-muted-foreground leading-relaxed">
              <p>
                Their story began where most great love stories do — in the space between impossible and 
                inevitable. He, a dreamer from the bustling streets of Madhya Pradesh, with calloused hands 
                and a heart full of gold. She, a quiet force from the serene hills of Jharkhand, with eyes 
                that could see beauty in raw stone.
              </p>
              <p>
                800 kilometres separated them. Different states, different worlds, different skies. But love, 
                as they say, doesn't read maps. Late-night calls turned into promises. Promises turned into 
                plans. And plans turned into a sacred vow: <em>"One day, our love won't just shine between us — 
                it will adorn the world."</em>
              </p>
              <p>
                He began with a single ring — crafted not for a customer, but for her. 925 sterling silver, 
                polished until it reflected their dreams. She looked at it and whispered, <em>"This is not 
                just jewellery. This is us."</em> And in that moment, MISHI was born.
              </p>
              <p>
                Today, every piece in the MISHI empire carries that first promise. Every lab-grown diamond 
                sparkles with the same fire that burned in their long-distance calls. Every thread in their 
                royal apparel is woven with the patience of two people who waited, believed, and built — 
                not for profit, but for love.
              </p>
            </div>
          </div>

          {/* The Sacred Promise */}
          <div className="text-center glass-card rounded-xl p-8 lg:p-10 border-primary/30 bg-gradient-to-br from-lavender/20 to-teal-light/10">
            <Heart className="w-8 h-8 text-royal-glow mx-auto mb-4 animate-float" />
            <h3 className="font-display text-2xl font-semibold text-foreground mb-4">The Sacred Promise</h3>
            <p className="font-body text-muted-foreground leading-relaxed italic max-w-2xl mx-auto">
              "This empire was not built for profit. It was built on a promise — a sacred vow made to her. 
              That one day, their love would not just shine between them, but would adorn the world. Every 
              ring, every diamond, every thread carries that oath. MISHI is not a brand. It is a love letter, 
              sealed in gold, delivered to you."
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-8 h-px bg-primary" />
              <Crown className="w-4 h-4 text-royal-glow" />
              <div className="w-8 h-px bg-primary" />
            </div>
            <p className="font-body text-xs text-muted-foreground mt-3 tracking-widest uppercase">
              Madhya Pradesh × Jharkhand — United by Love, Sealed in Gold
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoyalDastaan;
