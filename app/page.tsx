import { NavBar } from "@/components/layout/NavBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PackScrolly } from "@/components/scrolly/PackScrolly";
import { RoastCountdown } from "@/components/sections/RoastCountdown";
import { WaitlistSection } from "@/components/sections/WaitlistSection";
import { he } from "@/content/he";

/**
 * `Meridian Landing.dc.html`, as a page.
 *
 * Three sections and a footer. The pinned sequence is the whole first act —
 * 350vh of scroll driving one 3D pack through three beats — and everything
 * below it exists so the page still works for someone who never scrolls
 * through the sequence at all.
 */
export default function LandingPage() {
  return (
    <>
      <NavBar content={he} />
      <main>
        <PackScrolly content={he} />
        <RoastCountdown content={he} />
        <WaitlistSection content={he} />
      </main>
      <SiteFooter content={he} />
    </>
  );
}
