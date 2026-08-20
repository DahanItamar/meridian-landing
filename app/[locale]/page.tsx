import { notFound } from "next/navigation";
import { contentFor } from "@/lib/locale";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = contentFor(locale);
  if (!content) notFound();

  // Sections land in T-06 through T-10, in the order AC-011 requires.
  return (
    <main>
      <h1>{content.hero.headline}</h1>
    </main>
  );
}
