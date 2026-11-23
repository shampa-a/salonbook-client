import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

import HeroSection from "@/components/marketing/HeroSection";
import DiscoverySections from "@/components/marketing/DiscoverySections";
import PromoBanner from "@/components/marketing/PromoBanner";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        <HeroSection />

        <DiscoverySections />

        <PromoBanner />
      </main>

      <SiteFooter />
    </>
  );
}