import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../../lib/auth";

export default function Nav() {
  const { owner } = useAuth();
  return (
    <nav className="glass-nav">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold" style={{ color: "var(--text-1)" }}>
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-[calc(var(--radius)-0.4rem)]"
            style={{ background: "var(--brand)" }}
          >
            <Icon icon="ph:coffee-fill" width="18" color="#1e1e2e" />
          </span>
          <span style={{ fontFamily: "'Gabarito', sans-serif" }}>BrewPass</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: "var(--text-2)" }}>
          <a href="#how" className="hover:text-[color:var(--text-1)] transition-colors">How it works</a>
          <a href="#features" className="hover:text-[color:var(--text-1)] transition-colors">Features</a>
          <a href="#pricing" className="hover:text-[color:var(--text-1)] transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-2">
          {owner ? (
            <Link to="/dashboard" className="btn-primary text-sm">Open dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm hidden sm:inline-flex">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Start free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}