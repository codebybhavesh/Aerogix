import { Search, UserCheck, FileText } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "1",
    title: "Identify",
    desc: "Open Arogix and select your symptom using simple, intuitive icons.",
  },
  {
    icon: UserCheck,
    step: "2",
    title: "Match",
    desc: "Get paired with a certified doctor within 5 minutes—no waiting rooms.",
  },
  {
    icon: FileText,
    step: "3",
    title: "Recover",
    desc: "Receive your digital prescription and follow-up plan instantly.",
  },
];

const HowItWorks = () => {
  return (
    <section className="section-padding gradient-sky">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Three Taps to <span className="text-gradient">Better Health</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Simple enough for anyone to use—no tech expertise needed
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-0.5 bg-border" />

          {steps.map((s, i) => (
            <div key={i} className="text-center relative">
              <div className="w-14 h-14 rounded-full gradient-vitality flex items-center justify-center mx-auto mb-6 relative z-10 glow">
                <span className="text-xl font-bold text-primary-foreground">{s.step}</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-vitality-light flex items-center justify-center mx-auto mb-4">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
