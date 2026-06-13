import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import RewardPips from "../components/ui/RewardPips";
import { ErrorState } from "../components/ui/States";
import { fetchUsual, placeOrder } from "../services/api";
import { money, mmss } from "../lib/format";

export default function CustomerOrder() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payMethod, setPayMethod] = useState("pay_at_store");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [secs, setSecs] = useState(600);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await fetchUsual(token);
      setData(d);
      if (!d.paymentsConfigured) setPayMethod("pay_at_store");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!placed) return;
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [placed]);

  const confirm = async () => {
    setPlacing(true);
    setError("");
    try {
      const res = await placeOrder(token, payMethod);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setPlaced(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="card w-full max-w-md">
          <div className="shimmer" style={{ height: "1rem", width: "50%" }} />
          <div className="shimmer mt-4" style={{ height: "2rem", width: "80%" }} />
          <div className="shimmer mt-6" style={{ height: "3rem", width: "100%" }} />
        </div>
      </Layout>
    );
  }

  if (error && !data) {
    return (
      <Layout>
        <div className="w-full max-w-md">
          <ErrorState message={error} onRetry={load} />
        </div>
      </Layout>
    );
  }

  if (placed) {
    return (
      <Layout>
        <div className="card w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-4" style={{ background: "var(--accent)" }}>
            <Icon icon="ph:check-bold" width="28" color="#1e1e2e" />
          </div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Gabarito', sans-serif", color: "var(--text-1)" }}>
            On the counter soon
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-2)" }}>
            {data.usualOrder} at {data.cafeName}. Walk in and skip the line.
          </p>
          <div className="mt-6 py-5 rounded-[var(--radius)]" style={{ background: "var(--surface-2)" }}>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-2)" }}>Pickup window</p>
            <p className="text-4xl font-bold tabular-nums mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}>
              {mmss(secs)}
            </p>
          </div>
          {placed.rewardUnlocked && (
            <div className="mt-4">
              <RewardPips filled={5} size={18} />
            </div>
          )}
          <p className="text-xs mt-5" style={{ color: "var(--text-2)" }}>
            {payMethod === "pay_at_store" ? "Pay when you collect." : "Payment confirmed."}
          </p>
        </div>
      </Layout>
    );
  }

  const progress = data.rewardProgress || 0;

  return (
    <Layout>
      <div className="w-full max-w-md">
        <p className="text-sm mb-1" style={{ color: "var(--text-2)" }}>{data.cafeName}</p>
        <h1 className="text-3xl font-semibold mb-6" style={{ fontFamily: "'Gabarito', sans-serif", color: "var(--text-1)", letterSpacing: "-0.02em" }}>
          Your usual, {data.customerName.split(" ")[0]}?
        </h1>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold" style={{ color: "var(--text-1)" }}>{data.usualOrder || "Your usual order"}</div>
              <div className="text-sm" style={{ color: "var(--text-2)" }}>Ready ten minutes after you tap</div>
            </div>
            <div className="text-xl font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>{money(data.priceCents)}</div>
          </div>

          <div className="mt-4 pt-4 hairline-t">
            <p className="text-xs mb-2" style={{ color: "var(--text-2)" }}>Reward progress</p>
            <RewardPips filled={progress} size={16} />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium mb-2" style={{ color: "var(--text-1)" }}>How would you like to pay?</legend>
          <div className="grid grid-cols-2 gap-3">
            <PayOption
              active={payMethod === "pay_now"}
              disabled={!data.paymentsConfigured}
              onClick={() => data.paymentsConfigured && setPayMethod("pay_now")}
              icon="ph:credit-card"
              label="Pay now"
              note={data.paymentsConfigured ? "Card via Stripe" : "Not set up"}
            />
            <PayOption
              active={payMethod === "pay_at_store"}
              onClick={() => setPayMethod("pay_at_store")}
              icon="ph:storefront"
              label="Pay at store"
              note="When you collect"
            />
          </div>
        </fieldset>

        {error && (
          <div className="flex items-center gap-2 text-sm mt-4" style={{ color: "#dc2626" }}>
            <Icon icon="ph:warning-circle" width="16" /> {error}
          </div>
        )}

        <button className="btn-cta w-full mt-5" onClick={confirm} disabled={placing}>
          {placing ? (
            <><Icon icon="ph:spinner-gap" className="animate-spin-slow" width="18" /> Confirming…</>
          ) : (
            <><Icon icon="ph:hand-tap" width="18" /> Confirm my usual</>
          )}
        </button>
      </div>
    </Layout>
  );
}

function PayOption({ active, disabled, onClick, icon, label, note }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-start gap-1 p-3 rounded-[calc(var(--radius)-0.2rem)] text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: active ? "var(--surface-2)" : "var(--surface)",
        border: active ? "1px solid var(--accent)" : "1px solid var(--hairline)",
      }}
    >
      <Icon icon={icon} width="20" style={{ color: active ? "var(--accent)" : "var(--text-2)" }} />
      <span className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{label}</span>
      <span className="text-xs" style={{ color: "var(--text-2)" }}>{note}</span>
    </button>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-2" style={{ background: "var(--surface)" }}>
      <div className="hidden lg:flex flex-col justify-between p-12" style={{ background: "var(--surface-2)" }}>
        <div className="flex items-center gap-2 font-semibold" style={{ color: "var(--text-1)" }}>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-[calc(var(--radius)-0.4rem)]" style={{ background: "var(--brand)" }}>
            <Icon icon="ph:coffee-fill" width="18" color="#1e1e2e" />
          </span>
          <span style={{ fontFamily: "'Gabarito', sans-serif" }}>BrewPass</span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold leading-tight" style={{ fontFamily: "'Gabarito', sans-serif", color: "var(--text-1)" }}>
            One tap. Ten minutes. No line.
          </h2>
          <p className="text-sm mt-3 max-w-xs" style={{ color: "var(--text-2)" }}>
            Your order is on the counter before you walk through the door.
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--text-2)" }}>No app. No download.</p>
      </div>
      <div className="flex items-center justify-center p-6">{children}</div>
    </div>
  );
}