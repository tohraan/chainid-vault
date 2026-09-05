import RoleBadge from "./RoleBadge";
import type { RoleName } from "../lib/accounts";

export interface RevertInfo {
  reason: string;
  attemptedBy: string;
  role: RoleName;
  action: string;
}

/**
 * The single most important UI element in the app for the pitch's
 * "provable, not claimed" narrative. Full-width banner, stays until dismissed
 * or superseded — never a toast (build/04-design/UI_UX_GUIDELINES.md point 2).
 */
export default function RevertDisplay({
  info,
  onDismiss,
}: {
  info: RevertInfo;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-6 rounded-lg border-2 border-danger bg-danger-bg p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-danger">Action Rejected</h2>
          <p className="mt-1 text-sm text-danger/80">
            Rejected on-chain by the smart contract — not by this interface.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg border border-danger/30 px-3 py-1 text-sm font-medium text-danger hover:bg-danger/10"
        >
          Dismiss
        </button>
      </div>

      <div className="mt-4 rounded-lg bg-white/70 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-danger/70">
          Contract revert reason
        </div>
        <div className="mt-1 font-mono text-base font-semibold text-danger">
          {info.reason}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-danger/70">Attempted action</dt>
          <dd className="font-medium text-danger">{info.action}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-danger/70">Attempted by</dt>
          <dd className="font-mono text-xs text-danger">{info.attemptedBy}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-danger/70">Role held</dt>
          <dd>
            <RoleBadge role={info.role} />
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-danger/70">
        No event was emitted and nothing was written to the audit trail — a
        reverted transaction rolls back every state change, including its events.
      </p>
    </div>
  );
}
