import { DownloadApp } from "@/components/DownloadApp";
import { FeatureStrip } from "@/components/FeatureStrip";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { MadeWithCare } from "@/components/MadeWithCare";
import { Navbar } from "@/components/Navbar";
import { WholesomeMeals } from "@/components/WholesomeMeals";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeatureStrip />
        <MadeWithCare />
        <HowItWorks />
        <WholesomeMeals />
        <DownloadApp />
      </main>
      <Footer />
    </>
  );
}
