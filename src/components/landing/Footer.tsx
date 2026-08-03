import { Heart, Leaf } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-9 h-9 rounded-xl gradient-vitality flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground absolute" strokeWidth={2.5} />
                <Leaf className="w-3 h-3 text-primary-foreground absolute top-1 right-1 opacity-80" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold">Arogix</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              Empowering rural communities through digital health innovation. Healthcare without distance.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/50">Platform</h4>
            <ul className="space-y-2.5">
              {["Features", "How it Works", "For Doctors", "Pricing"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/50">Company</h4>
            <ul className="space-y-2.5">
              {["About Us", "Impact Report", "Careers", "Contact"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/50">Legal</h4>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Doctor Onboarding", "NGO Partnerships"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 text-center">
          <p className="text-sm text-primary-foreground/50">
            © 2026 Arogix. Bridging the gap, saving lives.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
