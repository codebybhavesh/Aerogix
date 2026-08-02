import * as React from "react";
import { useState } from "react";
import { Menu, X, Heart, Leaf, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import logoImg from "@/assets/dashboard/logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const links = ["Home", "Features", "Impact", "Testimonials"];

  const handleAuthAction = () => {
    if (user) {
      navigate(role === "doctor" ? "/doctor" : "/patient");
    } else {
      navigate("/login");
    }
  };

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img src={logoImg} alt="Arogix Logo" className="h-10 w-auto" />
          </Link>

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
            {user ? (
              <Button
                size={"lg" as any}
                className="gradient-vitality text-primary-foreground font-semibold rounded-xl px-6 glow"
                onClick={handleAuthAction}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/login", { state: { role: 'patient' } })}
                >
                  Login as Patient
                </Button>
                <Button
                  variant="ghost"
                  className="font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/login", { state: { role: 'doctor' } })}
                >
                  Login as Doctor
                </Button>
                <Button
                  size={"lg" as any}
                  className="gradient-vitality text-primary-foreground font-semibold rounded-xl px-6 glow"
                  onClick={() => navigate("/register")}
                >
                  Sign Up
                </Button>
              </>
            )}
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
            {user ? (
              <Button
                className="w-full gradient-vitality text-primary-foreground font-semibold rounded-xl mt-2 glow"
                onClick={() => {
                  setOpen(false);
                  handleAuthAction();
                }}
              >
                Dashboard
              </Button>
            ) : (
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="outline"
                  className="w-full font-semibold rounded-xl"
                  onClick={() => {
                    setOpen(false);
                    navigate("/login", { state: { role: 'patient' } });
                  }}
                >
                  Login as Patient
                </Button>
                <Button
                  variant="outline"
                  className="w-full font-semibold rounded-xl"
                  onClick={() => {
                    setOpen(false);
                    navigate("/login", { state: { role: 'doctor' } });
                  }}
                >
                  Login as Doctor
                </Button>
                <Button
                  className="w-full gradient-vitality text-primary-foreground font-semibold rounded-xl glow"
                  onClick={() => {
                    setOpen(false);
                    navigate("/register");
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
