import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { ACCOUNTS, NEW_CONTRACTOR } from "../lib/accounts";
import {
  extractRevertReason,
  getAssetNFT,
  getIdentityRegistry,
  getSignerFor,
  proveControl,
  resetSignerNonce,
  statusName,
} from "../lib/contracts";

/**
 * The Custody Pipeline — the actual defence workflow, run end to end.
 *
 * The other screens are a toolbox. This is the process: a contractor is
 * onboarded, issued controlled equipment, checked at a gate, offboarded, and
 * then the system refuses to let equipment reach them afterwards.
 *
 * Every stage carries the "before" — how this is done today, and why that fails
 * — because the contrast is the argument. The system is not interesting because
 * it can issue equipment. It is interesting because of what it refuses to do.
 */

type StageId = "onboard" | "issue" | "prove" | "verify" | "offboard" | "attempt";
type StageState = "idle" | "running" | "done" | "refused";

interface Stage {
  id: StageId;
  title: string;
  actor: string;
  today: string;
  gap: string;
  action: string;
  /** True when the whole point of the stage is that it FAILS. */
  expectRefusal?: boolean;
}

const STAGES: Stage[] = [
  {
    id: "onboard",
    title: "Onboard the contractor",
    actor: "Security Administrator",
    today:
      "A form goes to IT, an account is created in the directory, and a row is added to the contractor register.",
    gap: "Whoever administers that directory can create, alter or delete the record, and can edit the log that would show they did.",
    action: "Register identity on-chain",
  },
  {
    id: "issue",
    title: "Issue controlled equipment",
    actor: "Security Administrator",
    today:
      "Stores writes the serial number and the holder's name into the asset register, and files a signed custody form.",
    gap: "Both the register row and the paper form can be altered later. Nothing links the item to a verified person.",
    action: "Issue equipment and anchor its paperwork",
  },
  {
    id: "prove",
    title: "Contractor proves identity at the gate",
    actor: "S. Iyer — Contractor",
    today: "The contractor shows a badge, and the guard compares a photo.",
    gap: "A badge can be cloned, borrowed or forged. The guard is verifying a plastic card, not a person.",
    action: "Sign a one-time challenge",
  },
  {
    id: "verify",
    title: "Gate officer verifies the equipment",
    actor: "Gate officer (no login required)",
    today:
      "The officer phones stores, or trusts the custody form the contractor is carrying.",
    gap: "The form is the only evidence, and the form is exactly what an attacker would alter.",
    action: "Verify item and paperwork against the chain",
  },
  {
    id: "offboard",
    title: "Engagement ends — offboard",
    actor: "Security Administrator",
    today: "The directory account is disabled on the contractor's last day.",
    gap: "The asset register still shows them holding equipment, and nothing stops more being issued to them.",
    action: "Revoke the identity",
  },
  {
    id: "attempt",
    title: "Someone issues equipment to them anyway",
    actor: "Security Administrator (with full privileges)",
    today:
      "The register accepts the write. Nobody notices until the annual audit, if then.",
    gap: "This is the failure the whole system exists to prevent.",
    action: "Attempt to issue equipment to the revoked contractor",
    expectRefusal: true,
  },
];

const ADMIN = ACCOUNTS[0];
const CONTRACTOR_LABEL = "S. Iyer — Contractor (Radar Div)";
const EQUIPMENT_LABEL = "Signal Generator SG-4400";
const EQUIPMENT_DOC = JSON.stringify({
  serial: "BEL-SG-2026-01188",
  model: "Signal Generator SG-4400",
  classification: "RESTRICTED",
  calibratedUntil: "2027-06-30",
  issuedBy: "Bharat Electronics Limited",
});

interface Result {
  state: StageState;
  lines: string[];
  txHash?: string;
}

