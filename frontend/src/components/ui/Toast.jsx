import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, kind = "success") => {
      const id = ++idCounter;
      setToasts((t) => [...t, { id, message, kind }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-2rem)]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="card flex items-center gap-3 py-3 px-4"
              style={{ minWidth: "16rem" }}
            >
              <Icon
                icon={
                  t.kind === "error"
                    ? "ph:warning-circle-fill"
                    : t.kind === "info"
                    ? "ph:info-fill"
                    : "ph:check-circle-fill"
                }
                width="20"
                style={{
                  color:
                    t.kind === "error" ? "#dc2626" : t.kind === "info" ? "var(--accent)" : "#16a34a",
                }}
              />
              <span className="text-sm" style={{ color: "var(--text-1)" }}>
                {t.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}