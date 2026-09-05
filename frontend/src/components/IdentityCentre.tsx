import { useCallback, useEffect, useState } from "react";
import { useActiveAccount } from "../context/ActiveAccountContext";
import {
  extractRevertReason,
  getIdentityRegistry,
  getSignerFor,
  proveControl,
  resetSignerNonce,
  statusName,
} from "../lib/contracts";
import type { IdentityStatusName } from "../lib/contracts";
import type { RevertInfo } from "./RevertDisplay";
import { shortAddress } from "./AccountSwitcher";

interface Row {
  address: string;
  label: string;
  status: IdentityStatusName;
}

interface Props {
  onRevert: (info: RevertInfo) => void;
  pushToast: (state: "pending" | "success" | "error", msg: string, tx?: string) => number;
  updateToast: (id: number, state: "pending" | "success" | "error", msg: string, tx?: string) => void;
  refreshKey: number;
  onChainChanged: () => void;
}

const CARD = "rounded-lg bg-white p-6 shadow-sm";

const STATUS_CLASS: Record<IdentityStatusName, string> = {
  Active: "bg-success text-white",
  Suspended: "bg-role-auditor text-white",
  Revoked: "bg-danger text-white",
  Unregistered: "bg-slate-400 text-white",
};

/**
 * Identity Centre — the lifecycle that build/07-smart-contracts had no UI for.
 *
 * Two things live here because they are the same question from two directions:
 * the organisation deciding whether an identity may still act (suspend, revoke,
 * rotate), and the holder proving they still control it (EIP-712).
 */
export default function IdentityCentre({
  onRevert,
  pushToast,
  updateToast,
  refreshKey,
  onChainChanged,
}: Props) {
  const { account } = useActiveAccount();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [proof, setProof] = useState<{ nonce: string; txHash: string } | null>(null);
  // The active account's OWN status. The deployer holds ADMIN_ROLE but is
  // deliberately not a registered identity (build/02-planning/PHASE_03.md), so
  // this is legitimately "Unregistered" for Admin — say so plainly rather than
  // letting the user click into a confusing revert.
  const [ownStatus, setOwnStatus] = useState<IdentityStatusName>("Unregistered");

  const load = useCallback(async () => {
    const registry = getIdentityRegistry();
    // Paginated read — the bounded replacement for getAllIdentities, which
    // becomes permanently uncallable at roughly 2,800 identities.
    const count: bigint = await registry.identityCount();
    const [addrs, labels, statuses] = await registry.getIdentities(
      0,
      count > 200n ? 200 : Number(count) || 1,
    );
    setRows(
      addrs.map((address: string, i: number) => ({
        address,
        label: labels[i],
        status: statusName(statuses[i]),
      })),
    );
    setOwnStatus(statusName(await registry.status(account.address)));
  }, [account.address]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load, refreshKey]);

  async function run(action: string, fn: () => Promise<{ wait: () => Promise<unknown> }>) {
    setBusy(true);
    const toastId = pushToast("pending", `${action}…`);
    try {
      const tx = await fn();
      await tx.wait();
      updateToast(toastId, "success", `${action} confirmed`);
      onChainChanged();
      await load();
    } catch (error) {
      resetSignerNonce(account.privateKey);
      updateToast(toastId, "error", `${action} rejected`);
      onRevert({
        reason: extractRevertReason(error),
        attemptedBy: account.address,
        role: account.role,
        action,
      });
    } finally {
      setBusy(false);
    }
  }

  const registryAs = () => getIdentityRegistry(getSignerFor(account.privateKey));

  async function runProof() {
    setBusy(true);
    setProof(null);
    const toastId = pushToast("pending", "Signing challenge…");
    try {
      const res = await proveControl(account.privateKey, account.address);
      setProof({ nonce: res.nonce.toString(), txHash: res.txHash });
      updateToast(toastId, "success", "Control proven", res.txHash);
      onChainChanged();
    } catch (error) {
      resetSignerNonce(account.privateKey);
      updateToast(toastId, "error", "Proof rejected");
      onRevert({
        reason: extractRevertReason(error),
        attemptedBy: account.address,
        role: account.role,
        action: "Prove control of identity",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-slate-900">Prove control of this identity</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          An address is a public string &mdash; anyone can type it. A signature can only
          be produced by the private key behind it. The account selected above signs a
          one-time challenge; the key itself never leaves this device.
        </p>

        <button
          type="button"
          onClick={runProof}
          disabled={busy || ownStatus !== "Active"}
          className="mt-4 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Working…" : `Prove I control ${account.label}`}
        </button>

        {ownStatus !== "Active" && (
          <p className="mt-3 max-w-2xl rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">
              {account.label} has no active identity to prove.
            </span>{" "}
            {ownStatus === "Unregistered"
              ? "This account holds a role but was never registered as an identity, so there is nothing to prove control of. Switch to a registered identity above."
              : `This identity is ${ownStatus.toLowerCase()}, and a non-active identity cannot prove control.`}
          </p>
        )}

        {proof && (
          <div className="mt-4 rounded-lg bg-success-bg p-4">
            <p className="font-semibold text-success">Control proven on-chain</p>
            <ul className="mt-2 space-y-1 text-sm text-success/90">
              <li>✓ Signature matched the identity's own key</li>
              <li>✓ Identity is active and permitted to act</li>
              <li>✓ Challenge was within its time limit</li>
              <li>✓ Challenge #{proof.nonce} is now spent and can never be reused</li>
            </ul>
            <p className="mt-2 break-all font-mono text-xs text-success/70">{proof.txHash}</p>
          </div>
        )}
        <p className="mt-3 text-xs text-slate-500">
          Replaying the same signature fails, because the challenge counter has already
          moved on. A signature captured here is also useless anywhere else &mdash; it is
          bound to this contract and this chain.
        </p>
      </section>

      <section className={CARD}>
        <h2 className="text-lg font-semibold text-slate-900">Identity lifecycle</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Suspending or revoking an identity takes effect on-chain immediately. A
          non-active identity cannot receive assets by any route, and cannot prove
          control. Revocation is permanent by design &mdash; a revoked key must never
          become valid again.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2">Identity</th>
                <th className="pb-2">Address</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.address}>
                  <td className="py-2.5 font-medium text-slate-900">{row.label}</td>
                  <td className="py-2.5 font-mono text-xs text-slate-600">
                    {shortAddress(row.address)}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex flex-wrap gap-2">
                      {row.status === "Active" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run("Suspend identity", () => registryAs().suspendIdentity(row.address))
                          }
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}
                      {row.status === "Suspended" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run("Reactivate identity", () =>
                              registryAs().reactivateIdentity(row.address),
                            )
                          }
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Reactivate
                        </button>
                      )}
                      {(row.status === "Active" || row.status === "Suspended") && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run("Revoke identity", () => registryAs().revokeIdentity(row.address))
                          }
                          className="rounded-lg border border-danger/40 px-3 py-1 text-xs font-semibold text-danger hover:bg-danger-bg disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      )}
                      {row.status === "Revoked" && (
                        <span className="text-xs text-slate-400">
                          Permanently revoked
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-sm text-slate-500">
                    No identities registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Only an administrator may change a status. Attempting it from any other account
          is refused by the contract, not by this screen.
        </p>
      </section>
    </div>
  );
}
