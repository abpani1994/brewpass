import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import NumberTicker from "../ui/NumberTicker";
import { mmss } from "../../lib/format";

// Illustrative marketing simulation of the live "morning board".
// Continuously runs: the featured ticket counts 10:00 -> 0:00, flips to READY
// with a teal pulse, then resets. This is a clearly-illustrative hero demo.
const TICKETS = [
  { name: "Maya", order: "oat flat white", arrive: "8:14" },
  { name: "Dev", order: "double macchiato", arrive: "8:22" },
  { name: "Priya", order: "vanilla latte", arrive: "8:29" },
  { name: "Theo", order: "matcha latte", arrive: "8:36" },
];

export default function MorningBoard() {
  const reduce = useReducedMotion();
  const [seconds, setSeconds] = useState(reduce ? 0 : 137);
  const [ready, setReady] = useState(reduce);
  const [confirmed, setConfirmed] = useState(reduce ? 28 : 24);
  const timer = useRef(null);

  useEffect(() => {
    if (reduce) return;
    timer.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setReady(true);
          setConfirmed((c) => c + 1);
          // hold READY a moment, then reset the cycle
          setTimeout(() => {
            setReady(false);
            setSeconds(137 + Math.floor(Math.random() * 120));
          }, 3200);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [reduce]);

  return (
    <div
      className="card noise"
      style={{ background: "var(--surface-2)", padding: "1.25rem" }}
      aria-label="Live morning board preview"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: "var(--surface)", border: "1px solid var(--hairline)", color: "var(--accent)" }}
          >
            <span
              className="pulse-glow"
              style={{ width: 7, height: 7, borderRadius: 999, background: "var(--accent)" }}
            />
            Live · the 7:50 rush
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>
            <NumberTicker value={confirmed} />
          </div>
          <div className="text-xs" style={{ color: "var(--text-2)" }}>
            orders confirmed today
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Featured ticket — the one running the countdown / flip */}
        <motion.div
          layout
          className="rounded-[calc(var(--radius)-0.2rem)] px-4 py-3 flex items-center justify-between gap-3"
          style={{
            background: ready ? "var(--accent)" : "var(--surface)",
            border: "1px solid var(--hairline)",
            transition: "background var(--dur-base) var(--ease-morph)",
          }}
          animate={ready && !reduce ? { boxShadow: ["0 0 0 0 var(--accent-glow)", "0 0 0 12px transparent"] } : {}}
          transition={{ duration: 1.4, repeat: ready ? Infinity : 0, ease: "easeOut" }}
        >
          <div className="min-w-0">
            <div className="font-medium truncate" style={{ color: ready ? "#1e1e2e" : "var(--text-1)" }}>
              Maya
            </div>
            <div className="text-sm truncate" style={{ color: ready ? "#1e1e2e" : "var(--text-2)" }}>
              oat flat white · arriving 8:14
            </div>
          </div>
          <div
            className="font-bold tabular-nums text-lg shrink-0"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: ready ? "#1e1e2e" : "var(--accent)",
            }}
          >
            {ready ? "READY" : mmss(seconds)}
          </div>
        </motion.div>

        {/* Static satellite tickets */}
        {TICKETS.slice(1).map((t) => (
          <div
            key={t.name}
            className="rounded-[calc(var(--radius)-0.2rem)] px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: "var(--surface)", border: "1px solid var(--hairline)" }}
          >
            <div className="min-w-0">
              <div className="font-medium truncate" style={{ color: "var(--text-1)" }}>
                {t.name}
              </div>
              <div className="text-sm truncate" style={{ color: "var(--text-2)" }}>
                {t.order} · arriving {t.arrive}
              </div>
            </div>
            <span className="pill shrink-0">
              <Icon icon="ph:clock" width="13" /> queued
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}