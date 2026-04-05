import Navbar from "@/components/Navbar";
import RoyalDastaan from "@/components/RoyalDastaan";
import Footer from "@/components/Footer";

const DastaanPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <RoyalDastaan />
      </div>
      <Footer />
    </div>
  );
};

export default DastaanPage;
