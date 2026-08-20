import { notFound } from "next/navigation";
import { FeatureBlock } from "@/components/FeatureBlock";
import { HeroSection } from "@/components/HeroSection";
import { SocialProof } from "@/components/SocialProof";
import { SpecGrid } from "@/components/SpecGrid";
import { Testimonials } from "@/components/Testimonials";
import { contentFor } from "@/lib/locale";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = contentFor(locale);
  if (!content) notFound();

  // FAQ, email capture and footer follow in T-08 through T-10 (AC-011).
  return (
    <main>
      <HeroSection content={content} />
      <SocialProof content={content} />
      <section className="bg-surface">
        {content.features.map((feature, index) => (
          <FeatureBlock key={feature.title} feature={feature} index={index} />
        ))}
      </section>
      <SpecGrid content={content} />
      <Testimonials content={content} />
    </main>
  );
}
