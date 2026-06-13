import { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import AppShell from "../components/app/AppShell";
import RewardPips from "../components/ui/RewardPips";
import { EmptyState, ErrorState, SkeletonCard } from "../components/ui/States";
import { useToast } from "../components/ui/Toast";
import { fetchRewards, redeemReward } from "../services/api";
import { relativeDate } from "../lib/format";

export default function Rewards() {
  const { push } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchRewards());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const redeem = async (id, name) => {
    setBusyId(id);
    try {
      await redeemReward(id);
      push(`Free drink redeemed for ${name}`);
      load();
    } catch (err) {
      push(err.message, "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppShell title="Loyalty">
      {loading ? (
        <div className="grid gap-4"><SkeletonCard /><SkeletonCard /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-[var(--radius)]" style={{ background: "var(--surface-2)" }}>
                <Icon icon="ph:gift" width="22" style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "var(--text-1)" }}>
                  {data.rule.reward} after {data.rule.threshold} online orders
                </p>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>
                  Progress fills automatically as regulars reorder through BrewPass.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 hairline-t">
              <RewardPips filled={3} size={20} animate />
              <p className="text-xs mt-2" style={{ color: "var(--text-2)" }}>Preview of a 5-order reward strip</p>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4" style={{ color: "var(--text-1)" }}>Per-customer progress</h2>
            {data.perCustomer.length === 0 ? (
              <EmptyState icon="ph:users-three" title="No regulars yet" hint="Reward progress shows here once regulars start ordering." />
            ) : (
              <div className="flex flex-col gap-2">
                {data.perCustomer.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 rounded-[calc(var(--radius)-0.3rem)]" style={{ background: "var(--surface-2)" }}>
                    <div className="min-w-0">
                      <div className="font-medium truncate" style={{ color: "var(--text-1)" }}>{c.name}</div>
                      <div className="text-xs tabular-nums" style={{ color: "var(--text-2)" }}>{c.orderCount} orders total</div>
                    </div>
                    <RewardPips filled={c.progress} size={15} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4" style={{ color: "var(--text-1)" }}>Redemption log</h2>
            {data.redemptionLog.length === 0 ? (
              <EmptyState icon="ph:receipt" title="No rewards earned yet" hint="A free drink is issued automatically after every 5 online orders." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: "420px" }}>
                  <thead>
                    <tr className="text-left" style={{ color: "var(--text-2)" }}>
                      <th className="font-medium pb-3 px-2">Customer</th>
                      <th className="font-medium pb-3 px-2">Earned</th>
                      <th className="font-medium pb-3 px-2">Status</th>
                      <th className="font-medium pb-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.redemptionLog.map((r) => (
                      <tr key={r.id} className="hairline-t">
                        <td className="py-3 px-2 font-medium" style={{ color: "var(--text-1)" }}>{r.customerName}</td>
                        <td className="py-3 px-2" style={{ color: "var(--text-2)" }}>{relativeDate(r.createdAt)}</td>
                        <td className="py-3 px-2" style={{ color: r.redeemed ? "var(--text-2)" : "var(--accent)" }}>
                          {r.redeemed ? "Redeemed" : "Available"}
                        </td>
                        <td className="py-3 px-2 text-right">
                          {!r.redeemed && (
                            <button className="btn-secondary text-xs px-3 py-1.5" disabled={busyId === r.id} onClick={() => redeem(r.id, r.customerName)}>
                              {busyId === r.id ? "…" : "Mark redeemed"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}