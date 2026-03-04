import { useState } from "react";
import { Menu, X, Heart, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const links = ["Home", "Features", "Impact", "Testimonials"];

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 rounded-xl gradient-vitality flex items-center justify-center glow">
              <Heart className="w-4 h-4 text-primary-foreground absolute" strokeWidth={2.5} />
              <Leaf className="w-3 h-3 text-primary-foreground absolute top-1 right-1 opacity-80" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              Arog<span className="text-gradient">ix</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {l}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button size="lg" className="gradient-vitality text-primary-foreground font-semibold rounded-xl px-6 glow">
              Quick Consult
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-fade-up">
          <div className="px-4 py-4 space-y-2">
            {links.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={() => setOpen(false)}
                className="block py-3 px-4 text-base font-medium text-foreground rounded-xl hover:bg-muted transition-colors"
              >
                {l}
              </a>
            ))}
            <Button className="w-full gradient-vitality text-primary-foreground font-semibold rounded-xl mt-2 glow">
              Quick Consult
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