export default function CustodyPipeline({
  onChainChanged,
}: {
  onChainChanged: () => void;
}) {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [busy, setBusy] = useState(false);
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [alreadyOnboarded, setAlreadyOnboarded] = useState(false);

  const checkState = useCallback(async () => {
    const status = await getIdentityRegistry().status(NEW_CONTRACTOR.address);
    setAlreadyOnboarded(statusName(status) !== "Unregistered");
  }, []);

  useEffect(() => {
    checkState().catch(() => undefined);
  }, [checkState]);

  const set = (id: StageId, r: Result) => setResults((p) => ({ ...p, [id]: r }));

  async function run(stage: Stage) {
    setBusy(true);
    set(stage.id, { state: "running", lines: [] });
    const adminRegistry = () => getIdentityRegistry(getSignerFor(ADMIN.privateKey));
    const adminAsset = () => getAssetNFT(getSignerFor(ADMIN.privateKey));

    try {
      switch (stage.id) {
        case "onboard": {
          const tx = await adminRegistry().registerIdentity(
            NEW_CONTRACTOR.address,
            CONTRACTOR_LABEL,
          );
          const r = await tx.wait();
          await (await adminRegistry().grantRole(ethers.id("USER_ROLE"), NEW_CONTRACTOR.address)).wait();
          set(stage.id, {
            state: "done",
            txHash: r?.hash,
            lines: [
              "Identity created on-chain and marked Active",
              "USER_ROLE granted",
              "Permanently recorded — the record cannot be edited or deleted, only superseded",
            ],
          });
          setAlreadyOnboarded(true);
          break;
        }
        case "issue": {
          const hash = ethers.keccak256(ethers.toUtf8Bytes(EQUIPMENT_DOC));
          const tx = await adminAsset().mintAssetWithMetadata(
            NEW_CONTRACTOR.address,
            EQUIPMENT_LABEL,
            hash,
          );
          const r = await tx.wait();
          const ids: bigint[] = await getAssetNFT().tokensOfOwner(NEW_CONTRACTOR.address);
          const newest = ids[ids.length - 1];
          setTokenId(newest);
          set(stage.id, {
            state: "done",
            txHash: r?.hash,
            lines: [
              `Equipment issued as asset #${newest}`,
              "Recipient was checked against the identity registry before issue",
              "Custody paperwork fingerprinted — the document itself stays off-chain",
            ],
          });
          break;
        }
        case "prove": {
          const res = await proveControl(NEW_CONTRACTOR.privateKey, NEW_CONTRACTOR.address);
          set(stage.id, {
            state: "done",
            txHash: res.txHash,
            lines: [
              "Signature matched the key behind this identity",
              "Identity confirmed active at the moment of the check",
              `Challenge #${res.nonce} is now spent and can never be replayed`,
            ],
          });
          break;
        }
        case "verify": {
          const id = tokenId ?? 0n;
          const [exists, owner, ownerLabel, ownerStatus] =
            await getAssetNFT().verifyAsset(id);
          const genuine = await getAssetNFT().verifyAssetIntegrity(
            id,
            ethers.toUtf8Bytes(EQUIPMENT_DOC),
          );
          const tampered = await getAssetNFT().verifyAssetIntegrity(
            id,
            ethers.toUtf8Bytes(EQUIPMENT_DOC.replace("RESTRICTED", "UNCLASSIFIED")),
          );
          set(stage.id, {
            state: "done",
            lines: [
              exists ? `Asset #${id} exists on-chain` : "No such asset",
              `Held by ${ownerLabel || owner} — status ${statusName(ownerStatus)}`,
              genuine ? "Original paperwork verified authentic" : "Paperwork FAILED",
              tampered
                ? "Altered paperwork wrongly accepted"
                : "Same document with one word changed — REJECTED",
            ],
          });
          break;
        }
        case "offboard": {
          const tx = await adminRegistry().revokeIdentity(NEW_CONTRACTOR.address);
          const r = await tx.wait();
          set(stage.id, {
            state: "done",
            txHash: r?.hash,
            lines: [
              "Identity revoked — permanently, by design",
              "Equipment they still hold remains visible and attributable",
              "The revocation itself is a permanent audit entry",
            ],
          });
          break;
        }
        case "attempt": {
          await adminAsset().mintAssetWithMetadata(
            NEW_CONTRACTOR.address,
            "Oscilloscope OS-900",
            ethers.keccak256(ethers.toUtf8Bytes("late issue")),
          );
          set(stage.id, {
            state: "done",
            lines: ["IT SUCCEEDED — the rule is not being enforced."],
          });
          break;
        }
      }
      onChainChanged();
    } catch (error) {
      const reason = extractRevertReason(error);
      resetSignerNonce(ADMIN.privateKey);
      resetSignerNonce(NEW_CONTRACTOR.privateKey);
      set(stage.id, {
        state: stage.expectRefusal ? "refused" : "idle",
        lines: [reason],
      });
    } finally {
      setBusy(false);
    }
  }

  const done = STAGES.filter((s) => {
    const r = results[s.id];
    return r?.state === "done" || r?.state === "refused";
  }).length;

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-slate-900">
              Contractor custody pipeline
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              The real workflow, start to finish: a contractor joins, is issued
              controlled equipment, is checked at the gate, and leaves. Each stage
              shows how it is done today and what that leaves open.
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-semibold text-brand">
              {done}/{STAGES.length}
            </div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              stages run
            </div>
          </div>
        </div>
        {alreadyOnboarded && !results.onboard && (
          <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
            This contractor is already registered from an earlier run. Redeploy for a
            clean start:{" "}
            <code className="font-mono text-xs">
              npx hardhat run scripts/deploy.ts --network localhost
            </code>
          </p>
        )}
      </section>

      {STAGES.map((stage, i) => {
        const r = results[stage.id];
        const state = r?.state ?? "idle";
        const settled = state === "done" || state === "refused";
        const refusedAsIntended = state === "refused";

        return (
          <section
            key={stage.id}
            className={`rounded-lg border-l-4 bg-white p-6 shadow-sm ${
              refusedAsIntended
                ? "border-l-danger"
                : settled
                  ? "border-l-success"
                  : "border-l-slate-300"
            }`}
          >
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-xs text-slate-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-semibold text-slate-900">{stage.title}</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {stage.actor}
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  How it works today
                </div>
                <p className="mt-1 text-sm text-slate-700">{stage.today}</p>
                <p className="mt-2 text-sm font-medium text-danger">{stage.gap}</p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  With ChainID Vault
                </div>
                {!settled && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(stage)}
                    className={`mt-2 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                      stage.expectRefusal
                        ? "bg-slate-700 hover:bg-slate-800"
                        : "bg-brand hover:bg-brand-light"
                    }`}
                  >
                    {state === "running" ? "Working…" : stage.action}
                  </button>
                )}

                {settled && (
                  <>
                    <p
                      className={`mt-2 font-semibold ${
                        refusedAsIntended ? "text-danger" : "text-success"
                      }`}
                    >
                      {refusedAsIntended ? "Refused on-chain" : "Recorded on-chain"}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {r?.lines.map((l) => (
                        <li
                          key={l}
                          className={`flex gap-2 text-sm ${
                            refusedAsIntended ? "text-danger" : "text-slate-700"
                          }`}
                        >
                          <span aria-hidden="true">{refusedAsIntended ? "✕" : "✓"}</span>
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                    {r?.txHash && (
                      <p className="mt-2 break-all font-mono text-[11px] text-slate-400">
                        {r.txHash}
                      </p>
                    )}
                  </>
                )}

                {state === "idle" && r?.lines.length ? (
                  <p className="mt-2 text-sm font-medium text-danger">{r.lines[0]}</p>
                ) : null}
              </div>
            </div>

            {stage.expectRefusal && refusedAsIntended && (
              <p className="mt-4 rounded-lg bg-danger-bg p-4 text-sm text-danger">
                <strong>This is the whole argument.</strong> The account that just tried
                holds every administrative privilege in the system — it created the
                identity and issued the original equipment. It still cannot do this,
                because the constraint is a rule in the contract, not a permission that
                an administrator can grant themselves. A database administrator can
                always override the database.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
