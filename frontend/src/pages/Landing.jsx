import { useEffect } from "react";
import Lenis from "lenis";
import Nav from "../components/landing/Nav";
import Hero from "../components/landing/Hero";
import ProblemSection from "../components/landing/ProblemSection";
import SignatureBoard from "../components/landing/SignatureBoard";
import HowItWorks from "../components/landing/HowItWorks";
import OwnerProof from "../components/landing/OwnerProof";
import Footer from "../components/landing/Footer";
import MagicFeatures from "../components/magic/MagicFeatures";
import MagicPricing from "../components/magic/MagicPricing";
import MagicCTA from "../components/magic/MagicCTA";
import { useReveal } from "../lib/useReveal";

// Owner-facing feature set — matches the real capabilities the app ships.
const cup = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
    <path d="M18 8h1a3 3 0 0 1 0 6h-1" />
    <path d="M2 8h16v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" />
    <path d="M6 1v3M10 1v3M14 1v3" />
  </svg>
);
const users = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const bell = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const gift = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const cardIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const OWNER_FEATURES = [
  {
    title: "Saved usual",
    blurb: "Each regular's order is stored once. One tap each morning fires it with a ten-minute pickup window.",
    meta: "Reorder",
    icon: cup,
  },
  {
    title: "Regulars board",
    blurb: "See who is on a visit streak, who is active, and who is slipping away — your first real view of your regulars.",
    meta: "Owner",
    icon: users,
  },
  {
    title: "Absence alerts",
    blurb: "When a regular has not visited in five weekdays, you get a flag so you can re-engage before they are gone.",
    meta: "Retention",
    icon: bell,
  },
  {
    title: "Five-order reward",
    blurb: "A free drink unlocks automatically after five online orders. Coffee-bean pips track every step.",
    meta: "Loyalty",
    icon: gift,
  },
  {
    title: "Pay now or at store",
    blurb: "Card payment runs through Stripe when you connect it, or regulars simply settle in person.",
    meta: "Payments",
    icon: cardIcon,
  },
];

const PRICING_TIERS = [
  {
    title: "Monthly",
    description: "Unlimited regulars, unlimited reorders, one location. Cancel any time.",
    price: "$79",
    priceNote: "/ month",
    features: [
      { title: "Unlimited regulars", desc: "No cap on how many usuals you save." },
      { title: "Unlimited reorders", desc: "We never take a per-transaction cut." },
      { title: "Live morning board", desc: "Every order with its pickup window." },
      { title: "Absence alerts and loyalty", desc: "Catch churn, reward the loyal." },
    ],
    cta: "Start free",
    icon: "arrow",
    highlight: false,
  },
  {
    title: "Annual",
    description: "The same flat plan, billed yearly — two months on the house.",
    price: "$69",
    priceNote: "/ month, billed yearly",
    features: [
      { title: "Everything in monthly", desc: "All features, nothing held back." },
      { title: "Two months free", desc: "Pay for ten, get twelve." },
      { title: "No per-transaction cut", desc: "Your sales stay your sales." },
      { title: "Priority support", desc: "We answer fast during the rush." },
    ],
    cta: "Start free",
    icon: "arrow",
    highlight: true,
  },
  {
    title: "Multi-location",
    description: "For small groups running BrewPass across a few cafes.",
    price: "Custom",
    priceNote: "per group",
    features: [
      { title: "Every location on one login", desc: "Switch boards in a tap." },
      { title: "Group-wide loyalty", desc: "Regulars earn across your cafes." },
      { title: "Flat per-site pricing", desc: "Still no per-transaction cut." },
    ],
    cta: "Talk to us",
    icon: "phone",
    highlight: false,
  },
];

export default function Landing() {
  useReveal([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div style={{ background: "var(--surface)" }}>
      <Nav />
      <main>
        <Hero />
        <ProblemSection />
        <SignatureBoard />
        <HowItWorks />
        <section id="features">
          <MagicFeatures features={OWNER_FEATURES} />
        </section>
        <OwnerProof />
        <section id="pricing">
          <MagicPricing tiers={PRICING_TIERS} />
        </section>
        <MagicCTA
          badge="Get started"
          heading="Turn tomorrow's rush into confirmed orders."
          description="Send your first BrewPass link in two minutes. No app store, no POS swap, no per-transaction cut."
          buttons={{
            primary: { text: "Start free for one location", url: "/register" },
            secondary: { text: "Sign in", url: "/login" },
          }}
        />
      </main>
      <Footer />
    </div>
  );
}