import { Video, CalendarCheck, ShieldCheck, PhoneCall } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Tele-Clinic",
    desc: "Adaptive video quality for 3G/4G connections. Consult face-to-face with doctors from anywhere.",
  },
  {
    icon: CalendarCheck,
    title: "Smart Appointments",
    desc: "Book and manage appointments effortlessly. Get reminders and follow-up scheduling built in.",
  },
  {
    icon: ShieldCheck,
    title: "Digital Health Vault",
    desc: "Your complete medical history stored securely in the cloud. Accessible anytime, anywhere.",
  },
  {
    icon: PhoneCall,
    title: "24/7 Emergency Support",
    desc: "Instant emergency alerts with geolocation. Help reaches you when every second counts.",
  },
];

const FeaturesGrid = () => {
  return (
    <section id="features" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            The Four <span className="text-gradient">Pillars</span> of Care
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need for complete healthcare, right from your phone
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-6 border border-border card-hover group cursor-default"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-vitality-light flex items-center justify-center mb-5 group-hover:gradient-vitality transition-all duration-300">
                <f.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
