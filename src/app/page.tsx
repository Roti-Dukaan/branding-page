import { HashScroll } from "@/components/HashScroll";
import { DownloadApp } from "@/components/DownloadApp";
import { FeatureStrip } from "@/components/FeatureStrip";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MadeWithCare } from "@/components/MadeWithCare";
import { MarketingProviders } from "@/components/MarketingProviders";
import { Navbar } from "@/components/Navbar";
import { WholesomeMeals } from "@/components/WholesomeMeals";

export default function Home() {
  return (
    <MarketingProviders>
      <HashScroll />
      <Navbar />
      <main>
        <Hero />
        <FeatureStrip />
        <MadeWithCare />
        <WholesomeMeals />
        <DownloadApp />
      </main>
      <Footer />
    </MarketingProviders>
  );
}
