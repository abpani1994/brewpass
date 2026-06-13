import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import NumberTicker from "../ui/NumberTicker";
import { mmss } from "../../lib/format";

// SIGNATURE MOMENT — full-bleed departure board. The featured ticket runs a
// 10:00 -> 0:00 countdown, split-flap flips to READY with a teal pulse, then
// the board advances. Illustrative simulation; honours reduced motion.
const ROSTER = [
  { name: "Maya Cardoso", order: "oat flat white", arrive: "8:14", gate: "A1" },
  { name: "Dev Anand", order: "double macchiato", arrive: "8:22", gate: "A2" },
  { name: "Priya Shah", order: "vanilla latte", arrive: "8:29", gate: "B1" },
  { name: "Theo Mensah", order: "matcha latte", arrive: "8:36", gate: "B2" },
  { name: "Lena Fischer", order: "mocha, oat", arrive: "8:41", gate: "C1" },
];

export default function SignatureBoard() {
  const reduce = useReducedMotion();
  const [secs, setSecs] = useState(reduce ? 0 : 92);
  const [ready, setReady] = useState(reduce);
  const [confirmed, setConfirmed] = useState(reduce ? 41 : 37);
  const [featured, setFeatured] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          setReady(true);
          setConfirmed((c) => c + 1);
          setTimeout(() => {
            setReady(false);
            setFeatured((f) => (f + 1) % ROSTER.length);
            setSecs(80 + Math.floor(Math.random() * 120));
          }, 3400);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <section className="py-20 md:py-28" style={{ background: "var(--surface-2)" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p
              className="text-xs uppercase tracking-[0.18em] mb-3"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}
            >
              The morning board
            </p>
            <h2
              className="font-semibold leading-tight"
              style={{ fontFamily: "'Gabarito', sans-serif", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "var(--text-1)", letterSpacing: "-0.02em", overflowWrap: "anywhere" }}
            >
              This is the 7:50 rush — on time, every cup accounted for.
            </h2>
          </div>
          <div className="card shrink-0 text-center" style={{ padding: "1rem 1.5rem", background: "var(--surface)" }}>
            <div className="text-3xl font-semibold tabular-nums" style={{ color: "var(--accent)" }}>
              <NumberTicker value={confirmed} />
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
              orders confirmed today
            </div>
          </div>
        </div>

        <div
          className="rounded-[var(--radius)] overflow-hidden hairline noise"
          style={{ background: "var(--surface)" }}
        >
          <div
            className="flex items-center gap-2 px-5 py-3 hairline-b text-xs uppercase tracking-wider"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-2)" }}
          >
            <span
              className="pulse-glow"
              style={{ width: 7, height: 7, borderRadius: 999, background: "var(--accent)" }}
            />
            Departures · pickup window
          </div>

          <div className="divide-y" style={{ borderColor: "var(--hairline)" }}>
            {ROSTER.map((r, i) => {
              const isFeatured = i === featured;
              const isReady = isFeatured && ready;
              return (
                <motion.div
                  key={r.name}
                  layout
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-5 px-5 py-4"
                  style={{
                    background: isReady ? "var(--accent)" : "transparent",
                    transition: "background var(--dur-base) var(--ease-morph)",
                  }}
                  animate={
                    isReady && !reduce
                      ? { boxShadow: ["inset 0 0 0 0 var(--accent-glow)", "inset 0 0 40px 0 transparent"] }
                      : {}
                  }
                  transition={{ duration: 1.6, repeat: isReady ? Infinity : 0 }}
                >
                  <span
                    className="hidden sm:flex items-center justify-center w-9 h-9 rounded-[calc(var(--radius)-0.4rem)] text-xs font-bold tabular-nums"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      background: isReady ? "#1e1e2e" : "var(--surface-2)",
                      color: isReady ? "var(--accent)" : "var(--text-2)",
                    }}
                  >
                    {r.gate}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium truncate" style={{ color: isReady ? "#1e1e2e" : "var(--text-1)" }}>
                      {r.name}
                    </div>
                    <div className="text-sm truncate" style={{ color: isReady ? "#1e1e2e" : "var(--text-2)" }}>
                      {r.order} · arriving {r.arrive}
                    </div>
                  </div>
                  <div
                    className="text-right font-bold tabular-nums text-lg shrink-0"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: isReady ? "#1e1e2e" : isFeatured ? "var(--accent)" : "var(--text-2)",
                      minWidth: "5rem",
                    }}
                  >
                    {isReady ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Icon icon="ph:check-circle-fill" width="18" /> READY
                      </span>
                    ) : isFeatured ? (
                      mmss(secs)
                    ) : (
                      <span style={{ opacity: 0.6 }}>queued</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <p className="mt-5 text-sm" style={{ color: "var(--text-2)" }}>
          You just heard a regular vanishes unseen. Now watch their cup get ready before they
          walk in — that is the whole product in one held breath.
        </p>
      </div>
    </section>
  );
}