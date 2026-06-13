import { useEffect, useState, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import AppShell from "../components/app/AppShell";
import CountdownTicker from "../components/ui/CountdownTicker";
import StatusPill from "../components/ui/StatusPill";
import { EmptyState, ErrorState, SkeletonCard } from "../components/ui/States";
import { useToast } from "../components/ui/Toast";
import { fetchOrders, updateOrderStatus, getToken } from "../services/api";
import { money } from "../lib/format";

export default function Orders() {
  const { push } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const esRef = useRef(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const { orders } = await fetchOrders();
      setOrders(orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // SSE live updates with polling fallback.
    const token = getToken();
    try {
      const es = new EventSource(`/api/orders/stream`);
      es.addEventListener("order", () => load());
      es.onerror = () => {};
      esRef.current = es;
    } catch {
      // ignore
    }
    const poll = setInterval(load, 15000);
    return () => {
      clearInterval(poll);
      esRef.current?.close();
    };
  }, [load]);

  const setStatus = async (order, status) => {
    setBusyId(order.id);
    try {
      const { order: updated } = await updateOrderStatus(order.id, status);
      if (status === "collected") {
        setOrders((o) => o.filter((x) => x.id !== order.id));
        push(`${order.customerName}'s order collected`);
      } else {
        setOrders((o) => o.map((x) => (x.id === order.id ? { ...x, status: updated.status } : x)));
        push(status === "ready" ? `${order.customerName}'s order ready` : "Back to preparing");
      }
    } catch (err) {
      push(err.message, "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppShell title="Live orders">
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="ph:list-checks"
          title="No incoming orders"
          hint="When a regular taps their usual, it appears here with a ten-minute pickup window."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((o) => (
            <div key={o.id} className="card hover-lift flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate" style={{ color: "var(--text-1)" }}>{o.customerName}</div>
                  <div className="text-sm truncate" style={{ color: "var(--text-2)" }}>{o.itemSummary}</div>
                </div>
                <StatusPill status={o.status} />
              </div>

              <div className="flex items-center justify-between mt-4 py-3 hairline-t hairline-b">
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-2)" }}>
                  <Icon icon="ph:timer" width="16" /> Pickup in
                </div>
                <CountdownTicker pickupAt={o.pickupAt} className="text-lg" />
              </div>

              <div className="flex items-center justify-between mt-3 text-sm">
                <StatusPill status={o.payStatus} />
                <span className="tabular-nums font-medium" style={{ color: "var(--text-1)" }}>{money(o.totalCents)}</span>
              </div>

              <div className="flex gap-2 mt-4">
                {o.status === "preparing" ? (
                  <button className="btn-primary flex-1" disabled={busyId === o.id} onClick={() => setStatus(o, "ready")}>
                    <Icon icon="ph:check" width="16" /> Mark ready
                  </button>
                ) : (
                  <button className="btn-secondary flex-1" disabled={busyId === o.id} onClick={() => setStatus(o, "preparing")}>
                    <Icon icon="ph:arrow-counter-clockwise" width="16" /> Preparing
                  </button>
                )}
                <button className="btn-secondary" disabled={busyId === o.id} onClick={() => setStatus(o, "collected")} title="Collected">
                  <Icon icon="ph:bag-simple" width="16" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}