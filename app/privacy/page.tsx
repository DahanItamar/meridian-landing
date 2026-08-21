import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { he } from "@/content/he";

export const metadata: Metadata = { title: `${he.legal.privacy.title} · ${he.brand.name}` };

export default function PrivacyPage() {
  return <LegalPage content={he} doc={he.legal.privacy} />;
}
