export default function ProblemSection() {
  return (
    <section className="max-w-3xl mx-auto px-4 md:px-8 py-20 md:py-28 reveal">
      <p
        className="text-xs uppercase tracking-[0.18em] mb-5"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-2)" }}
      >
        The invisible loss
      </p>
      <h2
        className="font-semibold leading-tight"
        style={{ fontFamily: "'Gabarito', sans-serif", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "var(--text-1)", letterSpacing: "-0.02em" }}
      >
        The line moves slow. The commuter has a train.
      </h2>
      <p className="mt-5 text-lg leading-relaxed" style={{ color: "var(--text-2)" }}>
        By the time they would reach your counter, they are already gone — and you never
        knew their name. The regular who quietly stops coming is the churn you cannot see.
      </p>

      <div className="mt-10 grid sm:grid-cols-3 gap-px rounded-[var(--radius)] overflow-hidden hairline">
        {[
          { label: "Walk-aways", body: "Commuters abandon a line longer than a few people during rush." },
          { label: "Silent churn", body: "A regular's last visit passes unnoticed for weeks." },
          { label: "No record", body: "Without their order saved, every morning starts from zero." },
        ].map((s) => (
          <div key={s.label} className="p-6" style={{ background: "var(--surface)" }}>
            <p
              className="text-xs uppercase tracking-wider mb-2"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--brand)" }}
            >
              {s.label}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}