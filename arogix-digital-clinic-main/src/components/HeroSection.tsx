import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden pt-20">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-vitality-light rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/4" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vitality-light border border-primary/20 text-sm font-medium text-primary animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
              Bridging the Gap, Saving Lives
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Your Health, No Longer Bound by{" "}
              <span className="text-gradient">Distance</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Arogix brings certified medical expertise to your doorstep, ensuring every village has the care it deserves.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button size="lg" className="gradient-vitality text-primary-foreground font-semibold rounded-xl px-8 h-14 text-base glow">
                Consult Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl px-8 h-14 text-base border-border hover:bg-muted font-medium">
                <Play className="w-5 h-5 mr-2" />
                See Our Impact
              </Button>
            </div>

            {/* Trust bar */}
            <div className="flex items-center gap-6 pt-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">50+</p>
                <p className="text-xs text-muted-foreground">Villages</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">10k+</p>
                <p className="text-xs text-muted-foreground">Consultations</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">24/7</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-elevated)" }}>
              <img
                src={heroBg}
                alt="Rural patient connecting with doctor via video call on smartphone"
                className="w-full h-auto object-cover rounded-2xl"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent rounded-2xl" />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-background rounded-2xl p-4 border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-vitality flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Live Consultation</p>
                  <p className="text-xs text-muted-foreground">Works on 3G networks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
