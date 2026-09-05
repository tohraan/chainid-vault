import { useCallback, useRef, useState } from "react";
import type { ToastItem, ToastState } from "../components/Toast";

/** Small toast queue shared by the three screens via App. */
export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((state: ToastState, message: string, txHash?: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, state, message, txHash }]);
    return id;
  }, []);

  const update = useCallback(
    (id: number, state: ToastState, message: string, txHash?: string) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, state, message, txHash } : t)),
      );
    },
    [],
  );

  return { toasts, push, update, dismiss };
}
