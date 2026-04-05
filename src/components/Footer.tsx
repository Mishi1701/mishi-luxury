import { Crown, Instagram, Mail, Phone } from "lucide-react";
import mishiLogo from "@/assets/mishi-logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background/80 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <img src={mishiLogo} alt="MISHI" className="h-12 w-auto mb-4 brightness-[10]" />
            <p className="font-body text-sm text-background/50 leading-relaxed">
              Where Love Unites Empires. A legacy of fine jewellery, lab grown diamonds, 
              and premium fashion — built on a sacred promise.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">The Empire</h4>
            <div className="flex flex-col gap-2">
              {["Fine Jewellery", "Lab Grown Diamonds", "Royal Apparel", "Custom Orders", "Our Dastaan"].map(link => (
                <a key={link} href="#" className="font-body text-sm text-background/50 hover:text-background transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Policies & Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">Royal Decrees</h4>
            <div className="flex flex-col gap-2 mb-6">
              <a href="#" className="font-body text-sm text-background/50 hover:text-background transition-colors">15-Day Delivery Policy</a>
              <a href="#" className="font-body text-sm text-background/50 hover:text-background transition-colors">4-Day Return Policy</a>
              <a href="#" className="font-body text-sm text-background/50 hover:text-background transition-colors">Privacy Policy</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-background/50 hover:text-background transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-background/50 hover:text-background transition-colors"><Mail className="w-5 h-5" /></a>
              <a href="#" className="text-background/50 hover:text-background transition-colors"><Phone className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-background/30">
            © 2024 MISHI Official. All rights reserved. Built with Royal Love.
          </p>
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
