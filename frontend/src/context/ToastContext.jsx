import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "../lib/cn";

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "info") => {
      const id = ++idSeq;
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md transition duration-300",
              t.type === "success" &&
                "border-emerald-200/80 bg-emerald-50/95 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-100",
              t.type === "error" &&
                "border-rose-200/80 bg-rose-50/95 text-rose-900 dark:border-rose-900 dark:bg-rose-950/90 dark:text-rose-100",
              t.type === "info" &&
                "border-slate-200/80 bg-white/95 text-slate-900 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100"
            )}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : t.type === "error" ? (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            ) : null}
            <p className="flex-1 leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded-lg p-1 text-slate-500 hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
