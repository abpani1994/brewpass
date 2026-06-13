import { useEffect, useState } from "react";
import { secondsUntil, mmss } from "../../lib/format";

// Live countdown to a pickup time. Shows "Window passed" when overdue.
export default function CountdownTicker({ pickupAt, className = "" }) {
  const [secs, setSecs] = useState(() => secondsUntil(pickupAt));

  useEffect(() => {
    setSecs(secondsUntil(pickupAt));
    const id = setInterval(() => setSecs(secondsUntil(pickupAt)), 1000);
    return () => clearInterval(id);
  }, [pickupAt]);

  const overdue = secs <= 0;
  return (
    <span
      className={`tabular-nums font-bold ${className}`}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        color: overdue ? "#d97706" : "var(--accent)",
      }}
    >
      {overdue ? "due now" : mmss(secs)}
    </span>
  );
}