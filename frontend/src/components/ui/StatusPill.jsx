const MAP = {
  active: { label: "Active", color: "#16a34a" },
  "at-risk": { label: "At risk", color: "#d97706" },
  lapsed: { label: "Lapsed", color: "#dc2626" },
  preparing: { label: "Preparing", color: "#d97706" },
  ready: { label: "Ready", color: "#16a34a" },
  collected: { label: "Collected", color: "var(--text-2)" },
  paid: { label: "Paid", color: "#16a34a" },
  pending: { label: "Payment pending", color: "#d97706" },
  pay_at_store: { label: "Pay at store", color: "var(--text-2)" },
};

export default function StatusPill({ status }) {
  const cfg = MAP[status] || { label: status, color: "var(--text-2)" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        color: cfg.color,
        background: "var(--surface-2)",
        border: "1px solid var(--hairline)",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: cfg.color }} />
      {cfg.label}
    </span>
  );
}