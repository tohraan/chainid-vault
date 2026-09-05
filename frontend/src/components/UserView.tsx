import { useCallback, useEffect, useState } from "react";
import { useActiveAccount } from "../context/ActiveAccountContext";
import {
  extractRevertReason,
  getAssetNFT,
  getIdentityRegistry,
  getSignerFor,
  resetSignerNonce,
} from "../lib/contracts";
import type { RevertInfo } from "./RevertDisplay";
import RoleBadge from "./RoleBadge";

interface Asset {
  tokenId: string;
  label: string;
}

interface Props {
  onRevert: (info: RevertInfo) => void;
  pushToast: (state: "pending" | "success" | "error", msg: string, tx?: string) => number;
  updateToast: (id: number, state: "pending" | "success" | "error", msg: string, tx?: string) => void;
  refreshKey: number;
  onChainChanged: () => void;
}

export default function UserView({
  onRevert,
  pushToast,
  updateToast,
  refreshKey,
  onChainChanged,
}: Props) {
  const { account } = useActiveAccount();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [onChainLabel, setOnChainLabel] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const asset = getAssetNFT();
    const ids: bigint[] = await asset.tokensOfOwner(account.address);
    const rows = await Promise.all(
      ids.map(async (id) => ({
        tokenId: id.toString(),
        label: await asset.assetLabel(id),
      })),
    );
    setAssets(rows);

    // The deployer holds ADMIN_ROLE but is deliberately NOT a registered
    // identity (build/02-planning/PHASE_03.md), so this comes back empty for
    // Admin — fall back to the local account label rather than render blank.
    setOnChainLabel(await getIdentityRegistry().labels(account.address));
  }, [account.address]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load, refreshKey]);

  /**
   * The demo probe. Deliberately always enabled, whatever the active account's
   * role — that is the whole point (build/04-design/COMPONENT_ARCHITECTURE.md).
   */
  async function tryAdminAction() {
    setBusy(true);
    const toastId = pushToast("pending", "Attempting admin-only mint…");
    try {
      const tx = await getAssetNFT(getSignerFor(account.privateKey)).mintAsset(
        account.address,
        `Self-minted by ${account.label}`,
      );
      const receipt = await tx.wait();
      updateToast(toastId, "success", "Mint confirmed", receipt?.hash ?? tx.hash);
      onChainChanged();
      await load();
    } catch (error) {
      resetSignerNonce(account.privateKey);
      updateToast(toastId, "error", "Mint rejected on-chain");
      onRevert({
        reason: extractRevertReason(error),
        attemptedBy: account.address,
        role: account.role,
        action: "AssetNFT.mintAsset (admin only)",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {onChainLabel || account.label}
          </h2>
          <RoleBadge role={account.role} />
        </div>
        <p className="mt-1 font-mono text-xs text-slate-500">{account.address}</p>
        {!onChainLabel && (
          <p className="mt-2 text-xs text-slate-400">
            Not a registered identity — holds a role but has no on-chain label.
          </p>
        )}
      </section>

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">My Assets</h2>
        {assets.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No assets held by this account.</p>
        ) : (
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2">Token ID</th>
                <th className="pb-2">Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((a) => (
                <tr key={a.tokenId}>
                  <td className="py-2 font-mono text-slate-600">#{a.tokenId}</td>
                  <td className="py-2 font-medium text-slate-900">{a.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Try Admin Action</h2>
        <p className="mt-1 text-sm text-slate-600">
          Attempt an admin-only action to see on-chain enforcement. This calls
          <code className="mx-1 rounded bg-white px-1 py-0.5 font-mono text-xs">
            AssetNFT.mintAsset
          </code>
          directly from the account selected above.
        </p>
        <button
          type="button"
          onClick={tryAdminAction}
          disabled={busy}
          className="mt-4 rounded-lg border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Try Admin Action"}
        </button>
      </section>
    </div>
  );
}
