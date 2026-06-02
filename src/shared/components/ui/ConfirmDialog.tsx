import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * A shadcn-style AlertDialog exposed through an imperative `useConfirm()` hook so
 * any action can `await confirm({...})` before proceeding. Replaces window.confirm.
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title, description, variant: "destructive" }))) return;
 */

export type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
};

type InternalState = ConfirmOptions & { open: boolean; resolve?: (value: boolean) => void };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InternalState>({ open: false, title: "" });
  const [visible, setVisible] = useState(false);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, open: true, resolve });
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      setState((prev) => {
        prev.resolve?.(result);
        return { ...prev, open: false, resolve: undefined };
      });
    },
    []
  );

  // Animate in, lock scroll, focus the confirm button, wire Esc/Enter.
  useEffect(() => {
    if (!state.open) {
      setVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(false); }
      else if (e.key === "Enter") { e.preventDefault(); close(true); }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [state.open, close]);

  const isDestructive = state.variant === "destructive";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
          {/* overlay */}
          <div
            onClick={() => close(false)}
            className={`absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
          />

          {/* content */}
          <div
            className={`relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-950 ${visible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          >
            <div className="flex items-start gap-4">
              {isDestructive && (
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
                  <AlertTriangle size={22} />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-black text-neutral-900 dark:text-white">{state.title}</h2>
                {state.description && (
                  <div className="mt-1.5 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{state.description}</div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => close(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {state.cancelText || "Cancel"}
              </button>
              <button
                ref={confirmBtnRef}
                onClick={() => close(true)}
                className={`rounded-xl px-4 py-2.5 text-sm font-black text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-950 ${
                  isDestructive
                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    : "bg-neutral-900 hover:bg-neutral-700 focus:ring-neutral-500 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                }`}
              >
                {state.confirmText || "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}
