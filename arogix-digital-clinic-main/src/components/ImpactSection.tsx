import { useEffect, useRef, useState } from "react";
import { MapPin, Stethoscope, TrendingDown } from "lucide-react";
import Particles from "./Particles";

const metrics = [
  { icon: MapPin, value: 50, suffix: "+", label: "Villages Empowered" },
  { icon: Stethoscope, value: 10, suffix: "k+", label: "Consultations Completed" },
  { icon: TrendingDown, value: 35, suffix: "%", label: "Travel Cost Reduction" },
];

function useCountUp(target: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const duration = 1500;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    let startTime: number | null = null;
    requestAnimationFrame(step);
  }, [active, target]);
  return count;
}

const Counter = ({ metric, active }: { metric: typeof metrics[0]; active: boolean }) => {
  const count = useCountUp(metric.value, active);
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl bg-vitality-light flex items-center justify-center mx-auto mb-4">
        <metric.icon className="w-7 h-7 text-primary" />
      </div>
      <p className="text-4xl sm:text-5xl font-bold text-foreground mb-1">
        {count}{metric.suffix}
      </p>
      <p className="text-muted-foreground font-medium">{metric.label}</p>
    </div>
  );
};

const ImpactSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="impact" className="section-padding bg-background" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Our <span className="text-gradient">Impact</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Real numbers. Real lives changed.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {metrics.map((m, i) => (
            <Counter key={i} metric={m} active={visible} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
