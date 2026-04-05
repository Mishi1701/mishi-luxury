import { useState } from "react";
import { Menu, X, ShoppingBag, Crown } from "lucide-react";
import mishiLogo from "@/assets/mishi-logo.jpg";

const navLinks = [
  { label: "Fine Jewellery", href: "#jewellery" },
  { label: "Lab Diamonds", href: "#diamonds" },
  { label: "Royal Apparel", href: "#apparel" },
  { label: "Our Dastaan", href: "#dastaan" },
  { label: "Custom Orders", href: "#custom" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white-gold-bright/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <img src={mishiLogo} alt="MISHI Official" className="h-10 lg:h-14 w-auto" />
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-body text-sm font-medium tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-white-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-foreground/70 hover:text-foreground transition-colors">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">0</span>
            </button>
            <button
              className="lg:hidden p-2 text-foreground/70"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-6 animate-fade-up">
            <div className="flex flex-col gap-3 pt-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-body text-sm font-medium tracking-wider uppercase text-foreground/70 hover:text-foreground py-2 border-b border-border/50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
