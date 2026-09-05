import { useCallback, useEffect, useRef, useState } from "react";
import type { EventLog, Log } from "ethers";
import { getAssetNFT, getIdentityRegistry, roleNameFor } from "../lib/contracts";
import { shortAddress } from "./AccountSwitcher";

interface AuditRow {
  key: string;
  blockNumber: number;
  logIndex: number;
  action: string;
  actor: string;
  details: string;
  txHash: string;
}

const ACTION_STYLES: Record<string, string> = {
  IdentityRegistered: "bg-brand text-white",
  AssetMinted: "bg-success text-white",
  AssetTransferred: "bg-role-manager text-white",
  RoleGranted: "bg-role-auditor text-white",
  RoleRevoked: "bg-danger text-white",
};

function toRow(name: string, log: EventLog): AuditRow {
  const args = log.args;
  let actor = "";
  let details = "";

  switch (name) {
    case "IdentityRegistered":
      actor = args[0];
      details = `label "${args[1]}"`;
      break;
    case "AssetMinted":
      actor = args[0];
      details = `token #${args[1]} — "${args[2]}"`;
      break;
    case "AssetTransferred":
      actor = args[0];
      details = `token #${args[2]} -> ${shortAddress(args[1])}`;
      break;
    case "RoleGranted":
    case "RoleRevoked":
      actor = args[1];
      details = `${roleNameFor(args[0])} by ${shortAddress(args[2])}`;
      break;
    default:
      details = "";
  }

  return {
    key: `${log.transactionHash}-${log.index}`,
    blockNumber: log.blockNumber,
    logIndex: log.index,
    action: name,
    actor,
    details,
    txHash: log.transactionHash,
  };
}

// Every event that represents a state change, across both contracts. The raw
// ERC-721 `Transfer` is deliberately excluded — it duplicates AssetMinted
// without carrying the label (build/07-smart-contracts/EVENTS.md).
const REGISTRY_EVENTS = ["IdentityRegistered", "RoleGranted", "RoleRevoked"];
const ASSET_EVENTS = ["AssetMinted", "AssetTransferred", "RoleGranted", "RoleRevoked"];

export default function AuditTrail({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [error, setError] = useState<string>("");
  const seen = useRef<Set<string>>(new Set());
  const [freshKeys, setFreshKeys] = useState<Set<string>>(new Set());

  const merge = useCallback((incoming: AuditRow[]) => {
    setRows((prev) => {
      const byKey = new Map(prev.map((r) => [r.key, r]));
      const added: string[] = [];
      for (const row of incoming) {
        if (!byKey.has(row.key)) {
          byKey.set(row.key, row);
          if (seen.current.size > 0) added.push(row.key);
        }
        seen.current.add(row.key);
      }
      if (added.length) {
        // Briefly highlight new rows so the live update is visible to a room,
        // not just technically true (build/04-design/UI_UX_GUIDELINES.md #4).
        setFreshKeys(new Set(added));
        setTimeout(() => setFreshKeys(new Set()), 2500);
      }
      return [...byKey.values()].sort(
        (a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex,
      );
    });
  }, []);

  useEffect(() => {
    const registry = getIdentityRegistry();
    const asset = getAssetNFT();
    const subscriptions: Array<[typeof registry, string, (...a: unknown[]) => void]> = [];
    let cancelled = false;

    async function start() {
      try {
        const collected: AuditRow[] = [];
        for (const [contract, names] of [
          [registry, REGISTRY_EVENTS],
          [asset, ASSET_EVENTS],
        ] as const) {
          for (const name of names) {
            const logs = await contract.queryFilter(contract.filters[name](), 0, "latest");
            for (const log of logs as Array<Log | EventLog>) {
              if ("args" in log) collected.push(toRow(name, log as EventLog));
            }
          }
        }
        if (cancelled) return;
        merge(collected);
        setError("");

        // Live listeners, not a polling loop — see
        // build/06-blockchain/INDEXING_AND_SYNC.md "Do not build".
        for (const [contract, names] of [
          [registry, REGISTRY_EVENTS],
          [asset, ASSET_EVENTS],
        ] as const) {
          for (const name of names) {
            const handler = (...args: unknown[]) => {
              const payload = args[args.length - 1] as { log: EventLog };
              if (payload?.log) merge([toRow(name, payload.log)]);
            };
            contract.on(name, handler);
            subscriptions.push([contract, name, handler]);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError("Cannot reach the local node — is `npx hardhat node` running?");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      for (const [contract, name, handler] of subscriptions) {
        contract.off(name, handler);
      }
    };
  }, [merge, refreshKey]);

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Audit Trail</h2>
        <span className="text-xs text-slate-500">
          {rows.length} on-chain events · live
        </span>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-danger">{error}</p>}

      <table className="mt-4 w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="pb-2">Block</th>
            <th className="pb-2">Action</th>
            <th className="pb-2">Subject</th>
            <th className="pb-2">Details</th>
            <th className="pb-2">Tx hash</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={row.key}
              className={
                freshKeys.has(row.key) ? "bg-success-bg transition-colors" : "transition-colors"
              }
            >
              <td className="py-2 font-mono text-xs text-slate-500">{row.blockNumber}</td>
              <td className="py-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    ACTION_STYLES[row.action] ?? "bg-slate-400 text-white"
                  }`}
                >
                  {row.action}
                </span>
              </td>
              <td className="py-2 font-mono text-xs text-slate-600">
                {row.actor ? shortAddress(row.actor) : "—"}
              </td>
              <td className="py-2 text-slate-800">{row.details}</td>
              <td className="py-2 font-mono text-xs text-slate-500">
                {shortAddress(row.txHash)}
              </td>
            </tr>
          ))}
          {rows.length === 0 && !error && (
            <tr>
              <td colSpan={5} className="py-4 text-sm text-slate-500">
                No events yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
