import { useEffect } from "react";

export type ToastState = "pending" | "success" | "error";

export interface ToastItem {
  id: number;
  state: ToastState;
  message: string;
  txHash?: string;
}

const STYLES: Record<ToastState, string> = {
  pending: "bg-slate-700 text-white",
  success: "bg-success-bg text-success border border-success/30",
  error: "bg-danger-bg text-danger border border-danger/30",
};

function Row({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    // Pending toasts stay until the caller replaces them with the settled state.
    if (toast.state === "pending") return;
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.state, onDismiss]);

  return (
    <div className={`w-80 rounded-lg px-4 py-3 shadow-md ${STYLES[toast.state]}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        {toast.state === "pending" && (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {toast.message}
      </div>
      {toast.txHash && (
        <div className="mt-1 truncate font-mono text-xs opacity-80">
          {toast.txHash}
        </div>
      )}
    </div>
  );
}

/**
 * Bottom-right stack. Deliberately NOT used for the rejection demo — a toast
 * auto-dismisses too fast for a room to read, so reverts go to RevertDisplay
 * (build/04-design/COMPONENT_ARCHITECTURE.md).
 */
export default function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Row key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
