import { Crown, Instagram, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import mishiLogo from "@/assets/mishi-logo.jpg";
import { useSiteContent, type Socials } from "@/hooks/useSiteContent";

const SOCIAL_DEFAULTS: Socials = {
  instagram: "https://instagram.com/mishiofficial1701",
  email: "mishiofficial1701@gmail.com",
  phone: "+91 0000000000",
};

const Footer = () => {
  const { content: socials } = useSiteContent<Socials>("socials", SOCIAL_DEFAULTS);

  return (
    <footer className="bg-foreground text-background/80 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div>
            <img src={mishiLogo} alt="MISHI" className="h-12 w-auto mb-4 brightness-[10]" />
            <p className="font-body text-sm text-background/50 leading-relaxed">
              Where Love Unites Empires. A legacy of fine jewellery, lab grown diamonds, and premium fashion — built on a sacred promise.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">The Empire</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Fine Jewellery", path: "/collections/fine-jewellery" },
                { label: "Lab Diamonds", path: "/collections/lab-diamonds" },
                { label: "Royal Apparel", path: "/collections/royal-apparel" },
                { label: "Custom Orders", path: "/custom-orders" },
                { label: "Our Dastaan", path: "/dastaan" },
              ].map((link) => (
                <Link key={link.label} to={link.path} className="font-body text-sm text-background/50 hover:text-background transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">Royal Decrees</h4>
            <div className="flex flex-col gap-2 mb-6">
              <Link to="/policies" className="font-body text-sm text-background/50 hover:text-background transition-colors">15-Day Delivery Policy</Link>
              <Link to="/policies" className="font-body text-sm text-background/50 hover:text-background transition-colors">4-Day Return Policy</Link>
              <Link to="/policies" className="font-body text-sm text-background/50 hover:text-background transition-colors">Privacy Policy</Link>
            </div>
            <div className="flex items-center gap-4">
              <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-background/50 hover:text-background transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href={`mailto:${socials.email}`} aria-label="Email" className="text-background/50 hover:text-background transition-colors"><Mail className="w-5 h-5" /></a>
              <a href={`tel:${socials.phone.replace(/\s/g, "")}`} aria-label="Phone" className="text-background/50 hover:text-background transition-colors"><Phone className="w-5 h-5" /></a>
            </div>
            <p className="font-body text-[11px] text-background/40 mt-4">{socials.email}</p>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-background/30">© 2024 MISHI Official. All rights reserved. Built with Royal Love.</p>
          <div className="flex items-center gap-1 text-background/30">
            <Crown className="w-3.5 h-3.5" />
            <span className="font-body text-xs">The Empire Stands Forever</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
