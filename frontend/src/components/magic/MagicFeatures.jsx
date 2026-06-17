import React, { useEffect, useRef, useState } from "react";

const cn = (...c) => c.filter(Boolean).join(" ");

function BentoItem({ feature, span, index, isVisible }) {
  const { icon, title, blurb, meta, animation } = feature;
  const animationDelay = `${Math.max(index * 0.12, 0)}s`;

  return (
    <article
      className={cn(
        "card group relative flex h-full flex-col justify-between overflow-hidden p-5 transition-transform duration-300 ease-out hover-lift",
        isVisible ? "reveal in" : "reveal",
        span
      )}
      style={{
        animationDelay,
        background: "var(--surface-2)",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--radius)",
      }}
    >
      <div className="absolute inset-0 -z-10 overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
        <div
          className="absolute inset-0 opacity-70 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(ellipse 60% 120% at 12% 0%, color-mix(in srgb, var(--brand) 24%, transparent), transparent 72%)",
          }}
        />
      </div>

      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            border: "1px solid var(--hairline)",
            background: "color-mix(in srgb, var(--brand) 14%, transparent)",
            color: "var(--brand)",
            animation,
          }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <header className="flex items-start gap-3">
            <h3
              className="text-base font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-1)", fontFamily: "Gabarito, sans-serif" }}
            >
              {title}
            </h3>
            {meta && (
              <span
                className="pill ml-auto px-2 py-0.5 text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "var(--text-2)", border: "1px solid var(--hairline)" }}
              >
                {meta}
              </span>
            )}
          </header>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
            {blurb}
          </p>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ borderRadius: "var(--radius)", boxShadow: "0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent) inset" }}
      />
    </article>
  );
}

export default function MagicFeatures(props) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "magic-features-animations";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes mf-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6%); } }
      @keyframes mf-pulse { 0%,100% { transform: scale(1); opacity: .85; } 50% { transform: scale(1.08); opacity: 1; } }
      @keyframes mf-tilt { 0% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } 100% { transform: rotate(-2deg); } }
      @keyframes mf-drift { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(6%,-6%,0); } }
      @keyframes mf-glow { 0%,100% { opacity: .6; } 50% { opacity: 1; } }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || typeof window === "undefined") return;
    const node = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const iconCup = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" style={{ animation: "mf-float 6s ease-in-out infinite" }}>
      <path d="M18 8h1a3 3 0 0 1 0 6h-1" />
      <path d="M2 8h16v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" />
      <path d="M6 1v3M10 1v3M14 1v3" />
    </svg>
  );
  const iconMenu = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" style={{ animation: "mf-tilt 5.5s ease-in-out infinite" }}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
  const iconBolt = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" style={{ animation: "mf-pulse 4s ease-in-out infinite" }}>
      <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
    </svg>
  );
  const iconStar = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" style={{ animation: "mf-glow 7s ease-in-out infinite" }}>
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
    </svg>
  );
  const iconPhone = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" style={{ animation: "mf-drift 8s ease-in-out infinite" }}>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );

  const features = props.features || [
    {
      title: "Tap-to-Order",
      blurb: "Guests scan, browse, and order from their table or the commuter line — no app, no waiting.",
      meta: "Order",
      icon: iconPhone,
    },
    {
      title: "Living Menu",
      blurb: "Update specials, sold-out items, and seasonal brews in seconds. Your board, always current.",
      meta: "Menu",
      icon: iconMenu,
    },
    {
      title: "Fresh Roasts",
      blurb: "Showcase signature drinks with photos that make every commuter pause for a cup.",
      meta: "Brew",
      icon: iconCup,
    },
    {
      title: "Skip the Line",
      blurb: "Pre-order on the way in and grab it on the way out — fast lane for regulars.",
      meta: "Speed",
      icon: iconBolt,
    },
    {
      title: "Loyalty Built In",
      blurb: "Reward repeat visits automatically. Every BrewPass scan earns a step toward a free pour.",
      meta: "Perks",
      icon: iconStar,
    },
  ];

  const spans = [
    "md:col-span-4 md:row-span-2",
    "md:col-span-2 md:row-span-1",
    "md:col-span-2 md:row-span-1",
    "md:col-span-3 md:row-span-1",
    "md:col-span-3 md:row-span-1",
  ];

  return (
    <div className="relative w-full" style={{ background: "var(--surface)", color: "var(--text-1)" }}>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in srgb, var(--text-1) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--text-1) 6%, transparent) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(circle at 50% 0%, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 0%, black, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 80% at 12% 0%, color-mix(in srgb, var(--brand) 14%, transparent), transparent 65%), radial-gradient(ellipse 40% 70% at 88% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 70%)",
          }}
        />
      </div>

      <section ref={sectionRef} className="relative mx-auto max-w-6xl px-6 py-20">
        <header
          className="mb-10 flex flex-col gap-6 pb-6 md:flex-row md:items-end md:justify-between"
          style={{ borderBottom: "1px solid var(--hairline)" }}
        >
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.35em]" style={{ color: "var(--text-2)" }}>
              The Commuter Board
            </span>
            <h2
              className="text-3xl font-black tracking-tight md:text-5xl text-gradient"
              style={{ fontFamily: "Gabarito, sans-serif" }}
            >
              Everything BrewPass Does
            </h2>
          </div>
          <p className="max-w-sm text-sm md:text-base" style={{ color: "var(--text-2)" }}>
            A digital menu and ordering system built for the morning rush — clear, fast, and always up to date.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 md:auto-rows-[minmax(120px,auto)] md:grid-cols-6">
          {features.map((feature, index) => (
            <BentoItem
              key={feature.title}
              span={spans[index % spans.length]}
              feature={feature}
              index={index}
              isVisible={visible}
            />
          ))}
        </div>

        <footer
          className="mt-16 pt-6 text-xs uppercase tracking-[0.2em]"
          style={{ borderTop: "1px solid var(--hairline)", color: "var(--text-2)" }}
        >
          Brewed for busy mornings · BrewPass
        </footer>
      </section>
    </div>
  );
}