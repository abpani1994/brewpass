import { Icon } from "@iconify/react";

const STEPS = [
  {
    icon: "ph:chat-circle-dots",
    title: "One purchase saves the order",
    body: "At their first visit, you text a BrewPass link. They set their usual once — oat flat white, no sugar.",
  },
  {
    icon: "ph:hand-tap",
    title: "One tap each morning fires it",
    body: "Their saved usual is waiting. A single tap confirms the order on the way to the train.",
  },
  {
    icon: "ph:coffee",
    title: "Ten minutes later, on the counter",
    body: "It lands on your morning board with a pickup window. They skip the line entirely.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-xl mb-12">
          <p
            className="text-xs uppercase tracking-[0.18em] mb-3"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--brand)" }}
          >
            The loop
          </p>
          <h2
            className="font-semibold leading-tight"
            style={{ fontFamily: "'Gabarito', sans-serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "var(--text-1)", letterSpacing: "-0.02em" }}
          >
            One purchase saves it. One tap fires it.
          </h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-6 md:gap-8">
          {/* connecting line */}
          <div
            className="hidden md:block absolute top-7 left-0 right-0 h-px"
            style={{ background: "var(--hairline)" }}
            aria-hidden
          />
          {STEPS.map((s, i) => (
            <div key={s.title} className="reveal relative" style={{ transitionDelay: `${i * 60}ms` }}>
              <div
                className="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-[var(--radius)] mb-5"
                style={{ background: "var(--surface-2)", border: "1px solid var(--hairline)" }}
              >
                <Icon icon={s.icon} width="26" style={{ color: "var(--accent)" }} />
                <span
                  className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  style={{ background: "var(--brand)", color: "#1e1e2e", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-1)" }}>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}