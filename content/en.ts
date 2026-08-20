import type { Content } from "./types";

/**
 * English copy for the Meridian M1.
 *
 * Meridian is a fictional brand and every figure, quotation and person below is
 * invented. The footer says so on every page (AC-035).
 */
export const en = {
  meta: {
    title: "Meridian M1 — Single-dose hand grinder for espresso",
    description:
      "A 38mm conical burr grinder built for one thing: espresso that does not channel. Join the launch list.",
  },

  brand: { name: "Meridian", product: "Meridian M1" },

  hero: {
    eyebrow: "Single-dose hand grinder",
    headline: "Espresso does not start at the machine.",
    sub: "It starts about thirty seconds earlier, at the grinder. The Meridian M1 holds its particle distribution to a 15-micron spread — which is the difference between a shot that channels and one that does not.",
    cta: "Join the launch list",
    image: "/images/hero-grinder.jpg",
    imageAlt:
      "The Meridian M1 hand grinder in brushed steel, standing upright beside a loaded portafilter on a dark counter",
  },

  proof: [
    { statValue: "15μm", statLabel: "Particle distribution spread" },
    { statValue: "38mm", statLabel: "Conical burrs, hardened steel" },
    { statValue: "22s", statLabel: "Typical time for an 18g dose" },
  ],

  features: [
    {
      title: "Burrs that were designed, not catalogue-ordered",
      body: "Most hand grinders buy a stock burr set and build a body around it. The M1 started at the other end. The 38mm conical geometry was cut for espresso specifically — a steeper primary angle that fractures beans instead of crushing them, which is what keeps the fines count down and the shot even.",
      image: "/images/feature-burrs.jpg",
      imageAlt: "Close view of the M1 conical burr set, showing the cutting geometry",
    },
    {
      title: "The setting stays where you put it",
      body: "Stepless adjustment is only useful if it holds. The M1 locks its adjustment ring against a sprung detent plate under the lower bearing, so the setting does not creep as you grind. Dial in once, and the next morning it is still dialled in.",
      image: "/images/feature-adjust.jpg",
      imageAlt: "The adjustment ring on the base of the M1, marked with numbered detents",
    },
    {
      title: "Built to be taken apart",
      body: "No adhesive, no pressed fittings, nothing that needs a workshop. Six hex screws and the whole grinder is on the counter in pieces for cleaning. Every part that wears is a part you can replace, and we will sell you the part.",
      image: "/images/feature-teardown.jpg",
      imageAlt: "The M1 disassembled into its component parts, laid out in order on a light surface",
    },
  ],

  specs: {
    heading: "Specifications",
    rows: [
      { label: "Burr set", value: "38mm conical, hardened steel" },
      { label: "Adjustment", value: "Stepless, 0.01mm per detent" },
      { label: "Capacity", value: "25g single dose" },
      { label: "Body", value: "CNC-machined 6061 aluminium" },
      { label: "Bearings", value: "Dual stainless, axially loaded" },
      { label: "Weight", value: "640g" },
      { label: "Warranty", value: "Five years, burrs included" },
      { label: "Price", value: "$285 USD" },
    ],
  },

  testimonials: {
    heading: "Early units, honest opinions",
    items: [
      {
        quote:
          "I had spent two years blaming my beans. Swapped the grinder, changed nothing else, and the sourness was simply gone. That is an uncomfortable thing to learn about your own setup.",
        name: "Dana Reyes",
        role: "Home barista, four years",
        avatar: null,
      },
      {
        quote:
          "We keep one behind the bar for single origins we only pull a few times a day. Faster than purging the big grinder, and the cup is better.",
        name: "Tomer Aviad",
        role: "Owner, Little Gauge Coffee",
        avatar: null,
      },
      {
        quote:
          "It is the only grinder I have owned that survived a year of being thrown into a bag. Still holds the setting.",
        name: "Priya Raman",
        role: "Travels with an espresso kit, regrettably",
        avatar: null,
      },
    ],
  },

  faq: {
    heading: "Questions people actually ask",
    items: [
      {
        question: "Why a hand grinder rather than electric?",
        answer:
          "Consistency per pound spent. A hand grinder puts almost the entire cost into burrs and bearings, where an electric of the same price is paying for a motor, a housing and a hopper. At $285 the M1 competes with electric grinders costing three times as much — you are simply supplying the motor.",
      },
      {
        question: "How long does a dose take?",
        answer:
          "About 22 seconds for 18 grams at espresso fineness, once the burrs have broken in over the first kilo. Filter grinds take roughly half that.",
      },
      {
        question: "Does it do filter as well as espresso?",
        answer:
          "It does, though the burr geometry is optimised for the espresso range. If you brew filter more often than espresso, a flat burr set will serve you better and we would rather say so than sell you the wrong grinder.",
      },
      {
        question: "How do I clean it?",
        answer:
          "Six hex screws, no adhesive, no special tool. A brush handles weekly maintenance without disassembly. A full strip-down takes about five minutes and the hex key ships in the box.",
      },
      {
        question: "When does it ship?",
        answer:
          "The first production run opens in spring. Joining the launch list gets you one email when it does — that is the entire purpose of the list.",
      },
      {
        question: "What if I do not get on with it?",
        answer:
          "Sixty days, return it for a full refund including the shipping you paid. A grinder is a personal thing and a photograph cannot tell you how one feels in the hand.",
      },
    ],
  },

  capture: {
    heading: "Be first when the M1 ships",
    sub: "One email when the first production run opens. No newsletter, no drip sequence, nothing else.",
    label: "Email address",
    placeholder: "you@example.com",
    submit: "Join the launch list",
    consent:
      "Email me once when the Meridian M1 launches. I can unsubscribe from any message.",
    consentNotice: "Your address is used only for that one email. How we handle it:",
    consentVersion: "2026-08-21.1",
    confirmSent: "Almost there — open the email we just sent and click the link to confirm.",
    success: "You are on the list.",
    errorInvalid: "That does not look like an email address.",
    errorConsent: "Tick the box above so we know we may email you.",
    errorNetwork: "Something went wrong on our end. Your address was not saved — try again.",
    errorRate: "Too many attempts from this connection. Wait a minute and try again.",
  },

  footer: {
    disclaimer:
      "Meridian is a fictional brand. This site is a portfolio demonstration — the product, the specifications, the statistics, the testimonials and the people quoted are all invented. Nothing here is for sale.",
    privacyLabel: "Privacy",
    a11yLabel: "Accessibility",
    rights: "© 2026 — a portfolio project by Itamar Dahan.",
  },

  privacy: {
    heading: "Privacy",
    body: [
      "This page describes what happens to an email address submitted through the launch list form on this site.",
      "Meridian is a fictional brand, but the addresses collected here are real and are treated as such.",
    ],
  },

  a11y: {
    heading: "Accessibility",
    body: [
      "This site is built to WCAG 2.2 Level AA.",
      "If any part of it does not work for you, we would like to know rather than assume.",
    ],
    contact: "accessibility@example.com",
  },
} satisfies Content;
