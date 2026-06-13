import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import AppShell from "../components/app/AppShell";
import NumberTicker from "../components/ui/NumberTicker";
import StatusPill from "../components/ui/StatusPill";
import { EmptyState, ErrorState, SkeletonCard } from "../components/ui/States";
import { fetchDashboard } from "../services/api";
import { money, relativeDate } from "../lib/format";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchDashboard());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell title="Dashboard">
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <Content data={data} />
      )}
    </AppShell>
  );
}

function StatCard({ icon, label, value, money: isMoney }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3" style={{ color: "var(--text-2)" }}>
        <Icon icon={icon} width="18" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-3xl font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>
        {isMoney ? value : <NumberTicker value={value} />}
      </div>
    </div>
  );
}

function Content({ data }) {
  const { stats, regulars, absenceAlerts } = data;
  const hasRegulars = regulars.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {absenceAlerts.length > 0 && (
        <div
          className="flex items-start gap-3 rounded-[var(--radius)] px-4 py-3.5"
          style={{
            background: "color-mix(in srgb, #d97706 16%, var(--surface))",
            border: "1px solid color-mix(in srgb, #d97706 40%, transparent)",
          }}
        >
          <Icon icon="ph:bell-ringing" width="20" style={{ color: "#d97706", marginTop: 2 }} />
          <div>
            <p className="font-medium text-sm" style={{ color: "var(--text-1)" }}>
              {absenceAlerts.length} regular{absenceAlerts.length > 1 ? "s" : ""} absent 5 weekdays
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-2)" }}>
              {absenceAlerts.map((a) => a.name).join(", ")} — send a re-engage text from{" "}
              <Link to="/regulars" style={{ color: "var(--accent)" }}>Regulars</Link>.
            </p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="ph:check-circle" label="Confirmed today" value={stats.confirmedToday} />
        <StatCard icon="ph:currency-dollar" label="Paid revenue" value={money(stats.revenueCents)} money />
        <StatCard icon="ph:hourglass" label="Pending at store" value={money(stats.pendingCents)} money />
        <StatCard icon="ph:users-three" label="Active regulars" value={stats.activeRegulars} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: "var(--text-1)" }}>Today's regulars</h2>
          <Link to="/regulars" className="text-sm" style={{ color: "var(--accent)" }}>View all</Link>
        </div>
        {hasRegulars ? (
          <div className="flex flex-col gap-2">
            {regulars.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.5fr_1fr_auto] items-center gap-3 px-3 py-2.5 rounded-[calc(var(--radius)-0.3rem)] hover:brightness-110 transition-all"
                style={{ background: "var(--surface-2)" }}
              >
                <div className="min-w-0">
                  <div className="font-medium truncate" style={{ color: "var(--text-1)" }}>{r.name}</div>
                  <div className="text-xs truncate" style={{ color: "var(--text-2)" }}>{r.usualOrder || "No usual set"}</div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm tabular-nums" style={{ color: "var(--text-2)" }}>
                  <Icon icon="ph:flame" width="15" style={{ color: r.streak > 0 ? "var(--brand)" : "var(--text-2)" }} />
                  {r.streak} · last {relativeDate(r.lastVisit)}
                </div>
                <StatusPill status={r.status} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="ph:paper-plane-tilt"
            title="No regulars yet"
            hint="Add a customer and send your first SMS link to start building your morning board."
            action={<Link to="/regulars" className="btn-primary">Add a regular</Link>}
          />
        )}
      </div>
    </div>
  );
}