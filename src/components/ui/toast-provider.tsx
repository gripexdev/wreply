"use client";

import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  pushToast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastIconMap = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
};

const toastClasses = {
  success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-50",
  error: "border-rose-400/20 bg-rose-500/10 text-rose-50",
  info: "border-white/10 bg-white/8 text-white",
};

export function ToastProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const value: ToastContextValue = {
    pushToast(toast) {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((currentValue) => [...currentValue, { ...toast, id }]);
    },
  };

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToasts((currentValue) => currentValue.slice(1));
    }, 3800);

    return () => window.clearTimeout(timer);
  }, [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-5 right-5 z-[70] flex w-[min(92vw,24rem)] flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = toastIconMap[toast.variant];

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto rounded-[24px] border px-4 py-4 shadow-[0_30px_80px_-50px_rgba(0,0,0,1)] backdrop-blur-xl",
                toastClasses[toast.variant],
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm leading-6 text-current/80">
                      {toast.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  className="rounded-full p-1 text-current/70 transition hover:bg-white/8 hover:text-current"
                  onClick={() =>
                    setToasts((currentValue) =>
                      currentValue.filter(
                        (currentToast) => currentToast.id !== toast.id,
                      ),
                    )
                  }
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
