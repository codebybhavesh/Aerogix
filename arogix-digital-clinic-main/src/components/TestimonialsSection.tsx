import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "I used to travel 4 hours by bus for a 10-minute checkup. Now, I speak to my doctor from my living room.",
    name: "Ramesh K.",
    role: "Farmer, Madhya Pradesh",
  },
  {
    quote: "My mother got emergency support within minutes. Arogix literally saved her life that night.",
    name: "Sunita D.",
    role: "Teacher, Rajasthan",
  },
  {
    quote: "The digital health vault means I never lose a prescription again. Everything is on my phone.",
    name: "Priya M.",
    role: "Community Health Worker",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="section-padding gradient-sky">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Community <span className="text-gradient">Voices</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Stories from the people whose lives have changed
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-background rounded-2xl p-8 border border-border card-hover"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground leading-relaxed mb-6 text-base">
                "{t.quote}"
              </p>
              <div>
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
