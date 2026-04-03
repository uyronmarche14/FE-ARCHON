import { PublicFeatureSection } from "@/features/public/components/public-feature-section";
import { PublicFinalCta } from "@/features/public/components/public-final-cta";
import { PublicHero } from "@/features/public/components/public-hero";
import { PublicProofStrip } from "@/features/public/components/public-proof-strip";

export default function HomePage() {
  return (
    <main className="public-page-shell py-6 sm:py-8 lg:py-10">
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <PublicHero />
        <PublicProofStrip />
        <PublicFeatureSection />
        <PublicFinalCta />
      </div>
    </main>
  );
}
