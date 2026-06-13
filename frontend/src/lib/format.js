export function money(cents) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format((cents || 0) / 100);
}

export function relativeDate(value) {
  if (!value) return "Never";
  const date = new Date(value);
  const now = new Date();
  const diffMs = now - date;
  const days = Math.floor(diffMs / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function clockTime(value) {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// Seconds remaining until pickupAt, clamped at 0.
export function secondsUntil(value) {
  if (!value) return 0;
  return Math.max(0, Math.round((new Date(value) - Date.now()) / 1000));
}

export function mmss(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}