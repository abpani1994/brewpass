import React from "react";

const cn = (...c) => c.filter(Boolean).join(" ");

export default function MagicCTA({
  badge = "Get started",
  heading = "Order ahead. Skip the line.",
  description = "Join your neighbors who breeze past the morning rush with BrewPass. Browse our digital menu, order in seconds, and pick up your perfect brew — no waiting, no fuss.",
  buttons = {
    primary: { text: "Start ordering", url: "#order" },
    secondary: { text: "Talk to us", url: "#contact" },
  },
}) {
  return (
    <section className="w-full py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div
          className="relative overflow-hidden card flex flex-col items-center gap-8 p-8 text-center lg:p-16 reveal"
          style={{ borderRadius: "var(--radius)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-30"
            style={{ background: "var(--brand)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl opacity-30"
            style={{ background: "var(--accent)" }}
          />

          {badge && (
            <div className="relative">
              <span className="pill inline-flex items-center gap-2 text-sm">
                <span
                  className="inline-block h-2 w-2 rounded-full animate-pulse"
                  style={{ background: "var(--accent)" }}
                />
                {badge}
              </span>
            </div>
          )}

          <div className="relative flex flex-col gap-3">
            <h3
              className="text-3xl md:text-5xl tracking-tight max-w-2xl mx-auto text-gradient"
              style={{ fontFamily: "Gabarito, sans-serif" }}
            >
              {heading}
            </h3>
            <p
              className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ color: "var(--text-2)", fontFamily: "Inter, sans-serif" }}
            >
              {description}
            </p>
          </div>

          <div className="relative flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            {buttons.secondary && (
              <a
                href={buttons.secondary.url}
                className={cn("btn-secondary hover-lift inline-flex items-center justify-center gap-2 w-full sm:w-auto")}
              >
                {buttons.secondary.text}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>
            )}
            {buttons.primary && (
              <a
                href={buttons.primary.url}
                className={cn("btn-cta hover-lift inline-flex items-center justify-center gap-2 w-full sm:w-auto")}
              >
                {buttons.primary.text}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}