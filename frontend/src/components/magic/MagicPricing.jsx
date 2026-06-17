import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const cn = (...c) => c.filter(Boolean).join(" ");

const Check = ({ className, style }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRight = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const Phone = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

/**
 * Scroll-driven 3D split panel, built with Framer Motion's `useScroll` +
 * `useTransform` exactly like the Framer University "3D image split scroll"
 * recipe. The shared `scrollYProgress` (0 at "start end", 1 at "end start")
 * drives each panel: outer panels swing in from their own edge while the
 * center panel rises from depth, all settling flat as the section reaches the
 * middle of the viewport. Honors prefers-reduced-motion.
 */
function PricingCard({ tier, index, count, scrollYProgress, reduced }) {
  const center = (count - 1) / 2;
  const dir = index < center ? -1 : index > center ? 1 : 0;
  // Slight per-panel stagger so the trio resolves in sequence.
  const stagger = count > 1 ? (index / (count + 1)) * 0.22 : 0;
  const settle = 0.5 + stagger;

  const rotateY = useTransform(scrollYProgress, [0, settle], [dir * 42, 0]);
  const translateX = useTransform(scrollYProgress, [0, settle], [dir * 110, 0]);
  const translateZ = useTransform(
    scrollYProgress,
    [0, settle],
    [dir === 0 ? -320 : -200, 0]
  );
  const translateY = useTransform(
    scrollYProgress,
    [0, settle],
    [dir === 0 ? 70 : 28, 0]
  );
  const opacity = useTransform(scrollYProgress, [0, settle * 0.85], [0.1, 1]);

  const motionStyle = reduced
    ? { transformStyle: "preserve-3d" }
    : {
        transformStyle: "preserve-3d",
        rotateY,
        x: translateX,
        z: translateZ,
        y: translateY,
        opacity,
        willChange: "transform, opacity",
      };

  return (
    <motion.div className="flex" style={motionStyle}>
      <div
        className={cn(
          "card hover-lift flex w-full flex-col p-6 transition-all duration-300",
          tier.highlight && "lg:-translate-y-4 lg:scale-[1.03]"
        )}
        style={{
          background: tier.highlight ? "var(--surface-2)" : "var(--surface)",
          borderColor: tier.highlight ? "var(--brand)" : "var(--hairline)",
          borderWidth: tier.highlight ? "2px" : "1px",
          borderStyle: "solid",
          borderRadius: "var(--radius)",
          boxShadow: tier.highlight ? "0 20px 50px -20px var(--brand)" : "none",
        }}
      >
        <div className="flex items-start justify-between">
          <h3
            className="text-xl font-semibold"
            style={{
              fontFamily: "Gabarito, sans-serif",
              color: tier.highlight ? "var(--brand)" : "var(--text-1)",
            }}
          >
            {tier.title}
          </h3>
          {tier.highlight && (
            <span
              className="pill text-xs font-semibold"
              style={{
                background: "var(--brand)",
                color: "var(--surface)",
              }}
            >
              Most Popular
            </span>
          )}
        </div>

        <p className="mt-3 text-sm" style={{ color: "var(--text-2)" }}>
          {tier.description}
        </p>

        <div className="mt-6 flex flex-col gap-8">
          <p className="flex flex-row items-baseline gap-2">
            <span
              className="text-4xl font-bold tracking-tight"
              style={{ fontFamily: "Gabarito, sans-serif" }}
            >
              {tier.price}
            </span>
            <span className="text-sm" style={{ color: "var(--text-2)" }}>
              {tier.priceNote}
            </span>
          </p>

          <div className="flex flex-col gap-4">
            {tier.features.map((f, fi) => (
              <div key={fi} className="flex flex-row gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full"
                  style={{
                    background: "color-mix(in srgb, var(--accent) 18%, transparent)",
                  }}
                >
                  <Check className="h-3 w-3" style={{ color: "var(--accent)" }} />
                </span>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-xs" style={{ color: "var(--text-2)" }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            className={cn(
              "inline-flex w-full items-center justify-center gap-2",
              tier.highlight ? "btn-cta" : "btn-secondary"
            )}
          >
            {tier.cta}
            {tier.icon === "phone" ? (
              <Phone className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MagicPricing(props) {
  const reduced = useReducedMotion();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const tiers = props.tiers || [
    {
      title: "Regular",
      description: "For the casual visitor who likes to skip the line and order ahead.",
      price: "Free",
      priceNote: "no commitment",
      features: [
        { title: "Browse the digital menu", desc: "Full menu with photos, always up to date." },
        { title: "Order ahead", desc: "Skip the queue and pick up when ready." },
        { title: "Save favorites", desc: "Reorder your usual in one tap." },
      ],
      cta: "Get started",
      icon: "arrow",
      highlight: false,
    },
    {
      title: "BrewPass+",
      description: "For the daily regular who wants perks, rewards, and faster mornings.",
      price: "$8",
      priceNote: "/ month",
      features: [
        { title: "Everything in Regular", desc: "All the basics, included." },
        { title: "10% off every order", desc: "Savings that pay for the pass." },
        { title: "Free drink weekly", desc: "One house coffee on us, each week." },
        { title: "Priority pickup", desc: "Your order jumps the prep line." },
      ],
      cta: "Join BrewPass+",
      icon: "arrow",
      highlight: true,
    },
    {
      title: "Office",
      description: "For teams who keep the office caffeinated and want one tidy bill.",
      price: "Custom",
      priceNote: "per team",
      features: [
        { title: "Group ordering", desc: "Collect the whole team's order at once." },
        { title: "Monthly invoicing", desc: "One statement, no shared cards." },
        { title: "Dedicated barista line", desc: "Bulk orders prepped on schedule." },
      ],
      cta: "Talk to us",
      icon: "phone",
      highlight: false,
    },
  ];

  return (
    <section className="w-full py-20 lg:py-28" style={{ color: "var(--text-1)" }}>
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="pill" style={{ color: "var(--brand)" }}>
            Pricing
          </span>
          <div className="flex flex-col gap-3">
            <h2
              className="max-w-xl text-3xl font-bold tracking-tight md:text-5xl"
              style={{ fontFamily: "Gabarito, sans-serif" }}
            >
              Plans that fit your <span className="text-gradient">coffee habit</span>
            </h2>
            <p
              className="mx-auto max-w-xl text-lg leading-relaxed"
              style={{ color: "var(--text-2)" }}
            >
              From the occasional flat white to fueling the whole office —
              pick the pass that keeps your cup full.
            </p>
          </div>

          <div
            ref={containerRef}
            className="grid w-full grid-cols-1 gap-6 pt-14 text-left lg:grid-cols-3"
            style={{ perspective: "1400px", perspectiveOrigin: "50% 40%" }}
          >
            {tiers.map((tier, i) => (
              <PricingCard
                key={tier.title}
                tier={tier}
                index={i}
                count={tiers.length}
                scrollYProgress={scrollYProgress}
                reduced={reduced}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
