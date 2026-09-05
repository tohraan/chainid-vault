import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useActiveAccount } from "../context/ActiveAccountContext";
import {
  extractRevertReason,
  getAssetNFT,
  getIdentityRegistry,
  getSignerFor,
  resetSignerNonce,
  ROLE_NAMES,
} from "../lib/contracts";
import type { RevertInfo } from "./RevertDisplay";
import RoleBadge from "./RoleBadge";
import { shortAddress } from "./AccountSwitcher";

export interface Identity {
  address: string;
  label: string;
}

interface Props {
  onRevert: (info: RevertInfo) => void;
  pushToast: (state: "pending" | "success" | "error", msg: string, tx?: string) => number;
  updateToast: (id: number, state: "pending" | "success" | "error", msg: string, tx?: string) => void;
  refreshKey: number;
  onChainChanged: () => void;
}

const CARD = "rounded-lg bg-white p-6 shadow-sm";
const INPUT =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand";
const BUTTON =
  "mt-4 w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminDashboard({
  onRevert,
  pushToast,
  updateToast,
  refreshKey,
  onChainChanged,
}: Props) {
  const { account } = useActiveAccount();
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [roleTarget, setRoleTarget] = useState("");
  const [roleName, setRoleName] = useState<string>(ROLE_NAMES[1]);
  const [mintTarget, setMintTarget] = useState("");
  const [assetLabel, setAssetLabel] = useState("");

  const load = useCallback(async () => {
    const registry = getIdentityRegistry();
    const [addrs, labels] = await registry.getAllIdentities();
    const list: Identity[] = addrs.map((a: string, i: number) => ({
      address: a,
      label: labels[i],
    }));
    setIdentities(list);
    if (list.length) {
      setRoleTarget((prev) => prev || list[0].address);
      setMintTarget((prev) => prev || list[0].address);
    }

    // Which of the 4 roles each identity currently holds, for the reference table.
    const held: Record<string, string[]> = {};
    for (const identity of list) {
      const hits: string[] = [];
      for (const name of ROLE_NAMES) {
        const hash = ethers.id(name);
        if (await registry.hasRole(hash, identity.address)) hits.push(name);
      }
      held[identity.address] = hits;
    }
    setRoles(held);
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load, refreshKey]);

  /** Every write goes through here: pending toast -> confirmed toast, or RevertDisplay. */
  async function submit(
    action: string,
    run: (signer: ethers.NonceManager) => Promise<ethers.ContractTransactionResponse>,
  ) {
    setBusy(true);
    const toastId = pushToast("pending", `${action}…`);
    try {
      const tx = await run(getSignerFor(account.privateKey));
      const receipt = await tx.wait();
      updateToast(toastId, "success", `${action} confirmed`, receipt?.hash ?? tx.hash);
      onChainChanged();
      await load();
    } catch (error) {
      // REQUIRED, not defensive. NonceManager bumps its local nonce *before*
      // populateTransaction runs the gas estimate, and an admin-only call from a
      // non-admin reverts during that estimate. Without this resync the counter
      // is left one ahead and the account's next write dies with "nonce too
      // high" — i.e. every rejection demo would break the account that ran it.
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

  const addressValid = ethers.isAddress(newAddress);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className={CARD}>
          <h2 className="text-lg font-semibold text-slate-900">Register Identity</h2>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Address
            <input
              className={INPUT}
              value={newAddress}
              placeholder="0x…"
              onChange={(e) => setNewAddress(e.target.value)}
            />
          </label>
          {newAddress && !addressValid && (
            <p className="mt-1 text-xs font-medium text-danger">Not a valid address</p>
          )}
          <label className="mt-3 block text-sm font-medium text-slate-700">
            Label
            <input
              className={INPUT}
              value={newLabel}
              placeholder="Dave — Field Engineer"
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </label>
          <button
            type="button"
            className={BUTTON}
            disabled={busy || !addressValid || !newLabel.trim()}
            onClick={() =>
              submit("Register identity", (signer) =>
                getIdentityRegistry(signer).registerIdentity(newAddress, newLabel.trim()),
              ).then(() => {
                setNewAddress("");
                setNewLabel("");
              })
            }
          >
            Register
          </button>
        </section>

        <section className={CARD}>
          <h2 className="text-lg font-semibold text-slate-900">Assign Role</h2>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Identity
            <select
              className={INPUT}
              value={roleTarget}
              onChange={(e) => setRoleTarget(e.target.value)}
            >
              {identities.map((i) => (
                <option key={i.address} value={i.address}>
                  {i.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm font-medium text-slate-700">
            Role
            <select
              className={INPUT}
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            >
              {ROLE_NAMES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50"
              disabled={busy || !roleTarget}
              onClick={() =>
                submit("Grant role", (signer) =>
                  getIdentityRegistry(signer).grantRole(ethers.id(roleName), roleTarget),
                )
              }
            >
              Grant
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              disabled={busy || !roleTarget}
              onClick={() =>
                submit("Revoke role", (signer) =>
                  getIdentityRegistry(signer).revokeRole(ethers.id(roleName), roleTarget),
                )
              }
            >
              Revoke
            </button>
          </div>
        </section>

        <section className={CARD}>
          <h2 className="text-lg font-semibold text-slate-900">Mint Asset</h2>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Recipient identity
            <select
              className={INPUT}
              value={mintTarget}
              onChange={(e) => setMintTarget(e.target.value)}
            >
              {identities.map((i) => (
                <option key={i.address} value={i.address}>
                  {i.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm font-medium text-slate-700">
            Asset label
            <input
              className={INPUT}
              value={assetLabel}
              placeholder="Field Radio Unit 002"
              onChange={(e) => setAssetLabel(e.target.value)}
            />
          </label>
          <button
            type="button"
            className={BUTTON}
            disabled={busy || !mintTarget || !assetLabel.trim()}
            onClick={() =>
              submit("Mint asset", (signer) =>
                getAssetNFT(signer).mintAsset(mintTarget, assetLabel.trim()),
              ).then(() => setAssetLabel(""))
            }
          >
            Mint
          </button>
        </section>
      </div>

      <section className={CARD}>
        <h2 className="text-lg font-semibold text-slate-900">Registered Identities</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="pb-2">Label</th>
              <th className="pb-2">Address</th>
              <th className="pb-2">Roles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {identities.map((i) => (
              <tr key={i.address}>
                <td className="py-2 font-medium text-slate-900">{i.label}</td>
                <td className="py-2 font-mono text-xs text-slate-600">
                  {shortAddress(i.address)}
                </td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {(roles[i.address] ?? []).map((r) => (
                      <RoleBadge key={r} role={r} />
                    ))}
                    {(roles[i.address] ?? []).length === 0 && (
                      <span className="text-xs text-slate-400">none</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
