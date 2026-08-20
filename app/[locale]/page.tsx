import { notFound } from "next/navigation";
import { HeroSection } from "@/components/HeroSection";
import { contentFor } from "@/lib/locale";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = contentFor(locale);
  if (!content) notFound();

  // Remaining sections land in T-07 through T-10, in the order AC-011 requires.
  return (
    <main>
      <HeroSection content={content} />
    </main>
  );
}
