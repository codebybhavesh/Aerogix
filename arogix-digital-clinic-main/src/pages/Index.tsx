import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BridgeSection from "@/components/BridgeSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import HowItWorks from "@/components/HowItWorks";
import ImpactSection from "@/components/ImpactSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <BridgeSection />
      <FeaturesGrid />
      <HowItWorks />
      <ImpactSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default Index;
