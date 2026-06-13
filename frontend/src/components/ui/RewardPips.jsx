import { Icon } from "@iconify/react";

// 5-pip reward progress strip. `filled` 0..5.
export default function RewardPips({ filled = 0, total = 5, size = 18, animate = false }) {
  const unlocked = filled >= total;
  return (
    <div className="inline-flex items-center gap-1.5" aria-label={`${filled} of ${total} orders toward reward`}>
      {Array.from({ length: total }).map((_, i) => {
        const on = i < filled;
        return (
          <span
            key={i}
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: size,
              height: size,
              background: on ? "var(--accent)" : "var(--surface-2)",
              border: on ? "none" : "1px solid var(--hairline)",
              transition: animate
                ? `background var(--dur-base) var(--ease-hover) ${i * 60}ms`
                : "none",
            }}
          >
            <Icon
              icon="ph:coffee-bean-fill"
              width={size * 0.62}
              style={{ color: on ? "#1e1e2e" : "var(--text-2)", opacity: on ? 1 : 0.4 }}
            />
          </span>
        );
      })}
      {unlocked && (
        <span className="pill ml-1" style={{ background: "var(--accent)", color: "#1e1e2e", borderColor: "transparent" }}>
          Free drink unlocked
        </span>
      )}
    </div>
  );
}