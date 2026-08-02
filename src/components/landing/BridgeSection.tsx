import { MapPin, Clock, AlertTriangle, Smartphone, Cloud, Siren, ArrowRight } from "lucide-react";

const problems = [
  { icon: MapPin, label: "50km average distance to a clinic", color: "text-destructive" },
  { icon: Clock, label: "6-hour wait times for specialists", color: "text-destructive" },
  { icon: AlertTriangle, label: "Critical delays in emergencies", color: "text-destructive" },
];

const solutions = [
  { icon: Smartphone, label: "Instant video-link to doctors", color: "text-primary" },
  { icon: Cloud, label: "Lifetime digital health records", color: "text-primary" },
  { icon: Siren, label: "Geolocation-based emergency alerts", color: "text-primary" },
];

const BridgeSection = () => {
  return (
    <section className="section-padding gradient-sky">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            From <span className="text-destructive">Burden</span> to{" "}
            <span className="text-gradient">Breakthrough</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how Arogix transforms the rural healthcare journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch relative">
          {/* Arrow connector (desktop) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-14 h-14 rounded-full gradient-vitality flex items-center justify-center glow">
              <ArrowRight className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          {/* Problem */}
          <div className="bg-background rounded-2xl p-8 border border-destructive/15" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-6">
              The Burden
            </div>
            <div className="space-y-5">
              {problems.map((p, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <p.icon className="w-5 h-5 text-destructive" />
                  </div>
                  <p className="text-foreground font-medium pt-2.5 text-base">{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div className="bg-background rounded-2xl p-8 border border-primary/15 glow" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vitality-light text-primary text-sm font-medium mb-6">
              The Arogix Solution
            </div>
            <div className="space-y-5">
              {solutions.map((s, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-vitality-light flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-foreground font-medium pt-2.5 text-base">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BridgeSection;
