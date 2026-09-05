import { useActiveAccount } from "../context/ActiveAccountContext";
import { ACCOUNTS } from "../lib/accounts";
import RoleBadge from "./RoleBadge";

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Always visible in the fixed header — the presenter switches roles live
 * mid-demo, so this must never be buried in a menu
 * (build/04-design/UI_UX_GUIDELINES.md point 5).
 */
export default function AccountSwitcher() {
  const { account, accountIndex, setAccountIndex } = useActiveAccount();

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="acting-as"
        className="text-xs font-medium uppercase tracking-wide text-white/70"
      >
        Acting as
      </label>
      <select
        id="acting-as"
        value={accountIndex}
        onChange={(e) => setAccountIndex(Number(e.target.value))}
        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white outline-none focus:border-white/50"
      >
        {ACCOUNTS.map((a, i) => (
          <option key={a.address} value={i} className="text-slate-900">
            {a.label} · {shortAddress(a.address)}
          </option>
        ))}
      </select>
      <RoleBadge role={account.role} className="ring-1 ring-white/40" />
    </div>
  );
}
