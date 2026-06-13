import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../../lib/auth";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "ph:squares-four" },
  { to: "/regulars", label: "Regulars", icon: "ph:users-three" },
  { to: "/orders", label: "Live orders", icon: "ph:list-checks" },
  { to: "/menu", label: "Menu", icon: "ph:coffee" },
  { to: "/rewards", label: "Loyalty", icon: "ph:gift" },
];

export default function AppShell({ children, title }) {
  const { owner, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const sidebar = (
    <nav className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-2 font-semibold px-5 h-16" style={{ color: "var(--text-1)" }}>
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-[calc(var(--radius)-0.4rem)]"
          style={{ background: "var(--brand)" }}
        >
          <Icon icon="ph:coffee-fill" width="18" color="#1e1e2e" />
        </span>
        <span style={{ fontFamily: "'Gabarito', sans-serif" }}>BrewPass</span>
      </Link>
      <div className="flex flex-col gap-1 px-3 mt-2 flex-1">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[calc(var(--radius)-0.3rem)] text-sm font-medium transition-colors`
            }
            style={({ isActive }) => ({
              background: isActive ? "var(--surface-2)" : "transparent",
              color: isActive ? "var(--text-1)" : "var(--text-2)",
            })}
          >
            <Icon icon={n.icon} width="20" />
            {n.label}
          </NavLink>
        ))}
      </div>
      <div className="p-3 hairline-t">
        <div className="px-2 py-2 text-sm truncate" style={{ color: "var(--text-2)" }}>
          {owner?.cafeName}
        </div>
        <button onClick={handleSignOut} className="btn-secondary w-full text-sm">
          <Icon icon="ph:sign-out" width="18" /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-[100dvh]" style={{ background: "var(--surface)" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col hairline"
        style={{ background: "var(--surface)", borderTop: 0, borderBottom: 0, borderLeft: 0 }}
      >
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setOpen(false)} />
          <aside className="relative w-64 h-full hairline" style={{ background: "var(--surface)" }}>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="glass-nav lg:static">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button className="btn-secondary lg:hidden px-2.5 py-2" onClick={() => setOpen(true)} aria-label="Open menu">
                <Icon icon="ph:list" width="20" />
              </button>
              <h1 className="text-lg font-semibold" style={{ color: "var(--text-1)" }}>{title}</h1>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}