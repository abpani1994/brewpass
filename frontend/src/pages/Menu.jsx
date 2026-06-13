import { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import AppShell from "../components/app/AppShell";
import { EmptyState, ErrorState, SkeletonCard } from "../components/ui/States";
import { useToast } from "../components/ui/Toast";
import { fetchMenu, createMenuItem, updateMenuItem, deleteMenuItem } from "../services/api";
import { money } from "../lib/format";

export default function Menu() {
  const { push } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", category: "Latte", price: "", modifiers: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { items } = await fetchMenu();
      setItems(items);
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
    const price = parseFloat(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setFormError("Enter a valid price");
      return;
    }
    setSaving(true);
    try {
      const { item } = await createMenuItem({
        name: form.name,
        category: form.category,
        priceCents: Math.round(price * 100),
        modifiers: form.modifiers.split(",").map((m) => m.trim()).filter(Boolean),
      });
      setItems((i) => [...i, item]);
      setForm({ name: "", category: "Latte", price: "", modifiers: "" });
      push(`${item.name} added to the menu`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item) => {
    try {
      const { item: updated } = await updateMenuItem(item.id, { available: !item.available });
      setItems((i) => i.map((x) => (x.id === item.id ? updated : x)));
    } catch (err) {
      push(err.message, "error");
    }
  };

  const remove = async (item) => {
    try {
      await deleteMenuItem(item.id);
      setItems((i) => i.filter((x) => x.id !== item.id));
      push(`${item.name} removed`);
    } catch (err) {
      push(err.message, "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <AppShell title="Menu">
      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={add} className="card lg:col-span-1 flex flex-col gap-4 h-fit">
          <h2 className="font-semibold" style={{ color: "var(--text-1)" }}>Add an item</h2>
          <div>
            <label htmlFor="mname" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-1)" }}>Name</label>
            <input id="mname" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Caramel latte" required />
          </div>
          <div>
            <label htmlFor="mcat" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-1)" }}>Category</label>
            <input id="mcat" className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Latte" />
          </div>
          <div>
            <label htmlFor="mprice" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-1)" }}>Price (USD)</label>
            <input id="mprice" className="input" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="5.00" required />
          </div>
          <div>
            <label htmlFor="mmod" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-1)" }}>Modifiers</label>
            <input id="mmod" className="input" value={form.modifiers} onChange={(e) => setForm({ ...form, modifiers: e.target.value })} placeholder="Oat, Whole, Large" />
            <p className="text-xs mt-1.5" style={{ color: "var(--text-2)" }}>Comma separated</p>
          </div>
          {formError && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#dc2626" }}>
              <Icon icon="ph:warning-circle" width="16" /> {formError}
            </div>
          )}
          <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Add item"}</button>
        </form>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : items.length === 0 ? (
            <EmptyState icon="ph:coffee" title="No menu items" hint="Add your first drink so regulars can save it as their usual." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item.id} className="card flex flex-col" style={{ opacity: item.available ? 1 : 0.6 }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold truncate" style={{ color: "var(--text-1)" }}>{item.name}</div>
                      <span className="pill mt-1.5">{item.category}</span>
                    </div>
                    <span className="font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>{money(item.priceCents)}</span>
                  </div>
                  {Array.isArray(item.modifiers) && item.modifiers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.modifiers.map((m) => (
                        <span key={m} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-2)" }}>{m}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 hairline-t">
                    <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-2)" }}>
                      <input type="checkbox" checked={item.available} onChange={() => toggle(item)} />
                      {item.available ? "Available" : "Sold out"}
                    </label>
                    <button className="text-sm" style={{ color: "#dc2626" }} onClick={() => setConfirmDelete(item)}>
                      <Icon icon="ph:trash" width="16" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card max-w-sm w-full" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-1)" }}>Remove {confirmDelete.name}?</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-2)" }}>
              This takes it off your menu. Regulars who saved it will need a new usual.
            </p>
            <div className="flex gap-2 justify-end">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-primary" style={{ background: "#dc2626" }} onClick={() => remove(confirmDelete)}>Remove item</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}