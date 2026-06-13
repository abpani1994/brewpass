import { Icon } from "@iconify/react";
import RewardPips from "../ui/RewardPips";
import StatusPill from "../ui/StatusPill";

const REGULARS = [
  { name: "Maya Cardoso", usual: "Oat flat white", streak: 12, status: "active", pips: 4 },
  { name: "Dev Anand", usual: "Double macchiato", streak: 7, status: "active", pips: 2 },
  { name: "Priya Shah", usual: "Vanilla latte", streak: 3, status: "at-risk", pips: 5 },
  { name: "Theo Mensah", usual: "Matcha latte", streak: 0, status: "lapsed", pips: 1 },
];

export default function OwnerProof() {
  return (
    <section className="py-20 md:py-28" style={{ background: "var(--surface-2)" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 reveal">
          <p
            className="text-xs uppercase tracking-[0.18em] mb-3"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--brand)" }}
          >
            For the owner
          </p>
          <h2
            className="font-semibold leading-tight"
            style={{ fontFamily: "'Gabarito', sans-serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "var(--text-1)", letterSpacing: "-0.02em" }}
          >
            Your first-ever view of who keeps you in business.
          </h2>
          <p className="mt-5 text-lg leading-relaxed" style={{ color: "var(--text-2)" }}>
            See who is on a streak, who just earned a free drink, and who has not walked in for
            five weekdays — before you lose them for good.
          </p>
        </div>

        <div className="lg:col-span-7 reveal">
          <div className="card" style={{ background: "var(--surface)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="ph:users-three" width="20" style={{ color: "var(--accent)" }} />
              <span className="font-semibold" style={{ color: "var(--text-1)" }}>Today's regulars</span>
            </div>
            <div
              className="flex items-center gap-2 rounded-[calc(var(--radius)-0.2rem)] px-4 py-3 mb-4 text-sm"
              style={{ background: "color-mix(in srgb, #d97706 16%, var(--surface))", border: "1px solid color-mix(in srgb, #d97706 40%, transparent)", color: "var(--text-1)" }}
            >
              <Icon icon="ph:bell-ringing" width="18" style={{ color: "#d97706" }} />
              Theo Mensah has not visited in 5 weekdays. Send a re-engage text.
            </div>
            <div className="flex flex-col gap-2">
              {REGULARS.map((r) => (
                <div
                  key={r.name}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.4fr_1fr_auto] items-center gap-3 px-3 py-2.5 rounded-[calc(var(--radius)-0.3rem)]"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate" style={{ color: "var(--text-1)" }}>{r.name}</div>
                    <div className="text-xs truncate" style={{ color: "var(--text-2)" }}>{r.usual}</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-sm tabular-nums" style={{ color: "var(--text-2)" }}>
                    <Icon icon="ph:flame" width="15" style={{ color: r.streak > 0 ? "var(--brand)" : "var(--text-2)" }} />
                    {r.streak} day streak
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <StatusPill status={r.status} />
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <RewardPips filled={r.pips} size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}