import { useState } from "react";
import { getAssetNFT, statusName } from "../lib/contracts";
import type { IdentityStatusName } from "../lib/contracts";
import { shortAddress } from "./AccountSwitcher";

interface VerifiedAsset {
  tokenId: string;
  exists: boolean;
  owner: string;
  ownerLabel: string;
  ownerStatus: IdentityStatusName;
  label: string;
  metadataHash: string;
  mintedAt: number;
}

type Integrity = "untested" | "match" | "mismatch" | "unanchored";

const CARD = "rounded-lg bg-white p-6 shadow-sm";
const INPUT =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand";

/** One line of the "security checks" readout. Deliberately plain language —
 *  the blockchain is the trust layer, not the vocabulary the user has to learn. */
function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-start gap-2 text-sm ${ok ? "text-success" : "text-danger"}`}>
      <span aria-hidden="true" className="font-semibold">
        {ok ? "✓" : "✕"}
      </span>
      <span className={ok ? "text-slate-700" : "font-medium"}>{children}</span>
    </li>
  );
}

/**
 * Verification Centre — SIH26125 §10.
 *
 * The point of this screen: everything on it is read straight from chain state.
 * A verifier here is not trusting our application, our database (there isn't
 * one), or the person holding the asset. They are reading the record and
 * checking a hash themselves.
 */
export default function VerifyAsset() {
  const [tokenIdInput, setTokenIdInput] = useState("0");
  const [result, setResult] = useState<VerifiedAsset | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [document, setDocument] = useState("");
  const [integrity, setIntegrity] = useState<Integrity>("untested");

  async function lookup() {
    setBusy(true);
    setError("");
    setIntegrity("untested");
    try {
      const tokenId = BigInt(tokenIdInput.trim());
      const asset = getAssetNFT();
      const [exists, owner, ownerLabel, ownerStatus, label, metadataHash, mintedAt] =
        await asset.verifyAsset(tokenId);

      setResult({
        tokenId: tokenId.toString(),
        exists,
        owner,
        ownerLabel,
        ownerStatus: statusName(ownerStatus),
        label,
        metadataHash,
        mintedAt: Number(mintedAt),
      });
    } catch {
      setResult(null);
      setError("Could not read that asset ID. Enter a whole number, e.g. 0.");
    } finally {
      setBusy(false);
    }
  }

  async function checkIntegrity() {
    if (!result) return;
    setBusy(true);
    try {
      if (result.metadataHash === `0x${"0".repeat(64)}`) {
        setIntegrity("unanchored");
        return;
      }
      const bytes = new TextEncoder().encode(document);
      const ok = await getAssetNFT().verifyAssetIntegrity(BigInt(result.tokenId), bytes);
      setIntegrity(ok ? "match" : "mismatch");
    } catch {
      setIntegrity("mismatch");
    } finally {
      setBusy(false);
    }
  }

  const anchored = result?.metadataHash && result.metadataHash !== `0x${"0".repeat(64)}`;

  return (
    <div className="space-y-6">
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-slate-900">Verify an asset</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Every field below is read directly from the blockchain. Nothing here comes
          from this application's own records &mdash; there are none to trust.
        </p>
        <div className="mt-4 flex items-end gap-3">
          <label className="block w-48 text-sm font-medium text-slate-700">
            Asset ID
            <input
              className={INPUT}
              value={tokenIdInput}
              onChange={(e) => setTokenIdInput(e.target.value)}
              placeholder="0"
            />
          </label>
          <button
            type="button"
            onClick={lookup}
            disabled={busy}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50"
          >
            {busy ? "Checking…" : "Verify asset"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}
      </section>

      {result && !result.exists && (
        <section className="rounded-lg border-2 border-danger bg-danger-bg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-danger">No such asset</h2>
          <p className="mt-1 text-sm text-danger/80">
            The blockchain holds no record of asset #{result.tokenId}. An item presented
            with this identifier is not one this organisation issued.
          </p>
        </section>
      )}

      {result?.exists && (
        <>
          <section className={CARD}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{result.label}</h2>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  Asset #{result.tokenId}
                </p>
              </div>
              <span className="rounded-full bg-success-bg px-3 py-1 text-sm font-semibold text-success">
                Genuine &mdash; on-chain record found
              </span>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Held by
                </dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {result.ownerLabel || "Unregistered holder"}
                </dd>
                <dd className="font-mono text-xs text-slate-500">
                  {shortAddress(result.owner)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Holder status
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
                      result.ownerStatus === "Active"
                        ? "bg-success"
                        : result.ownerStatus === "Suspended"
                          ? "bg-role-auditor"
                          : "bg-danger"
                    }`}
                  >
                    {result.ownerStatus}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Issued
                </dt>
                <dd className="mt-1 text-sm text-slate-800">
                  {result.mintedAt
                    ? new Date(result.mintedAt * 1000).toLocaleString()
                    : "—"}
                </dd>
              </div>
            </dl>

            <ul className="mt-6 space-y-1.5 border-t border-slate-100 pt-4">
              <Check ok>Asset exists in the on-chain registry</Check>
              <Check ok={result.ownerStatus === "Active"}>
                {result.ownerStatus === "Active"
                  ? "Current holder is an active identity"
                  : `Current holder's identity is ${result.ownerStatus.toLowerCase()} — do not release this asset`}
              </Check>
              <Check ok={Boolean(anchored)}>
                {anchored
                  ? "A tamper-evident document hash is anchored for this asset"
                  : "No document hash anchored — authenticity of paperwork cannot be checked"}
              </Check>
            </ul>
          </section>

          <section className={CARD}>
            <h2 className="text-lg font-semibold text-slate-900">Check the paperwork</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Paste the custody document you were handed. Its fingerprint is compared
              against the one recorded when the asset was issued. The document itself was
              never stored on the blockchain &mdash; only its fingerprint &mdash; so
              nothing sensitive was ever published.
            </p>
            <textarea
              className={`${INPUT} h-28 font-mono text-xs`}
              value={document}
              onChange={(e) => {
                setDocument(e.target.value);
                setIntegrity("untested");
              }}
              placeholder='{"serial":"BEL-RF-2026-00417", ...}'
            />
            <button
              type="button"
              onClick={checkIntegrity}
              disabled={busy || !document}
              className="mt-3 rounded-lg border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Check document
            </button>

            {integrity === "match" && (
              <div className="mt-4 rounded-lg bg-success-bg p-4">
                <p className="font-semibold text-success">Document is authentic</p>
                <p className="mt-1 text-sm text-success/80">
                  Byte-for-byte identical to the record anchored when this asset was
                  issued.
                </p>
              </div>
            )}
            {integrity === "mismatch" && (
              <div className="mt-4 rounded-lg border-2 border-danger bg-danger-bg p-4 shadow-lg">
                <p className="font-semibold text-danger">Document does not match</p>
                <p className="mt-1 text-sm text-danger/80">
                  This paperwork differs from what was recorded at issue. Even a single
                  altered character produces this result. Treat the document as
                  untrustworthy.
                </p>
              </div>
            )}
            {integrity === "unanchored" && (
              <p className="mt-4 text-sm font-medium text-role-auditor">
                No document hash was anchored for this asset, so nothing can be compared.
              </p>
            )}
          </section>

          <p className="px-1 text-xs text-slate-500">
            Anyone can run these checks. Verification functions are readable by any
            account and require no permission &mdash; an auditor who needs permission to
            audit is not an auditor.
          </p>
        </>
      )}

      {!result && !error && (
        <section className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-100 p-8 text-center">
          <p className="text-sm text-slate-600">
            Enter an asset ID above to verify it. The demo chain is seeded with asset{" "}
            <span className="font-mono font-semibold">#0</span>.
          </p>
        </section>
      )}
    </div>
  );
}
