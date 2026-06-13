import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="hairline-t">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-semibold" style={{ color: "var(--text-1)" }}>
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-[calc(var(--radius)-0.45rem)]"
            style={{ background: "var(--brand)" }}
          >
            <Icon icon="ph:coffee-fill" width="15" color="#1e1e2e" />
          </span>
          <span style={{ fontFamily: "'Gabarito', sans-serif" }}>BrewPass</span>
        </div>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>
          No app store. No POS swap. Just confirmed morning orders.
        </p>
      </div>
    </footer>
  );
}