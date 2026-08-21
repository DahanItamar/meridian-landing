import { notFound } from "next/navigation";
import { FeatureBento } from "@/components/FeatureBento";
import { HeroScrolly } from "@/components/HeroScrolly";
import { SpecBento } from "@/components/SpecBento";
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
      <HeroScrolly content={content} />
      <FeatureBento content={content} />
      <SpecBento content={content} />
      <Testimonials content={content} />
    </main>
  );
}
