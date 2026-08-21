import type { Content } from "./types";

/**
 * English copy for Meridian Specialty.
 *
 * Meridian is a fictional brand. The farm, the cupping score, the quotations and
 * the people below are all invented, and the footer says so on every page
 * (AC-035). The bag artwork is original work made for this project — no real
 * roaster's packaging, marks or copy appear anywhere on this site.
 */
export const en = {
  meta: {
    title: "Meridian Specialty — Single-origin Guji, Ethiopia, 1kg whole bean",
    description:
      "One farm, one harvest, and a roast date where the best-before usually goes. Natural-process Guji: jasmine, blueberry, stone fruit. Join the launch list.",
  },

  brand: { name: "Meridian", product: "Meridian Specialty · 1kg" },

  hero: {
    eyebrow: "Single origin · Guji, Ethiopia",
    headline: "Most coffee is anonymous.",
    sub: "Meridian Specialty is one farm in the Guji highlands, one harvest, and a roast date printed where the best-before usually goes. Natural process — jasmine on the nose, blueberry in the cup, and enough structure to pull as espresso.",
    cta: "Join the launch list",
    image: "/images/meridian-coffee-bag.png",
    imageAlt:
      "A one-kilogram Meridian Specialty coffee bag in matte black, with a cream label reading MERIDIAN SPECIALTY, Guji, Ethiopia",
    width: 1024,
    height: 1365,
  },

  proof: [
    { statValue: "87.5", statLabel: "SCA cupping score" },
    { statValue: "1,950m", statLabel: "Altitude, Guji highlands" },
    { statValue: "48h", statLabel: "Roasted to order, then shipped" },
  ],

  features: [
    {
      kicker: "Traceable to the estate",
      title: "One farm, named on the bag",
      body: "Most specialty coffee tells you the country and stops there, because the supply chain genuinely does not know the rest. Ours names the estate, the washing station, the altitude band and the harvest window — printed on the bag, not buried on a website. If a lot cannot be traced that far, we do not buy it.",
    },
    {
      kicker: "Developed for both",
      title: "Roasted light enough to taste the fruit, dark enough to pull",
      body: "A single origin this delicate is usually roasted for filter and falls apart under nine bars. We develop it slightly further — enough body to hold an espresso together without flattening the jasmine. One roast, both brew methods, and no compromise you can taste in the cup.",
    },
    {
      kicker: "Freshness, stated",
      title: "A roast date, not a best-before",
      body: "Coffee does not expire; it fades. It is at its best somewhere between seven and twenty-one days off the roast, and a best-before eighteen months out tells you nothing about that. We print the day it was roasted and let you do the arithmetic, which is the only honest way to sell a bag of coffee.",
    },
  ],

  specs: {
    heading: "The lot",
    rows: [
      { label: "Origin", value: "Guji Zone, Ethiopia" },
      { label: "Producer", value: "Hambela Estate" },
      { label: "Altitude", value: "1,950 – 2,100 m" },
      { label: "Varietal", value: "Ethiopian heirloom" },
      { label: "Process", value: "Natural, 18 days on raised beds" },
      { label: "Roast", value: "Medium-light, omni" },
      { label: "Tasting notes", value: "Jasmine, blueberry, stone fruit" },
      { label: "Format", value: "1 kg, whole bean" },
      { label: "Price", value: "$54 USD" },
    ],
  },

  testimonials: {
    heading: "Early bags, honest opinions",
    items: [
      {
        quote:
          "I had been buying the same supermarket single origin for years and assumed the sourness was how Ethiopian coffee tasted. It is not. It tasted like blueberries and I had to sit down.",
        name: "Dana Reyes",
        role: "Home barista, four years",
        avatar: null,
      },
      {
        quote:
          "We put it on as a guest espresso expecting to fight it. It pulled on the first try and stayed drinkable for three weeks, which almost never happens with a natural.",
        name: "Tomer Aviad",
        role: "Owner, Little Gauge Coffee",
        avatar: null,
      },
      {
        quote:
          "The roast date on the front is a small thing that changed how I buy coffee. I now notice that nobody else prints it.",
        name: "Priya Raman",
        role: "Drinks it black, brews it twice",
        avatar: null,
      },
    ],
  },

  faq: {
    heading: "Questions people actually ask",
    items: [
      {
        question: "What does natural process actually mean?",
        answer:
          "The cherry is dried whole, fruit still on, before the bean is hulled out — eighteen days on raised beds in our case, turned by hand. The fruit ferments against the seed as it dries, which is where the blueberry comes from. Washed coffees strip the fruit off first and taste cleaner and less wild.",
      },
      {
        question: "Espresso or filter?",
        answer:
          "Both, deliberately. The roast is developed a little further than a filter-only roaster would take it, so it holds together under pressure without losing the florals. If you only ever brew filter you will get a slightly rounder cup than a dedicated filter roast — that is the trade we chose.",
      },
      {
        question: "Why one kilogram?",
        answer:
          "Because 250g bags mean four times the packaging and four times the shipping for the same coffee. A kilogram is roughly six weeks for one daily espresso drinker. Keep it sealed, decant a week at a time, and it will still be good at the end.",
      },
      {
        question: "How should I store it?",
        answer:
          "Sealed, at room temperature, out of the light. Not the fridge — coffee is hygroscopic and will take on whatever else is in there. The freezer works for long-term storage if the bag is genuinely airtight, but for six weeks it is unnecessary.",
      },
      {
        question: "When does it ship?",
        answer:
          "The first harvest lands in spring, and we roast to order within forty-eight hours. Joining the launch list gets you one email when that opens — that is the entire purpose of the list.",
      },
      {
        question: "What if I do not like it?",
        answer:
          "Tell us and we refund the bag, including what you paid to ship it. Naturals are polarising, and a tasting note on a website cannot tell you whether you are someone who enjoys a coffee that tastes like fruit.",
      },
    ],
  },

  capture: {
    heading: "Be first when the harvest lands",
    sub: "One email when the first roast opens. No newsletter, no drip sequence, nothing else.",
    label: "Email address",
    placeholder: "you@example.com",
    submit: "Join the launch list",
    consent: "Email me once when Meridian Specialty launches. I can unsubscribe from any message.",
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
      "Meridian is a fictional brand. This site is a portfolio demonstration — the coffee, the farm, the cupping score, the testimonials and the people quoted are all invented. Nothing here is for sale.",
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
