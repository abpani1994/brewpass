import { Icon } from "@iconify/react";

export function EmptyState({ icon = "ph:coffee", title, hint, action }) {
  return (
    <div className="card flex flex-col items-center text-center py-12 px-6">
      <div
        className="flex items-center justify-center w-12 h-12 rounded-full mb-4"
        style={{ background: "var(--surface-2)" }}
      >
        <Icon icon={icon} width="26" style={{ color: "var(--text-2)" }} />
      </div>
      <h3 className="text-lg font-semibold" style={{ color: "var(--text-1)" }}>
        {title}
      </h3>
      {hint && (
        <p className="text-sm mt-1.5 max-w-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
          {hint}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card flex flex-col items-center text-center py-12 px-6">
      <Icon icon="ph:warning-circle" width="32" style={{ color: "#dc2626" }} />
      <h3 className="text-lg font-semibold mt-3" style={{ color: "var(--text-1)" }}>
        Something broke loading this
      </h3>
      <p className="text-sm mt-1.5 max-w-sm" style={{ color: "var(--text-2)" }}>
        {message || "We could not reach the server."}
      </p>
      {onRetry && (
        <button className="btn-secondary mt-5" onClick={onRetry}>
          <Icon icon="ph:arrow-clockwise" width="18" /> Try again
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className = "", style }) {
  return <div className={`shimmer ${className}`} style={{ height: "1rem", ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="card">
      <Skeleton style={{ width: "40%", height: "0.9rem" }} />
      <Skeleton style={{ width: "70%", height: "1.4rem", marginTop: "0.75rem" }} />
      <Skeleton style={{ width: "100%", height: "0.8rem", marginTop: "1rem" }} />
      <Skeleton style={{ width: "85%", height: "0.8rem", marginTop: "0.5rem" }} />
    </div>
  );
}