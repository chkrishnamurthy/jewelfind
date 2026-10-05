"use client";

import { CheckCircle2, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: number; tone: "success" | "error"; title: string; message?: string };
type ToastApi = { success: (title: string, message?: string) => void; error: (title: string, message?: string) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((tone: Toast["tone"], title: string, message?: string) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, tone, title, message }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4200);
  }, []);
  const api = useMemo(() => ({ success: (title: string, message?: string) => push("success", title, message), error: (title: string, message?: string) => push("error", title, message) }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {items.map((item) => (
          <div className={`toast toast--${item.tone}`} key={item.id}>
            {item.tone === "success" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            <div><strong>{item.title}</strong>{item.message && <span>{item.message}</span>}</div>
            <button aria-label="Dismiss notification" onClick={() => setItems((current) => current.filter((candidate) => candidate.id !== item.id))}><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const api = useContext(ToastContext);
  if (!api) throw new Error("ToastProvider is missing.");
  return api;
}
