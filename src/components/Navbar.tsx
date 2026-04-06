import { useState } from "react";
import { Menu, X, ShoppingBag, ChevronDown, User } from "lucide-react";
import { Link } from "react-router-dom";
import mishiLogo from "@/assets/mishi-logo.jpg";

const collections = [
  { label: "Fine Jewellery", path: "/collections/fine-jewellery" },
  { label: "Lab Diamonds", path: "/collections/lab-diamonds" },
  { label: "Royal Apparel", path: "/collections/royal-apparel" },
  { label: "Streetwear", path: "/collections/streetwear" },
  { label: "Traditional Wear", path: "/collections/traditional-wear" },
  { label: "Custom Watches", path: "/collections/custom-watches" },
];

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Our Dastaan", path: "/dastaan" },
  { label: "Custom Orders", path: "/custom-orders" },
  { label: "Policies", path: "/policies" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCollections, setShowCollections] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white-gold-bright/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src={mishiLogo} alt="MISHI Official" className="h-10 lg:h-14 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="font-body text-xs font-medium tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}

            {/* Collections Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowCollections(true)}
              onMouseLeave={() => setShowCollections(false)}
            >
              <button className="flex items-center gap-1 font-body text-xs font-medium tracking-wider uppercase text-foreground/70 hover:text-foreground transition-colors duration-300">
                Collections <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCollections ? 'rotate-180' : ''}`} />
              </button>
              {showCollections && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                  <div className="glass-card rounded-lg border border-white-gold-bright/40 shadow-lg py-2 min-w-[200px] animate-fade-up">
                    {collections.map((col) => (
                      <Link
                        key={col.label}
                        to={col.path}
                        className="block px-5 py-2.5 font-body text-xs font-medium tracking-wider text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-colors"
                      >
                        {col.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 text-foreground/70 hover:text-foreground transition-colors">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">0</span>
            </Link>
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
            <div className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="font-body text-sm font-medium tracking-wider uppercase text-foreground/70 hover:text-foreground py-2.5 border-b border-border/50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="py-2">
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Collections</span>
                {collections.map((col) => (
                  <Link
                    key={col.label}
                    to={col.path}
                    onClick={() => setIsOpen(false)}
                    className="block font-body text-sm font-medium tracking-wider text-foreground/70 hover:text-foreground py-2 pl-4 border-b border-border/30 transition-colors"
                  >
                    {col.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
