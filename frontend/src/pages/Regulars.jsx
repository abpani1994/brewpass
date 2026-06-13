import { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import AppShell from "../components/app/AppShell";
import RewardPips from "../components/ui/RewardPips";
import StatusPill from "../components/ui/StatusPill";
import { EmptyState, ErrorState, SkeletonCard } from "../components/ui/States";
import { useToast } from "../components/ui/Toast";
import { fetchCustomers, createCustomer, sendInvite } from "../services/api";
import { relativeDate } from "../lib/format";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "at-risk", label: "At risk" },
  { key: "lapsed", label: "Lapsed" },
];

export default function Regulars() {
  const { push } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", usualOrder: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [invitingId, setInvitingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { customers } = await fetchCustomers();
      setCustomers(customers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const { customer } = await createCustomer(form);
      setCustomers((c) => [customer, ...c]);
      setForm({ name: "", phone: "", usualOrder: "" });
      setShowForm(false);
      push(`${customer.name} added`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const invite = async (c) => {
    setInvitingId(c.id);
    try {
      const res = await sendInvite(c.id);
      if (res.delivery === "sent") push(`Link texted to ${c.name}`);
      else if (res.delivery === "queued") push("Link queued — connect Twilio to deliver", "info");
      else push("Could not send the text. Check the number.", "error");
    } catch (err) {
      push(err.message, "error");
    } finally {
      setInvitingId(null);
    }
  };

  const visible = customers.filter((c) => filter === "all" || c.status === filter);

  return (
    <AppShell title="Regulars">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: filter === f.key ? "var(--brand)" : "var(--surface-2)",
                  color: filter === f.key ? "#1e1e2e" : "var(--text-2)",
                  border: "1px solid var(--hairline)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            <Icon icon="ph:plus" width="18" /> Add regular
          </button>
        </div>

        {showForm && (
          <form onSubmit={add} className="card grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-1)" }}>Name</label>
              <input id="name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Maya Cardoso" required />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="phone" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-1)" }}>Phone</label>
              <input id="phone" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0100" required />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="usual" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-1)" }}>Usual order</label>
              <input id="usual" className="input" value={form.usualOrder} onChange={(e) => setForm({ ...form, usualOrder: e.target.value })} placeholder="Oat flat white" />
            </div>
            {formError && (
              <div className="sm:col-span-3 flex items-center gap-2 text-sm" style={{ color: "#dc2626" }}>
                <Icon icon="ph:warning-circle" width="16" /> {formError}
              </div>
            )}
            <div className="sm:col-span-3 flex gap-2">
              <button className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save regular"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="grid gap-4"><SkeletonCard /><SkeletonCard /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : customers.length === 0 ? (
          <EmptyState
            icon="ph:users-three"
            title="No regulars yet"
            hint="Add your first regular and text them a BrewPass link so they can save their usual."
            action={<button className="btn-primary" onClick={() => setShowForm(true)}>Add a regular</button>}
          />
        ) : visible.length === 0 ? (
          <EmptyState icon="ph:funnel" title="No matches" hint="No regulars match this filter right now." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: "640px" }}>
              <thead>
                <tr className="text-left" style={{ color: "var(--text-2)" }}>
                  <th className="font-medium pb-3 px-2">Name</th>
                  <th className="font-medium pb-3 px-2">Usual</th>
                  <th className="font-medium pb-3 px-2 text-right">Streak</th>
                  <th className="font-medium pb-3 px-2">Last visit</th>
                  <th className="font-medium pb-3 px-2">Reward</th>
                  <th className="font-medium pb-3 px-2">Status</th>
                  <th className="font-medium pb-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id} className="hairline-t hover:brightness-110 transition-all">
                    <td className="py-3 px-2 font-medium" style={{ color: "var(--text-1)" }}>{c.name}</td>
                    <td className="py-3 px-2 max-w-[160px] truncate" style={{ color: "var(--text-2)" }} title={c.usualOrder}>{c.usualOrder || "—"}</td>
                    <td className="py-3 px-2 text-right tabular-nums" style={{ color: "var(--text-1)" }}>{c.streak}</td>
                    <td className="py-3 px-2 tabular-nums" style={{ color: "var(--text-2)" }}>{relativeDate(c.lastVisit)}</td>
                    <td className="py-3 px-2"><RewardPips filled={c.rewardProgress} size={13} /></td>
                    <td className="py-3 px-2"><StatusPill status={c.status} /></td>
                    <td className="py-3 px-2 text-right">
                      <button
                        className="btn-secondary text-xs px-3 py-1.5"
                        onClick={() => invite(c)}
                        disabled={invitingId === c.id}
                      >
                        {invitingId === c.id ? (
                          <Icon icon="ph:spinner-gap" className="animate-spin-slow" width="14" />
                        ) : (
                          <><Icon icon="ph:paper-plane-tilt" width="14" /> {c.status === "lapsed" ? "Re-engage" : "Send link"}</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}