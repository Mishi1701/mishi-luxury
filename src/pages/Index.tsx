import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import LuxuryChambers from "@/components/LuxuryChambers";
import RoyalDastaan from "@/components/RoyalDastaan";
import CustomOrderCTA from "@/components/CustomOrderCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TrustBadges />
      <LuxuryChambers />
      <RoyalDastaan />
      <CustomOrderCTA />
      <Footer />
    </div>
  );
};

export default Index;
